/**
 * Netlify Serverless Function - Story Generation
 * Creates compelling stories (light or dark) with amazing narratives
 */
import type { Handler, HandlerEvent } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { 
      prompt, 
      tone = 'uplifting', // uplifting, dark, mysterious, adventure, emotional
      length = 'medium', // short (500w), medium (1000w), long (2000w)
      includeImage = true
    } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Story prompt is required' }),
      };
    }

    const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'AI provider not configured' }),
      };
    }

    // Generate story
    const story = await generateStory(prompt, tone, length, openaiKey);

    // Generate cover image if requested
    let coverImage = null;
    if (includeImage) {
      try {
        coverImage = await generateStoryCover(story.title, tone, openaiKey);
      } catch (err) {
        console.error('Cover generation failed:', err);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        story: {
          title: story.title,
          content: story.content,
          summary: story.summary,
          tone,
          wordCount: story.content.split(' ').length,
          readTime: Math.ceil(story.content.split(' ').length / 200) + ' min',
        },
        coverImage,
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

async function generateStory(prompt: string, tone: string, length: string, apiKey: string) {
  const wordCounts: Record<string, number> = {
    short: 500,
    medium: 1000,
    long: 2000,
  };

  const toneInstructions: Record<string, string> = {
    uplifting: 'positive, hopeful, inspiring, with good energy and meaningful messages',
    dark: 'dark and haunting but BEAUTIFUL and ARTISTIC - compelling, meaningful, not gratuitous. Think literary horror.',
    mysterious: 'mysterious and intriguing, with layers of meaning and subtle revelations',
    adventure: 'exciting and dynamic, with vivid action and compelling characters',
    emotional: 'deeply emotional and moving, with authentic human experiences',
  };

  const systemPrompt = `You are a MASTER storyteller creating ${toneInstructions[tone]} stories.

CRITICAL RULES:
1. Make it COMPELLING - readers should be captivated
2. Use vivid, sensory details
3. Create memorable characters
4. Build atmosphere and mood
5. Include meaningful themes
6. NO clichés or tropes
7. SHOW don't tell
8. Strong opening hook
9. Satisfying arc/resolution
10. Leave emotional impact

If dark/horror: Make it ARTISTIC and MEANINGFUL, not just scary. Think "Hereditary" or "The Lighthouse" - beautiful cinematography meets deep themes.

Target length: ~${wordCounts[length]} words

Return JSON:
{
  "title": "Compelling Title",
  "summary": "One sentence hook",
  "content": "Full story text with paragraphs"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 3000,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    // If not JSON, parse manually
    return {
      title: 'Untitled Story',
      summary: prompt,
      content: content,
    };
  }
}

async function generateStoryCover(title: string, tone: string, apiKey: string) {
  const styleMap: Record<string, string> = {
    uplifting: 'vibrant, warm colors, hopeful atmosphere, beautiful lighting',
    dark: 'cinematic, moody, atmospheric, dark fantasy art, hauntingly beautiful',
    mysterious: 'noir style, shadows and light, enigmatic atmosphere',
    adventure: 'epic fantasy art, dynamic composition, exciting energy',
    emotional: 'intimate, soft lighting, emotional depth, artistic photography',
  };

  const imagePrompt = `Book cover for "${title}" - ${styleMap[tone]}, professional book cover design, stunning visual`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: tone === 'dark' ? 'natural' : 'vivid',
    }),
  });

  if (!response.ok) {
    throw new Error('Cover generation failed');
  }

  const data = await response.json();
  return {
    url: data.data[0].url,
    prompt: imagePrompt,
  };
}

export { handler };

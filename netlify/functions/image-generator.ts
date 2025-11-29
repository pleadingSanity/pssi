/**
 * Netlify Serverless Function - Image Generation
 * Creates images using DALL-E 3 with movement-aligned prompts
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
    const { prompt, style = 'vivid', size = '1024x1024', quality = 'hd' } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
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

    // Enhance prompt with movement energy
    const enhancedPrompt = await enhancePromptWithMovement(prompt, openaiKey);

    // Generate image with DALL-E 3
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size,
        quality,
        style, // 'vivid' or 'natural'
      }),
    });

    if (!imageResponse.ok) {
      const error = await imageResponse.json();
      throw new Error(error.error?.message || 'Image generation failed');
    }

    const imageData = await imageResponse.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        image: {
          url: imageData.data[0].url,
          revisedPrompt: imageData.data[0].revised_prompt,
        },
        originalPrompt: prompt,
        enhancedPrompt,
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

async function enhancePromptWithMovement(userPrompt: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: `You enhance image prompts with GOOD ENERGY and movement philosophy.

Add vibrant, positive, uplifting elements while keeping the user's core vision.
Use words like: vibrant, uplifting, hope, light, energy, movement, flow, dynamic.

If the prompt asks for dark/horror/sad themes, make them COMPELLING and artistic:
- Dark but beautiful
- Haunting but meaningful
- Emotional but not gratuitous
- Story-driven atmosphere

Return ONLY the enhanced prompt, no explanation.`
      }, {
        role: 'user',
        content: userPrompt
      }],
      temperature: 0.9,
      max_tokens: 200,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export { handler };

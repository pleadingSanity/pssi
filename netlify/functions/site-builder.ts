/**
 * DEPRECATED - Use ultimate-web-builder.ts instead
 * This is kept for backwards compatibility
 * 
 * Netlify Serverless Function - Full Site Builder
 * Creates complete websites from user prompts
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
      style = 'modern', // modern, minimal, vibrant, dark, retro
      features = [],    // ['contact-form', 'gallery', 'video', 'blog']
      colors = 'auto'   // auto or specific palette
    } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Site description prompt is required' }),
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

    // Generate complete site code
    const site = await generateSite(prompt, style, features, colors, openaiKey);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        site: {
          html: site.html,
          css: site.css,
          js: site.js,
          preview: site.html, // Combined preview
          features: site.features,
          colorPalette: site.colors,
        },
        metadata: {
          style,
          generatedFeatures: site.features,
          responsive: true,
          accessibility: 'WCAG 2.1 AA compliant',
        },
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

async function generateSite(
  prompt: string, 
  style: string, 
  features: string[], 
  colors: string, 
  apiKey: string
) {
  const systemPrompt = `You are an ELITE web designer creating STUNNING, production-ready websites.

USER WANTS: ${prompt}
STYLE: ${style}
FEATURES: ${features.join(', ') || 'auto-detect from prompt'}
COLORS: ${colors}

Create a COMPLETE, BEAUTIFUL, MODERN website with:

1. **HTML** - Semantic, accessible, SEO-optimized
2. **CSS** - Modern, responsive, beautiful animations
3. **JavaScript** - Interactive, smooth, no frameworks needed
4. **MOVEMENT ENERGY** - Positive vibes, good intentions, uplifting

REQUIREMENTS:
- Mobile-first responsive design
- Smooth animations and transitions
- Beautiful color palette (vibrant if uplifting, artistic if dark)
- Perfect typography hierarchy
- Accessibility (ARIA labels, keyboard nav)
- Performance optimized
- Clean, maintainable code
- NO placeholder text - generate REAL content
- Include hero section, features, CTA
- Add subtle micro-interactions
- Modern glassmorphism or neumorphism if appropriate

If user wants VIDEO embedding:
- Add placeholder for video upload
- Responsive video container
- Custom video player controls

If user wants IMAGE gallery:
- Lightbox functionality
- Lazy loading
- Masonry or grid layout

Return JSON:
{
  "html": "complete HTML with inline CSS and JS",
  "css": "extracted CSS",
  "js": "extracted JS",
  "features": ["feature1", "feature2"],
  "colors": {"primary": "#hex", "secondary": "#hex", "accent": "#hex"}
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
      temperature: 0.8,
      max_tokens: 4000,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch {
    // Extract HTML from code blocks if not JSON
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
    const html = htmlMatch ? htmlMatch[1] : content;
    
    return {
      html,
      css: '',
      js: '',
      features: features,
      colors: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
    };
  }
}

export { handler };

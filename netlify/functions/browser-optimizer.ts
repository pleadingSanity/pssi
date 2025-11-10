/**
 * Netlify Serverless Function - Browser Optimizer
 * Optimizes Chrome, Firefox, Edge, Safari for maximum speed
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
    const { browser = 'chrome', action = 'optimize' } = body;

    const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'AI provider not configured' }),
      };
    }

    const prompt = `You are a browser optimization expert in GOD MODE.

BROWSER: ${browser.toUpperCase()}

TASK: Make this browser 2-5x faster with expert optimizations.

Categories:
1. **SPEED OPTIMIZATIONS**
   - Hardware acceleration
   - Prefetch resources
   - DNS prefetching
   - Parallel downloads
   - Cache settings
   - Preload pages

2. **MEMORY MANAGEMENT**
   - Tab sleeping/discarding
   - Extension impact analysis
   - Memory saver mode
   - Process management
   - RAM limits

3. **PRIVACY & PERFORMANCE**
   - Tracking prevention (speed boost)
   - Ad blocker setup (which one is fastest)
   - Cookie management
   - HTTPS-only mode
   - Telemetry disable

4. **EXTENSIONS TO ADD**
   - Speed boosters
   - Ad blockers (fastest)
   - Memory savers
   - Auto tab discarders
   - Which to avoid (slow ones)

5. **FLAGS/SETTINGS** (Advanced)
   - chrome://flags optimizations
   - about:config tweaks (Firefox)
   - edge://flags settings
   - Experimental features
   - GPU acceleration

6. **CLEANUP ACTIONS**
   - Clear cache (how often)
   - Remove unused extensions
   - Clear browsing data
   - Reset to defaults if needed
   - Profile optimization

For each optimization provide:
- Exact setting location
- What to change
- Speed impact (% faster)
- Memory impact
- Safety level

Format as JSON with detailed steps.`;

    const response = await callOpenAI(prompt, openaiKey);
    
    try {
      const data = JSON.parse(response.content);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          browser,
          ...data,
        }),
      };
    } catch {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          browser,
          guide: response.content,
        }),
      };
    }

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

async function callOpenAI(prompt: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI request failed');
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
  };
}

export { handler };

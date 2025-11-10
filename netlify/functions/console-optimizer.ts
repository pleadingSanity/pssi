/**
 * Netlify Serverless Function - Xbox/PlayStation Optimizer
 * Optimizes gaming consoles for maximum FPS and network performance
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
    const { console = 'xbox', action = 'optimize' } = body;

    const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'AI provider not configured' }),
      };
    }

    const prompt = `You are a gaming console optimization expert in GOD MODE.

CONSOLE: ${console.toUpperCase()} (Series X/S or PS5/PS4)

TASK: Provide complete optimization guide for maximum gaming performance.

Categories:
1. **GRAPHICS SETTINGS** (FPS boost)
   - Resolution vs Performance mode
   - HDR settings optimization
   - VRR (Variable Refresh Rate) setup
   - Ray tracing vs frame rate
   - 120Hz gaming setup

2. **NETWORK OPTIMIZATION** (reduce lag)
   - DNS settings (best DNS servers)
   - Port forwarding guide
   - QoS (Quality of Service)
   - Wired vs WiFi optimization
   - NAT type optimization
   - MTU settings

3. **STORAGE OPTIMIZATION**
   - Game installation (internal vs external)
   - Quick Resume management
   - Cache clearing
   - Storage expansion tips
   - Game library management

4. **SYSTEM PERFORMANCE**
   - Background downloads control
   - Auto-update settings
   - Power modes explained
   - System cache clearing
   - Ventilation optimization

5. **CONTROLLER OPTIMIZATION**
   - Input lag reduction
   - Dead zone settings
   - Button mapping
   - Vibration settings
   - Battery management

6. **AUDIO SETUP**
   - Headset vs speakers
   - Dolby Atmos setup
   - Chat mixer optimization
   - Spatial audio settings

For each optimization provide:
- Exact menu path
- Setting to change
- Performance impact
- Why it helps

Format as JSON with categories and steps.`;

    const response = await callOpenAI(prompt, openaiKey);
    
    try {
      const data = JSON.parse(response.content);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          console,
          ...data,
        }),
      };
    } catch {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          console,
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

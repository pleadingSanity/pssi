/**
 * Netlify Serverless Function - iOS/iPhone Optimizer
 * Optimizes iOS devices for maximum performance and battery life
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
    const { action = 'optimize' } = body;

    const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'AI provider not configured' }),
      };
    }

    const prompt = `You are an iOS/iPhone optimization expert with GOD MODE activated.

TASK: Provide comprehensive iOS optimization guide for maximum performance and battery life.

Categories to cover:
1. **CRITICAL SETTINGS** (biggest battery/performance impact)
   - Background App Refresh settings
   - Location Services optimization
   - Push notifications management
   - Automatic Downloads control
   
2. **BATTERY OPTIMIZATION**
   - Low Power Mode best practices
   - Display brightness and timeout
   - Raise to Wake settings
   - Widget management
   - Battery health tips

3. **PERFORMANCE BOOST**
   - Reduce Motion settings
   - Transparency effects
   - App management (which to delete)
   - Storage optimization
   - Cache clearing methods

4. **PRIVACY & SECURITY**
   - Tracking prevention
   - App permissions review
   - Advertising settings
   - Location privacy

5. **NETWORK OPTIMIZATION**
   - WiFi vs Cellular data
   - Airplane mode strategies
   - Hotspot optimization
   - VPN recommendations

6. **STORAGE CLEANUP**
   - Photos optimization
   - App data management
   - Safari cache clearing
   - Message cleanup
   - Downloads folder

For each optimization provide:
- Setting path (exact menu location)
- What to change
- Why it helps
- Battery/performance impact (High/Medium/Low)

Format as JSON:
{
  "optimizations": [
    {
      "category": "category name",
      "name": "optimization name",
      "path": "Settings > Section > Subsection",
      "action": "what to do",
      "impact": "high|medium|low",
      "benefit": "battery savings % or performance gain"
    }
  ],
  "estimatedImprovement": "overall expected improvement"
}`;

    const response = await callOpenAI(prompt, openaiKey);
    
    try {
      const data = JSON.parse(response.content);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          platform: 'ios',
          ...data,
        }),
      };
    } catch {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          platform: 'ios',
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

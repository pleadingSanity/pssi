/**
 * Netlify Serverless Function - Code Analyzer AI
 * Scans code, finds issues, and auto-fixes them 24/7
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { code, filepath, action = 'analyze' } = body;

    if (!code && action !== 'monitor') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Code is required' }),
      };
    }

    const providers = {
      openai: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      anthropic: process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
      gemini: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
    };

    // Use GPT-4o for code analysis (best at coding)
    if (providers.openai) {
      const result = await analyzeCode(code, filepath, action, providers.openai);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    } else if (providers.anthropic) {
      const result = await analyzeWithClaude(code, filepath, action, providers.anthropic);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    } else {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'No code analysis AI available' }),
      };
    }

  } catch (error) {
    console.error('Code analysis failed:', error);
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

async function analyzeCode(code: string, filepath: string, action: string, apiKey: string) {
  // Import comprehensive code expert prompts
  const { CODE_EXPERT, REASONING_FRAMEWORK } = await import('./ai-system-prompts');
  
  const systemContext = `${CODE_EXPERT}\n\n${REASONING_FRAMEWORK}\n\nYou are analyzing code to help developers write better, safer, more performant applications.`;
  
  const prompts = {
    analyze: `${systemContext}

Analyze this code and find ALL issues:

File: ${filepath}
\`\`\`
${code}
\`\`\`

Find and report:
1. 🐛 Bugs and errors
2. 🔒 Security vulnerabilities (SQL injection, XSS, CSRF, etc.)
3. ⚡ Performance issues
4. 📝 Code quality problems
5. 🎨 Style inconsistencies
6. 🔧 Best practice violations

Format response as JSON:
{
  "issues": [
    {
      "severity": "high|medium|low",
      "type": "bug|security|performance|quality|style",
      "line": number,
      "description": "what's wrong",
      "fix": "how to fix it"
    }
  ],
  "score": 0-100,
  "summary": "overall assessment"
}`,

    fix: `${systemContext}

Fix ALL issues in this code:

File: ${filepath}
\`\`\`
${code}
\`\`\`

Return ONLY the fixed code, no explanations. Make it:
- Bug-free
- Secure
- Performant
- Clean
- Best practices compliant`,

    review: `You are a senior code reviewer. Review this code thoroughly:

File: ${filepath}
\`\`\`
${code}
\`\`\`

Provide:
1. ✅ What's good
2. ❌ What needs improvement
3. 💡 Suggestions
4. 🎯 Priority fixes
5. Overall recommendation (Approve/Request Changes/Reject)`
  };

  const prompt = prompts[action as keyof typeof prompts] || prompts.analyze;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code analyzer and fixer. You work 24/7 to keep code perfect.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temp for more accurate code analysis
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI failed: ${response.status}`);
  }

  const data = await response.json();
  const result = data.choices[0].message.content;

  return {
    success: true,
    action,
    filepath,
    result: action === 'analyze' ? tryParseJSON(result) : result,
    model: 'gpt-4o',
    timestamp: new Date().toISOString(),
  };
}

async function analyzeWithClaude(code: string, filepath: string, action: string, apiKey: string) {
  const prompt = `Analyze and ${action} this code from ${filepath}:\n\n${code}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    success: true,
    action,
    filepath,
    result: data.content[0].text,
    model: 'claude-3.5-sonnet',
    timestamp: new Date().toISOString(),
  };
}

function tryParseJSON(text: string) {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export { handler };

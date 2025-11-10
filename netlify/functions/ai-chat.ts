/**
 * Netlify Serverless Function - AI Chat Endpoint
 */
import type { Handler, HandlerEvent } from '@netlify/functions';

interface AIRequest {
  provider?: 'openai' | 'anthropic' | 'gemini' | 'auto';
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const handler: Handler = async (event: HandlerEvent) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
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
    const body: AIRequest = JSON.parse(event.body || '{}');
    const { provider = 'auto', prompt, model, temperature = 0.7, maxTokens = 1000 } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Get API keys from environment
    const providers = {
      openai: {
        name: 'OpenAI GPT-4o',
        apiKey: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
        available: !!(process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY),
      },
      anthropic: {
        name: 'Anthropic Claude 3.5',
        apiKey: process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
        available: !!(process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY),
      },
      gemini: {
        name: 'Google Gemini 2.0',
        apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
        available: !!(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY),
      },
    };

    // Auto-select first available provider
    let selectedProvider = provider;
    if (provider === 'auto') {
      selectedProvider = (Object.keys(providers).find(
        p => providers[p as keyof typeof providers].available
      ) || 'openai') as typeof provider;
    }

    const providerConfig = providers[selectedProvider as keyof typeof providers];

    if (!providerConfig?.available) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          success: false,
          error: `${selectedProvider} is not configured. Please add API key to Netlify environment variables.`,
          availableProviders: Object.keys(providers).filter(
            p => providers[p as keyof typeof providers].available
          ),
        }),
      };
    }

    // Call the appropriate AI provider
    let response;
    switch (selectedProvider) {
      case 'openai':
        response = await callOpenAI(prompt, providerConfig.apiKey!, { model, temperature, maxTokens });
        break;
      case 'anthropic':
        response = await callAnthropic(prompt, providerConfig.apiKey!, { model, temperature, maxTokens });
        break;
      case 'gemini':
        response = await callGemini(prompt, providerConfig.apiKey!, { model, temperature, maxTokens });
        break;
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid provider' }),
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        provider: selectedProvider,
        ...response,
      }),
    };

  } catch (error) {
    console.error('AI request failed:', error);
    
    // Better error messages for common issues
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let errorType = 'error';
    
    if (errorMessage.includes('quota') || errorMessage.includes('rate_limit')) {
      errorType = 'quota_exceeded';
      errorMessage = '⚠️ OpenAI quota exceeded. Try adding ANTHROPIC or GEMINI API keys as backup, or wait a bit and try again.';
    } else if (errorMessage.includes('401') || errorMessage.includes('invalid')) {
      errorType = 'invalid_key';
      errorMessage = '🔑 API key is invalid or expired. Please check your Netlify environment variables.';
    }
    
    return {
      statusCode: error instanceof Error && errorMessage.includes('quota') ? 429 : 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        errorType,
        hint: errorType === 'quota_exceeded' 
          ? 'Add backup AI providers: netlify env:set VITE_ANTHROPIC_API_KEY "your-key" or VITE_GEMINI_API_KEY "your-key"'
          : 'Check your API keys in Netlify dashboard',
      }),
    };
  }
};

async function callOpenAI(prompt: string, apiKey: string, options: any) {
  // Import comprehensive system prompts
  const { getPromptForScenario } = await import('./ai-system-prompts');
  const systemPrompt = getPromptForScenario('chat');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI request failed');
  }

  const data = await response.json();
  return {
    model: data.model,
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  };
}

async function callAnthropic(prompt: string, apiKey: string, options: any) {
  // Import comprehensive system prompts
  const { getPromptForScenario } = await import('./ai-system-prompts');
  const systemPrompt = getPromptForScenario('chat');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.model || 'claude-3-5-sonnet-20241022',
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic request failed');
  }

  const data = await response.json();
  return {
    model: data.model,
    content: data.content[0].text,
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
  };
}

async function callGemini(prompt: string, apiKey: string, options: any) {
  // Import comprehensive system prompts
  const { getPromptForScenario } = await import('./ai-system-prompts');
  const systemPrompt = getPromptForScenario('chat');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
  
  const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini request failed');
  }

  const data = await response.json();
  return {
    model: 'gemini-2.0-flash-exp',
    content: data.candidates[0].content.parts[0].text,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0,
    },
  };
}

export { handler };

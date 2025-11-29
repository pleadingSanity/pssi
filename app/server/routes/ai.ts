/**
 * AI API Routes - Backend endpoints for AI operations
 */
import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// AI Provider configurations
const providers = {
  openai: {
    name: 'OpenAI GPT-4o',
    apiKey: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    available: false,
  },
  anthropic: {
    name: 'Anthropic Claude 3.5',
    apiKey: process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
    endpoint: 'https://api.anthropic.com/v1/messages',
    available: false,
  },
  gemini: {
    name: 'Google Gemini 2.0',
    apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    available: false,
  },
};

// Check which providers are available
for (const [, provider] of Object.entries(providers)) {
  provider.available = !!provider.apiKey;
  if (provider.available) {
    console.log(`✅ ${provider.name} is configured`);
  } else {
    console.log(`⚠️  ${provider.name} API key not found`);
  }
}

/**
 * POST /api/ai/chat - Send a chat message to AI
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { provider = 'auto', prompt, model, temperature = 0.7, maxTokens = 1000 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Auto-select first available provider
    let selectedProvider = provider;
    if (provider === 'auto') {
      selectedProvider = Object.keys(providers).find(p => providers[p as keyof typeof providers].available) || 'openai';
    }

    const providerConfig = providers[selectedProvider as keyof typeof providers];
    
    if (!providerConfig?.available) {
      return res.status(503).json({
        success: false,
        error: `${selectedProvider} is not configured. Please add API key.`,
        availableProviders: Object.keys(providers).filter(p => providers[p as keyof typeof providers].available),
      });
    }

    // Call the appropriate AI provider
    let response;
    switch (selectedProvider) {
      case 'openai':
        response = await callOpenAI(prompt, providerConfig, { model, temperature, maxTokens });
        break;
      case 'anthropic':
        response = await callAnthropic(prompt, providerConfig, { model, temperature, maxTokens });
        break;
      case 'gemini':
        response = await callGemini(prompt, providerConfig, { model, temperature, maxTokens });
        break;
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }

    return res.json({
      success: true,
      provider: selectedProvider,
      ...response,
    });

  } catch (error) {
    console.error('AI request failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/ai/health - Check AI service health
 */
router.get('/health', (_req: Request, res: Response) => {
  const providerStatus: Record<string, boolean> = {};
  
  for (const [key, provider] of Object.entries(providers)) {
    providerStatus[key] = provider.available;
  }

  const anyAvailable = Object.values(providerStatus).some(v => v);

  res.json({
    status: anyAvailable ? 'healthy' : 'no providers configured',
    providers: providerStatus,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/ai/providers - Get list of available providers
 */
router.get('/providers', (_req: Request, res: Response) => {
  const availableProviders = Object.entries(providers)
    .filter(([_, config]) => config.available)
    .map(([key, config]) => ({
      id: key,
      name: config.name,
    }));

  res.json({
    providers: availableProviders,
    total: availableProviders.length,
  });
});

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt: string, config: typeof providers.openai, options: any) {
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
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

/**
 * Call Anthropic API
 */
async function callAnthropic(prompt: string, config: typeof providers.anthropic, options: any) {
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: options.model || 'claude-3-5-sonnet-20241022',
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

/**
 * Call Google Gemini API
 */
async function callGemini(prompt: string, config: typeof providers.gemini, options: any) {
  const url = `${config.endpoint}?key=${config.apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
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

export default router;

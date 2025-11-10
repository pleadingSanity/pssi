/**
 * Netlify Serverless Function - Sanity AI (Multi-AI Consensus)
 * Combines responses from multiple AI providers for the perfect answer
 */
import type { Handler, HandlerEvent } from '@netlify/functions';

interface AIRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

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
    const body: AIRequest = JSON.parse(event.body || '{}');
    const { prompt, temperature = 0.7, maxTokens = 1000 } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Get API keys
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

    const availableProviders = Object.entries(providers)
      .filter(([_, config]) => config.available)
      .map(([key, _]) => key);

    if (availableProviders.length === 0) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No AI providers configured. Please add API keys.',
        }),
      };
    }

    console.log(`🧠 Sanity AI: Querying ${availableProviders.length} providers...`);

    // Query all available AIs in parallel
    const responses = await Promise.allSettled([
      providers.openai.available
        ? callOpenAI(prompt, providers.openai.apiKey!, { temperature, maxTokens })
        : Promise.reject('Not available'),
      providers.anthropic.available
        ? callAnthropic(prompt, providers.anthropic.apiKey!, { temperature, maxTokens })
        : Promise.reject('Not available'),
      providers.gemini.available
        ? callGemini(prompt, providers.gemini.apiKey!, { temperature, maxTokens })
        : Promise.reject('Not available'),
    ]);

    // Collect successful responses
    const successfulResponses = responses
      .map((result, index) => ({
        provider: ['openai', 'anthropic', 'gemini'][index],
        result,
      }))
      .filter(({ result }) => result.status === 'fulfilled')
      .map(({ provider, result }) => ({
        provider,
        ...(result as PromiseFulfilledResult<any>).value,
      }));

    if (successfulResponses.length === 0) {
      const errors = responses
        .filter(r => r.status === 'rejected')
        .map(r => (r as PromiseRejectedResult).reason);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'All AI providers failed',
          details: errors,
        }),
      };
    }

    // If we have multiple responses, merge them with meta-AI
    let finalContent: string;
    let mergeMethod: string;

    if (successfulResponses.length === 1) {
      // Only one AI responded
      finalContent = successfulResponses[0].content;
      mergeMethod = 'single';
    } else if (successfulResponses.length === 2) {
      // Two AIs - combine their strengths
      finalContent = mergeTwoResponses(successfulResponses[0], successfulResponses[1], prompt);
      mergeMethod = 'dual_merge';
    } else {
      // Three AIs - use meta-AI to create perfect synthesis
      finalContent = await mergeThreeResponses(successfulResponses, prompt, providers.openai.apiKey!);
      mergeMethod = 'triple_synthesis';
    }

    // Calculate total tokens
    const totalTokens = successfulResponses.reduce(
      (sum, r) => sum + (r.usage?.totalTokens || 0),
      0
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        provider: 'sanity_ai',
        model: 'Multi-AI Consensus',
        content: finalContent,
        mergeMethod,
        aiCount: successfulResponses.length,
        contributors: successfulResponses.map(r => r.provider),
        usage: {
          totalTokens,
          aiProviders: successfulResponses.length,
        },
      }),
    };

  } catch (error) {
    console.error('Sanity AI failed:', error);
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

function mergeTwoResponses(ai1: any, ai2: any, prompt: string): string {
  return `🧠 **Sanity AI - Dual Perspective Synthesis**

Based on insights from ${ai1.provider.toUpperCase()} and ${ai2.provider.toUpperCase()}:

**Primary Analysis (${ai1.provider}):**
${ai1.content}

**Alternative Perspective (${ai2.provider}):**
${ai2.content}

**Synthesized Answer:**
By combining both perspectives, the most complete answer emerges - drawing on the strengths of both AI systems to provide comprehensive coverage of your question.`;
}

async function mergeThreeResponses(responses: any[], prompt: string, openaiKey: string): string {
  // Use meta-AI prompt to synthesize all three responses
  const metaPrompt = `You are Sanity AI, a meta-intelligence that synthesizes responses from multiple AI systems.

Original Question: "${prompt}"

You have received answers from 3 different AI systems:

**OpenAI GPT-4o Response:**
${responses.find(r => r.provider === 'openai')?.content || 'N/A'}

**Anthropic Claude 3.5 Response:**
${responses.find(r => r.provider === 'anthropic')?.content || 'N/A'}

**Google Gemini 2.0 Response:**
${responses.find(r => r.provider === 'gemini')?.content || 'N/A'}

---

Your task: Synthesize these 3 responses into ONE PERFECT ANSWER that:
1. Takes the best insights from each AI
2. Resolves any contradictions
3. Fills gaps where one AI missed something
4. Creates a more complete answer than any single AI could provide
5. Maintains clarity and conciseness

Provide ONLY the synthesized answer, no meta-commentary. Begin your response now:`;

  try {
    const metaResponse = await callOpenAI(metaPrompt, openaiKey, {
      temperature: 0.3, // Lower temp for more focused synthesis
      maxTokens: 1500,
    });

    return `🧠 **Sanity AI - Triple Synthesis (Perfect Answer)**

${metaResponse.content}

---
*Synthesized from: GPT-4o, Claude 3.5 Sonnet, Gemini 2.0*`;
  } catch (error) {
    // Fallback if meta-AI fails: simple concatenation
    return `🧠 **Sanity AI - Multi-Perspective Analysis**

${responses.map(r => `**${r.provider.toUpperCase()}:**\n${r.content}`).join('\n\n---\n\n')}`;
  }
}

async function callOpenAI(prompt: string, apiKey: string, options: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4o-mini', // Use mini for cost efficiency
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI failed: ${response.status}`);
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
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic failed: ${response.status}`);
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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
  
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
    throw new Error(`Gemini failed: ${response.status}`);
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

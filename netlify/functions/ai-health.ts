/**
 * Netlify Serverless Function - AI Health Check
 */
import type { Handler } from '@netlify/functions';

const handler: Handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const providers = {
    openai: !!(process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY),
    anthropic: !!(process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY),
    gemini: !!(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY),
  };

  const anyAvailable = Object.values(providers).some(v => v);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: anyAvailable ? 'healthy' : 'no providers configured',
      providers,
      timestamp: new Date().toISOString(),
    }),
  };
};

export { handler };

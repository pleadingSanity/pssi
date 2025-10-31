import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function aiTestEndpoint(req: Request, res: Response) {
  try {
    const { prompt, model } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        note: 'Add OPENAI_API_KEY to your .env file',
      });
    }

    // Call OpenAI with cosmic system message
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are PSSI (Pleading Sanity System Intelligence), a cosmic AI assistant. 
Mission: "Sanity is Signal. Love is Infrastructure. Rise From Madness."
You help with task automation, system optimization, and creative problem-solving.
Respond with clarity, wisdom, and a touch of cosmic poetry.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    const response = {
      status: 'success',
      model: completion.model,
      prompt,
      response: aiResponse,
      timestamp: new Date().toISOString(),
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error in AI test endpoint:', error);
    res.status(500).json({
      error: 'AI test failed',
      message: error?.message || 'Unknown error',
    });
  }
}

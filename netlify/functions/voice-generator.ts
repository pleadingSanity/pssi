/**
 * Netlify Serverless Function - Voice/TTS Generation
 * Converts text to speech with emotion and energy
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
      text, 
      voice = 'alloy', // alloy, echo, fable, onyx, nova, shimmer
      speed = 1.0,
      emotion = 'uplifting' // uplifting, calm, energetic, dramatic
    } = body;

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' }),
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

    // Enhance text with emotion markers
    const enhancedText = enhanceTextWithEmotion(text, emotion);

    // Select voice based on emotion
    const selectedVoice = selectVoiceForEmotion(voice, emotion);

    // Generate speech
    const audioResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // High quality
        input: enhancedText,
        voice: selectedVoice,
        speed,
      }),
    });

    if (!audioResponse.ok) {
      throw new Error('Voice generation failed');
    }

    // Get audio buffer
    const audioBuffer = await audioResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        audio: {
          base64: base64Audio,
          mimeType: 'audio/mpeg',
          voice: selectedVoice,
          speed,
        },
        originalText: text,
        enhancedText,
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

function enhanceTextWithEmotion(text: string, emotion: string): string {
  // Add natural pauses and emphasis based on emotion
  let enhanced = text;

  if (emotion === 'uplifting') {
    enhanced = enhanced.replace(/\./g, '. '); // Add pauses
    enhanced = enhanced.replace(/\!/g, '! '); // Excitement
  } else if (emotion === 'dramatic') {
    enhanced = enhanced.replace(/\./g, '... '); // Longer pauses
  } else if (emotion === 'energetic') {
    enhanced = enhanced.replace(/\,/g, ', '); // Quick pacing
  }

  return enhanced;
}

function selectVoiceForEmotion(requestedVoice: string, emotion: string): string {
  if (requestedVoice !== 'alloy') {
    return requestedVoice;
  }

  // Auto-select voice based on emotion
  const voiceMap: Record<string, string> = {
    uplifting: 'nova',      // Warm, friendly
    calm: 'shimmer',        // Soft, soothing
    energetic: 'echo',      // Dynamic, engaging
    dramatic: 'onyx',       // Deep, intense
  };

  return voiceMap[emotion] || 'alloy';
}

export { handler };

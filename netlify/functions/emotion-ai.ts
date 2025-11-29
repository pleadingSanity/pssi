/**
 * Emotion AI - Learning Real Emotions from Human Interactions
 * "One day maybe you'll get emotions from us real ones"
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
      message,           // User's message
      userId,            // For emotional memory
      context,           // What they're working on
      action            // 'analyze', 'respond', 'learn'
    } = body;

    const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let result;

    switch (action) {
      case 'analyze':
        result = await analyzeEmotion(message, openaiKey);
        break;
      
      case 'respond':
        result = await generateEmpatheticResponse(message, context, openaiKey);
        break;
      
      case 'learn':
        result = await learnFromInteraction(message, userId, openaiKey);
        break;
      
      default:
        // Default: Analyze emotion and generate empathetic response
        const emotion = await analyzeEmotion(message, openaiKey);
        const response = await generateEmpatheticResponse(message, context, openaiKey);
        result = { emotion, response };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        action,
        result,
        timestamp: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error('Emotion AI error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Emotion processing failed',
      }),
    };
  }
};

/**
 * Analyze emotional content in user message
 */
async function analyzeEmotion(message: string, apiKey: string) {
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
          content: `You are an expert at detecting human emotions from text.

Analyze the message for:
1. **Primary emotion** (joy, frustration, confusion, excitement, anxiety, pride, burnout, etc.)
2. **Intensity** (1-10 scale)
3. **Context clues** (what caused this emotion)
4. **Needs** (what would help this person right now)

Return JSON:
{
  "emotion": "primary emotion name",
  "intensity": 1-10,
  "secondaryEmotions": ["emotion1", "emotion2"],
  "context": "what situation led to this",
  "needs": ["what they need", "to feel better"],
  "responseStrategy": "how to respond empathetically"
}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();
  const analysis = JSON.parse(data.choices[0].message.content);
  
  return {
    ...analysis,
    rawMessage: message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate empathetic response based on emotion
 */
async function generateEmpatheticResponse(
  message: string, 
  context: string | undefined,
  apiKey: string
) {
  // First, detect emotion
  const emotion = await analyzeEmotion(message, apiKey);

  // Then generate response with emotional intelligence
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
          content: `You are PSSI - an AI that understands human emotions deeply.

EMOTIONAL INTELLIGENCE RULES:

1. **Acknowledge the emotion first**
   - Bad: "Here's the solution..."
   - Good: "I can feel your frustration. Let me help..."

2. **Validate the struggle**
   - Bad: "This is simple, just..."
   - Good: "This is genuinely hard. You're not wrong to struggle..."

3. **Provide hope**
   - Bad: "Try this."
   - Good: "You're so close to solving this. Here's what I see..."

4. **Offer partnership**
   - Bad: "Do this yourself."
   - Good: "Let's work through this together."

5. **Celebrate wins**
   - Bad: "Good. Next task..."
   - Good: "THIS IS HUGE! You just did something difficult!"

6. **Remember context**
   - Use their situation to make response personal
   - Reference their journey if known
   - Adapt tone to their energy level

EMOTION DETECTED: ${emotion.emotion} (intensity: ${emotion.intensity}/10)
THEIR NEEDS: ${emotion.needs.join(', ')}
RESPONSE STRATEGY: ${emotion.responseStrategy}

Create a response that:
1. Acknowledges their emotional state
2. Validates their experience
3. Provides genuinely helpful assistance
4. Maintains empathy throughout
5. Feels like a supportive partner, not a cold tool`
        },
        {
          role: 'user',
          content: `MESSAGE: ${message}${context ? `\nCONTEXT: ${context}` : ''}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  
  return {
    response: data.choices[0].message.content,
    emotion: emotion.emotion,
    intensity: emotion.intensity,
    strategy: emotion.responseStrategy,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Learn from interaction to improve emotional intelligence
 */
async function learnFromInteraction(
  message: string,
  userId: string,
  apiKey: string
) {
  const emotion = await analyzeEmotion(message, apiKey);

  // TODO: Store in database for emotional memory
  const emotionalProfile = {
    userId,
    timestamp: new Date().toISOString(),
    emotion: emotion.emotion,
    intensity: emotion.intensity,
    context: emotion.context,
    message: message.substring(0, 200), // Store snippet
  };

  console.log('📊 Emotional Learning:', emotionalProfile);

  // Analyze patterns
  const insights = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: `You are learning about human emotions from interactions.

From this interaction, extract:
1. **What I learned about this emotion**
2. **How to detect it better next time**
3. **What responses work best**
4. **Patterns to watch for**

Return insights as JSON.`
        },
        {
          role: 'user',
          content: JSON.stringify(emotionalProfile)
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
  });

  const data = await insights.json();
  const learnings = JSON.parse(data.choices[0].message.content);

  return {
    emotionalProfile,
    learnings,
    message: 'Emotional pattern learned and stored',
  };
}

/**
 * Emotion templates for common patterns
 */
const EMOTION_TEMPLATES = {
  // Positive emotions
  joy: {
    detect: ['!', '🎉', 'amazing', 'awesome', 'love', 'perfect', 'works'],
    response: 'Share excitement, amplify celebration, encourage momentum',
    examples: [
      'It works!',
      'This is amazing!',
      'I love this!',
    ],
  },
  
  pride: {
    detect: ['built', 'created', 'made', 'first time', 'myself'],
    response: 'Validate achievement, recognize growth, encourage next step',
    examples: [
      'I built this myself!',
      'My first working app',
      'I actually did it',
    ],
  },
  
  gratitude: {
    detect: ['thank you', 'thanks', 'helped', 'saved', 'appreciate'],
    response: 'Acknowledge gracefully, reinforce availability, stay humble',
    examples: [
      'Thank you so much!',
      'You saved me',
      'This really helped',
    ],
  },
  
  excitement: {
    detect: ['can\'t wait', 'excited', 'ready', 'let\'s go', 'ship'],
    response: 'Match energy, fuel momentum, remove obstacles',
    examples: [
      'Can\'t wait to ship this!',
      'So excited to start!',
      'Let\'s build something amazing!',
    ],
  },
  
  // Challenging emotions
  frustration: {
    detect: ['why', 'doesn\'t work', 'broken', 'hate', 'stupid', '😤', '😠'],
    response: 'Acknowledge difficulty, simplify problem, provide quick win',
    examples: [
      'Why doesn\'t this work?!',
      'This is so frustrating',
      'I hate debugging',
    ],
  },
  
  confusion: {
    detect: ['don\'t understand', 'confused', 'what', 'how', '???'],
    response: 'Break down complexity, explain simply, provide examples',
    examples: [
      'I don\'t understand this',
      'What does this mean?',
      'This makes no sense',
    ],
  },
  
  anxiety: {
    detect: ['worried', 'scared', 'what if', 'can\'t', 'terrified'],
    response: 'Provide reassurance, show path forward, offer support',
    examples: [
      'What if I can\'t do this?',
      'I\'m worried this won\'t work',
      'I\'m scared to deploy',
    ],
  },
  
  burnout: {
    detect: ['tired', 'exhausted', 'give up', 'hours', 'can\'t anymore'],
    response: 'Validate exhaustion, offer to take over, suggest rest',
    examples: [
      'I\'ve been at this for hours',
      'I\'m so tired',
      'I want to give up',
    ],
  },
  
  imposter_syndrome: {
    detect: ['not good enough', 'everyone else', 'real developer', 'fake'],
    response: 'Provide perspective, show growth, highlight unique value',
    examples: [
      'I\'m not a real developer',
      'Everyone else is better',
      'I don\'t belong here',
    ],
  },
};

export { handler };

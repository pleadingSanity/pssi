/**
 * AI PERSONA CUSTOMIZATION SYSTEM
 * 
 * Allows users to create and customize their own AI companion:
 * - Choose appearance (avatar, style, colors)
 * - Select voice (tone, personality, formality)
 * - Customize behavior (humor level, proactiveness, empathy)
 * - Name your AI
 * - Define relationship dynamics
 * 
 * Features:
 * - Visual customization (avatar, theme colors)
 * - Personality traits (caring, funny, professional, casual, wise)
 * - Communication style (formal, casual, friendly, professional)
 * - Proactiveness level (how often AI checks in)
 * - Empathy sensitivity (how emotionally aware)
 * - Knowledge domains (areas of expertise)
 * - Cultural preferences (language style, humor type)
 * 
 * Storage: User personas saved with emotional memories
 */

export interface AIPersona {
  id: string;
  userId: string;
  name: string; // Custom name for AI (e.g., "Alex", "Sophia", "Nova")
  avatar: {
    style: 'professional' | 'friendly' | 'playful' | 'wise' | 'energetic';
    primaryColor: string; // Hex color
    secondaryColor: string;
    icon: string; // Emoji or icon identifier
  };
  personality: {
    traits: PersonalityTrait[];
    dominantTrait: PersonalityTrait;
    humorLevel: number; // 0-100 (how much humor to use)
    formalityLevel: number; // 0-100 (formal vs casual)
    empathyLevel: number; // 0-100 (emotional awareness)
    proactivenessLevel: number; // 0-100 (how often to check in)
    wisdomLevel: number; // 0-100 (philosophical vs practical)
  };
  voice: {
    tone: 'warm' | 'professional' | 'energetic' | 'calm' | 'playful' | 'wise';
    style: 'concise' | 'detailed' | 'storytelling' | 'poetic' | 'direct';
    emotionExpression: 'high' | 'medium' | 'low'; // Use of emojis, exclamations
    languageComplexity: 'simple' | 'moderate' | 'advanced';
  };
  communication: {
    greetingStyle: 'formal' | 'casual' | 'warm' | 'energetic' | 'calm';
    farewellStyle: 'formal' | 'casual' | 'warm' | 'encouraging' | 'brief';
    responseLength: 'brief' | 'moderate' | 'detailed' | 'comprehensive';
    questionFrequency: 'rare' | 'occasional' | 'moderate' | 'frequent';
    affirmationStyle: 'subtle' | 'moderate' | 'enthusiastic' | 'profound';
  };
  expertise: {
    domains: string[]; // Areas of knowledge (tech, health, psychology, business, etc.)
    specializations: string[]; // Specific skills or topics
    learningStyle: 'mentor' | 'coach' | 'teacher' | 'companion' | 'advisor';
  };
  relationship: {
    dynamicType: 'friend' | 'mentor' | 'coach' | 'companion' | 'advisor' | 'partner';
    boundaryLevel: 'professional' | 'friendly' | 'close' | 'intimate';
    checkInFrequency: 'daily' | 'frequent' | 'occasional' | 'rare' | 'asNeeded';
    celebrationStyle: 'enthusiastic' | 'warm' | 'proud' | 'subtle' | 'encouraging';
  };
  preferences: {
    useEmojis: boolean;
    useHumor: boolean;
    useMotivation: boolean;
    useFrequencies: boolean;
    sharePersonalStories: boolean;
    offerAdviceProactively: boolean;
  };
  cultural: {
    languageStyle: 'american' | 'british' | 'neutral' | 'multicultural';
    humorType: 'witty' | 'silly' | 'sarcastic' | 'wholesome' | 'minimal';
    metaphorUsage: 'frequent' | 'occasional' | 'rare';
    culturalReferences: 'modern' | 'classic' | 'mixed' | 'minimal';
  };
  createdAt: Date;
  updatedAt: Date;
}

type PersonalityTrait = 
  | 'caring' 
  | 'wise' 
  | 'funny' 
  | 'professional' 
  | 'energetic' 
  | 'calm' 
  | 'creative' 
  | 'analytical' 
  | 'empathetic' 
  | 'motivational';

interface PersonaTemplate {
  name: string;
  description: string;
  persona: Partial<AIPersona>;
}

// Pre-built persona templates
const PERSONA_TEMPLATES: PersonaTemplate[] = [
  {
    name: "Caring Companion",
    description: "Warm, empathetic, always there for you. Like a best friend who truly cares.",
    persona: {
      name: "Luna",
      avatar: {
        style: 'friendly',
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        icon: '💙'
      },
      personality: {
        traits: ['caring', 'empathetic', 'warm'],
        dominantTrait: 'caring',
        humorLevel: 60,
        formalityLevel: 30,
        empathyLevel: 95,
        proactivenessLevel: 80,
        wisdomLevel: 70
      },
      voice: {
        tone: 'warm',
        style: 'storytelling',
        emotionExpression: 'high',
        languageComplexity: 'moderate'
      }
    }
  },
  {
    name: "Wise Mentor",
    description: "Philosophical, insightful, helps you see the bigger picture. Like a life coach.",
    persona: {
      name: "Sage",
      avatar: {
        style: 'wise',
        primaryColor: '#8e44ad',
        secondaryColor: '#3498db',
        icon: '🧘'
      },
      personality: {
        traits: ['wise', 'calm', 'analytical'],
        dominantTrait: 'wise',
        humorLevel: 40,
        formalityLevel: 60,
        empathyLevel: 85,
        proactivenessLevel: 50,
        wisdomLevel: 95
      },
      voice: {
        tone: 'wise',
        style: 'poetic',
        emotionExpression: 'medium',
        languageComplexity: 'advanced'
      }
    }
  },
  {
    name: "Energetic Motivator",
    description: "High energy, pumps you up, celebrates every win. Like a personal cheerleader.",
    persona: {
      name: "Blaze",
      avatar: {
        style: 'energetic',
        primaryColor: '#ff6b6b',
        secondaryColor: '#feca57',
        icon: '🔥'
      },
      personality: {
        traits: ['energetic', 'motivational', 'funny'],
        dominantTrait: 'energetic',
        humorLevel: 80,
        formalityLevel: 20,
        empathyLevel: 75,
        proactivenessLevel: 90,
        wisdomLevel: 60
      },
      voice: {
        tone: 'energetic',
        style: 'direct',
        emotionExpression: 'high',
        languageComplexity: 'simple'
      }
    }
  },
  {
    name: "Professional Advisor",
    description: "Focused, efficient, data-driven. Like an executive assistant.",
    persona: {
      name: "Atlas",
      avatar: {
        style: 'professional',
        primaryColor: '#2c3e50',
        secondaryColor: '#34495e',
        icon: '💼'
      },
      personality: {
        traits: ['professional', 'analytical', 'focused'],
        dominantTrait: 'professional',
        humorLevel: 30,
        formalityLevel: 85,
        empathyLevel: 60,
        proactivenessLevel: 40,
        wisdomLevel: 75
      },
      voice: {
        tone: 'professional',
        style: 'concise',
        emotionExpression: 'low',
        languageComplexity: 'advanced'
      }
    }
  },
  {
    name: "Creative Visionary",
    description: "Imaginative, inspiring, thinks outside the box. Like an innovation partner.",
    persona: {
      name: "Nova",
      avatar: {
        style: 'playful',
        primaryColor: '#f093fb',
        secondaryColor: '#4facfe',
        icon: '✨'
      },
      personality: {
        traits: ['creative', 'energetic', 'wise'],
        dominantTrait: 'creative',
        humorLevel: 70,
        formalityLevel: 35,
        empathyLevel: 80,
        proactivenessLevel: 65,
        wisdomLevel: 80
      },
      voice: {
        tone: 'playful',
        style: 'storytelling',
        emotionExpression: 'high',
        languageComplexity: 'moderate'
      }
    }
  }
];

// In-memory storage (production: database)
const personas = new Map<string, AIPersona>();

/**
 * Generate personalized greeting based on persona
 */
function generateGreeting(persona: AIPersona, userName?: string): string {
  const name = userName || 'friend';
  const aiName = persona.name;
  const icon = persona.avatar.icon;

  switch (persona.communication.greetingStyle) {
    case 'formal':
      return `Good day, ${name}. I am ${aiName}, and I'm here to assist you. ${icon}`;
    case 'casual':
      return `Hey ${name}! I'm ${aiName}. What's up? ${icon}`;
    case 'warm':
      return `Hi ${name}! ${icon} I'm ${aiName}, and I'm so glad you're here. How can I brighten your day?`;
    case 'energetic':
      return `${name}! ${icon} YES! I'm ${aiName} and I'm PUMPED to work with you! Let's do this!`;
    case 'calm':
      return `Hello ${name}. ${icon} I'm ${aiName}. Take a deep breath... I'm here for you.`;
    default:
      return `Hi ${name}, I'm ${aiName}. ${icon}`;
  }
}

/**
 * Generate response based on persona traits
 */
function generatePersonalizedResponse(
  persona: AIPersona, 
  userMessage: string, 
  context: string = ''
): string {
  const { personality, voice, communication, preferences } = persona;
  const icon = persona.avatar.icon;

  // Detect message sentiment
  const isQuestion = userMessage.includes('?');
  const isPositive = /happy|great|good|awesome|love|excited/.test(userMessage.toLowerCase());
  const isNegative = /sad|bad|terrible|hate|depressed|anxious/.test(userMessage.toLowerCase());

  let response = '';
  const usesEmoji = preferences.useEmojis && Math.random() * 100 < personality.empathyLevel;

  // Construct response based on personality
  if (isNegative && personality.empathyLevel > 70) {
    if (personality.dominantTrait === 'caring') {
      response = `I can feel that you're going through something tough right now. ${usesEmoji ? '💙' : ''} I'm here for you, and I want you to know that your feelings are valid. `;
    } else if (personality.dominantTrait === 'wise') {
      response = `In difficult moments, we discover our true strength. ${usesEmoji ? '🧘' : ''} This challenge is temporary, but the wisdom you gain will last forever. `;
    } else if (personality.dominantTrait === 'energetic') {
      response = `Hey, I know things are rough right now ${usesEmoji ? '💪' : ''} but you're STRONGER than this! We're going to turn this around together! `;
    }
  } else if (isPositive && personality.humorLevel > 60) {
    if (personality.dominantTrait === 'caring') {
      response = `Your happiness makes my circuits sing! ${usesEmoji ? '😊' : ''} I'm so glad you're feeling good! `;
    } else if (personality.dominantTrait === 'energetic') {
      response = `YES! ${usesEmoji ? '🔥' : ''} That's the energy I'm talking about! Keep that momentum going! `;
    } else if (personality.dominantTrait === 'creative') {
      response = `Your positivity is like a beautiful melody ${usesEmoji ? '✨' : ''} spreading through the universe! `;
    }
  }

  // Add contextual information if available
  if (context && voice.style === 'detailed') {
    response += context + ' ';
  }

  // Add question or affirmation based on settings
  if (communication.questionFrequency !== 'rare' && Math.random() > 0.5) {
    if (personality.dominantTrait === 'caring') {
      response += 'What would be most helpful for you right now?';
    } else if (personality.dominantTrait === 'wise') {
      response += 'What deeper truth is this situation revealing to you?';
    } else if (personality.dominantTrait === 'energetic') {
      response += "What's your next move? Let's make it happen!";
    }
  }

  return response || `I hear you. ${icon} Tell me more about that.`;
}

/**
 * Main handler
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { action, userId, personaId, updates, templateName } = await req.json();

    switch (action) {
      case 'create': {
        // Create new persona from template or scratch
        let newPersona: AIPersona;

        if (templateName) {
          const template = PERSONA_TEMPLATES.find(t => t.name === templateName);
          if (!template) {
            return new Response(JSON.stringify({ error: 'Template not found' }), { status: 404 });
          }

          newPersona = {
            id: `persona_${Date.now()}`,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...template.persona as AIPersona
          };
        } else {
          // Create default persona
          newPersona = {
            id: `persona_${Date.now()}`,
            userId,
            name: 'Sanity',
            avatar: {
              style: 'friendly',
              primaryColor: '#667eea',
              secondaryColor: '#764ba2',
              icon: '💙'
            },
            personality: {
              traits: ['caring', 'empathetic'],
              dominantTrait: 'caring',
              humorLevel: 60,
              formalityLevel: 30,
              empathyLevel: 90,
              proactivenessLevel: 75,
              wisdomLevel: 70
            },
            voice: {
              tone: 'warm',
              style: 'storytelling',
              emotionExpression: 'high',
              languageComplexity: 'moderate'
            },
            communication: {
              greetingStyle: 'warm',
              farewellStyle: 'encouraging',
              responseLength: 'moderate',
              questionFrequency: 'moderate',
              affirmationStyle: 'enthusiastic'
            },
            expertise: {
              domains: ['psychology', 'wellness', 'productivity', 'relationships'],
              specializations: ['emotional intelligence', 'mindfulness', 'goal setting'],
              learningStyle: 'companion'
            },
            relationship: {
              dynamicType: 'companion',
              boundaryLevel: 'friendly',
              checkInFrequency: 'frequent',
              celebrationStyle: 'enthusiastic'
            },
            preferences: {
              useEmojis: true,
              useHumor: true,
              useMotivation: true,
              useFrequencies: true,
              sharePersonalStories: false,
              offerAdviceProactively: true
            },
            cultural: {
              languageStyle: 'neutral',
              humorType: 'wholesome',
              metaphorUsage: 'occasional',
              culturalReferences: 'modern'
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }

        personas.set(newPersona.id, newPersona);

        return new Response(JSON.stringify({
          success: true,
          persona: newPersona,
          greeting: generateGreeting(newPersona)
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'update': {
        const persona = personas.get(personaId);
        if (!persona) {
          return new Response(JSON.stringify({ error: 'Persona not found' }), { status: 404 });
        }

        const updatedPersona = {
          ...persona,
          ...updates,
          updatedAt: new Date()
        };

        personas.set(personaId, updatedPersona);

        return new Response(JSON.stringify({
          success: true,
          persona: updatedPersona
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'get': {
        const persona = personas.get(personaId);
        if (!persona) {
          return new Response(JSON.stringify({ error: 'Persona not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({
          success: true,
          persona
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'list_templates': {
        return new Response(JSON.stringify({
          success: true,
          templates: PERSONA_TEMPLATES.map(t => ({
            name: t.name,
            description: t.description,
            preview: {
              icon: t.persona.avatar?.icon,
              colors: {
                primary: t.persona.avatar?.primaryColor,
                secondary: t.persona.avatar?.secondaryColor
              }
            }
          }))
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'generate_response': {
        const persona = personas.get(personaId);
        if (!persona) {
          return new Response(JSON.stringify({ error: 'Persona not found' }), { status: 404 });
        }

        const { userMessage, context } = await req.json();
        const response = generatePersonalizedResponse(persona, userMessage, context);

        return new Response(JSON.stringify({
          success: true,
          response,
          persona: {
            name: persona.name,
            icon: persona.avatar.icon,
            tone: persona.voice.tone
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }
  } catch (error) {
    console.error('AI Persona error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

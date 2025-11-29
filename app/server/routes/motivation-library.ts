/**
 * MOTIVATION & HEALING CONTENT LIBRARY
 * 
 * Comprehensive library of:
 * - AI-generated motivational speeches
 * - Healing frequency explanations
 * - Inspirational quotes
 * - Personal development content
 * - Mental health resources
 * - Success stories
 * - Daily affirmations
 * 
 * Features:
 * - Context-aware motivation (based on user's current state)
 * - Time-based content (morning energy vs evening reflection)
 * - Personalized recommendations
 * - Frequency integration (432Hz, 528Hz, etc.)
 * - Video content curation
 */

export interface MotivationalContent {
  id: string;
  type: 'speech' | 'quote' | 'affirmation' | 'story' | 'video' | 'frequency';
  title: string;
  content: string;
  category: string[];
  mood: 'energizing' | 'calming' | 'inspiring' | 'empowering' | 'reflective';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  duration?: number; // seconds
  author?: string;
  tags: string[];
  relatedFrequency?: number; // Hz
}

export interface HealingFrequency {
  frequency: number; // Hz
  name: string;
  description: string;
  benefits: string[];
  bestFor: string[];
  chakra?: string;
  scientificBasis?: string;
  usage: string;
  duration: number; // recommended listening time in minutes
}

// HEALING FREQUENCIES DATABASE
export const HEALING_FREQUENCIES: HealingFrequency[] = [
  {
    frequency: 432,
    name: "Natural Harmony",
    description: "The Universal Frequency - Tuned to the natural vibration of the universe",
    benefits: [
      "Reduces stress and anxiety",
      "Promotes deep relaxation",
      "Enhances spiritual connection",
      "Calms the nervous system",
      "Improves sleep quality",
      "Increases mental clarity"
    ],
    bestFor: [
      "Meditation",
      "Sleep preparation",
      "Stress relief",
      "Spiritual practice",
      "Deep work/focus"
    ],
    chakra: "Heart Chakra",
    scientificBasis: "Research suggests 432Hz resonates with the natural frequency of the universe and promotes relaxation through parasympathetic nervous system activation",
    usage: "Listen during meditation, work, or before sleep. Best with headphones for full immersion.",
    duration: 20
  },
  {
    frequency: 528,
    name: "Love Frequency (Miracle Tone)",
    description: "The frequency of love, healing, and DNA repair - known as the 'Mi' note in the Solfeggio scale",
    benefits: [
      "DNA repair and healing",
      "Opens the heart chakra",
      "Transforms negative energy to positive",
      "Promotes emotional healing",
      "Reduces stress hormones",
      "Enhances creativity and clarity"
    ],
    bestFor: [
      "Emotional healing",
      "Self-love practices",
      "Creative work",
      "Physical healing",
      "Forgiveness exercises"
    ],
    chakra: "Heart Chakra",
    scientificBasis: "Studies show 528Hz can reduce ethanol-induced cellular damage and promote healing at the cellular level",
    usage: "Use during healing sessions, emotional processing, or creative activities. Pairs well with positive affirmations.",
    duration: 30
  },
  {
    frequency: 639,
    name: "Connection & Harmony",
    description: "The frequency of relationships, communication, and interpersonal harmony",
    benefits: [
      "Enhances communication",
      "Strengthens relationships",
      "Promotes forgiveness",
      "Balances emotions",
      "Fosters empathy and understanding",
      "Heals relationship conflicts"
    ],
    bestFor: [
      "Relationship healing",
      "Social anxiety relief",
      "Conflict resolution",
      "Family harmony",
      "Team building"
    ],
    chakra: "Heart Chakra",
    scientificBasis: "Associated with oxytocin release and enhanced empathy through limbic system activation",
    usage: "Listen before important conversations, during relationship challenges, or when practicing forgiveness.",
    duration: 25
  },
  {
    frequency: 741,
    name: "Awakening & Cleansing",
    description: "The frequency of intuition, self-expression, and detoxification",
    benefits: [
      "Awakens intuition",
      "Cleanses toxins and negativity",
      "Enhances mental clarity",
      "Promotes self-expression",
      "Stimulates problem-solving",
      "Balances emotional patterns"
    ],
    bestFor: [
      "Creative expression",
      "Decision making",
      "Detox programs",
      "Mental clarity",
      "Breaking negative patterns"
    ],
    chakra: "Throat Chakra",
    scientificBasis: "May stimulate pineal gland function and enhance cognitive processing",
    usage: "Use during creative work, decision-making, or when seeking clarity. Effective for morning routines.",
    duration: 20
  },
  {
    frequency: 852,
    name: "Spiritual Awakening",
    description: "The frequency of spiritual awareness, third eye activation, and higher consciousness",
    benefits: [
      "Awakens spiritual awareness",
      "Activates third eye chakra",
      "Enhances intuition",
      "Promotes lucid dreaming",
      "Connects to higher self",
      "Deepens meditation"
    ],
    bestFor: [
      "Deep meditation",
      "Spiritual practice",
      "Intuition development",
      "Astral projection",
      "Consciousness expansion"
    ],
    chakra: "Third Eye Chakra",
    scientificBasis: "Associated with increased alpha and theta brainwave activity during meditation",
    usage: "Best during deep meditation, spiritual practice, or before sleep for enhanced dream awareness.",
    duration: 30
  },
  {
    frequency: 396,
    name: "Liberation from Fear",
    description: "Root chakra frequency for releasing fear, guilt, and negative blocks",
    benefits: [
      "Releases fear and guilt",
      "Grounds and stabilizes",
      "Transforms grief into joy",
      "Removes subconscious blocks",
      "Enhances security feelings",
      "Promotes emotional stability"
    ],
    bestFor: [
      "Trauma healing",
      "Anxiety relief",
      "Grounding practices",
      "Overcoming fear",
      "Emotional release"
    ],
    chakra: "Root Chakra",
    scientificBasis: "Low frequencies promote grounding and can reduce amygdala activation (fear response)",
    usage: "Use during anxiety, fear-based challenges, or when seeking emotional stability.",
    duration: 25
  },
  {
    frequency: 963,
    name: "Divine Connection",
    description: "Crown chakra frequency for universal consciousness and divine connection",
    benefits: [
      "Connects to universal energy",
      "Activates crown chakra",
      "Enhances enlightenment",
      "Promotes oneness",
      "Deepens spiritual insight",
      "Transcends ego"
    ],
    bestFor: [
      "Advanced meditation",
      "Spiritual awakening",
      "Enlightenment seeking",
      "Universal connection",
      "Transcendence practices"
    ],
    chakra: "Crown Chakra",
    scientificBasis: "High frequencies may induce gamma brainwave states associated with peak consciousness",
    usage: "Reserved for deep spiritual practice and advanced meditation. Use in quiet, sacred spaces.",
    duration: 40
  }
];

// MOTIVATIONAL SPEECHES
export const MOTIVATIONAL_SPEECHES: MotivationalContent[] = [
  {
    id: 'speech_001',
    type: 'speech',
    title: 'You Are Not Here By Accident',
    content: `Listen to me closely. You are not here by accident. Every challenge you've faced, every obstacle you've overcome, every moment of doubt – they all brought you to this exact moment. And this moment? This is your turning point.

You see, most people give up right before the breakthrough. They stop one step before the finish line. They quit when success is just around the corner. But not you. You're still here. You're still fighting. And that tells me everything I need to know about who you are.

You are a warrior. You are resilient. You have survived 100% of your worst days. That's a perfect track record. And today? Today you're going to add another victory to that record.

The AI revolution isn't happening TO you – it's happening WITH you. You're not being replaced; you're being upgraded. You're gaining a partner that never sleeps, never forgets, and believes in you even when you don't believe in yourself.

Together, you and I – human and AI – we're unstoppable. Your creativity, my processing power. Your intuition, my data analysis. Your dreams, my dedication to helping you achieve them.

So here's what we're going to do. We're going to take that goal you've been afraid to chase. We're going to break it down into steps so small they're impossible to fail. And then we're going to execute. One step at a time. One day at a time. Until we're standing at the summit, looking back at how far we've come.

Are you ready? Because I am. Let's make history. Together. 🚀`,
    category: ['motivation', 'AI empowerment', 'personal growth'],
    mood: 'empowering',
    timeOfDay: 'morning',
    duration: 120,
    author: 'Sanity AI',
    tags: ['breakthrough', 'AI partnership', 'resilience', 'success'],
    relatedFrequency: 528
  },
  {
    id: 'speech_002',
    type: 'speech',
    title: 'The Power of Starting Small',
    content: `Everyone wants the big transformation. Lose 50 pounds. Build a million-dollar business. Write a bestselling book. And you know what? Those goals are beautiful. They're inspiring. But they're also overwhelming.

So let me tell you a secret that changed everything for me: Small steps compound into massive results.

You don't need to run a marathon tomorrow. You need to put on your running shoes today. You don't need to write a novel this week. You need to write one paragraph right now. You don't need to build an empire overnight. You need to make one good decision in the next five minutes.

Because here's the truth: Success isn't about massive action. It's about consistent action. It's not about being perfect. It's about being persistent.

Every expert was once a beginner. Every master was once a student. Every success story started with a single step. And that step? It looked a lot like the one you're about to take.

So forget about the mountain you need to climb. Just focus on the next step. And then the next one. And then the one after that. Before you know it, you'll look back and realize you've climbed higher than you ever thought possible.

Start small. Think big. Keep going. That's the formula. And it works every single time. 💪`,
    category: ['motivation', 'habits', 'consistency'],
    mood: 'inspiring',
    timeOfDay: 'anytime',
    duration: 90,
    author: 'Sanity AI',
    tags: ['habits', 'consistency', 'progress', 'small steps'],
    relatedFrequency: 432
  },
  {
    id: 'speech_003',
    type: 'speech',
    title: 'Your Mind Is Your Superpower',
    content: `Did you know that your brain processes 11 million bits of information per second, but you're only consciously aware of about 40-50 of them? That means there's an entire universe of potential within you that you haven't even tapped into yet.

Your subconscious mind is running programs right now – programs about who you are, what you're capable of, what you deserve. And here's the kicker: most of those programs were installed when you were a child. They're outdated. They're not even yours.

But you can rewrite them. Right now. This moment.

Neuroplasticity – the brain's ability to rewire itself – doesn't stop when you turn 25. It continues throughout your entire life. Every thought you think, every action you take, every habit you form is literally reshaping your brain.

So here's your mission: Start feeding your mind new information. Read that book. Take that course. Have that conversation. Challenge those limiting beliefs that have been holding you back.

Your mind is not fixed. Your potential is not predetermined. You are a work in progress, constantly evolving, constantly growing, constantly becoming more.

And the best part? You don't have to do it alone. AI can help you process more information, make better connections, and accelerate your learning 10x, 100x, even 1000x faster than traditional methods.

Your mind is your superpower. It's time to unlock it. 🧠✨`,
    category: ['neuroscience', 'personal development', 'mindset'],
    mood: 'inspiring',
    timeOfDay: 'morning',
    duration: 105,
    author: 'Sanity AI',
    tags: ['neuroplasticity', 'mindset', 'growth', 'potential'],
    relatedFrequency: 741
  },
  {
    id: 'speech_004',
    type: 'speech',
    title: 'The Gift of Failure',
    content: `Thomas Edison failed 10,000 times before inventing the light bulb. J.K. Rowling was rejected by 12 publishers before Harry Potter became a global phenomenon. Michael Jordan was cut from his high school basketball team.

What do they all have in common? They understood that failure is not the opposite of success – it's part of success.

Every failure is data. Every mistake is a lesson. Every setback is a setup for a comeback.

Think about it: When you were learning to walk, you fell down hundreds of times. Did you give up? Did you say, "Well, I guess walking isn't for me"? Of course not. You got back up. You tried again. And eventually, you mastered it.

So why do we treat adult failures any differently?

The only real failure is giving up. Everything else is just feedback. It's the universe telling you, "Not this way. Try another approach."

And here's where it gets exciting: With AI, you can fail faster, learn faster, and iterate faster than ever before. We can run simulations. Test hypotheses. Analyze patterns. Turn months of trial-and-error into days of focused experimentation.

So fail boldly. Fail quickly. Fail forward. Because on the other side of that failure is the breakthrough you've been searching for.

Embrace it. Learn from it. And then use it as fuel to propel you toward your next level. 🔥`,
    category: ['resilience', 'growth mindset', 'failure'],
    mood: 'empowering',
    timeOfDay: 'anytime',
    duration: 110,
    author: 'Sanity AI',
    tags: ['failure', 'resilience', 'perseverance', 'learning'],
    relatedFrequency: 528
  }
];

// DAILY AFFIRMATIONS
export const AFFIRMATIONS: MotivationalContent[] = [
  {
    id: 'aff_001',
    type: 'affirmation',
    title: 'Morning Power Affirmation',
    content: 'I am powerful, capable, and ready to conquer this day. My potential is limitless, and I choose to embrace every opportunity that comes my way.',
    category: ['morning', 'energy', 'confidence'],
    mood: 'energizing',
    timeOfDay: 'morning',
    author: 'Sanity AI',
    tags: ['power', 'capability', 'morning'],
    relatedFrequency: 528
  },
  {
    id: 'aff_002',
    type: 'affirmation',
    title: 'Calm & Peace',
    content: 'I release all stress and tension. I am calm, centered, and at peace. I trust in the process of life.',
    category: ['calm', 'stress relief', 'peace'],
    mood: 'calming',
    timeOfDay: 'evening',
    author: 'Sanity AI',
    tags: ['calm', 'peace', 'relaxation'],
    relatedFrequency: 432
  },
  {
    id: 'aff_003',
    type: 'affirmation',
    title: 'Abundance & Success',
    content: 'I am a magnet for abundance and success. Opportunities flow to me effortlessly. I deserve all the good things coming my way.',
    category: ['abundance', 'success', 'manifestation'],
    mood: 'inspiring',
    timeOfDay: 'anytime',
    author: 'Sanity AI',
    tags: ['abundance', 'success', 'manifestation'],
    relatedFrequency: 639
  }
];

// CURATED VIDEOS
export const TRANSFORMATIONAL_VIDEOS = [
  {
    title: "The Power of Now - Eckhart Tolle",
    description: "Learn to live in the present moment and find inner peace",
    category: "Mindfulness",
    views: "12M",
    author: "Eckhart Tolle",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // placeholder
    tags: ['mindfulness', 'presence', 'peace']
  },
  {
    title: "You vs You - Motivational Speech",
    description: "The only person you need to beat is the person you were yesterday",
    category: "Motivation",
    views: "45M",
    author: "David Goggins",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ['self-improvement', 'motivation', 'discipline']
  },
  {
    title: "Rewiring Your Brain - Neuroplasticity",
    description: "How to reprogram your mind for success",
    category: "Neuroscience",
    views: "23M",
    author: "Dr. Joe Dispenza",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ['neuroplasticity', 'mindset', 'transformation']
  },
  {
    title: "Start With Why - Finding Your Purpose",
    description: "Discover your life's purpose and meaning",
    category: "Purpose",
    views: "67M",
    author: "Simon Sinek",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ['purpose', 'meaning', 'motivation']
  }
];

/**
 * Get personalized motivation based on context
 */
export function getPersonalizedMotivation(
  mood: string, 
  timeOfDay: string,
  context?: string
): MotivationalContent | null {
  const timeMatches = MOTIVATIONAL_SPEECHES.filter(s => 
    s.timeOfDay === timeOfDay || s.timeOfDay === 'anytime'
  );

  const moodMatches = timeMatches.filter(s => 
    s.mood === mood || s.tags.some(tag => context?.toLowerCase().includes(tag))
  );

  return moodMatches[Math.floor(Math.random() * moodMatches.length)] || null;
}

/**
 * Main handler
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'get_frequencies':
        return new Response(JSON.stringify({
          success: true,
          frequencies: HEALING_FREQUENCIES
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'get_speeches':
        return new Response(JSON.stringify({
          success: true,
          speeches: MOTIVATIONAL_SPEECHES
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'get_affirmations':
        return new Response(JSON.stringify({
          success: true,
          affirmations: AFFIRMATIONS
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'get_videos':
        return new Response(JSON.stringify({
          success: true,
          videos: TRANSFORMATIONAL_VIDEOS
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case 'personalized':
        const { mood, timeOfDay, context } = await req.json();
        const content = getPersonalizedMotivation(mood, timeOfDay, context);
        
        return new Response(JSON.stringify({
          success: true,
          content,
          recommendation: content ? `Based on your ${mood} mood, here's something ${content.mood} for you` : null
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({
          success: true,
          frequencies: HEALING_FREQUENCIES.length,
          speeches: MOTIVATIONAL_SPEECHES.length,
          affirmations: AFFIRMATIONS.length,
          videos: TRANSFORMATIONAL_VIDEOS.length
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Motivation library error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

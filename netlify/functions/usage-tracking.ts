/**
 * Usage Tracking & Rate Limiting
 * Tracks API usage per user and enforces limits
 */
import type { Handler, HandlerEvent } from '@netlify/functions';

// Pricing tiers
const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      aiChat: 10,           // 10 chat messages/month
      imageGen: 5,          // 5 images/month
      voiceGen: 5,          // 5 voice generations/month
      storyGen: 3,          // 3 stories/month
      siteBuilder: 2,       // 2 sites/month
      optimization: 10,     // 10 optimizations/month
    }
  },
  pro: {
    name: 'Pro',
    price: 1.99,
    limits: {
      aiChat: 1000,         // 1000 messages/month
      imageGen: 100,        // 100 images/month
      voiceGen: 100,        // 100 voice generations/month
      storyGen: 50,         // 50 stories/month
      siteBuilder: 20,      // 20 sites/month
      optimization: 500,    // 500 optimizations/month
    }
  },
  premium: {
    name: 'Premium',
    price: 9.99,
    limits: {
      aiChat: -1,           // Unlimited
      imageGen: -1,         // Unlimited
      voiceGen: -1,         // Unlimited
      storyGen: -1,         // Unlimited
      siteBuilder: -1,      // Unlimited
      optimization: -1,     // Unlimited
    }
  }
};

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const path = event.path.split('/').pop();
    const body = event.body ? JSON.parse(event.body) : {};
    const authHeader = event.headers.authorization || event.headers.Authorization;

    // Extract user ID from token (would use real JWT in production)
    const userId = extractUserId(authHeader);

    switch (path) {
      case 'check':
        return await checkLimit(userId, body, headers);
      
      case 'increment':
        return await incrementUsage(userId, body, headers);
      
      case 'stats':
        return await getUsageStats(userId, headers);
      
      case 'reset':
        return await resetUsage(userId, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Usage tracking error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Tracking failed',
      }),
    };
  }
};

function extractUserId(authHeader: string | undefined): string {
  if (!authHeader) return 'anonymous';
  
  // In production, decode JWT token
  // For now, return simplified user ID
  return authHeader.replace('Bearer ', '').split(':')[0] || 'anonymous';
}

async function checkLimit(userId: string, body: any, headers: any) {
  const { feature } = body; // 'aiChat', 'imageGen', etc.
  
  if (!feature) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Feature name required' }),
    };
  }

  // Get user's tier and usage (would query database in production)
  const userTier = await getUserTier(userId);
  const usage = await getUserUsage(userId);
  
  const limit = PRICING_TIERS[userTier].limits[feature];
  const used = usage[feature] || 0;
  
  const allowed = limit === -1 || used < limit;
  const remaining = limit === -1 ? -1 : Math.max(0, limit - used);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      allowed,
      limit,
      used,
      remaining,
      tier: userTier,
      resetDate: getResetDate(),
    }),
  };
}

async function incrementUsage(userId: string, body: any, headers: any) {
  const { feature, amount = 1 } = body;
  
  if (!feature) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Feature name required' }),
    };
  }

  // Check if user has quota
  const checkResult = await checkLimit(userId, { feature }, headers);
  const checkData = JSON.parse(checkResult.body);
  
  if (!checkData.allowed) {
    return {
      statusCode: 429, // Too Many Requests
      headers,
      body: JSON.stringify({
        error: 'Usage limit exceeded',
        limit: checkData.limit,
        used: checkData.used,
        tier: checkData.tier,
        upgradeUrl: 'https://pssi.netlify.app/pricing',
      }),
    };
  }

  // Increment usage (would update database in production)
  const newUsage = await incrementUserUsage(userId, feature, amount);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      feature,
      used: newUsage[feature],
      remaining: checkData.remaining - amount,
    }),
  };
}

async function getUsageStats(userId: string, headers: any) {
  const tier = await getUserTier(userId);
  const usage = await getUserUsage(userId);
  const limits = PRICING_TIERS[tier].limits;

  const stats: any = {
    tier,
    price: PRICING_TIERS[tier].price,
    period: getCurrentPeriod(),
    resetDate: getResetDate(),
    features: {},
  };

  // Calculate stats for each feature
  Object.keys(limits).forEach(feature => {
    const limit = limits[feature];
    const used = usage[feature] || 0;
    const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
    const percentage = limit === -1 ? 0 : Math.round((used / limit) * 100);

    stats.features[feature] = {
      used,
      limit,
      remaining,
      percentage,
      unlimited: limit === -1,
    };
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(stats),
  };
}

async function resetUsage(userId: string, headers: any) {
  // Admin only - would check permissions in production
  
  await resetUserUsage(userId);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Usage reset successfully',
    }),
  };
}

// Helper functions (would use database in production)
async function getUserTier(userId: string): Promise<keyof typeof PRICING_TIERS> {
  // TODO: Query database for user's subscription tier
  // For now, return 'free' for anonymous, 'pro' for others
  return userId === 'anonymous' ? 'free' : 'pro';
}

async function getUserUsage(userId: string): Promise<any> {
  // TODO: Query database for user's current usage
  // For now, return mock data
  return {
    aiChat: 5,
    imageGen: 2,
    voiceGen: 1,
    storyGen: 1,
    siteBuilder: 1,
    optimization: 3,
  };
}

async function incrementUserUsage(userId: string, feature: string, amount: number): Promise<any> {
  // TODO: Update database with incremented usage
  const usage = await getUserUsage(userId);
  usage[feature] = (usage[feature] || 0) + amount;
  return usage;
}

async function resetUserUsage(userId: string): Promise<void> {
  // TODO: Reset all usage counters in database
  console.log('Usage reset for user:', userId);
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getResetDate(): string {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return next.toISOString();
}

export { handler };

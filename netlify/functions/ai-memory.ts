/**
 * AI MEMORY SYSTEM - LONG-TERM CONTEXT PERSISTENCE
 * 
 * Features:
 * - User preferences storage
 * - Conversation history
 * - Learning from interactions
 * - Context continuity across sessions
 * - Personalized AI responses
 */

import type { Handler, HandlerEvent } from '@netlify/functions';

interface MemoryEntry {
  id: string;
  userId: string;
  type: 'preference' | 'fact' | 'conversation' | 'emotion' | 'skill';
  content: string;
  metadata?: {
    topic?: string;
    sentiment?: string;
    importance?: number;
    source?: string;
  };
  timestamp: Date;
  lastAccessed?: Date;
  accessCount: number;
}

interface MemoryRequest {
  action: 'store' | 'recall' | 'search' | 'summarize' | 'delete' | 'stats';
  userId: string;
  entry?: Partial<MemoryEntry>;
  query?: string;
  limit?: number;
}

// In-memory storage (in production, use database like Supabase/Redis)
const memory: Map<string, MemoryEntry[]> = new Map();

// Generate memory ID
function generateMemoryId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Store memory
function storeMemory(userId: string, entry: Partial<MemoryEntry>): MemoryEntry {
  const userMemories = memory.get(userId) || [];
  
  const memoryEntry: MemoryEntry = {
    id: generateMemoryId(),
    userId,
    type: entry.type || 'fact',
    content: entry.content || '',
    metadata: entry.metadata || {},
    timestamp: new Date(),
    accessCount: 0
  };

  userMemories.push(memoryEntry);
  memory.set(userId, userMemories);

  return memoryEntry;
}

// Recall recent memories
function recallMemories(userId: string, limit: number = 10): MemoryEntry[] {
  const userMemories = memory.get(userId) || [];
  
  return userMemories
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
    .map(mem => {
      mem.lastAccessed = new Date();
      mem.accessCount++;
      return mem;
    });
}

// Search memories by content
function searchMemories(userId: string, query: string, limit: number = 5): MemoryEntry[] {
  const userMemories = memory.get(userId) || [];
  const queryLower = query.toLowerCase();

  return userMemories
    .filter(mem => 
      mem.content.toLowerCase().includes(queryLower) ||
      mem.metadata?.topic?.toLowerCase().includes(queryLower)
    )
    .sort((a, b) => (b.metadata?.importance || 0) - (a.metadata?.importance || 0))
    .slice(0, limit)
    .map(mem => {
      mem.lastAccessed = new Date();
      mem.accessCount++;
      return mem;
    });
}

// Summarize user's memory profile
async function summarizeMemory(userId: string): Promise<string> {
  const userMemories = memory.get(userId) || [];
  
  if (userMemories.length === 0) {
    return 'No memories stored yet.';
  }

  // Get most important/accessed memories
  const topMemories = userMemories
    .sort((a, b) => 
      (b.accessCount * (b.metadata?.importance || 1)) - 
      (a.accessCount * (a.metadata?.importance || 1))
    )
    .slice(0, 10);

  // Use AI to generate summary
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return topMemories.map(m => m.content).join('\n');
  }

  const memoryContext = topMemories.map(m => 
    `[${m.type}] ${m.content} (accessed ${m.accessCount} times)`
  ).join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are analyzing user memories to create a concise personality/preference profile.'
          },
          {
            role: 'user',
            content: `Summarize what you know about this user based on their memories:\n\n${memoryContext}\n\nProvide a brief, natural summary of their preferences, interests, and personality.`
          }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    return topMemories.map(m => m.content).join('\n');
  }
}

// Get memory statistics
function getMemoryStats(userId: string) {
  const userMemories = memory.get(userId) || [];

  const stats = {
    total: userMemories.length,
    byType: {} as Record<string, number>,
    totalAccesses: 0,
    avgImportance: 0,
    oldestMemory: null as Date | null,
    newestMemory: null as Date | null
  };

  userMemories.forEach(mem => {
    stats.byType[mem.type] = (stats.byType[mem.type] || 0) + 1;
    stats.totalAccesses += mem.accessCount;
    stats.avgImportance += mem.metadata?.importance || 0;

    const memTime = new Date(mem.timestamp).getTime();
    if (!stats.oldestMemory || memTime < stats.oldestMemory.getTime()) {
      stats.oldestMemory = new Date(mem.timestamp);
    }
    if (!stats.newestMemory || memTime > stats.newestMemory.getTime()) {
      stats.newestMemory = new Date(mem.timestamp);
    }
  });

  stats.avgImportance = userMemories.length > 0 
    ? stats.avgImportance / userMemories.length 
    : 0;

  return stats;
}

// Main Handler
export const handler: Handler = async (event: HandlerEvent) => {
  // CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const request: MemoryRequest = event.httpMethod === 'POST' || event.httpMethod === 'DELETE'
      ? JSON.parse(event.body || '{}')
      : { action: 'recall', userId: 'default' };

    const { action, userId, entry, query, limit } = request;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User ID required' })
      };
    }

    // STORE MEMORY
    if (action === 'store') {
      if (!entry || !entry.content) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Memory content required' })
        };
      }

      const stored = storeMemory(userId, entry);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          memory: stored
        })
      };
    }

    // RECALL MEMORIES
    if (action === 'recall') {
      const memories = recallMemories(userId, limit || 10);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          memories,
          count: memories.length
        })
      };
    }

    // SEARCH MEMORIES
    if (action === 'search') {
      if (!query) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Search query required' })
        };
      }

      const results = searchMemories(userId, query, limit || 5);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          results,
          count: results.length
        })
      };
    }

    // SUMMARIZE MEMORY
    if (action === 'summarize') {
      const summary = await summarizeMemory(userId);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          summary
        })
      };
    }

    // DELETE MEMORIES
    if (action === 'delete') {
      memory.delete(userId);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'All memories deleted'
        })
      };
    }

    // MEMORY STATS
    if (action === 'stats') {
      const stats = getMemoryStats(userId);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          stats
        })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error: any) {
    console.error('Memory system error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Memory operation failed',
        message: error.message
      })
    };
  }
};

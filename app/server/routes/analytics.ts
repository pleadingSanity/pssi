/**
 * ADVANCED ANALYTICS - REAL-TIME AI METRICS
 * 
 * Track everything:
 * - AI usage statistics
 * - Performance metrics
 * - Cost tracking per provider
 * - User behavior analytics
 * - Response quality metrics
 * - System health monitoring
 */

import type { Handler, HandlerEvent } from '@netlify/functions';

interface AnalyticsEvent {
  id: string;
  type: 'ai_request' | 'ai_response' | 'error' | 'performance' | 'user_action';
  timestamp: Date;
  userId?: string;
  data: {
    provider?: string;
    model?: string;
    tokensUsed?: number;
    responseTime?: number;
    cost?: number;
    success?: boolean;
    errorMessage?: string;
    action?: string;
    metadata?: Record<string, any>;
  };
}

interface AnalyticsRequest {
  action: 'track' | 'stats' | 'dashboard' | 'export' | 'clear';
  event?: Partial<AnalyticsEvent>;
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'all';
  userId?: string;
}

interface DashboardStats {
  overview: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    totalCost: number;
    activeUsers: number;
  };
  byProvider: Record<string, {
    requests: number;
    avgResponseTime: number;
    tokensUsed: number;
    cost: number;
    errorRate: number;
  }>;
  byModel: Record<string, {
    requests: number;
    avgResponseTime: number;
    tokensUsed: number;
  }>;
  performance: {
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  timeline: Array<{
    timestamp: Date;
    requests: number;
    errors: number;
    avgResponseTime: number;
  }>;
}

// In-memory analytics storage
const events: AnalyticsEvent[] = [];
const maxEvents = 10000; // Keep last 10k events

// Cost per 1M tokens (approximate)
const COST_PER_MILLION = {
  'gpt-4o': 2.50,
  'gpt-4o-mini': 0.15,
  'gpt-4-turbo': 10.00,
  'gpt-3.5-turbo': 0.50,
  'claude-3-5-sonnet-20241022': 3.00,
  'claude-3-opus-20240229': 15.00,
  'claude-3-haiku-20240307': 0.25,
  'gemini-2.0-flash-exp': 0.10,
  'gemini-1.5-pro-002': 1.25,
  'gemini-1.5-flash-002': 0.075
};

// Generate event ID
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate cost
function calculateCost(model: string = '', tokensUsed: number = 0): number {
  const costPer1M = COST_PER_MILLION[model as keyof typeof COST_PER_MILLION] || 1.0;
  return (tokensUsed / 1000000) * costPer1M;
}

// Track event
function trackEvent(event: Partial<AnalyticsEvent>): AnalyticsEvent {
  const analyticsEvent: AnalyticsEvent = {
    id: generateEventId(),
    type: event.type || 'ai_request',
    timestamp: new Date(),
    userId: event.userId,
    data: {
      ...event.data,
      cost: event.data?.tokensUsed 
        ? calculateCost(event.data.model, event.data.tokensUsed)
        : event.data?.cost
    }
  };

  events.push(analyticsEvent);

  // Keep only last maxEvents
  if (events.length > maxEvents) {
    events.shift();
  }

  return analyticsEvent;
}

// Filter events by timeframe
function filterByTimeframe(timeframe: string = 'all'): AnalyticsEvent[] {
  if (timeframe === 'all') return events;

  const now = Date.now();
  const timeframes = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000
  };

  const duration = timeframes[timeframe as keyof typeof timeframes] || 0;
  const cutoff = now - duration;

  return events.filter(e => new Date(e.timestamp).getTime() > cutoff);
}

// Calculate percentile
function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
}

// Generate dashboard stats
function generateDashboard(timeframe: string = 'all'): DashboardStats {
  const filtered = filterByTimeframe(timeframe);

  // Overview
  const totalRequests = filtered.filter(e => e.type === 'ai_request').length;
  const successCount = filtered.filter(e => 
    e.type === 'ai_response' && e.data.success !== false
  ).length;
  const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;

  const responseTimes = filtered
    .filter(e => e.data.responseTime)
    .map(e => e.data.responseTime!);
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const totalCost = filtered
    .filter(e => e.data.cost)
    .reduce((sum, e) => sum + (e.data.cost || 0), 0);

  const uniqueUsers = new Set(filtered.map(e => e.userId).filter(Boolean)).size;

  // By Provider
  const byProvider: Record<string, any> = {};
  for (const event of filtered.filter(e => e.data.provider)) {
    const provider = event.data.provider!;
    if (!byProvider[provider]) {
      byProvider[provider] = {
        requests: 0,
        responseTimes: [],
        tokensUsed: 0,
        cost: 0,
        errors: 0
      };
    }

    byProvider[provider].requests++;
    if (event.data.responseTime) {
      byProvider[provider].responseTimes.push(event.data.responseTime);
    }
    if (event.data.tokensUsed) {
      byProvider[provider].tokensUsed += event.data.tokensUsed;
    }
    if (event.data.cost) {
      byProvider[provider].cost += event.data.cost;
    }
    if (event.data.success === false) {
      byProvider[provider].errors++;
    }
  }

  // Calculate averages
  for (const provider in byProvider) {
    const data = byProvider[provider];
    data.avgResponseTime = data.responseTimes.length > 0
      ? data.responseTimes.reduce((a: number, b: number) => a + b, 0) / data.responseTimes.length
      : 0;
    data.errorRate = data.requests > 0 ? (data.errors / data.requests) * 100 : 0;
    delete data.responseTimes;
    delete data.errors;
  }

  // By Model
  const byModel: Record<string, any> = {};
  for (const event of filtered.filter(e => e.data.model)) {
    const model = event.data.model!;
    if (!byModel[model]) {
      byModel[model] = {
        requests: 0,
        responseTimes: [],
        tokensUsed: 0
      };
    }

    byModel[model].requests++;
    if (event.data.responseTime) {
      byModel[model].responseTimes.push(event.data.responseTime);
    }
    if (event.data.tokensUsed) {
      byModel[model].tokensUsed += event.data.tokensUsed;
    }
  }

  // Calculate model averages
  for (const model in byModel) {
    const data = byModel[model];
    data.avgResponseTime = data.responseTimes.length > 0
      ? data.responseTimes.reduce((a: number, b: number) => a + b, 0) / data.responseTimes.length
      : 0;
    delete data.responseTimes;
  }

  // Performance metrics
  const performance = {
    p50ResponseTime: calculatePercentile(responseTimes, 50),
    p95ResponseTime: calculatePercentile(responseTimes, 95),
    p99ResponseTime: calculatePercentile(responseTimes, 99)
  };

  // Timeline (hourly buckets)
  const timeline: Array<any> = [];
  const buckets: Record<string, any> = {};

  for (const event of filtered) {
    const hour = new Date(event.timestamp);
    hour.setMinutes(0, 0, 0);
    const key = hour.toISOString();

    if (!buckets[key]) {
      buckets[key] = {
        timestamp: hour,
        requests: 0,
        errors: 0,
        responseTimes: []
      };
    }

    if (event.type === 'ai_request') buckets[key].requests++;
    if (event.type === 'error') buckets[key].errors++;
    if (event.data.responseTime) buckets[key].responseTimes.push(event.data.responseTime);
  }

  for (const key in buckets) {
    const bucket = buckets[key];
    timeline.push({
      timestamp: bucket.timestamp,
      requests: bucket.requests,
      errors: bucket.errors,
      avgResponseTime: bucket.responseTimes.length > 0
        ? bucket.responseTimes.reduce((a: number, b: number) => a + b, 0) / bucket.responseTimes.length
        : 0
    });
  }

  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    overview: {
      totalRequests,
      successRate,
      avgResponseTime,
      totalCost,
      activeUsers: uniqueUsers
    },
    byProvider,
    byModel,
    performance,
    timeline
  };
}

// Main Handler
export const handler: Handler = async (event: HandlerEvent) => {
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
    const request: AnalyticsRequest = event.httpMethod === 'POST' || event.httpMethod === 'DELETE'
      ? JSON.parse(event.body || '{}')
      : { action: 'dashboard', timeframe: 'day' };

    // TRACK EVENT
    if (request.action === 'track') {
      if (!request.event) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Event data required' })
        };
      }

      const tracked = trackEvent(request.event);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          event: tracked
        })
      };
    }

    // GET DASHBOARD
    if (request.action === 'dashboard') {
      const dashboard = generateDashboard(request.timeframe);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          dashboard,
          timeframe: request.timeframe || 'all'
        })
      };
    }

    // GET STATS
    if (request.action === 'stats') {
      const filtered = filterByTimeframe(request.timeframe);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          stats: {
            totalEvents: filtered.length,
            eventTypes: filtered.reduce((acc, e) => {
              acc[e.type] = (acc[e.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          }
        })
      };
    }

    // EXPORT DATA
    if (request.action === 'export') {
      const filtered = filterByTimeframe(request.timeframe);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          events: filtered,
          count: filtered.length
        })
      };
    }

    // CLEAR DATA
    if (request.action === 'clear') {
      events.length = 0;

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'All analytics data cleared'
        })
      };
    }

    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error: any) {
    console.error('Analytics error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Analytics operation failed',
        message: error.message
      })
    };
  }
};

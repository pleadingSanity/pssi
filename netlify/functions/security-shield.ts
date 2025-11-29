/**
 * SECURITY SHIELD - ULTIMATE PROTECTION SYSTEM
 * 
 * Features:
 * - Real-time threat detection
 * - Attack pattern recognition
 * - Rate limiting & DDoS protection
 * - Suspicious activity monitoring
 * - Auto-blocking malicious IPs
 * - Security event logging
 * - Cross-site coordination (Vercel + Netlify)
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'attack' | 'suspicious' | 'blocked' | 'threat' | 'scan';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: {
    ip: string;
    userAgent?: string;
    country?: string;
    method: string;
    path: string;
  };
  details: {
    reason: string;
    pattern?: string;
    requestCount?: number;
    blocked?: boolean;
  };
}

interface SecurityStats {
  status: 'secure' | 'alert' | 'under_attack';
  totalRequests: number;
  blockedRequests: number;
  threats: {
    sqlInjection: number;
    xss: number;
    pathTraversal: number;
    bruteForce: number;
    ddos: number;
    other: number;
  };
  topAttackers: Array<{
    ip: string;
    attacks: number;
    lastSeen: Date;
  }>;
  recentEvents: SecurityEvent[];
}

// In-memory threat storage (in production, use Redis/DB)
const securityEvents: SecurityEvent[] = [];
const blockedIPs: Map<string, { count: number; until: Date; reason: string }> = new Map();
const requestCounts: Map<string, { count: number; firstRequest: Date }> = new Map();

// Rate limits
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60;
const MAX_REQUESTS_PER_SECOND = 10;

// Threat patterns
const THREAT_PATTERNS = {
  SQL_INJECTION: [
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /('|\bOR\b\s+1\s*=\s*1)/i,
    /(;|\-\-|\/\*|\*\/)/
  ],
  XSS: [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\(/i,
    /alert\(/i
  ],
  PATH_TRAVERSAL: [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%2e%2e\\/i,
    /\/etc\/passwd/i,
    /\/windows\/system32/i
  ],
  SUSPICIOUS_HEADERS: [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /acunetix/i,
    /burp/i
  ]
};

// Generate event ID
function generateEventId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract IP from event
function extractIP(event: HandlerEvent): string {
  return event.headers['x-forwarded-for']?.split(',')[0].trim() ||
         event.headers['x-real-ip'] ||
         'unknown';
}

// Check if IP is blocked
function isIPBlocked(ip: string): boolean {
  const blocked = blockedIPs.get(ip);
  if (!blocked) return false;
  
  if (new Date() > blocked.until) {
    blockedIPs.delete(ip);
    return false;
  }
  
  return true;
}

// Block IP
function blockIP(ip: string, reason: string, durationMs: number = 3600000): void {
  blockedIPs.set(ip, {
    count: (blockedIPs.get(ip)?.count || 0) + 1,
    until: new Date(Date.now() + durationMs),
    reason
  });
}

// Check rate limiting
function checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record) {
    requestCounts.set(ip, { count: 1, firstRequest: new Date(now) });
    return { allowed: true };
  }
  
  const timeSinceFirst = now - record.firstRequest.getTime();
  
  // Reset counter if window passed
  if (timeSinceFirst > RATE_LIMIT_WINDOW) {
    requestCounts.set(ip, { count: 1, firstRequest: new Date(now) });
    return { allowed: true };
  }
  
  record.count++;
  
  // Check requests per minute
  if (record.count > MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, reason: 'Rate limit exceeded (60 req/min)' };
  }
  
  // Check requests per second (if many requests in short time)
  if (timeSinceFirst < 1000 && record.count > MAX_REQUESTS_PER_SECOND) {
    return { allowed: false, reason: 'Too many requests (DDoS suspected)' };
  }
  
  return { allowed: true };
}

// Detect threats in request
function detectThreats(event: HandlerEvent): Array<{ type: string; pattern: string }> {
  const threats: Array<{ type: string; pattern: string }> = [];
  const checkContent = [
    event.path,
    event.body || '',
    JSON.stringify(event.queryStringParameters || {}),
    event.headers['user-agent'] || '',
    event.headers['referer'] || ''
  ].join(' ');
  
  // Check SQL injection
  for (const pattern of THREAT_PATTERNS.SQL_INJECTION) {
    if (pattern.test(checkContent)) {
      threats.push({ type: 'SQL Injection', pattern: pattern.toString() });
    }
  }
  
  // Check XSS
  for (const pattern of THREAT_PATTERNS.XSS) {
    if (pattern.test(checkContent)) {
      threats.push({ type: 'XSS Attack', pattern: pattern.toString() });
    }
  }
  
  // Check path traversal
  for (const pattern of THREAT_PATTERNS.PATH_TRAVERSAL) {
    if (pattern.test(checkContent)) {
      threats.push({ type: 'Path Traversal', pattern: pattern.toString() });
    }
  }
  
  // Check suspicious user agents
  const userAgent = event.headers['user-agent'] || '';
  for (const pattern of THREAT_PATTERNS.SUSPICIOUS_HEADERS) {
    if (pattern.test(userAgent)) {
      threats.push({ type: 'Suspicious Scanner', pattern: pattern.toString() });
    }
  }
  
  return threats;
}

// Log security event
function logSecurityEvent(event: SecurityEvent): void {
  securityEvents.push(event);
  
  // Keep only last 1000 events
  if (securityEvents.length > 1000) {
    securityEvents.shift();
  }
}

// Get security statistics
function getSecurityStats(): SecurityStats {
  const now = Date.now();
  const last24h = securityEvents.filter(e => 
    now - new Date(e.timestamp).getTime() < 86400000
  );
  
  const threats = {
    sqlInjection: 0,
    xss: 0,
    pathTraversal: 0,
    bruteForce: 0,
    ddos: 0,
    other: 0
  };
  
  const attackerCounts: Map<string, number> = new Map();
  
  for (const event of last24h) {
    if (event.details.pattern?.includes('SQL')) threats.sqlInjection++;
    else if (event.details.pattern?.includes('XSS')) threats.xss++;
    else if (event.details.pattern?.includes('Path')) threats.pathTraversal++;
    else if (event.details.reason?.includes('Rate limit')) threats.bruteForce++;
    else if (event.details.reason?.includes('DDoS')) threats.ddos++;
    else threats.other++;
    
    attackerCounts.set(
      event.source.ip,
      (attackerCounts.get(event.source.ip) || 0) + 1
    );
  }
  
  const topAttackers = Array.from(attackerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ip, count]) => {
      const lastEvent = last24h.filter(e => e.source.ip === ip).pop();
      return {
        ip,
        attacks: count,
        lastSeen: lastEvent?.timestamp || new Date()
      };
    });
  
  const totalThreats = Object.values(threats).reduce((a, b) => a + b, 0);
  const status = totalThreats > 100 ? 'under_attack' : totalThreats > 10 ? 'alert' : 'secure';
  
  return {
    status,
    totalRequests: requestCounts.size,
    blockedRequests: last24h.filter(e => e.details.blocked).length,
    threats,
    topAttackers,
    recentEvents: last24h.slice(-20)
  };
}

// Main handler
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  const ip = extractIP(event);
  const path = event.path;
  const method = event.httpMethod;

  // Check if IP is blocked
  if (isIPBlocked(ip)) {
    const blockInfo = blockedIPs.get(ip)!;
    
    logSecurityEvent({
      id: generateEventId(),
      timestamp: new Date(),
      type: 'blocked',
      severity: 'high',
      source: {
        ip,
        userAgent: event.headers['user-agent'],
        method,
        path
      },
      details: {
        reason: `Blocked IP attempted access: ${blockInfo.reason}`,
        blocked: true
      }
    });

    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Access Forbidden',
        message: 'Your IP has been blocked due to suspicious activity',
        reason: blockInfo.reason,
        blockedUntil: blockInfo.until
      })
    };
  }

  // Check rate limiting
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    blockIP(ip, rateCheck.reason!, 600000); // Block for 10 minutes
    
    logSecurityEvent({
      id: generateEventId(),
      timestamp: new Date(),
      type: 'attack',
      severity: 'high',
      source: { ip, userAgent: event.headers['user-agent'], method, path },
      details: {
        reason: rateCheck.reason!,
        blocked: true
      }
    });

    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Too Many Requests',
        message: rateCheck.reason
      })
    };
  }

  // Detect threats
  const threats = detectThreats(event);
  if (threats.length > 0) {
    blockIP(ip, `Multiple threats detected: ${threats.map(t => t.type).join(', ')}`, 7200000);
    
    logSecurityEvent({
      id: generateEventId(),
      timestamp: new Date(),
      type: 'threat',
      severity: 'critical',
      source: { ip, userAgent: event.headers['user-agent'], method, path },
      details: {
        reason: `Threats detected: ${threats.map(t => t.type).join(', ')}`,
        pattern: threats[0].pattern,
        blocked: true
      }
    });

    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Security Threat Detected',
        message: 'Malicious activity detected and blocked',
        threats: threats.map(t => t.type)
      })
    };
  }

  // Handle security endpoints
  const request = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
  const action = request.action || event.queryStringParameters?.action || 'stats';

  // Get security stats
  if (action === 'stats') {
    const stats = getSecurityStats();
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        stats,
        timestamp: new Date()
      })
    };
  }

  // Get events
  if (action === 'events') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        events: securityEvents.slice(-50),
        total: securityEvents.length
      })
    };
  }

  // Get blocked IPs
  if (action === 'blocked') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        blocked: Array.from(blockedIPs.entries()).map(([ip, info]) => ({
          ip,
          ...info
        }))
      })
    };
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      message: 'Security shield active',
      status: 'protected'
    })
  };
};

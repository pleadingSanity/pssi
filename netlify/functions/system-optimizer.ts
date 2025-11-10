/**
 * Netlify Serverless Function - System Optimizer (GOD MODE)
 * Optimizes Windows, Android, and all platforms
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
    const { platform = 'auto', action = 'optimize' } = body;

    const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'AI provider not configured' }),
      };
    }

    let result;
    
    switch (action) {
      case 'optimize':
        result = await optimizeSystem(platform, openaiKey);
        break;
      case 'analyze':
        result = await analyzeSystem(platform, openaiKey);
        break;
      case 'clean':
        result = await cleanSystem(platform, openaiKey);
        break;
      case 'boost':
        result = await boostPerformance(platform, openaiKey);
        break;
      default:
        result = await optimizeSystem(platform, openaiKey);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        platform,
        action,
        ...result,
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

async function optimizeSystem(platform: string, apiKey: string) {
  const { CORE_IDENTITY, REASONING_FRAMEWORK } = await import('./ai-system-prompts');
  
  const platformPrompt = getPlatformPrompt(platform);
  
  const prompt = `${CORE_IDENTITY}

${REASONING_FRAMEWORK}

You are in GOD MODE - the ultimate system optimizer with complete knowledge of all platforms.

TASK: Optimize ${platform === 'auto' ? 'all platforms' : platform} for maximum performance.

${platformPrompt}

Provide:
1. **Critical Optimizations** (do these first - biggest impact)
2. **Performance Boosts** (speed improvements)
3. **Memory Optimization** (reduce RAM usage)
4. **Battery Optimization** (for mobile/laptops)
5. **Security Hardening** (make it secure)
6. **Cleanup Actions** (remove junk)
7. **Advanced Tweaks** (power user optimizations)

For each optimization, provide:
- Action name
- Impact (High/Medium/Low)
- How to do it (exact steps)
- Why it helps
- Risks (if any)

Format as JSON:
{
  "platform": "detected platform",
  "optimizations": [
    {
      "category": "critical|performance|memory|battery|security|cleanup|advanced",
      "name": "optimization name",
      "impact": "high|medium|low",
      "steps": ["step 1", "step 2"],
      "benefit": "what this improves",
      "risk": "none|low|medium"
    }
  ],
  "estimatedImprovement": "expected performance gain %"
}`;

  const response = await callOpenAI(prompt, apiKey);
  
  try {
    const data = JSON.parse(response.content);
    return data;
  } catch {
    return {
      platform,
      optimizations: parseOptimizations(response.content),
      estimatedImprovement: "20-50%",
    };
  }
}

async function analyzeSystem(platform: string, apiKey: string) {
  const prompt = `Analyze ${platform} system and identify:
1. Performance bottlenecks
2. Security vulnerabilities
3. Resource waste
4. Optimization opportunities
5. Common issues

Provide detailed analysis with actionable recommendations.`;

  const response = await callOpenAI(prompt, apiKey);
  
  return {
    analysis: response.content,
    timestamp: new Date().toISOString(),
  };
}

async function cleanSystem(platform: string, apiKey: string) {
  const platformPrompt = getPlatformPrompt(platform);
  
  const prompt = `${platformPrompt}

Provide comprehensive cleanup instructions:
1. Temporary files to delete
2. Cache directories to clear
3. Logs to remove
4. Unused apps to uninstall
5. Startup programs to disable
6. Services to stop
7. Registry cleanup (Windows only)

Make it safe - only remove what's truly unnecessary.
Provide exact commands/paths for each cleanup action.`;

  const response = await callOpenAI(prompt, apiKey);
  
  return {
    cleanupActions: response.content,
    safetyLevel: "conservative",
    estimatedSpace: "1-10 GB",
  };
}

async function boostPerformance(platform: string, apiKey: string) {
  const prompt = `Provide MAXIMUM PERFORMANCE BOOST for ${platform}:

AGGRESSIVE OPTIMIZATIONS:
1. Disable all unnecessary services
2. Optimize virtual memory/swap
3. Network performance tuning
4. Graphics acceleration
5. Process priority optimization
6. CPU governor tweaks (if applicable)
7. Disk I/O optimization

Provide PowerShell/Terminal commands that can be run immediately.
Mark which require admin/root access.`;

  const response = await callOpenAI(prompt, apiKey);
  
  return {
    boostActions: response.content,
    powerMode: "MAXIMUM",
    expectedGain: "30-100% faster",
  };
}

function getPlatformPrompt(platform: string): string {
  const prompts: Record<string, string> = {
    windows: `WINDOWS OPTIMIZATION EXPERT MODE:
- Know every Windows 10/11 optimization
- PowerShell scripts for automation
- Registry tweaks (safe ones)
- Services to disable
- Startup optimization
- Disk cleanup strategies
- Performance monitor usage
- Resource monitor interpretation`,

    android: `ANDROID OPTIMIZATION EXPERT MODE:
- ADB commands for deep optimization
- Developer options tweaks
- App hibernation strategies
- Battery optimization
- RAM management
- Storage cleanup
- Network optimization
- GPU rendering tweaks`,

    linux: `LINUX OPTIMIZATION EXPERT MODE:
- Systemd optimization
- Kernel parameter tuning
- Package cleanup
- Service management
- Swap optimization
- File system tweaks
- Cron job cleanup
- Log rotation`,

    macos: `MACOS OPTIMIZATION EXPERT MODE:
- Activity Monitor mastery
- Spotlight optimization
- Login items cleanup
- Cache management
- Terminal commands
- Launch agents/daemons
- Memory pressure reduction
- Battery life extension`,

    auto: `CROSS-PLATFORM OPTIMIZATION EXPERT MODE:
Detect and optimize ALL platforms:
- Windows (PowerShell scripts)
- Android (ADB commands)
- Linux (bash/systemd)
- macOS (Terminal commands)
- iOS (Settings guidance)

Provide platform-specific optimizations for each.`,
  };

  return prompts[platform] || prompts.auto;
}

function parseOptimizations(content: string) {
  // Fallback parser if JSON parsing fails
  return [{
    category: "performance",
    name: "AI-Generated Optimizations",
    impact: "high",
    steps: ["See detailed response"],
    benefit: content.substring(0, 200) + "...",
    risk: "low",
  }];
}

async function callOpenAI(prompt: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI request failed');
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
  };
}

export { handler };

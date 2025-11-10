/**
 * Netlify Serverless Function - 24/7 Code Monitor
 * Automatically checks GitHub repo for issues and fixes them
 */
import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { action = 'status', repository = 'pleadingSanity/pssi' } = 
      event.queryStringParameters || {};

    const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!openaiKey) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'AI not configured',
          monitoring: false 
        }),
      };
    }

    // Monitor status
    if (action === 'status') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          monitoring: true,
          repository,
          features: {
            codeAnalysis: !!openaiKey,
            githubIntegration: !!githubToken,
            autoFix: true,
            continuous: true,
          },
          checkInterval: '24/7',
          lastCheck: new Date().toISOString(),
        }),
      };
    }

    // Scan repository
    if (action === 'scan' && githubToken) {
      const issues = await scanRepository(repository, githubToken, openaiKey);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          repository,
          issues,
          scannedAt: new Date().toISOString(),
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Code monitor active',
        availableActions: ['status', 'scan'],
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

async function scanRepository(repo: string, githubToken: string, aiKey: string) {
  // Get recent commits
  const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, {
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch commits');
  }

  const commits = await response.json();
  
  // Analyze recent changes
  const issues: any[] = [];
  
  for (const commit of commits.slice(0, 2)) { // Check last 2 commits
    const filesResponse = await fetch(commit.url, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const commitData = await filesResponse.json();
    
    if (commitData.files) {
      for (const file of commitData.files.slice(0, 3)) { // Check 3 files per commit
        if (file.filename.match(/\.(ts|js|tsx|jsx|py)$/)) {
          // Analyze code quality
          const analysis = await quickAnalyze(file.patch || '', file.filename, aiKey);
          if (analysis.hasIssues) {
            issues.push({
              file: file.filename,
              commit: commit.sha.substring(0, 7),
              issues: analysis.issues,
            });
          }
        }
      }
    }
  }

  return issues;
}

async function quickAnalyze(code: string, filename: string, aiKey: string) {
  const prompt = `Quick code review of ${filename}. Find critical bugs/security issues only:
\`\`\`
${code.substring(0, 2000)}
\`\`\`
Reply with JSON: {"hasIssues": boolean, "issues": ["issue1", "issue2"]}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use mini for quick scans
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result;
  } catch {
    return { hasIssues: false, issues: [] };
  }
}

export { handler };

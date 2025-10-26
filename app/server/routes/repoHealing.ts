import { Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function repoHealing(req: Request, res: Response) {
  try {
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    let result;
    switch (action) {
      case 'check':
        result = await checkRepoHealth();
        break;
      case 'fix':
        result = await fixRepoIssues();
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error in repo healing:', error);
    res.status(500).json({ error: 'Repo healing failed' });
  }
}

async function checkRepoHealth() {
  try {
    const { stdout: status } = await execAsync('git status --porcelain');
    const { stdout: branch } = await execAsync('git branch --show-current');
    
    return {
      status: 'success',
      action: 'check',
      branch: branch.trim(),
      hasChanges: status.trim().length > 0,
      changes: status.trim().split('\n').filter(Boolean),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      action: 'check',
      error: String(error),
    };
  }
}

async function fixRepoIssues() {
  // Placeholder for repo fixing logic
  return {
    status: 'success',
    action: 'fix',
    message: 'Repo healing logic would be implemented here',
    timestamp: new Date().toISOString(),
  };
}

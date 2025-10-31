import { Request, Response } from 'express';
import OpenAI from 'openai';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';

const execAsync = promisify(exec);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  error?: string;
  timestamp: string;
}

const tasks: Map<string, Task> = new Map();

export async function automateTask(req: Request, res: Response) {
  try {
    const { task, autoExecute } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        note: 'Add OPENAI_API_KEY to your .env file',
      });
    }

    const taskId = `task_${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      description: task,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    tasks.set(taskId, newTask);

    // Ask AI to analyze the task and suggest automation
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are PSSI Task Automation AI. Analyze user tasks and suggest safe automation steps.
For system tasks, suggest specific commands or Python scripts.
Always prioritize safety and user confirmation.
Format your response as JSON with: { "analysis": string, "steps": string[], "safe": boolean, "requires_confirmation": boolean }`,
        },
        { role: 'user', content: `Analyze this task for automation: ${task}` },
      ],
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;
    let analysis;
    
    try {
      analysis = JSON.parse(aiResponse || '{}');
    } catch {
      analysis = {
        analysis: aiResponse,
        steps: [],
        safe: false,
        requires_confirmation: true,
      };
    }

    newTask.status = 'in_progress';
    tasks.set(taskId, newTask);

    // If autoExecute is true and task is marked safe, attempt execution
    if (autoExecute && analysis.safe && !analysis.requires_confirmation) {
      try {
        // Execute simple safe tasks (this is a placeholder - expand based on needs)
        newTask.result = `Task analyzed: ${analysis.analysis}`;
        newTask.status = 'completed';
      } catch (error: any) {
        newTask.error = error.message;
        newTask.status = 'failed';
      }
      tasks.set(taskId, newTask);
    }

    res.json({
      taskId,
      analysis,
      task: newTask,
    });
  } catch (error: any) {
    console.error('Error in task automation:', error);
    res.status(500).json({
      error: 'Task automation failed',
      message: error?.message || 'Unknown error',
    });
  }
}

export async function getTaskStatus(req: Request, res: Response) {
  try {
    const { taskId } = req.params;

    const task = tasks.get(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error: any) {
    console.error('Error getting task status:', error);
    res.status(500).json({ error: 'Failed to get task status' });
  }
}

export async function optimizeSystem(_req: Request, res: Response) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
      });
    }

    // Get current system stats (simplified)
    const cwd = resolve(process.cwd());
    const { stdout: diskUsage } = await execAsync('df -h || wmic logicaldisk get size,freespace,caption', { cwd });

    // Ask AI for optimization suggestions
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are PSSI System Optimizer. Analyze system information and suggest safe optimizations.
Focus on: disk cleanup, process optimization, memory management.
Provide actionable, safe suggestions.`,
        },
        {
          role: 'user',
          content: `Analyze this system and suggest optimizations:\nDisk Info:\n${diskUsage}`,
        },
      ],
      temperature: 0.5,
    });

    const suggestions = completion.choices[0].message.content;

    res.json({
      status: 'success',
      optimizations: suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in system optimization:', error);
    res.status(500).json({
      error: 'System optimization failed',
      message: error?.message || 'Unknown error',
    });
  }
}

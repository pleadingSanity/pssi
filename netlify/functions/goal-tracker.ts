/**
 * GOAL TRACKER & ACHIEVEMENT SYSTEM
 * 
 * Helps users set, track, and achieve their goals:
 * - Personal development goals
 * - Professional milestones
 * - Learning objectives
 * - Habit formation
 * - Progress visualization
 * - AI-powered motivation and guidance
 */

import type { Handler, HandlerEvent } from '@netlify/functions';

interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'personal' | 'professional' | 'learning' | 'health' | 'creative' | 'financial';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  progress: number; // 0-100
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;
  milestones: Milestone[];
  tags: string[];
  aiInsights?: string[];
  motivationScore: number; // 0-100 (how motivated user is)
  difficultyLevel: number; // 0-100
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedDate?: Date;
  progress: number; // 0-100
  weight: number; // How much this contributes to overall goal (0-1)
}

interface Achievement {
  id: string;
  userId: string;
  goalId: string;
  title: string;
  description: string;
  unlockedDate: Date;
  badge: string; // emoji or icon
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface ProgressReport {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  goalsStarted: number;
  goalsCompleted: number;
  totalProgress: number; // Average progress across all goals
  streakDays: number;
  achievements: Achievement[];
  recommendations: string[];
  motivationalMessage: string;
}

// In-memory storage (replace with database in production)
const goals = new Map<string, Goal>();
const achievements = new Map<string, Achievement[]>();

/**
 * Generate AI insights for a goal based on progress and context
 */
function generateAIInsights(goal: Goal): string[] {
  const insights: string[] = [];
  
  // Progress-based insights
  if (goal.progress < 10) {
    insights.push("💡 Pro tip: Break this into smaller, more manageable milestones to build momentum.");
    insights.push("🎯 Start with just 5 minutes a day - consistency beats perfection.");
  } else if (goal.progress >= 10 && goal.progress < 30) {
    insights.push("🚀 Great start! You're building momentum. Keep this energy going!");
    insights.push("📊 Track your daily progress to maintain motivation.");
  } else if (goal.progress >= 30 && goal.progress < 70) {
    insights.push("💪 You're over the hump! The hardest part is often behind you now.");
    insights.push("🎉 Celebrate small wins along the way to stay motivated.");
  } else if (goal.progress >= 70 && goal.progress < 100) {
    insights.push("🏁 You're in the home stretch! Finish strong!");
    insights.push("🌟 Think about what you'll accomplish next after completing this.");
  }
  
  // Difficulty-based insights
  if (goal.difficultyLevel > 75) {
    insights.push("🧗 This is a challenging goal. Consider finding an accountability partner.");
    insights.push("📚 Research shows breaking difficult goals into 7-day sprints increases success by 40%.");
  }
  
  // Motivation-based insights
  if (goal.motivationScore < 40) {
    insights.push("❤️ Reconnect with WHY this goal matters to you. Write it down.");
    insights.push("🔄 Sometimes pausing a goal is the right move. It's okay to adjust your priorities.");
  }
  
  // Category-specific insights
  switch (goal.category) {
    case 'learning':
      insights.push("🧠 The Feynman Technique: Explain what you're learning to someone else to solidify understanding.");
      break;
    case 'health':
      insights.push("🏃 Habit stacking: Attach new health habits to existing routines for better consistency.");
      break;
    case 'professional':
      insights.push("💼 Document your progress - it's great for performance reviews and interviews.");
      break;
    case 'creative':
      insights.push("🎨 Set aside 'creative time' where quality doesn't matter - just create freely.");
      break;
  }
  
  return insights.slice(0, 3); // Return top 3 most relevant
}

/**
 * Calculate overall progress for a goal including milestones
 */
function calculateGoalProgress(goal: Goal): number {
  if (goal.milestones.length === 0) {
    return goal.progress;
  }
  
  const weightedProgress = goal.milestones.reduce((total, milestone) => {
    return total + (milestone.progress * milestone.weight);
  }, 0);
  
  const totalWeight = goal.milestones.reduce((sum, m) => sum + m.weight, 0);
  return totalWeight > 0 ? (weightedProgress / totalWeight) * 100 : goal.progress;
}

/**
 * Check if user unlocked any achievements
 */
function checkAchievements(userId: string, goal: Goal): Achievement[] {
  const newAchievements: Achievement[] = [];
  const userAchievements = achievements.get(userId) || [];
  
  // First goal started
  if (userAchievements.length === 0) {
    newAchievements.push({
      id: `ach_${Date.now()}_1`,
      userId,
      goalId: goal.id,
      title: "Journey Begins",
      description: "Started your first goal!",
      unlockedDate: new Date(),
      badge: "🌱",
      rarity: "common",
      points: 10
    });
  }
  
  // First goal completed
  if (goal.status === 'completed' && !userAchievements.some(a => a.title === "First Victory")) {
    newAchievements.push({
      id: `ach_${Date.now()}_2`,
      userId,
      goalId: goal.id,
      title: "First Victory",
      description: "Completed your first goal!",
      unlockedDate: new Date(),
      badge: "🏆",
      rarity: "rare",
      points: 50
    });
  }
  
  // High difficulty goal completed
  if (goal.status === 'completed' && goal.difficultyLevel > 80) {
    newAchievements.push({
      id: `ach_${Date.now()}_3`,
      userId,
      goalId: goal.id,
      title: "Mountain Climber",
      description: "Completed an extremely challenging goal!",
      unlockedDate: new Date(),
      badge: "⛰️",
      rarity: "epic",
      points: 100
    });
  }
  
  // 50% milestone
  if (goal.progress >= 50 && goal.progress < 60 && !userAchievements.some(a => a.goalId === goal.id && a.title === "Halfway There")) {
    newAchievements.push({
      id: `ach_${Date.now()}_4`,
      userId,
      goalId: goal.id,
      title: "Halfway There",
      description: "Reached 50% progress on a goal!",
      unlockedDate: new Date(),
      badge: "⚡",
      rarity: "common",
      points: 25
    });
  }
  
  // Store new achievements
  if (newAchievements.length > 0) {
    achievements.set(userId, [...userAchievements, ...newAchievements]);
  }
  
  return newAchievements;
}

/**
 * Generate motivational message based on user's progress
 */
function generateMotivationalMessage(report: ProgressReport): string {
  const messages = [
    "🌟 You're making incredible progress! Keep pushing forward!",
    "💪 Every step counts. You're building something amazing!",
    "🚀 Your dedication is inspiring. Don't stop now!",
    "🎯 Focus on progress, not perfection. You've got this!",
    "⚡ Small daily improvements lead to stunning results!",
    "🏆 Champions are made in the moments when they want to quit but don't!",
    "🌈 The future belongs to those who believe in their dreams!",
    "🔥 Your only limit is the one you set for yourself!"
  ];
  
  if (report.goalsCompleted > 0) {
    return `🎉 Amazing! You've completed ${report.goalsCompleted} goal(s)! You're unstoppable!`;
  }
  
  if (report.streakDays >= 7) {
    return `🔥 ${report.streakDays}-day streak! Your consistency is phenomenal!`;
  }
  
  if (report.totalProgress >= 70) {
    return "🚀 You're in the home stretch! Finish strong!";
  }
  
  return messages[Math.floor(Math.random() * messages.length)];
}

export const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { action, userId = 'default', goalData, goalId } = body;

    switch (action) {
      case 'create_goal': {
        const newGoal: Goal = {
          id: `goal_${Date.now()}`,
          userId,
          title: goalData.title,
          description: goalData.description || '',
          category: goalData.category || 'personal',
          priority: goalData.priority || 'medium',
          status: 'active',
          progress: 0,
          startDate: new Date(),
          targetDate: new Date(goalData.targetDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
          milestones: goalData.milestones || [],
          tags: goalData.tags || [],
          motivationScore: 80, // Start high!
          difficultyLevel: goalData.difficultyLevel || 50
        };
        
        newGoal.aiInsights = generateAIInsights(newGoal);
        goals.set(newGoal.id, newGoal);
        
        const newAchievements = checkAchievements(userId, newGoal);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            goal: newGoal,
            achievements: newAchievements,
            message: "🎯 Goal created! Let's make it happen!"
          })
        };
      }

      case 'update_progress': {
        const goal = goals.get(goalId);
        if (!goal) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, error: 'Goal not found' })
          };
        }
        
        goal.progress = Math.min(100, Math.max(0, goalData.progress));
        
        if (goal.progress === 100 && goal.status !== 'completed') {
          goal.status = 'completed';
          goal.completedDate = new Date();
        }
        
        goal.aiInsights = generateAIInsights(goal);
        const newAchievements = checkAchievements(userId, goal);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            goal,
            achievements: newAchievements,
            progress: calculateGoalProgress(goal)
          })
        };
      }

      case 'get_goals': {
        const userGoals = Array.from(goals.values()).filter(g => g.userId === userId);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            goals: userGoals,
            total: userGoals.length,
            active: userGoals.filter(g => g.status === 'active').length,
            completed: userGoals.filter(g => g.status === 'completed').length
          })
        };
      }

      case 'get_progress_report': {
        const userGoals = Array.from(goals.values()).filter(g => g.userId === userId);
        const completedGoals = userGoals.filter(g => g.status === 'completed').length;
        const avgProgress = userGoals.length > 0 
          ? userGoals.reduce((sum, g) => sum + g.progress, 0) / userGoals.length 
          : 0;
        
        const report: ProgressReport = {
          userId,
          period: 'weekly',
          goalsStarted: userGoals.length,
          goalsCompleted: completedGoals,
          totalProgress: avgProgress,
          streakDays: 5, // Would calculate from activity log in production
          achievements: achievements.get(userId) || [],
          recommendations: [
            "🎯 Focus on 1-3 high-priority goals at a time for better results",
            "📅 Review your goals every Sunday to stay on track",
            "🤝 Share your goals with a friend for accountability"
          ],
          motivationalMessage: ''
        };
        
        report.motivationalMessage = generateMotivationalMessage(report);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            report
          })
        };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Invalid action',
            validActions: ['create_goal', 'update_progress', 'get_goals', 'get_progress_report']
          })
        };
    }
  } catch (error) {
    const err = error as Error;
    console.error('Goal tracker error:', err);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: err.message
      })
    };
  }
};

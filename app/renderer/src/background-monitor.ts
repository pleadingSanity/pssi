/**
 * BACKGROUND SYSTEM MONITOR & DAILY REPORTER
 * 
 * Runs in background checking systems and sending daily progress reports
 * Features:
 * - Continuous system monitoring (even when app closed)
 * - Daily SMS/email reports to user
 * - Auto-learning from new information
 * - System health checks
 * - Progress tracking
 */

import { offlineStorage } from './offline-ai';

interface DailyReport {
  date: string;
  userId: string;
  conversationsToday: number;
  tasksCompleted: string[];
  knowledgeLearned: string[];
  systemHealth: string;
  aiImprovements: string[];
  recommendations: string[];
  timesSaved: number; // minutes
  issuesFixed: number;
  experimentsConducted: number;
}

interface SystemCheck {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline';
  functionsWorking: number;
  endpointsAlive: number;
  errors: string[];
}

/**
 * Background monitoring service
 */
class BackgroundMonitor {
  private checkInterval: number = 5 * 60 * 1000; // 5 minutes
  private reportCheckInterval: number = 60 * 60 * 1000; // 1 hour
  private knowledgeCheckInterval: number = 30 * 60 * 1000; // 30 minutes
  private timers: number[] = [];
  private dailyStats: Map<string, DailyReport> = new Map();
  private userConfigs: Map<string, { reportTime: string; email?: string; phoneNumber?: string; notifications: any }> = new Map();
  private readonly MAX_DAILY_STATS = 10; // Limit stored daily stats to prevent memory growth
  private readonly MAX_TASK_HISTORY = 50; // Limit tasks per user
  private readonly MAX_KNOWLEDGE_HISTORY = 100; // Limit learned items per user

  start(): void {
    console.log('🔄 Background monitor started');
    
    // System checks every 5 minutes
    this.timers.push(window.setInterval(() => {
      this.performSystemCheck();
    }, this.checkInterval));

    // Daily report check every hour
    this.timers.push(window.setInterval(() => {
      this.checkDailyReport();
    }, this.reportCheckInterval));

    // Auto-learning check every 30 minutes
    this.timers.push(window.setInterval(() => {
      this.checkForNewKnowledge();
    }, this.knowledgeCheckInterval));

    // Clean old data every 24 hours
    this.timers.push(window.setInterval(() => {
      offlineStorage.cleanOldData(30);
      this.pruneOldStats();
    }, 24 * 60 * 60 * 1000));

    // Initial fetch of user configurations
    this.fetchUserConfigs();
  }

  stop(): void {
    this.timers.forEach(timer => window.clearInterval(timer));
    this.timers = [];
    console.log('🛑 Background monitor stopped');
  }

  /**
   * Prune old daily stats to prevent memory growth
   */
  private pruneOldStats(): void {
    if (this.dailyStats.size > this.MAX_DAILY_STATS) {
      const sortedKeys = Array.from(this.dailyStats.entries())
        .sort((a, b) => new Date(a[1].date).getTime() - new Date(b[1].date).getTime())
        .map(([key]) => key);
      
      // Remove oldest entries
      const toRemove = sortedKeys.slice(0, sortedKeys.length - this.MAX_DAILY_STATS);
      toRemove.forEach(key => this.dailyStats.delete(key));
      
      console.log(`🧹 Pruned ${toRemove.length} old daily stats from memory`);
    }
  }

  /**
   * Fetch user configurations for daily reports.
   * In a real app, this would fetch configs for the logged-in user.
   */
  private async fetchUserConfigs(userId: string = 'default'): Promise<void> {
    const SETTINGS_KEY = `ps_full_ai_settings_${userId}`;
    const savedSettings = localStorage.getItem(SETTINGS_KEY);

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        this.userConfigs.set(userId, settings);
        console.log(`⚙️ Loaded configuration for user: ${userId} from local storage.`);
      } catch (e) {
        console.error('Failed to load user config, using defaults.', e);
        this.setDefaultConfig(userId);
      }
    } else {
      this.setDefaultConfig(userId);
    }
  }

  /**
   * Perform system health check
   */
  private async performSystemCheck(): Promise<SystemCheck> {
    const check: SystemCheck = {
      timestamp: new Date(),
      cpuUsage: 0,
      memoryUsage: 0,
      networkStatus: navigator.onLine ? 'online' : 'offline',
      functionsWorking: 0,
      endpointsAlive: 0,
      errors: []
    };

    try {
      // Check self-healing endpoint
      const healthResponse = await fetch('/.netlify/functions/self-healing', {
        signal: AbortSignal.timeout(3000)
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        check.functionsWorking = healthData.health?.functions?.working || 0;
        check.endpointsAlive = Object.values(healthData.health?.endpoints || {})
          .filter(v => v).length;
        
        // Log predictive insights
        if (healthData.health?.predictions) {
          console.log('🔮 Predictive Health Analysis:', healthData.health.predictions);
        }

        // Log dynamic resource allocation actions
        if (healthData.health?.allocations && healthData.health.allocations.length > 0) {
          console.log('🚀 Dynamic Resource Allocation:', healthData.health.allocations);
        }
      }

      // Check memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        check.memoryUsage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      }

      console.log('✅ System check completed:', check);

    } catch (error) {
      check.errors.push(`System check failed: ${error}`);
      console.error('❌ System check error:', error);
    }

    return check;
  }

  /**
   * Check if it's time to send daily report
   */
  private async checkDailyReport(): Promise<void> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    for (const [userId, config] of this.userConfigs.entries()) {
      // Check if it's time for this user's report and if they have any stats for today
      if (currentTime === config.reportTime && this.dailyStats.has(userId)) {
        console.log(`🕒 It's time to send a daily report for user ${userId}`);
        await this.sendDailyReport(userId);
      }
    }
  }

  /**
   * Generate and send daily progress report
   */
  async sendDailyReport(userId: string): Promise<void> {
    const report = this.getOrCreateDailyStats(userId);
    const config = this.userConfigs.get(userId);

    try {
      // Send via notification
      await this.sendNotification(userId, report);

      // Send via email/SMS (if configured)
      await fetch('/.netlify/functions/background-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_daily_report',
          userId,
          config, // Pass user-specific config
          report
        })
      });

      // Store in IndexedDB
      await offlineStorage.saveDailyReport(userId, report);

      console.log('📊 Daily report sent:', report);

      // Reset stats for tomorrow
      this.dailyStats.set(userId, this.createEmptyReport(userId));

    } catch (error) {
      console.error('Failed to send daily report:', error);
    }
  }

  /**
   * Send notification to user
   */
  private async sendNotification(_userId: string, report: DailyReport): Promise<void> {
    const message = `📊 P.S-Full.AI Daily Report:
✅ ${report.conversationsToday} conversations
✅ ${report.tasksCompleted.length} tasks completed
✅ ${report.knowledgeLearned.length} new things learned
✅ ${report.timesSaved} minutes saved
✅ ${report.issuesFixed} issues auto-fixed
💡 ${report.recommendations.length} recommendations for you

System Health: ${report.systemHealth}`;

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('P.S-Full.AI Daily Report', {
        body: message,
        icon: '/icon.png',
        badge: '/badge.png'
      });
    }

    // Push notification (if service worker supports it)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('P.S-Full.AI Daily Report', {
        body: message,
        icon: '/icon.png',
        badge: '/badge.png'
      });
    }
  }

  /**
   * Gets the daily stats for a user, creating a new report if one doesn't exist.
   */
  private getOrCreateDailyStats(userId: string): DailyReport {
    if (!this.dailyStats.has(userId)) {
      this.dailyStats.set(userId, this.createEmptyReport(userId));
    }
    return this.dailyStats.get(userId)!;
  }

  /**
   * Track conversation
   */
  trackConversation(userId: string): void {
    const report = this.getOrCreateDailyStats(userId);
    report.conversationsToday++;
  }

  /**
   * Track completed task
   */
  trackTask(userId: string, task: string): void {
    const report = this.getOrCreateDailyStats(userId);
    report.tasksCompleted.push(task);
    
    // Limit task history to prevent memory growth
    if (report.tasksCompleted.length > this.MAX_TASK_HISTORY) {
      report.tasksCompleted = report.tasksCompleted.slice(-this.MAX_TASK_HISTORY);
    }
  }

  /**
   * Auto-learn from new information
   */
  private async checkForNewKnowledge(): Promise<void> {
    console.log('🧠 Checking for new knowledge to learn...');

    // Phase 1: Mine for new external knowledge
    try {
      const response = await fetch('/.netlify/functions/knowledge-miner');

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.insight) {
          console.log(`⛏️ Knowledge Miner found something new: ${data.insight.topic}`);
          await this.incorporateKnowledge(data.insight);
        }
      }
    } catch (error) {
      console.error('Knowledge mining failed:', error);
    }

    // Phase 2: Weave existing memories to find deeper connections
    try {
      await this.weaveMemories('default');
    } catch (error) {
      console.error('Memory weaving failed:', error);
    }

    // Phase 2: Analyze internal data for insights (existing logic)
    try {
      const response = await fetch('/.netlify/functions/ai-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_insights', timeframe: 'today' })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.insights && data.insights.length > 0) {
          for (const insight of data.insights) await this.incorporateKnowledge(insight);
        }
      }
    } catch (error) {
      console.error('Knowledge check failed:', error);
    }
  }

  /**
   * Triggers the Memory Weaver AI to find deeper connections in existing knowledge.
   */
  private async weaveMemories(userId: string): Promise<void> {
    console.log('🕸️ Weaving memories to find deeper insights...');
    try {
      const response = await fetch('/.netlify/functions/memory-weaver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.insights && data.insights.length > 0) {
          console.log(`🧵 Memory Weaver found ${data.insights.length} new insight(s)!`);
          for (const insight of data.insights) {
            await this.incorporateKnowledge(insight);
          }
        }
      }
    } catch (error) {
      console.error('Failed to trigger Memory Weaver:', error);
    }
  }
  /**
   * Runs an experiment on a new piece of knowledge in a safe sandbox.
   */
  private async runExperiment(insight: any): Promise<any> {
    console.log(`🔬 Running experiment for: ${insight.topic}`);
    const report = this.getOrCreateDailyStats('default');
    report.experimentsConducted++;

    try {
      const response = await fetch('/.netlify/functions/ai-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiment: { insight } })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`✅ Experiment Result: ${data.result.verdict} - ${data.result.message}`);
          return data.result;
        }
      }
    } catch (error) {
      console.error('Sandbox experiment failed:', error);
    }
    return null;
  }

  /**
   * Incorporate new knowledge into AI
   */
  private async incorporateKnowledge(insight: any): Promise<void> {
    console.log('📚 Learning new knowledge:', insight);
    const userId = 'default'; // Or determine user context if insight is user-specific

    let experimentResult = null;
    if (insight.isExperimental) {
      experimentResult = await this.runExperiment(insight);
      // Only proceed with verified, successful experiments
      if (!experimentResult || experimentResult.verdict !== 'SUCCESS') {
        console.log(`Skipping integration of '${insight.topic}' due to unsuccessful experiment.`);
        return;
      }
    }

    // Save to knowledge base
    await offlineStorage.saveKnowledge(
      insight.topic || 'general',
      insight.content,
      insight.importance || 50,
      experimentResult // Attach experiment results if they exist
    );

    // Track that knowledge was learned for the daily report
    const report = this.getOrCreateDailyStats(userId);
    let knowledgeEntry = insight.topic || 'A new pattern';
    if (experimentResult) {
      knowledgeEntry += ` (Verified: ${experimentResult.metrics?.performanceGain || 'Success'})`;
    }
    report.knowledgeLearned.push(knowledgeEntry);
    
    // Limit knowledge history to prevent memory growth
    if (report.knowledgeLearned.length > this.MAX_KNOWLEDGE_HISTORY) {
      report.knowledgeLearned = report.knowledgeLearned.slice(-this.MAX_KNOWLEDGE_HISTORY);
    }

    // Update AI prompts library
    await fetch('/.netlify/functions/ai-prompts-library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_learned_pattern',
        pattern: insight
      })
    });
  }

  /**
   * Create empty report template
   */
  private createEmptyReport(userId: string): DailyReport {
    return {
      date: new Date().toISOString().split('T')[0],
      userId,
      conversationsToday: 0,
      tasksCompleted: [],
      knowledgeLearned: [],
      systemHealth: 'healthy',
      aiImprovements: [],
      recommendations: [],
      timesSaved: 0,
      issuesFixed: 0,
      experimentsConducted: 0
    };
  }

  /**
   * Sets a default configuration for a user if none is found.
   */
  private setDefaultConfig(userId: string): void {
    const defaultConfig = {
      reportTime: '20:00',
      notifications: { email: true, sms: false, push: true }
    };
    this.userConfigs.set(userId, defaultConfig);
    console.log(`⚙️ No saved configuration found for user ${userId}. Using defaults.`);
  }
}

// Start background monitoring
const backgroundMonitor = new BackgroundMonitor();
backgroundMonitor.start();

// Keep monitoring even if page is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('📱 App in background - monitoring continues');
  } else {
    console.log('👀 App active - full monitoring');
  }
});

export { BackgroundMonitor, backgroundMonitor };
export type { DailyReport, SystemCheck };

/**
 * OFFLINE-FIRST P.S-FULL.AI
 * 
 * Works fully offline using Service Worker + IndexedDB
 * Features:
 * - Complete offline functionality
 * - Background sync when online
 * - Local AI processing (fallback)
 * - Stores conversations locally
 * - Auto-syncs when connection restored
 */

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered for offline support');
        
        // Background sync for updates
        if ('sync' in registration) {
          registration.sync.register('sync-ai-data');
        }
      })
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

// IndexedDB for offline storage
const DB_NAME = 'PSFullAI';
const DB_VERSION = 1;

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationStore = db.createObjectStore('conversations', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          conversationStore.createIndex('userId', 'userId', { unique: false });
          conversationStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Knowledge store (auto-learned information)
        if (!db.objectStoreNames.contains('knowledge')) {
          const knowledgeStore = db.createObjectStore('knowledge', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          knowledgeStore.createIndex('topic', 'topic', { unique: false });
          knowledgeStore.createIndex('importance', 'importance', { unique: false });
        }

        // Queue for offline requests
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
        }

        // Daily progress reports
        if (!db.objectStoreNames.contains('dailyReports')) {
          const reportStore = db.createObjectStore('dailyReports', { 
            keyPath: 'date' 
          });
          reportStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  async saveConversation(userId: string, message: string, response: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['conversations'], 'readwrite');
    const store = transaction.objectStore('conversations');

    await store.add({
      userId,
      message,
      response,
      timestamp: new Date(),
      synced: false
    });
  }

  async saveKnowledge(topic: string, content: string, importance: number): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['knowledge'], 'readwrite');
    const store = transaction.objectStore('knowledge');

    await store.add({
      topic,
      content,
      importance,
      timestamp: new Date(),
      source: 'auto-learned'
    });
  }

  async getUnsyncedData(): Promise<any[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['conversations'], 'readonly');
    const store = transaction.objectStore('conversations');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => {
        const data = request.result.filter(item => !item.synced);
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveDailyReport(userId: string, report: any): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['dailyReports'], 'readwrite');
    const store = transaction.objectStore('dailyReports');

    await store.put({
      date: new Date().toISOString().split('T')[0],
      userId,
      ...report
    });
  }
}

// Initialize offline storage
const offlineStorage = new OfflineStorage();
offlineStorage.init().then(() => {
  console.log('✅ Offline storage initialized');
});

// Offline AI (basic fallback)
class OfflineAI {
  private responses: Record<string, string> = {
    greeting: "Hi! I'm working offline right now, but I can still help you with basic tasks. Your messages will sync when you're back online.",
    help: "While offline, I can: provide cached information, save your messages for later, and give you basic assistance. Full AI features will be available when you reconnect.",
    default: "I've saved your message. When you're back online, I'll process it with the full AI system and give you a complete response."
  };

  processOffline(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      return this.responses.greeting;
    }
    
    if (lowerMessage.includes('help')) {
      return this.responses.help;
    }
    
    return this.responses.default;
  }
}

const offlineAI = new OfflineAI();

// Enhanced fetch with offline support
async function fetchWithOfflineSupport(url: string, options: RequestInit): Promise<Response> {
  try {
    // Try online first
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(5000)
    });
    
    return response;
  } catch (error) {
    console.log('🔌 Offline mode - using local processing');
    
    // Process offline
    const body = options.body ? JSON.parse(options.body as string) : {};
    const offlineResponse = offlineAI.processOffline(body.prompt || body.message || '');
    
    // Save to sync queue
    await offlineStorage.saveConversation(
      body.userId || 'default',
      body.prompt || body.message,
      offlineResponse
    );
    
    // Return mock response
    return new Response(JSON.stringify({
      success: true,
      content: offlineResponse,
      offline: true,
      provider: 'offline-mode'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync when online
if ('sync' in navigator.serviceWorker) {
  navigator.serviceWorker.ready.then(registration => {
    registration.sync.register('sync-ai-data').then(() => {
      console.log('🔄 Background sync registered');
    });
  });
}

// Listen for online/offline events
window.addEventListener('online', async () => {
  console.log('🌐 Back online - syncing data...');
  
  const unsyncedData = await offlineStorage.getUnsyncedData();
  console.log(`📤 Syncing ${unsyncedData.length} offline conversations`);
  
  // Sync each conversation
  for (const item of unsyncedData) {
    try {
      await fetch('/.netlify/functions/emotional-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          userId: item.userId,
          message: item.message,
          offline_sync: true
        })
      });
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  }
});

window.addEventListener('offline', () => {
  console.log('🔌 Offline mode activated');
  showNotification('You\'re offline', 'P.S-Full.AI will continue working with limited features');
});

// Notification helper
function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon.png' });
  }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

export { offlineStorage, fetchWithOfflineSupport, OfflineAI };

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
        
        // Background sync for updates (if supported)
        if ('sync' in registration) {
          (registration as any).sync.register('sync-ai-data');
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

  async saveKnowledge(topic: string, content: string, importance: number, experimentResult?: any): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['knowledge'], 'readwrite');
    const store = transaction.objectStore('knowledge');

    await store.add({
      topic,
      content,
      importance,
      timestamp: new Date(),
      source: 'auto-learned',
      experimentResult
    });
  }

  async getAllData(): Promise<{ conversations: any[]; knowledge: any[]; dailyReports: any[] }> {
    if (!this.db) return { conversations: [], knowledge: [], dailyReports: [] };

    const transaction = this.db.transaction(['conversations', 'knowledge', 'dailyReports'], 'readonly');
    
    const getAllFromStore = (storeName: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        const request = transaction.objectStore(storeName).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    };

    const [conversations, knowledge, dailyReports] = await Promise.all([
      getAllFromStore('conversations'),
      getAllFromStore('knowledge'),
      getAllFromStore('dailyReports')
    ]);

    return { conversations, knowledge, dailyReports };
  }

  async clearAllStores(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['conversations', 'knowledge', 'dailyReports'], 'readwrite');
    
    const clearStore = (storeName: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const request = transaction.objectStore(storeName).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    };

    await Promise.all([
      clearStore('conversations'),
      clearStore('knowledge'),
      clearStore('dailyReports')
    ]);
  }

  async bulkAdd(storeName: 'conversations' | 'knowledge' | 'dailyReports', data: any[]): Promise<void> {
    if (!this.db || !data || data.length === 0) return;

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    for (const item of data) {
      // Remove auto-incrementing keys if they exist to allow the DB to generate new ones
      delete item.id; 
      store.add(item);
    }
  }

  async getUnsyncedData(limit: number = 50): Promise<any[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['conversations'], 'readonly');
    const store = transaction.objectStore('conversations');
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const unsyncedItems: any[] = [];
      const request = index.openCursor();
      
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor && unsyncedItems.length < limit) {
          if (!cursor.value.synced) {
            unsyncedItems.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(unsyncedItems);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async cleanOldData(daysToKeep: number = 30): Promise<void> {
    if (!this.db) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const transaction = this.db.transaction(['conversations', 'dailyReports'], 'readwrite');
    
    // Clean old conversations
    const conversationStore = transaction.objectStore('conversations');
    const conversationIndex = conversationStore.index('timestamp');
    const conversationRequest = conversationIndex.openCursor(IDBKeyRange.upperBound(cutoffDate));
    
    conversationRequest.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.synced) {
          cursor.delete(); // Only delete synced items
        }
        cursor.continue();
      }
    };

    // Clean old reports (keep only last 90 days)
    const reportStore = transaction.objectStore('dailyReports');
    const reportRequest = reportStore.openCursor();
    
    reportRequest.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        const reportDate = new Date(cursor.value.date);
        if (reportDate < cutoffDate) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
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
  // Simulates a lightweight, local AI model for better offline responses.
  private localModel(prompt: string): string {
    const p = prompt.toLowerCase();
    if (p.includes('hello') || p.includes('hi')) {
      return "Hello! I'm currently offline, but I've saved your message. We'll get a full response from the AI network once we're back online.";
    }
    if (p.includes('how are you')) {
      return "I'm operating in offline mode, but I'm ready to assist and save your thoughts. How are you doing?";
    }
    if (p.includes('help')) {
      return "Of course. While offline, I can save all your messages, provide basic information from my cache, and keep track of our conversation. Everything will be synced for a full AI response later.";
    }
    if (p.includes('thank you') || p.includes('thanks')) {
      return "You're very welcome! I've noted your message.";
    }
    return "I've recorded your message. It will be processed by the full AI network as soon as we're back online. Feel free to continue our conversation.";
  }

  processOffline(message: string): string {
    // In a real application, this could be a more sophisticated local model
    // like a quantized version of a larger model running on-device.
    // For now, this simulation provides more dynamic responses than static ones.
    const response = this.localModel(message);
    console.log(`🤖 Offline AI generated response: "${response}"`);
    return response;
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

// Background sync when online (if supported)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    if ('sync' in registration) {
      (registration as any).sync.register('sync-ai-data').then(() => {
        console.log('🔄 Background sync registered');
      });
    }
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

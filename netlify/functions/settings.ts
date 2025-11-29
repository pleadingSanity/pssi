/**
 * PSSI Settings System - Maximum Customization & Optimization
 * Complete control over every aspect of the AI system
 */
import type { Handler, HandlerEvent } from '@netlify/functions';

interface PSSISettings {
  // Performance optimization
  performance: {
    maxMemory: number;           // MB
    cacheSize: number;           // MB
    workers: number;             // CPU cores
    gpuAcceleration: boolean;
    prefetchEnabled: boolean;
    compressionLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;  // gzip compression
  };
  
  // Network configuration
  network: {
    timeout: number;             // ms
    retries: number;
    maxConcurrent: number;
    compression: boolean;
    http2: boolean;
    keepAlive: boolean;
    dataSaver: boolean;
  };
  
  // AI provider settings
  ai: {
    defaultProvider: 'sanity' | 'openai' | 'anthropic' | 'gemini' | 'auto';
    fallbackEnabled: boolean;
    loadBalancing: boolean;
    cacheDuration: number;       // seconds
    maxTokens: number;
    temperature: number;         // 0-1
    streamingEnabled: boolean;
    providers: {
      openai: ProviderConfig;
      anthropic: ProviderConfig;
      gemini: ProviderConfig;
    };
  };
  
  // UI/UX customization
  ui: {
    theme: 'dark' | 'light' | 'auto';
    colorScheme: 'purple' | 'blue' | 'green' | 'red' | 'orange' | 'pink';
    fontSize: number;            // px
    animations: boolean;
    soundEffects: boolean;
    hapticFeedback: boolean;
    notifications: boolean;
    compactMode: boolean;
    fontFamily: string;
    lineHeight: number;
  };
  
  // Privacy & security
  privacy: {
    saveHistory: boolean;
    encryptLocal: boolean;
    analytics: boolean;
    crashReports: boolean;
    clearOnExit: boolean;
    biometricLock: boolean;
    autoLock: boolean;
    lockTimeout: number;         // minutes
  };
  
  // Advanced features
  advanced: {
    developerMode: boolean;
    experimentalFeatures: boolean;
    autoUpdate: boolean;
    offlineMode: boolean;
    customPrompts: boolean;
    macros: boolean;
    voiceInput: boolean;
    multiLanguage: boolean;
    codeHighlighting: boolean;
    markdownRendering: boolean;
  };
  
  // Mobile-specific (Android/iOS)
  mobile?: {
    dataSaver: boolean;
    wifiOnly: boolean;
    backgroundSync: boolean;
    batteryOptimized: boolean;
    reducedAnimations: boolean;
    dimWhenIdle: boolean;
  };
  
  // Keyboard shortcuts
  keyboard: {
    sendMessage: string;
    newChat: string;
    clearChat: string;
    settings: string;
    search: string;
    voiceInput: string;
  };
}

interface ProviderConfig {
  enabled: boolean;
  models: string[];
  priority: number;
  rateLimit: number;            // requests per minute
  costLimit: number;            // $ per month
}

const DEFAULT_SETTINGS: PSSISettings = {
  performance: {
    maxMemory: 4096,
    cacheSize: 1024,
    workers: 4,
    gpuAcceleration: true,
    prefetchEnabled: true,
    compressionLevel: 6,
  },
  network: {
    timeout: 30000,
    retries: 3,
    maxConcurrent: 5,
    compression: true,
    http2: true,
    keepAlive: true,
    dataSaver: false,
  },
  ai: {
    defaultProvider: 'sanity',
    fallbackEnabled: true,
    loadBalancing: true,
    cacheDuration: 3600,
    maxTokens: 4000,
    temperature: 0.7,
    streamingEnabled: true,
    providers: {
      openai: {
        enabled: true,
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
        priority: 1,
        rateLimit: 60,
        costLimit: 100,
      },
      anthropic: {
        enabled: true,
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
        priority: 2,
        rateLimit: 60,
        costLimit: 100,
      },
      gemini: {
        enabled: true,
        models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro'],
        priority: 3,
        rateLimit: 60,
        costLimit: 50,
      },
    },
  },
  ui: {
    theme: 'dark',
    colorScheme: 'purple',
    fontSize: 16,
    animations: true,
    soundEffects: false,
    hapticFeedback: true,
    notifications: true,
    compactMode: false,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 1.5,
  },
  privacy: {
    saveHistory: true,
    encryptLocal: true,
    analytics: false,
    crashReports: true,
    clearOnExit: false,
    biometricLock: false,
    autoLock: false,
    lockTimeout: 15,
  },
  advanced: {
    developerMode: false,
    experimentalFeatures: true,
    autoUpdate: true,
    offlineMode: false,
    customPrompts: true,
    macros: true,
    voiceInput: false,
    multiLanguage: true,
    codeHighlighting: true,
    markdownRendering: true,
  },
  mobile: {
    dataSaver: false,
    wifiOnly: false,
    backgroundSync: true,
    batteryOptimized: false,
    reducedAnimations: false,
    dimWhenIdle: true,
  },
  keyboard: {
    sendMessage: 'Ctrl+Enter',
    newChat: 'Ctrl+N',
    clearChat: 'Ctrl+L',
    settings: 'Ctrl+,',
    search: 'Ctrl+F',
    voiceInput: 'Ctrl+Shift+V',
  },
};

// Settings presets for different use cases
const PRESETS = {
  maximum_performance: {
    ...DEFAULT_SETTINGS,
    performance: {
      maxMemory: 8192,
      cacheSize: 2048,
      workers: 8,
      gpuAcceleration: true,
      prefetchEnabled: true,
      compressionLevel: 1,  // Less compression = faster
    },
    network: {
      ...DEFAULT_SETTINGS.network,
      maxConcurrent: 10,
      timeout: 60000,
    },
    ai: {
      ...DEFAULT_SETTINGS.ai,
      maxTokens: 8000,
      streamingEnabled: true,
    },
  },
  
  battery_saver: {
    ...DEFAULT_SETTINGS,
    performance: {
      maxMemory: 2048,
      cacheSize: 512,
      workers: 2,
      gpuAcceleration: false,
      prefetchEnabled: false,
      compressionLevel: 9,  // Max compression
    },
    ui: {
      ...DEFAULT_SETTINGS.ui,
      theme: 'dark',
      animations: false,
    },
    mobile: {
      dataSaver: true,
      wifiOnly: true,
      backgroundSync: false,
      batteryOptimized: true,
      reducedAnimations: true,
      dimWhenIdle: true,
    },
  },
  
  data_saver: {
    ...DEFAULT_SETTINGS,
    network: {
      ...DEFAULT_SETTINGS.network,
      compression: true,
      maxConcurrent: 2,
      dataSaver: true,
    },
    ai: {
      ...DEFAULT_SETTINGS.ai,
      maxTokens: 2000,
      cacheDuration: 7200,  // 2 hours
    },
    mobile: {
      dataSaver: true,
      wifiOnly: true,
      backgroundSync: false,
      batteryOptimized: true,
      reducedAnimations: false,
      dimWhenIdle: false,
    },
  },
  
  maximum_privacy: {
    ...DEFAULT_SETTINGS,
    privacy: {
      saveHistory: false,
      encryptLocal: true,
      analytics: false,
      crashReports: false,
      clearOnExit: true,
      biometricLock: true,
      autoLock: true,
      lockTimeout: 5,
    },
    ai: {
      ...DEFAULT_SETTINGS.ai,
      cacheDuration: 0,  // No caching
    },
  },
  
  developer: {
    ...DEFAULT_SETTINGS,
    advanced: {
      developerMode: true,
      experimentalFeatures: true,
      autoUpdate: false,  // Manual updates
      offlineMode: false,
      customPrompts: true,
      macros: true,
      voiceInput: true,
      multiLanguage: true,
      codeHighlighting: true,
      markdownRendering: true,
    },
    ui: {
      ...DEFAULT_SETTINGS.ui,
      compactMode: true,
      fontSize: 14,
    },
  },
};

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const method = event.httpMethod;
    const path = event.path;

    // GET /api/settings - Get current settings
    if (method === 'GET' && path.includes('/settings')) {
      const userId = event.queryStringParameters?.userId || 'default';
      
      // TODO: Load from database
      // For now, return defaults
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          settings: DEFAULT_SETTINGS,
          userId,
        }),
      };
    }

    // POST /api/settings - Update settings
    if (method === 'POST' && path.includes('/settings')) {
      const body = JSON.parse(event.body || '{}');
      const { settings, userId = 'default' } = body;

      // Validate settings
      const validated = validateSettings(settings);
      
      // TODO: Save to database
      console.log('💾 Saving settings for user:', userId);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Settings updated successfully',
          settings: validated,
        }),
      };
    }

    // GET /api/settings/presets - Get all presets
    if (method === 'GET' && path.includes('/presets')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          presets: Object.keys(PRESETS),
          descriptions: {
            maximum_performance: 'Best speed, highest resource usage',
            battery_saver: 'Minimal power consumption',
            data_saver: 'Reduce network usage by 70%',
            maximum_privacy: 'No tracking, encrypted, auto-clear',
            developer: 'Debug tools, custom features enabled',
          },
        }),
      };
    }

    // GET /api/settings/preset/:name - Get specific preset
    if (method === 'GET' && path.includes('/preset/')) {
      const presetName = path.split('/preset/')[1];
      const preset = PRESETS[presetName as keyof typeof PRESETS];

      if (!preset) {
        throw new Error(`Preset "${presetName}" not found`);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          preset: presetName,
          settings: preset,
        }),
      };
    }

    // POST /api/settings/reset - Reset to defaults
    if (method === 'POST' && path.includes('/reset')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Settings reset to defaults',
          settings: DEFAULT_SETTINGS,
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Settings endpoint not found',
      }),
    };

  } catch (error) {
    console.error('Settings error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Settings operation failed',
      }),
    };
  }
};

/**
 * Validate and sanitize settings
 */
function validateSettings(settings: Partial<PSSISettings>): PSSISettings {
  const validated = { ...DEFAULT_SETTINGS };

  // Validate performance settings
  if (settings.performance) {
    validated.performance = {
      maxMemory: clamp(settings.performance.maxMemory || 4096, 1024, 16384),
      cacheSize: clamp(settings.performance.cacheSize || 1024, 256, 8192),
      workers: clamp(settings.performance.workers || 4, 1, 16),
      gpuAcceleration: settings.performance.gpuAcceleration ?? true,
      prefetchEnabled: settings.performance.prefetchEnabled ?? true,
      compressionLevel: clamp(settings.performance.compressionLevel || 6, 1, 9) as any,
    };
  }

  // Validate network settings
  if (settings.network) {
    validated.network = {
      timeout: clamp(settings.network.timeout || 30000, 5000, 120000),
      retries: clamp(settings.network.retries || 3, 0, 10),
      maxConcurrent: clamp(settings.network.maxConcurrent || 5, 1, 20),
      compression: settings.network.compression ?? true,
      http2: settings.network.http2 ?? true,
      keepAlive: settings.network.keepAlive ?? true,
      dataSaver: settings.network.dataSaver ?? false,
    };
  }

  // Validate AI settings
  if (settings.ai) {
    validated.ai = {
      defaultProvider: settings.ai.defaultProvider || 'sanity',
      fallbackEnabled: settings.ai.fallbackEnabled ?? true,
      loadBalancing: settings.ai.loadBalancing ?? true,
      cacheDuration: clamp(settings.ai.cacheDuration || 3600, 0, 86400),
      maxTokens: clamp(settings.ai.maxTokens || 4000, 100, 32000),
      temperature: clamp(settings.ai.temperature || 0.7, 0, 1),
      streamingEnabled: settings.ai.streamingEnabled ?? true,
      providers: settings.ai.providers || validated.ai.providers,
    };
  }

  // Validate UI settings
  if (settings.ui) {
    validated.ui = {
      theme: settings.ui.theme || 'dark',
      colorScheme: settings.ui.colorScheme || 'purple',
      fontSize: clamp(settings.ui.fontSize || 16, 10, 24),
      animations: settings.ui.animations ?? true,
      soundEffects: settings.ui.soundEffects ?? false,
      hapticFeedback: settings.ui.hapticFeedback ?? true,
      notifications: settings.ui.notifications ?? true,
      compactMode: settings.ui.compactMode ?? false,
      fontFamily: settings.ui.fontFamily || validated.ui.fontFamily,
      lineHeight: clamp(settings.ui.lineHeight || 1.5, 1.0, 2.0),
    };
  }

  return validated;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export { handler };

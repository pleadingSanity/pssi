/**
 * AI API Client - Frontend interface for AI operations
 */

interface AIRequest {
  provider: 'openai' | 'anthropic' | 'gemini' | 'llama' | 'auto';
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIResponse {
  success: boolean;
  provider: string;
  model: string;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

class AIClient {
  private baseURL: string;

  constructor() {
    // Use environment variable or default to current origin
    this.baseURL = import.meta.env.VITE_API_URL || window.location.origin;
  }

  /**
   * Send a prompt to AI with automatic provider selection
   */
  async chat(prompt: string, options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const request: AIRequest = {
      provider: options.provider || 'auto',
      prompt,
      model: options.model,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 1000,
    };

    try {
      const response = await fetch(`${this.baseURL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'AI request failed');
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        provider: 'unknown',
        model: 'unknown',
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check health of AI services
   */
  async health(): Promise<{
    status: string;
    providers: Record<string, boolean>;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/api/ai/health`);
      return await response.json();
    } catch (error) {
      return {
        status: 'error',
        providers: {},
      };
    }
  }

  /**
   * Get available AI providers
   */
  async getProviders(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/ai/providers`);
      const data = await response.json();
      return data.providers || [];
    } catch (error) {
      return [];
    }
  }
}

// Export singleton instance
export const aiClient = new AIClient();
export type { AIRequest, AIResponse };

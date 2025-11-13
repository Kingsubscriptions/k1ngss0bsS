import { Product } from '@/data/products';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '' // Use relative URLs for Vercel serverless functions
  : 'http://localhost:3001'; // Backend server runs on port 3001

// Cross-browser sync utility using BroadcastChannel and localStorage
class CrossBrowserSync {
  private channels: Map<string, BroadcastChannel> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private lastSyncTimestamps: Map<string, number> = new Map();

  constructor() {
    // Listen for storage events (cross-tab sync)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key?.startsWith('sync_')) {
          const key = event.key.replace('sync_', '');
          try {
            const data = event.newValue ? JSON.parse(event.newValue) : null;
            if (data && data.timestamp) {
              // Check if this is a newer update
              const lastTimestamp = this.lastSyncTimestamps.get(key) || 0;
              if (data.timestamp > lastTimestamp) {
                this.lastSyncTimestamps.set(key, data.timestamp);
                this.notifyListeners(key, data.data, data.sessionId);
              }
            }
          } catch (error) {
            console.error('Error parsing storage event:', error);
          }
        }
      });
    }
  }

  private getChannel(key: string): BroadcastChannel | null {
    if (!this.channels.has(key)) {
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const channel = new BroadcastChannel(`admin_sync_${key}`);
          channel.onmessage = (event) => {
            const data = event.data;
            if (data && data.timestamp) {
              // Check if this is a newer update
              const lastTimestamp = this.lastSyncTimestamps.get(key) || 0;
              if (data.timestamp > lastTimestamp) {
                this.lastSyncTimestamps.set(key, data.timestamp);
                this.notifyListeners(key, data.data, data.sessionId);
              }
            }
          };
          this.channels.set(key, channel);
        } catch (error) {
          console.warn('BroadcastChannel not supported:', error);
          return null;
        }
      }
    }
    return this.channels.get(key) || null;
  }

  private notifyListeners(key: string, data: any, sourceSessionId?: string) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in sync listener:', error);
        }
      });
    }
  }

  async syncData(key: string, data: any) {
    const timestamp = Date.now();
    const sessionId = this.getSessionId();

    const syncData = {
      data,
      timestamp,
      sessionId
    };

    // Update last timestamp to prevent echo
    this.lastSyncTimestamps.set(key, timestamp);

    // Save to localStorage (cross-tab and cross-browser sync)
    try {
      localStorage.setItem(`sync_${key}`, JSON.stringify(syncData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    // Broadcast to other tabs (same browser)
    const channel = this.getChannel(key);
    if (channel) {
      try {
        channel.postMessage(syncData);
      } catch (error) {
        console.warn('Error broadcasting message:', error);
      }
    }

    console.log(`🔄 Synced ${key} across browsers and tabs at ${new Date(timestamp).toLocaleTimeString()}`);
  }

  async getData(key: string) {
    try {
      const stored = localStorage.getItem(`sync_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
    } catch (error) {
      console.error('Error reading sync data:', error);
    }
    return null;
  }

  listenForChanges(key: string, callback: (data: any) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Return cleanup function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(callback);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('admin_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('admin_session_id', sessionId);
    }
    return sessionId;
  }

  // Check if data is from current session (to avoid echo)
  isFromCurrentSession(data: any): boolean {
    return data && data.sessionId === this.getSessionId();
  }

  // Force sync data across all tabs and browsers
  async forceSync(key: string, data: any) {
    console.log(`🔄 Force syncing ${key} across all browsers and tabs`);
    await this.syncData(key, data);

    // Also trigger a custom event for same-tab updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adminSync', {
        detail: { key, data }
      }));
    }
  }
}

export const crossBrowserSync = new CrossBrowserSync();

export interface AdminSettings {
  whatsappNumber?: string;
  whatsappDirectOrder?: boolean;
  enablePurchaseNotifications?: boolean;
  enableFloatingCart?: boolean;
  showDiscountBadges?: boolean;
  showBreadcrumbs?: boolean;
  popupSettings?: {
    enabled?: boolean;
    title?: string;
    message?: string;
    buttonText?: string;
    buttonHref?: string;
    showTimer?: boolean;
    timerDuration?: number;
    trigger?: 'delay' | 'scroll' | 'exit-intent';
    delaySeconds?: number;
    frequency?: 'always' | 'once-per-session' | 'once-per-day';
    theme?: 'light' | 'dark';
    pages?: string[];
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add admin token if available
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAdminSettings(): Promise<AdminSettings> {
    return this.request<AdminSettings>('/api/admin/settings');
  }

  async updateAdminSettings(settings: AdminSettings): Promise<{ message: string; warning?: string }> {
    return this.request<{ message: string; warning?: string }>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async loginAdmin(password: string): Promise<{ token: string; message: string }> {
    return this.request<{ token: string; message: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/admin/products');
  }

  async updateProducts(products: Product[]): Promise<{ message: string; warning?: string }> {
    return this.request<{ message: string; warning?: string }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(products),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PopupSettingsService } from '@/lib/supabase';

export type PopupTrigger = 'delay' | 'scroll' | 'exit-intent';
export type PopupFrequency = 'always' | 'once-per-session' | 'once-per-day';

export interface PopupSettings {
  enabled: boolean;
  title: string;
  message: string;
  buttonText: string;
  buttonHref: string;
  showTimer: boolean;
  timerDuration: number;
  trigger: PopupTrigger;
  delaySeconds: number;
  frequency: PopupFrequency;
  theme: 'light' | 'dark';
  pages: string[];
}

export interface PopupState extends PopupSettings {
  lastShownAt?: string;
  lastDismissedAt?: string;
  metrics: {
    impressions: number;
    clicks: number;
    dismissals: number;
  };
}

interface PopupContextValue {
  settings: PopupState;
  updateSettings: (changes: Partial<PopupSettings>) => Promise<void>;
  updateState: (changes: Partial<PopupState>) => void;
  resetSettings: () => void;
  recordImpression: () => void;
  recordClick: () => void;
  recordDismissal: () => void;
  isLoading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
}

const defaultPopupState: PopupState = {
  enabled: true,
  title: 'Limited Time Offer',
  message: 'Get 10% off when you order on WhatsApp within the next 10 minutes.',
  buttonText: 'Order on WhatsApp',
  buttonHref: 'https://wa.me/923276847960?text=I%20want%20to%20claim%20the%20limited%20time%20offer',
  showTimer: true,
  timerDuration: 10,
  trigger: 'delay',
  delaySeconds: 6,
  frequency: 'once-per-session',
  theme: 'dark',
  pages: ['/', '/tools', '/product/:id'],
  metrics: {
    impressions: 0,
    clicks: 0,
    dismissals: 0,
  },
};

const convertDatabaseToClient = (dbSettings: any): PopupState => {
  if (!dbSettings) return defaultPopupState;

  return {
    enabled: dbSettings.enabled ?? defaultPopupState.enabled,
    title: dbSettings.title ?? defaultPopupState.title,
    message: dbSettings.message ?? defaultPopupState.message,
    buttonText: dbSettings.button_text ?? defaultPopupState.buttonText,
    buttonHref: dbSettings.button_href ?? defaultPopupState.buttonHref,
    showTimer: dbSettings.show_timer ?? defaultPopupState.showTimer,
    timerDuration: dbSettings.timer_duration ?? defaultPopupState.timerDuration,
    trigger: dbSettings.trigger ?? defaultPopupState.trigger,
    delaySeconds: dbSettings.delay_seconds ?? defaultPopupState.delaySeconds,
    frequency: dbSettings.frequency ?? defaultPopupState.frequency,
    theme: dbSettings.theme ?? defaultPopupState.theme,
    pages: typeof dbSettings.pages === 'string' ? JSON.parse(dbSettings.pages) : dbSettings.pages ?? defaultPopupState.pages,
    lastShownAt: dbSettings.last_shown_at,
    lastDismissedAt: dbSettings.last_dismissed_at,
    metrics: {
      impressions: dbSettings.impressions ?? 0,
      clicks: dbSettings.clicks ?? 0,
      dismissals: dbSettings.dismissals ?? 0,
    },
  };
};

const PopupContext = createContext<PopupContextValue | undefined>(undefined);

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PopupState>(defaultPopupState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from Supabase on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Subscribe to real-time changes from Supabase
  useEffect(() => {
    const unsubscribe = PopupSettingsService.subscribeToChanges((dbSettings) => {
      console.log('🔄 Popup settings synced from Supabase (cross-browser sync)');
      const clientSettings = convertDatabaseToClient(dbSettings);
      setSettings(clientSettings);
    });

    return unsubscribe;
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dbSettings = await PopupSettingsService.getPopupSettings();
      if (dbSettings) {
        const clientSettings = convertDatabaseToClient(dbSettings);
        setSettings(clientSettings);
        console.log('✅ Popup settings loaded from Supabase');
      } else {
        // If no settings in database, use defaults and sync them
        console.log('🎯 No popup settings in database, using defaults');
        setSettings(defaultPopupState);

        // Sync default settings to database
        await PopupSettingsService.updatePopupSettings(defaultPopupState);
      }
    } catch (error) {
      console.error('Failed to load popup settings from Supabase:', error);
      setError('Failed to load popup settings from database. Using default settings.');
      setSettings(defaultPopupState);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (changes: Partial<PopupSettings>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newSettings = { ...settings, ...changes };
      const success = await PopupSettingsService.updatePopupSettings(newSettings);

      if (success) {
        setSettings(newSettings);
        console.log('✅ Popup settings updated in Supabase and synced across browsers');
      } else {
        throw new Error('Failed to update popup settings in database');
      }
    } catch (error) {
      console.error('Failed to update popup settings in Supabase:', error);
      setError('Failed to save popup settings to database. Please try again.');
      // Don't update local state if database update fails
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const updateState = useCallback(async (changes: Partial<PopupState>) => {
    try {
      const newSettings = {
        ...settings,
        ...changes,
        metrics: {
          ...settings.metrics,
          ...(changes.metrics ?? {}),
        },
      };

      const success = await PopupSettingsService.updatePopupSettings(newSettings);

      if (success) {
        setSettings(newSettings);
        console.log('✅ Popup state updated in Supabase');
      } else {
        throw new Error('Failed to update popup state in database');
      }
    } catch (error) {
      console.error('Failed to update popup state:', error);
      // Update local state even if database fails for metrics
      setSettings((prev) => ({
        ...prev,
        ...changes,
        metrics: {
          ...prev.metrics,
          ...(changes.metrics ?? {}),
        },
      }));
    }
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettings(defaultPopupState);
  }, []);

  const recordImpression = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      lastShownAt: new Date().toISOString(),
      metrics: {
        ...prev.metrics,
        impressions: prev.metrics.impressions + 1,
      },
    }));
  }, []);

  const recordClick = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        clicks: prev.metrics.clicks + 1,
      },
    }));
  }, []);

  const recordDismissal = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      lastDismissedAt: new Date().toISOString(),
      metrics: {
        ...prev.metrics,
        dismissals: prev.metrics.dismissals + 1,
      },
    }));
  }, []);

  const value = useMemo<PopupContextValue>(() => ({
    settings,
    updateSettings,
    updateState,
    resetSettings,
    recordImpression,
    recordClick,
    recordDismissal,
    isLoading,
    error,
    loadSettings,
  }), [recordClick, recordDismissal, recordImpression, resetSettings, settings, updateSettings, updateState, isLoading, error, loadSettings]);

  return <PopupContext.Provider value={value}>{children}</PopupContext.Provider>;
};

export const usePopup = (): PopupContextValue => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const POPUP_PAGE_OPTIONS = [
  { label: 'All pages', value: '*' },
  { label: 'Home', value: '/' },
  { label: 'Tools', value: '/tools' },
  { label: 'Compare', value: '/compare' },
  { label: 'All Products', value: '/products' },
  { label: 'Product Detail', value: '/product/:id' },
  { label: 'Blog', value: '/blog' },
  { label: 'Contact', value: '/contact' },
];

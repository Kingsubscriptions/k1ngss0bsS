import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { siteConfig } from '@/data/site-config';
import { AdminSettingsService, AdminSettings as SupabaseAdminSettings } from '@/lib/supabase';

export interface SiteSettings {
  whatsappNumber: string;
  whatsappDirectOrder: boolean;
  enablePurchaseNotifications: boolean;
  enableFloatingCart: boolean;
  showDiscountBadges: boolean;
  showBreadcrumbs: boolean;
}

interface SettingsContextValue {
  settings: SiteSettings;
  updateSettings: (changes: Partial<SiteSettings>) => Promise<void>;
  resetSettings: () => void;
  isLoading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  whatsappNumber: siteConfig.whatsappNumber,
  whatsappDirectOrder: siteConfig.whatsappDirectOrder,
  enablePurchaseNotifications: true,
  enableFloatingCart: true,
  showDiscountBadges: true,
  showBreadcrumbs: siteConfig.showBreadcrumbs,
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// Convert Supabase settings to client format
const convertSupabaseToClient = (supabaseSettings: SupabaseAdminSettings | null): SiteSettings => {
  if (!supabaseSettings) {
    return defaultSettings;
  }

  return {
    whatsappNumber: supabaseSettings.whatsapp_number || defaultSettings.whatsappNumber,
    whatsappDirectOrder: supabaseSettings.whatsapp_direct_order ?? defaultSettings.whatsappDirectOrder,
    enablePurchaseNotifications: supabaseSettings.enable_purchase_notifications ?? defaultSettings.enablePurchaseNotifications,
    enableFloatingCart: supabaseSettings.enable_floating_cart ?? defaultSettings.enableFloatingCart,
    showDiscountBadges: supabaseSettings.show_discount_badges ?? defaultSettings.showDiscountBadges,
    showBreadcrumbs: supabaseSettings.show_breadcrumbs ?? defaultSettings.showBreadcrumbs,
  };
};

// Convert client settings to Supabase format
const convertClientToSupabase = (clientSettings: SiteSettings): Partial<SupabaseAdminSettings> => {
  return {
    whatsapp_number: clientSettings.whatsappNumber,
    whatsapp_direct_order: clientSettings.whatsappDirectOrder,
    enable_purchase_notifications: clientSettings.enablePurchaseNotifications,
    enable_floating_cart: clientSettings.enableFloatingCart,
    show_discount_badges: clientSettings.showDiscountBadges,
    show_breadcrumbs: clientSettings.showBreadcrumbs,
  };
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from Supabase on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Subscribe to real-time changes from Supabase
  useEffect(() => {
    const unsubscribe = AdminSettingsService.subscribeToChanges((supabaseSettings) => {
      console.log('🔄 Settings synced from Supabase (cross-browser sync)');
      const clientSettings = convertSupabaseToClient(supabaseSettings);
      setSettings(clientSettings);
    });

    return unsubscribe;
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabaseSettings = await AdminSettingsService.getSettings();
      const clientSettings = convertSupabaseToClient(supabaseSettings);
      setSettings(clientSettings);
      console.log('✅ Settings loaded from Supabase');
    } catch (error) {
      console.error('Failed to load settings from Supabase:', error);
      setError('Failed to load settings from database. Using default settings.');
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (changes: Partial<SiteSettings>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newSettings = { ...settings, ...changes };
      const supabaseSettings = convertClientToSupabase(newSettings);

      const success = await AdminSettingsService.updateSettings(supabaseSettings);

      if (success) {
        setSettings(newSettings);
        console.log('✅ Settings updated in Supabase and synced across browsers');
      } else {
        throw new Error('Failed to update settings in database');
      }
    } catch (error) {
      console.error('Failed to update settings in Supabase:', error);
      setError('Failed to save settings to database. Please try again.');
      // Don't update local state if database update fails
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    error,
    loadSettings
  }), [settings, updateSettings, resetSettings, isLoading, error, loadSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

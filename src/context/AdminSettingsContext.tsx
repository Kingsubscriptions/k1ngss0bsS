import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface AdminSettings {
  id: number;
  whatsapp_number: string;
  whatsapp_direct_order: boolean;
  enable_purchase_notifications: boolean;
  enable_floating_cart: boolean;
  show_discount_badges: boolean;
  show_breadcrumbs: boolean;
  popup_settings: any;
  // New fields that may not exist yet
  meta_description?: string;
  support_email?: string;
  enable_popups?: boolean;
  maintenance_mode?: boolean;
  currency_display?: string;
  updated_at: string;
}

interface AdminSettingsContextValue {
  settings: AdminSettings | null;
  updateSettings: (settings: Partial<Omit<AdminSettings, 'id' | 'updated_at'>>) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const AdminSettingsContext = createContext<AdminSettingsContextValue | undefined>(undefined);

export const AdminSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load admin settings from Supabase
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          id: 1,
          meta_description: 'Get premium AI & SEO tools at Huge Discounts! ChatGPT Plus, Canva Pro, Adobe Creative Suite & 15+ tools. Instant access, 24/7 support.',
          whatsapp_number: '+923276847960',
          support_email: 'itxahmadjan@gmail.com',
          enable_purchase_notifications: true,
          enable_floating_cart: true,
          enable_popups: true,
          show_discount_badges: true,
          whatsapp_direct_order: false,
          maintenance_mode: false,
          currency_display: 'USD',
        };

        const { data: newData, error: insertError } = await supabase
          .from('admin_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      }
    } catch (err) {
      console.error('Failed to load admin settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // Set default settings on error
      setSettings({
        id: 1,
        whatsapp_number: '+923276847960',
        whatsapp_direct_order: false,
        enable_purchase_notifications: true,
        enable_floating_cart: true,
        show_discount_badges: true,
        show_breadcrumbs: true,
        popup_settings: {},
        meta_description: 'Get premium AI & SEO tools at Huge Discounts! ChatGPT Plus, Canva Pro, Adobe Creative Suite & 15+ tools. Instant access, 24/7 support.',
        support_email: 'itxahmadjan@gmail.com',
        enable_popups: true,
        maintenance_mode: false,
        currency_display: 'USD',
        updated_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update admin settings
  const updateSettings = useCallback(async (newSettings: Partial<Omit<AdminSettings, 'id' | 'updated_at'>>): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('admin_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(data);
      console.log('✅ Admin settings updated successfully');
      return true;
    } catch (err) {
      console.error('Failed to update admin settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    }
  }, []);

  // Load settings on mount and subscribe to changes
  useEffect(() => {
    loadSettings();

    // Subscribe to real-time changes
    const unsubscribe = supabase
      .channel('admin_settings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'admin_settings',
        filter: 'id=eq.1',
      }, (payload) => {
        console.log('🔄 Admin settings synced from Supabase');
        if (payload.new) {
          setSettings(payload.new as AdminSettings);
        }
      })
      .subscribe();

    return () => {
      unsubscribe.unsubscribe();
    };
  }, [loadSettings]);

  const value: AdminSettingsContextValue = {
    settings,
    updateSettings,
    isLoading,
    error,
  };

  return <AdminSettingsContext.Provider value={value}>{children}</AdminSettingsContext.Provider>;
};

export const useAdminSettings = (): AdminSettingsContextValue => {
  const context = useContext(AdminSettingsContext);
  if (!context) {
    throw new Error('useAdminSettings must be used within a AdminSettingsProvider');
  }
  return context;
};

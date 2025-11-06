import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface SiteSettings {
  id: number;
  site_name: string;
  tagline: string;
  logo_url?: string;
  updated_at: string;
}

interface SiteSettingsContextValue {
  settings: SiteSettings | null;
  updateSettings: (settings: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load site settings from Supabase
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('site_settings')
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
          site_name: 'King Subscription',
          tagline: 'Premium AI & SEO Tools at Huge Discounts',
          logo_url: null,
        };

        const { data: newData, error: insertError } = await supabase
          .from('site_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      }
    } catch (err) {
      console.error('Failed to load site settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // Set default settings on error
      setSettings({
        id: 1,
        site_name: 'King Subscription',
        tagline: 'Premium AI & SEO Tools at Huge Discounts',
        logo_url: null,
        updated_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update site settings
  const updateSettings = useCallback(async (newSettings: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('site_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(data);
      console.log('✅ Site settings updated successfully');
      return true;
    } catch (err) {
      console.error('Failed to update site settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    }
  }, []);

  // Load settings on mount and subscribe to changes
  useEffect(() => {
    loadSettings();

    // Subscribe to real-time changes
    const unsubscribe = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: 'id=eq.1',
      }, (payload) => {
        console.log('🔄 Site settings synced from Supabase');
        if (payload.new) {
          setSettings(payload.new as SiteSettings);
        }
      })
      .subscribe();

    return () => {
      unsubscribe.unsubscribe();
    };
  }, [loadSettings]);

  const value: SiteSettingsContextValue = {
    settings,
    updateSettings,
    isLoading,
    error,
  };

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
};

export const useSiteSettings = (): SiteSettingsContextValue => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

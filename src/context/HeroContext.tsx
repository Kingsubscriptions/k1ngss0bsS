import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface HeroSettings {
  id: number;
  title: string;
  subtitle: string;
  updated_at: string;
}

interface HeroContextValue {
  settings: HeroSettings | null;
  updateSettings: (settings: Partial<Omit<HeroSettings, 'id' | 'updated_at'>>) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const HeroContext = createContext<HeroContextValue | undefined>(undefined);

export const HeroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load hero settings from Supabase
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('hero_settings')
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
          title: 'STOP BLEEDING MONEY On Overpriced Software!',
          subtitle: '10,000+ Smart Entrepreneurs have already ditched expensive subscriptions...',
        };

        const { data: newData, error: insertError } = await supabase
          .from('hero_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      }
    } catch (err) {
      console.error('Failed to load hero settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      // Set default settings on error
      setSettings({
        id: 1,
        title: 'STOP BLEEDING MONEY On Overpriced Software!',
        subtitle: '10,000+ Smart Entrepreneurs have already ditched expensive subscriptions...',
        updated_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update hero settings
  const updateSettings = useCallback(async (newSettings: Partial<Omit<HeroSettings, 'id' | 'updated_at'>>): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('hero_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(data);
      console.log('✅ Hero settings updated successfully');
      return true;
    } catch (err) {
      console.error('Failed to update hero settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    }
  }, []);

  // Load settings on mount and subscribe to changes
  useEffect(() => {
    loadSettings();

    // Subscribe to real-time changes
    const unsubscribe = supabase
      .channel('hero_settings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'hero_settings',
        filter: 'id=eq.1',
      }, (payload) => {
        console.log('🔄 Hero settings synced from Supabase');
        if (payload.new) {
          setSettings(payload.new as HeroSettings);
        }
      })
      .subscribe();

    return () => {
      unsubscribe.unsubscribe();
    };
  }, [loadSettings]);

  const value: HeroContextValue = {
    settings,
    updateSettings,
    isLoading,
    error,
  };

  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>;
};

export const useHero = (): HeroContextValue => {
  const context = useContext(HeroContext);
  if (!context) {
    throw new Error('useHero must be used within a HeroProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface StaticPage {
  id: number;
  page_key: string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface StaticPagesContextValue {
  pages: StaticPage[];
  updatePage: (pageKey: string, updates: Partial<Omit<StaticPage, 'id' | 'page_key' | 'created_at' | 'updated_at'>>) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const StaticPagesContext = createContext<StaticPagesContextValue | undefined>(undefined);

export const StaticPagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load static pages from Supabase
  const loadPages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('static_pages')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setPages(data || []);
    } catch (err) {
      console.error('Failed to load static pages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pages');
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a static page
  const updatePage = useCallback(async (
    pageKey: string,
    updates: Partial<Omit<StaticPage, 'id' | 'page_key' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('static_pages')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('page_key', pageKey)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setPages(prevPages =>
        prevPages.map(page =>
          page.page_key === pageKey ? { ...page, ...data } : page
        )
      );

      console.log('✅ Static page updated successfully');
      return true;
    } catch (err) {
      console.error('Failed to update static page:', err);
      setError(err instanceof Error ? err.message : 'Failed to update page');
      return false;
    }
  }, []);

  // Load pages on mount and subscribe to changes
  useEffect(() => {
    loadPages();

    // Subscribe to real-time changes
    const unsubscribe = supabase
      .channel('static_pages_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'static_pages',
      }, (payload) => {
        console.log('🔄 Static pages synced from Supabase');
        loadPages(); // Reload all pages on any change
      })
      .subscribe();

    return () => {
      unsubscribe.unsubscribe();
    };
  }, [loadPages]);

  const value: StaticPagesContextValue = {
    pages,
    updatePage,
    isLoading,
    error,
  };

  return <StaticPagesContext.Provider value={value}>{children}</StaticPagesContext.Provider>;
};

export const useStaticPages = (): StaticPagesContextValue => {
  const context = useContext(StaticPagesContext);
  if (!context) {
    throw new Error('useStaticPages must be used within a StaticPagesProvider');
  }
  return context;
};

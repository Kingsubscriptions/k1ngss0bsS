import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SiteContent {
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string;
  };
  social_links: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  footer: {
    text: string;
  };
}

interface SiteContentContextType {
  content: SiteContent;
  loading: boolean;
  error: string | null;
  updateContent: (newContent: SiteContent) => Promise<boolean>;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>({
    seo: { meta_title: '', meta_description: '', keywords: '' },
    social_links: { facebook: '', twitter: '', instagram: '' },
    footer: { text: '' },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('site_content').select('*').single();
      if (error) throw error;
      setContent(data || content);
    } catch (err) {
      setError('Failed to fetch site content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const updateContent = async (newContent: SiteContent): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('site_content').update(newContent).eq('id', 1).select();
      if (error) throw error;
      setContent(data[0]);
      return true;
    } catch (err) {
      setError('Failed to update site content.');
      return false;
    }
  };

  return (
    <SiteContentContext.Provider value={{ content, loading, error, updateContent }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = (): SiteContentContextType => {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
};

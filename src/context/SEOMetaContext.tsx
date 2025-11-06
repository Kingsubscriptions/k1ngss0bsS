import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface SEOMeta {
  id: string;
  page_type: 'home' | 'product' | 'category' | 'blog' | 'custom_page';
  page_identifier: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card: 'summary' | 'summary_large_image' | 'app' | 'player';
  structured_data?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SEOMetaContextType {
  seoMetas: SEOMeta[];
  loading: boolean;
  error: string | null;
  fetchSEOMetas: () => Promise<void>;
  createSEOMeta: (meta: Omit<SEOMeta, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSEOMeta: (id: string, updates: Partial<SEOMeta>) => Promise<void>;
  deleteSEOMeta: (id: string) => Promise<void>;
  toggleSEOMetaStatus: (id: string) => Promise<void>;
  getSEOMetaByPage: (pageType: string, pageIdentifier: string) => SEOMeta | undefined;
  generateSEOMeta: (pageType: string, pageIdentifier: string, data: Record<string, any>) => Omit<SEOMeta, 'id' | 'created_at' | 'updated_at'>;
}

const SEOMetaContext = createContext<SEOMetaContextType | undefined>(undefined);

export const useSEOMeta = () => {
  const context = useContext(SEOMetaContext);
  if (!context) {
    throw new Error('useSEOMeta must be used within a SEOMetaProvider');
  }
  return context;
};

interface SEOMetaProviderProps {
  children: ReactNode;
}

export const SEOMetaProvider: React.FC<SEOMetaProviderProps> = ({ children }) => {
  const [seoMetas, setSEOMetas] = useState<SEOMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSEOMetas = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('seo_meta')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSEOMetas(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch SEO meta data');
    } finally {
      setLoading(false);
    }
  };

  const createSEOMeta = async (meta: Omit<SEOMeta, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('seo_meta')
        .insert([meta])
        .select()
        .single();

      if (insertError) throw insertError;
      setSEOMetas(prev => [data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SEO meta data');
      throw err;
    }
  };

  const updateSEOMeta = async (id: string, updates: Partial<SEOMeta>) => {
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('seo_meta')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setSEOMetas(prev => prev.map(meta => meta.id === id ? data : meta));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update SEO meta data');
      throw err;
    }
  };

  const deleteSEOMeta = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('seo_meta')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSEOMetas(prev => prev.filter(meta => meta.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete SEO meta data');
      throw err;
    }
  };

  const toggleSEOMetaStatus = async (id: string) => {
    const meta = seoMetas.find(m => m.id === id);
    if (!meta) return;

    await updateSEOMeta(id, { is_active: !meta.is_active });
  };

  const getSEOMetaByPage = (pageType: string, pageIdentifier: string) => {
    return seoMetas.find(meta =>
      meta.page_type === pageType &&
      meta.page_identifier === pageIdentifier &&
      meta.is_active
    );
  };

  const generateSEOMeta = (pageType: string, pageIdentifier: string, data: Record<string, any>) => {
    const baseMeta: Omit<SEOMeta, 'id' | 'created_at' | 'updated_at'> = {
      page_type: pageType as any,
      page_identifier: pageIdentifier,
      twitter_card: 'summary_large_image',
      is_active: true,
    };

    switch (pageType) {
      case 'home':
        return {
          ...baseMeta,
          meta_title: data.siteName ? `${data.siteName} - ${data.tagline}` : 'Premium Digital Tools & Subscriptions',
          meta_description: data.description || 'Get access to premium AI tools, design software, and digital subscriptions at affordable prices.',
          meta_keywords: ['premium tools', 'AI subscriptions', 'design software', 'digital tools'],
          og_title: data.siteName || 'Premium Digital Tools',
          og_description: data.description || 'Access premium software subscriptions at discounted rates.',
        };

      case 'product':
        return {
          ...baseMeta,
          meta_title: data.name ? `${data.name} - Premium Subscription` : 'Premium Digital Tool',
          meta_description: data.description || `Get access to ${data.name} premium features at discounted rates.`,
          meta_keywords: ['premium subscription', data.name, 'digital tools'],
          og_title: data.name || 'Premium Digital Tool',
          og_description: data.description || `Access premium features at affordable prices.`,
          og_image: data.image,
        };

      case 'category':
        return {
          ...baseMeta,
          meta_title: data.name ? `${data.name} Tools & Subscriptions` : 'Digital Tools Category',
          meta_description: data.description || `Browse our collection of ${data.name} tools and premium subscriptions.`,
          meta_keywords: [data.name, 'tools', 'subscriptions', 'premium'],
          og_title: data.name ? `${data.name} Tools` : 'Digital Tools Category',
          og_description: data.description || `Discover premium ${data.name} tools and subscriptions.`,
        };

      case 'blog':
        return {
          ...baseMeta,
          meta_title: data.title || 'Blog Post',
          meta_description: data.excerpt || data.description,
          meta_keywords: data.tags || ['blog', 'digital tools', 'premium subscriptions'],
          og_title: data.title,
          og_description: data.excerpt,
          og_image: data.cover_image,
          canonical_url: `/blog/${data.slug}`,
        };

      default:
        return baseMeta;
    }
  };

  useEffect(() => {
    fetchSEOMetas();
  }, []);

  const value: SEOMetaContextType = {
    seoMetas,
    loading,
    error,
    fetchSEOMetas,
    createSEOMeta,
    updateSEOMeta,
    deleteSEOMeta,
    toggleSEOMetaStatus,
    getSEOMetaByPage,
    generateSEOMeta,
  };

  return (
    <SEOMetaContext.Provider value={value}>
      {children}
    </SEOMetaContext.Provider>
  );
};

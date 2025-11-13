import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  username?: string;
  display_name?: string;
  icon_class?: string;
  is_active: boolean;
  sort_order: number;
  follower_count?: number;
  created_at: string;
  updated_at: string;
}

interface SocialMediaLinksContextType {
  socialLinks: SocialMediaLink[];
  loading: boolean;
  error: string | null;
  fetchSocialLinks: () => Promise<void>;
  createSocialLink: (link: Omit<SocialMediaLink, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSocialLink: (id: string, updates: Partial<SocialMediaLink>) => Promise<void>;
  deleteSocialLink: (id: string) => Promise<void>;
  toggleSocialLinkStatus: (id: string) => Promise<void>;
  reorderSocialLinks: (links: SocialMediaLink[]) => Promise<void>;
  getActiveSocialLinks: () => SocialMediaLink[];
}

const SocialMediaLinksContext = createContext<SocialMediaLinksContextType | undefined>(undefined);

export const useSocialMediaLinks = () => {
  const context = useContext(SocialMediaLinksContext);
  if (!context) {
    throw new Error('useSocialMediaLinks must be used within a SocialMediaLinksProvider');
  }
  return context;
};

interface SocialMediaLinksProviderProps {
  children: ReactNode;
}

export const SocialMediaLinksProvider: React.FC<SocialMediaLinksProviderProps> = ({ children }) => {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSocialLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('social_media_links')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setSocialLinks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch social media links');
    } finally {
      setLoading(false);
    }
  };

  const createSocialLink = async (link: Omit<SocialMediaLink, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('social_media_links')
        .insert([link])
        .select()
        .single();

      if (insertError) throw insertError;
      setSocialLinks(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create social media link');
      throw err;
    }
  };

  const updateSocialLink = async (id: string, updates: Partial<SocialMediaLink>) => {
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('social_media_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setSocialLinks(prev => prev.map(link => link.id === id ? data : link));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update social media link');
      throw err;
    }
  };

  const deleteSocialLink = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('social_media_links')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSocialLinks(prev => prev.filter(link => link.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete social media link');
      throw err;
    }
  };

  const toggleSocialLinkStatus = async (id: string) => {
    const link = socialLinks.find(l => l.id === id);
    if (!link) return;

    await updateSocialLink(id, { is_active: !link.is_active });
  };

  const reorderSocialLinks = async (links: SocialMediaLink[]) => {
    setError(null);
    try {
      // Update sort_order for all links
      const updates = links.map((link, index) => ({
        id: link.id,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('social_media_links')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      setSocialLinks(links);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder social media links');
      throw err;
    }
  };

  const getActiveSocialLinks = () => {
    return socialLinks.filter(link => link.is_active);
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const value: SocialMediaLinksContextType = {
    socialLinks,
    loading,
    error,
    fetchSocialLinks,
    createSocialLink,
    updateSocialLink,
    deleteSocialLink,
    toggleSocialLinkStatus,
    reorderSocialLinks,
    getActiveSocialLinks,
  };

  return (
    <SocialMediaLinksContext.Provider value={value}>
      {children}
    </SocialMediaLinksContext.Provider>
  );
};

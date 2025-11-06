import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface FooterContent {
  id: string;
  section_name: string;
  title?: string;
  content?: string;
  links?: Record<string, any>[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface FooterContentContextType {
  footerContents: FooterContent[];
  loading: boolean;
  error: string | null;
  fetchFooterContents: () => Promise<void>;
  createFooterContent: (content: Omit<FooterContent, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFooterContent: (id: string, updates: Partial<FooterContent>) => Promise<void>;
  deleteFooterContent: (id: string) => Promise<void>;
  toggleFooterContentStatus: (id: string) => Promise<void>;
  reorderFooterContents: (contents: FooterContent[]) => Promise<void>;
  getActiveFooterContents: () => FooterContent[];
  getFooterContentBySection: (sectionName: string) => FooterContent | undefined;
}

const FooterContentContext = createContext<FooterContentContextType | undefined>(undefined);

export const useFooterContent = () => {
  const context = useContext(FooterContentContext);
  if (!context) {
    throw new Error('useFooterContent must be used within a FooterContentProvider');
  }
  return context;
};

interface FooterContentProviderProps {
  children: ReactNode;
}

export const FooterContentProvider: React.FC<FooterContentProviderProps> = ({ children }) => {
  const [footerContents, setFooterContents] = useState<FooterContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFooterContents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('footer_content')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setFooterContents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch footer content');
    } finally {
      setLoading(false);
    }
  };

  const createFooterContent = async (content: Omit<FooterContent, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('footer_content')
        .insert([content])
        .select()
        .single();

      if (insertError) throw insertError;
      setFooterContents(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create footer content');
      throw err;
    }
  };

  const updateFooterContent = async (id: string, updates: Partial<FooterContent>) => {
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('footer_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setFooterContents(prev => prev.map(content => content.id === id ? data : content));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update footer content');
      throw err;
    }
  };

  const deleteFooterContent = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('footer_content')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setFooterContents(prev => prev.filter(content => content.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete footer content');
      throw err;
    }
  };

  const toggleFooterContentStatus = async (id: string) => {
    const content = footerContents.find(c => c.id === id);
    if (!content) return;

    await updateFooterContent(id, { is_active: !content.is_active });
  };

  const reorderFooterContents = async (contents: FooterContent[]) => {
    setError(null);
    try {
      // Update sort_order for all contents
      const updates = contents.map((content, index) => ({
        id: content.id,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('footer_content')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      setFooterContents(contents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder footer contents');
      throw err;
    }
  };

  const getActiveFooterContents = () => {
    return footerContents.filter(content => content.is_active);
  };

  const getFooterContentBySection = (sectionName: string) => {
    return footerContents.find(content =>
      content.section_name === sectionName && content.is_active
    );
  };

  useEffect(() => {
    fetchFooterContents();
  }, []);

  const value: FooterContentContextType = {
    footerContents,
    loading,
    error,
    fetchFooterContents,
    createFooterContent,
    updateFooterContent,
    deleteFooterContent,
    toggleFooterContentStatus,
    reorderFooterContents,
    getActiveFooterContents,
    getFooterContentBySection,
  };

  return (
    <FooterContentContext.Provider value={value}>
      {children}
    </FooterContentContext.Provider>
  );
};

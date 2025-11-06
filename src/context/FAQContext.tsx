import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FAQContextType {
  faqs: FAQ[];
  loading: boolean;
  createFAQ: (faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateFAQ: (id: number, faq: Partial<FAQ>) => Promise<{ success: boolean; error?: string }>;
  deleteFAQ: (id: number) => Promise<{ success: boolean; error?: string }>;
  reorderFAQs: (faqs: FAQ[]) => Promise<{ success: boolean; error?: string }>;
  refreshFAQs: () => Promise<void>;
}

const FAQContext = createContext<FAQContextType | undefined>(undefined);

export const useFAQ = () => {
  const context = useContext(FAQContext);
  if (context === undefined) {
    throw new Error('useFAQ must be used within a FAQProvider');
  }
  return context;
};

interface FAQProviderProps {
  children: ReactNode;
}

export const FAQProvider: React.FC<FAQProviderProps> = ({ children }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFAQ = async (faqData: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('faq')
        .insert([faqData])
        .select()
        .single();

      if (error) throw error;
      await loadFAQs();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateFAQ = async (id: number, faqData: Partial<FAQ>) => {
    try {
      const { error } = await supabase
        .from('faq')
        .update(faqData)
        .eq('id', id);

      if (error) throw error;
      await loadFAQs();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteFAQ = async (id: number) => {
    try {
      const { error } = await supabase
        .from('faq')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadFAQs();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const reorderFAQs = async (reorderedFaqs: FAQ[]) => {
    try {
      const updates = reorderedFaqs.map((faq, index) => ({
        id: faq.id,
        sort_order: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('faq')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      await loadFAQs();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const refreshFAQs = async () => {
    await loadFAQs();
  };

  const value: FAQContextType = {
    faqs,
    loading,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    reorderFAQs,
    refreshFAQs,
  };

  return (
    <FAQContext.Provider value={value}>
      {children}
    </FAQContext.Provider>
  );
};

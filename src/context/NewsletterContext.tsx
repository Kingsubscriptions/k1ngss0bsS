import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface NewsletterSubscription {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  preferences: Record<string, any>;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
  source: string;
}

interface NewsletterContextType {
  subscriptions: NewsletterSubscription[];
  loading: boolean;
  subscribe: (email: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; error?: string }>;
  unsubscribe: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateSubscription: (id: string, data: Partial<NewsletterSubscription>) => Promise<{ success: boolean; error?: string }>;
  deleteSubscription: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshSubscriptions: () => Promise<void>;
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

export const useNewsletter = () => {
  const context = useContext(NewsletterContext);
  if (context === undefined) {
    throw new Error('useNewsletter must be used within a NewsletterProvider');
  }
  return context;
};

interface NewsletterProviderProps {
  children: ReactNode;
}

export const NewsletterProvider: React.FC<NewsletterProviderProps> = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading newsletter subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (email: string, firstName?: string, lastName?: string) => {
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('newsletter_subscriptions')
        .select('id, is_active')
        .eq('email', email)
        .single();

      if (existing) {
        if (existing.is_active) {
          return { success: false, error: 'Email already subscribed' };
        } else {
          // Reactivate subscription
          const { error } = await supabase
            .from('newsletter_subscriptions')
            .update({
              is_active: true,
              unsubscribed_at: null,
              first_name: firstName,
              last_name: lastName
            })
            .eq('id', existing.id);

          if (error) throw error;
          await loadSubscriptions();
          return { success: true };
        }
      }

      // Create new subscription
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{
          email,
          first_name: firstName,
          last_name: lastName,
          preferences: {},
          is_active: true,
          source: 'website'
        }]);

      if (error) throw error;
      await loadSubscriptions();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const unsubscribe = async (email: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email);

      if (error) throw error;
      await loadSubscriptions();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateSubscription = async (id: string, data: Partial<NewsletterSubscription>) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await loadSubscriptions();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadSubscriptions();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const refreshSubscriptions = async () => {
    await loadSubscriptions();
  };

  const value: NewsletterContextType = {
    subscriptions,
    loading,
    subscribe,
    unsubscribe,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions,
  };

  return (
    <NewsletterContext.Provider value={value}>
      {children}
    </NewsletterContext.Provider>
  );
};

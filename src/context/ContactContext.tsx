import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

interface ContactContextType {
  submissions: ContactSubmission[];
  loading: boolean;
  submitContactForm: (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateSubmission: (id: string, data: Partial<ContactSubmission>) => Promise<{ success: boolean; error?: string }>;
  deleteSubmission: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshSubmissions: () => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const useContact = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};

interface ContactProviderProps {
  children: ReactNode;
}

export const ContactProvider: React.FC<ContactProviderProps> = ({ children }) => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading contact submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitContactForm = async (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          ...data,
          status: 'pending',
          priority: 'medium'
        }]);

      if (error) throw error;
      await loadSubmissions();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateSubmission = async (id: string, data: Partial<ContactSubmission>) => {
    try {
      const updateData = { ...data };
      if (data.response && !data.responded_at) {
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await loadSubmissions();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadSubmissions();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const refreshSubmissions = async () => {
    await loadSubmissions();
  };

  const value: ContactContextType = {
    submissions,
    loading,
    submitContactForm,
    updateSubmission,
    deleteSubmission,
    refreshSubmissions,
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};

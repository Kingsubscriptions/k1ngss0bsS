import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'cash_on_delivery';
  provider?: string;
  is_active: boolean;
  configuration: Record<string, any>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface PaymentMethodsContextType {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  fetchPaymentMethods: () => Promise<void>;
  createPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  togglePaymentMethodStatus: (id: string) => Promise<void>;
  reorderPaymentMethods: (methods: PaymentMethod[]) => Promise<void>;
}

const PaymentMethodsContext = createContext<PaymentMethodsContextType | undefined>(undefined);

export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodsContext);
  if (!context) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodsProvider');
  }
  return context;
};

interface PaymentMethodsProviderProps {
  children: ReactNode;
}

export const PaymentMethodsProvider: React.FC<PaymentMethodsProviderProps> = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('payment_methods')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setPaymentMethods(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentMethod = async (method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('payment_methods')
        .insert([method])
        .select()
        .single();

      if (insertError) throw insertError;
      setPaymentMethods(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment method');
      throw err;
    }
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setPaymentMethods(prev => prev.map(method => method.id === id ? data : method));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment method');
      throw err;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment method');
      throw err;
    }
  };

  const togglePaymentMethodStatus = async (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (!method) return;

    await updatePaymentMethod(id, { is_active: !method.is_active });
  };

  const reorderPaymentMethods = async (methods: PaymentMethod[]) => {
    setError(null);
    try {
      // Update sort_order for all methods
      const updates = methods.map((method, index) => ({
        id: method.id,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('payment_methods')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      setPaymentMethods(methods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder payment methods');
      throw err;
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const value: PaymentMethodsContextType = {
    paymentMethods,
    loading,
    error,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodStatus,
    reorderPaymentMethods,
  };

  return (
    <PaymentMethodsContext.Provider value={value}>
      {children}
    </PaymentMethodsContext.Provider>
  );
};

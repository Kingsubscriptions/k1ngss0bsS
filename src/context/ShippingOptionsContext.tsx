import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface ShippingOption {
  id: string;
  name: string;
  description?: string;
  carrier?: string;
  delivery_time: string;
  price: number;
  free_shipping_threshold?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ShippingOptionsContextType {
  shippingOptions: ShippingOption[];
  loading: boolean;
  error: string | null;
  fetchShippingOptions: () => Promise<void>;
  createShippingOption: (option: Omit<ShippingOption, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateShippingOption: (id: string, updates: Partial<ShippingOption>) => Promise<void>;
  deleteShippingOption: (id: string) => Promise<void>;
  toggleShippingOptionStatus: (id: string) => Promise<void>;
  reorderShippingOptions: (options: ShippingOption[]) => Promise<void>;
  getShippingCost: (subtotal: number) => ShippingOption[];
}

const ShippingOptionsContext = createContext<ShippingOptionsContextType | undefined>(undefined);

export const useShippingOptions = () => {
  const context = useContext(ShippingOptionsContext);
  if (!context) {
    throw new Error('useShippingOptions must be used within a ShippingOptionsProvider');
  }
  return context;
};

interface ShippingOptionsProviderProps {
  children: ReactNode;
}

export const ShippingOptionsProvider: React.FC<ShippingOptionsProviderProps> = ({ children }) => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShippingOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('shipping_options')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setShippingOptions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shipping options');
    } finally {
      setLoading(false);
    }
  };

  const createShippingOption = async (option: Omit<ShippingOption, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('shipping_options')
        .insert([option])
        .select()
        .single();

      if (insertError) throw insertError;
      setShippingOptions(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shipping option');
      throw err;
    }
  };

  const updateShippingOption = async (id: string, updates: Partial<ShippingOption>) => {
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('shipping_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setShippingOptions(prev => prev.map(option => option.id === id ? data : option));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shipping option');
      throw err;
    }
  };

  const deleteShippingOption = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('shipping_options')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setShippingOptions(prev => prev.filter(option => option.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shipping option');
      throw err;
    }
  };

  const toggleShippingOptionStatus = async (id: string) => {
    const option = shippingOptions.find(o => o.id === id);
    if (!option) return;

    await updateShippingOption(id, { is_active: !option.is_active });
  };

  const reorderShippingOptions = async (options: ShippingOption[]) => {
    setError(null);
    try {
      // Update sort_order for all options
      const updates = options.map((option, index) => ({
        id: option.id,
        sort_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('shipping_options')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      setShippingOptions(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder shipping options');
      throw err;
    }
  };

  const getShippingCost = (subtotal: number) => {
    return shippingOptions
      .filter(option => option.is_active)
      .map(option => ({
        ...option,
        effectivePrice: option.free_shipping_threshold && subtotal >= option.free_shipping_threshold ? 0 : option.price
      }));
  };

  useEffect(() => {
    fetchShippingOptions();
  }, []);

  const value: ShippingOptionsContextType = {
    shippingOptions,
    loading,
    error,
    fetchShippingOptions,
    createShippingOption,
    updateShippingOption,
    deleteShippingOption,
    toggleShippingOptionStatus,
    reorderShippingOptions,
    getShippingCost,
  };

  return (
    <ShippingOptionsContext.Provider value={value}>
      {children}
    </ShippingOptionsContext.Provider>
  );
};

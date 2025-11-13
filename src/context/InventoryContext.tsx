import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface InventoryItem {
  id: string;
  product_id: string;
  variant_id?: string;
  sku?: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_sold: number;
  low_stock_threshold: number;
  location: string;
  cost_price?: number;
  supplier_info?: Record<string, any>;
  last_restocked?: string;
  created_at: string;
  updated_at: string;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
  fetchInventory: () => Promise<void>;
  createInventoryItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  updateStock: (id: string, quantityChange: number, operation: 'add' | 'subtract' | 'set') => Promise<void>;
  getLowStockItems: () => InventoryItem[];
  getTotalValue: () => number;
  getInventoryByProduct: (productId: string) => InventoryItem[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInventory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('inventory')
        .insert([item])
        .select()
        .single();

      if (insertError) throw insertError;
      setInventory(prev => [data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create inventory item');
      throw err;
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setInventory(prev => prev.map(item => item.id === id ? data : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory item');
      throw err;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setInventory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inventory item');
      throw err;
    }
  };

  const updateStock = async (id: string, quantityChange: number, operation: 'add' | 'subtract' | 'set') => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    let newQuantity: number;
    switch (operation) {
      case 'add':
        newQuantity = item.quantity_available + quantityChange;
        break;
      case 'subtract':
        newQuantity = Math.max(0, item.quantity_available - quantityChange);
        break;
      case 'set':
        newQuantity = Math.max(0, quantityChange);
        break;
      default:
        return;
    }

    await updateInventoryItem(id, {
      quantity_available: newQuantity,
      last_restocked: operation === 'add' ? new Date().toISOString() : item.last_restocked
    });
  };

  const getLowStockItems = () => {
    return inventory.filter(item =>
      item.quantity_available <= item.low_stock_threshold && item.quantity_available > 0
    );
  };

  const getTotalValue = () => {
    return inventory.reduce((total, item) => {
      const value = (item.cost_price || 0) * item.quantity_available;
      return total + value;
    }, 0);
  };

  const getInventoryByProduct = (productId: string) => {
    return inventory.filter(item => item.product_id === productId);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const value: InventoryContextType = {
    inventory,
    loading,
    error,
    fetchInventory,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock,
    getLowStockItems,
    getTotalValue,
    getInventoryByProduct,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

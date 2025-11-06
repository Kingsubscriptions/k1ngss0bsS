import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

interface ProductCategoriesContextType {
  categories: ProductCategory[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  toggleCategoryStatus: (id: string) => Promise<void>;
}

const ProductCategoriesContext = createContext<ProductCategoriesContextType | undefined>(undefined);

export const useProductCategories = () => {
  const context = useContext(ProductCategoriesContext);
  if (!context) {
    throw new Error('useProductCategories must be used within a ProductCategoriesProvider');
  }
  return context;
};

interface ProductCategoriesProviderProps {
  children: ReactNode;
}

export const ProductCategoriesProvider: React.FC<ProductCategoriesProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('product_categories')
        .insert([category])
        .select()
        .single();

      if (insertError) throw insertError;
      setCategories(prev => [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<ProductCategory>) => {
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('product_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  };

  const toggleCategoryStatus = async (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    await updateCategory(id, { is_active: !category.is_active });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const value: ProductCategoriesContextType = {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  };

  return (
    <ProductCategoriesContext.Provider value={value}>
      {children}
    </ProductCategoriesContext.Provider>
  );
};

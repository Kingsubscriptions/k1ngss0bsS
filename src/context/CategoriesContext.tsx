import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<boolean>;
  updateCategory: (id: number, category: Partial<Omit<Category, 'id'>>) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (category: Omit<Category, 'id'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('categories').insert([category]).select();
      if (error) throw error;
      setCategories((prev) => [...prev, data[0]]);
      return true;
    } catch (err) {
      setError('Failed to add category.');
      return false;
    }
  };

  const updateCategory = async (id: number, category: Partial<Omit<Category, 'id'>>): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('categories').update(category).eq('id', id).select();
      if (error) throw error;
      setCategories((prev) => prev.map((c) => (c.id === id ? data[0] : c)));
      return true;
    } catch (err) {
      setError('Failed to update category.');
      return false;
    }
  };

  const deleteCategory = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      setError('Failed to delete category.');
      return false;
    }
  };

  return (
    <CategoriesContext.Provider value={{ categories, loading, error, fetchCategories, addCategory, updateCategory, deleteCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

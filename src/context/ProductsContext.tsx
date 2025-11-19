import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { products as defaultProducts, Product } from '@/data/products';
import { ProductsService, ProductData } from '@/lib/supabase';
import { apiClient } from '@/lib/api';

type ProductsContextValue = {
  products: Product[];
  setProducts: (next: Product[]) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  resetProducts: () => void;
  isLoading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProductsState] = useState<Product[]>(defaultProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products from Supabase on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Subscribe to real-time changes from Supabase
  useEffect(() => {
    const unsubscribe = ProductsService.subscribeToChanges((supabaseProducts) => {
      console.log('🔄 Products synced from Supabase (cross-browser sync)');
      const clientProducts = supabaseProducts.map(ProductsService.convertToClientFormat);
      setProductsState(clientProducts);
    });

    return unsubscribe;
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabaseProducts = await ProductsService.getProducts();
      if (supabaseProducts && supabaseProducts.length > 0) {
        const clientProducts = supabaseProducts.map(ProductsService.convertToClientFormat);
        setProductsState(clientProducts);
        console.log('✅ Products loaded from Supabase');
      } else {
        // If no products in database, use default products and sync them
        console.log('📦 No products in database, using defaults');
        setProductsState(defaultProducts);

        // Sync default products to database
        const dbProducts = defaultProducts.map(ProductsService.convertToDatabaseFormat);
        await ProductsService.updateProducts(dbProducts);
      }
    } catch (error) {
      console.error('Failed to load products from Supabase:', error);
      setError('Failed to load products from database. Using default products.');
      setProductsState(defaultProducts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setProducts = useCallback(async (next: Product[]) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.updateProducts(next);
      setProductsState(next);
      console.log('✅ Products updated via API');
    } catch (error) {
      console.error('Failed to update products via API:', error);
      setError('Failed to save products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (product: Product) => {
    try {
      const { product: newProduct } = await apiClient.addProduct(product);

      // Convert server response (which might be DB format) to client format if needed
      // But apiClient returns Product type which is client format
      setProductsState((prev) => [newProduct, ...prev]);
      console.log('✅ Product added via API');
    } catch (error) {
      console.error('Failed to add product:', error);
      setError('Failed to add product.');
    }
  }, []);

  const updateProduct = useCallback(async (product: Product) => {
    try {
      const { product: updatedProduct } = await apiClient.updateProduct(product);

      setProductsState((prev) => {
        const exists = prev.findIndex((item) => item.id === product.id);
        if (exists === -1) {
          return [...prev, updatedProduct];
        }
        const next = [...prev];
        next[exists] = updatedProduct;
        return next;
      });
      console.log('✅ Product updated via API');
    } catch (error) {
      console.error('Failed to update product:', error);
      setError('Failed to update product.');
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await apiClient.deleteProduct(productId);

      setProductsState((prev) => prev.filter((item) => item.id !== productId));
      console.log('✅ Product deleted via API');
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product.');
    }
  }, []);

  const resetProducts = useCallback(() => {
    setProductsState(defaultProducts);
  }, []);

  const value = useMemo<ProductsContextValue>(
    () => ({
      products,
      setProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      resetProducts,
      isLoading,
      error,
      loadProducts
    }),
    [products, setProducts, addProduct, updateProduct, deleteProduct, resetProducts, isLoading, error, loadProducts],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export const useProductsContext = (): ProductsContextValue => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};

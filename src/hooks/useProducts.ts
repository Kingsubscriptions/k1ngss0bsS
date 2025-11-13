import { useProductsContext } from '@/context/ProductsContext';
import { useMemo } from 'react';

export const useProducts = () => {
  const { products } = useProductsContext();

  const result = useMemo(() => products, [products]);

  return {
    data: result,
    isLoading: false,
    error: null,
  } as const;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface ProductReview {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title?: string;
  review_text: string;
  is_verified: boolean;
  is_featured: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
}

interface ReviewManagementContextType {
  reviews: ProductReview[];
  loading: boolean;
  error: string | null;
  fetchReviews: () => Promise<void>;
  createReview: (review: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateReview: (id: string, updates: Partial<ProductReview>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  toggleReviewVerification: (id: string) => Promise<void>;
  toggleReviewFeatured: (id: string) => Promise<void>;
  getReviewsByProduct: (productId: string) => ProductReview[];
  getAverageRating: (productId: string) => number;
}

const ReviewManagementContext = createContext<ReviewManagementContextType | undefined>(undefined);

export const useReviewManagement = () => {
  const context = useContext(ReviewManagementContext);
  if (!context) {
    throw new Error('useReviewManagement must be used within a ReviewManagementProvider');
  }
  return context;
};

interface ReviewManagementProviderProps {
  children: ReactNode;
}

export const ReviewManagementProvider: React.FC<ReviewManagementProviderProps> = ({ children }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (review: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('product_reviews')
        .insert([review])
        .select()
        .single();

      if (insertError) throw insertError;
      setReviews(prev => [data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create review');
      throw err;
    }
  };

  const updateReview = async (id: string, updates: Partial<ProductReview>) => {
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('product_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setReviews(prev => prev.map(review => review.id === id ? data : review));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setReviews(prev => prev.filter(review => review.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      throw err;
    }
  };

  const toggleReviewVerification = async (id: string) => {
    const review = reviews.find(r => r.id === id);
    if (!review) return;

    await updateReview(id, { is_verified: !review.is_verified });
  };

  const toggleReviewFeatured = async (id: string) => {
    const review = reviews.find(r => r.id === id);
    if (!review) return;

    await updateReview(id, { is_featured: !review.is_featured });
  };

  const getReviewsByProduct = (productId: string) => {
    return reviews.filter(review => review.product_id === productId);
  };

  const getAverageRating = (productId: string) => {
    const productReviews = getReviewsByProduct(productId);
    if (productReviews.length === 0) return 0;

    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / productReviews.length;
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const value: ReviewManagementContextType = {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleReviewVerification,
    toggleReviewFeatured,
    getReviewsByProduct,
    getAverageRating,
  };

  return (
    <ReviewManagementContext.Provider value={value}>
      {children}
    </ReviewManagementContext.Provider>
  );
};

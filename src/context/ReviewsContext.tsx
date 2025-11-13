import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Review {
  id: number;
  product_id: string;
  rating: number;
  comment: string;
  author: string;
  is_approved: boolean;
  created_at: string;
}

interface ReviewsContextType {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  fetchReviews: () => Promise<void>;
  approveReview: (id: number) => Promise<boolean>;
  deleteReview: (id: number) => Promise<boolean>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setError('Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const approveReview = async (id: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', id)
        .select();
      if (error) throw error;
      setReviews((prev) => prev.map((r) => (r.id === id ? data[0] : r)));
      return true;
    } catch (err) {
      setError('Failed to approve review.');
      return false;
    }
  };

  const deleteReview = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      setReviews((prev) => prev.filter((r) => r.id !== id));
      return true;
    } catch (err) {
      setError('Failed to delete review.');
      return false;
    }
  };

  return (
    <ReviewsContext.Provider value={{ reviews, loading, error, fetchReviews, approveReview, deleteReview }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = (): ReviewsContextType => {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};

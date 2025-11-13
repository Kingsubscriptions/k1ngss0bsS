import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  applicable_products: string[];
  applicable_categories: string[];
  created_at: string;
  updated_at: string;
}

interface CouponContextType {
  coupons: Coupon[];
  loading: boolean;
  createCoupon: (coupon: Omit<Coupon, 'id' | 'usage_count' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<{ success: boolean; error?: string }>;
  deleteCoupon: (id: string) => Promise<{ success: boolean; error?: string }>;
  validateCoupon: (code: string, orderAmount: number) => Promise<{ valid: boolean; discount?: number; error?: string }>;
  refreshCoupons: () => Promise<void>;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};

interface CouponProviderProps {
  children: ReactNode;
}

export const CouponProvider: React.FC<CouponProviderProps> = ({ children }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'usage_count' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert([{ ...couponData, usage_count: 0 }])
        .select()
        .single();

      if (error) throw error;
      await loadCoupons();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', id);

      if (error) throw error;
      await loadCoupons();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadCoupons();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const validateCoupon = async (code: string, orderAmount: number) => {
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        return { valid: false, error: 'Invalid coupon code' };
      }

      // Check if coupon is within valid date range
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

      if (now < validFrom || (validUntil && now > validUntil)) {
        return { valid: false, error: 'Coupon has expired' };
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return { valid: false, error: 'Coupon usage limit exceeded' };
      }

      // Check minimum order amount
      if (orderAmount < coupon.minimum_order_amount) {
        return { valid: false, error: `Minimum order amount is $${coupon.minimum_order_amount}` };
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (orderAmount * coupon.discount_value) / 100;
        if (coupon.maximum_discount_amount && discount > coupon.maximum_discount_amount) {
          discount = coupon.maximum_discount_amount;
        }
      } else {
        discount = coupon.discount_value;
      }

      return { valid: true, discount };
    } catch (error: any) {
      return { valid: false, error: 'Failed to validate coupon' };
    }
  };

  const refreshCoupons = async () => {
    await loadCoupons();
  };

  const value: CouponContextType = {
    coupons,
    loading,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    refreshCoupons,
  };

  return (
    <CouponContext.Provider value={value}>
      {children}
    </CouponContext.Provider>
  );
};

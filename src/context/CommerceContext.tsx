import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface PaymentMethod {
  id: number;
  name: string;
  enabled: boolean;
}

export interface ShippingOption {
  id: number;
  name: string;
  price: number;
  enabled: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  discount_percentage: number;
  enabled: boolean;
}

interface CommerceContextType {
  paymentMethods: PaymentMethod[];
  shippingOptions: ShippingOption[];
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  fetchCommerceData: () => Promise<void>;
  // Add methods for create, update, delete for each
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommerceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: paymentMethodsData, error: paymentMethodsError } = await supabase.from('payment_methods').select('*');
      if (paymentMethodsError) throw paymentMethodsError;
      setPaymentMethods(paymentMethodsData || []);

      const { data: shippingOptionsData, error: shippingOptionsError } = await supabase.from('shipping_options').select('*');
      if (shippingOptionsError) throw shippingOptionsError;
      setShippingOptions(shippingOptionsData || []);

      const { data: couponsData, error: couponsError } = await supabase.from('coupons').select('*');
      if (couponsError) throw couponsError;
      setCoupons(couponsData || []);
    } catch (err) {
      setError('Failed to fetch commerce data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommerceData();
  }, [fetchCommerceData]);

  return (
    <CommerceContext.Provider value={{ paymentMethods, shippingOptions, coupons, loading, error, fetchCommerceData }}>
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = (): CommerceContextType => {
  const context = useContext(CommerceContext);
  if (context === undefined) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
};

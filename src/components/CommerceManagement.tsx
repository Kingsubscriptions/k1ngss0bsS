import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCommerce, PaymentMethod, ShippingOption, Coupon } from '@/context/CommerceContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const CommerceManagement: React.FC = () => {
  const { paymentMethods, shippingOptions, coupons, loading, error, fetchCommerceData } = useCommerce();

  // TODO: Add state and handlers for forms

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Add form for adding/editing payment methods */}
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between">
                  <span>{method.name}</span>
                  <Switch checked={method.enabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shipping Options</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Add form for adding/editing shipping options */}
            <div className="space-y-2">
              {shippingOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between">
                  <span>{option.name}</span>
                  <span>{option.price}</span>
                  <Switch checked={option.enabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Add form for adding/editing coupons */}
          <div className="space-y-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between">
                <span>{coupon.code}</span>
                <span>{coupon.discount_percentage}%</span>
                <Switch checked={coupon.enabled} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommerceManagement;

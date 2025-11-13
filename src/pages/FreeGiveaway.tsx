import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGiveaway } from '@/context/GiveawayContext';
import { useProductsContext } from '@/context/ProductsContext';
import { Product } from '@/data/products';
import ProductCard from '@/components/ProductCard';

const FreeGiveaway: React.FC = () => {
  const { accounts, isLoading, error } = useGiveaway();
  const { products } = useProductsContext();

  const recommendedProducts = products.slice(0, 3);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Free Giveaway!</h1>
        <p className="text-lg text-center text-muted-foreground mb-12">
          Win amazing premium accounts! Here are the currently available accounts.
        </p>

        <div className="max-w-2xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Available Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <div key={account.id} className="p-4 border rounded-lg">
                    <p className="font-semibold">{account.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Click to reveal password
                    </p>
                  </div>
                ))
              ) : (
                <p>No giveaway accounts are available at the moment. Please check back later.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <h2 className="text-3xl font-bold text-center mb-8">Premium Products You Can Win</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendedProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreeGiveaway;

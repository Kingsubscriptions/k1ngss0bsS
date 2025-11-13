import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProductsContext } from '@/context/ProductsContext';
import { Product } from '@/data/products';
import ProductCard from '@/components/ProductCard';

interface FreeGiveawayAccount {
  id: string;
  product_name: string;
  login_details: string;
  notes: string;
}

const FreeGiveaway: React.FC = () => {
  const [giveawayAccounts, setGiveawayAccounts] = useState<FreeGiveawayAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { products } = useProductsContext();

  useEffect(() => {
    const fetchGiveawayAccounts = async () => {
      try {
        // For public giveaway page, we'll show a message instead of actual accounts
        // The actual giveaway accounts are only accessible to admins
        setGiveawayAccounts([]);
        setError('');
      } catch (err: any) {
        setError('Giveaway accounts are currently unavailable. Please check back later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGiveawayAccounts();
  }, []);

  const recommendedProducts = products.slice(0, 3);

  if (loading) {
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
          Win amazing premium accounts! Enter our giveaway for a chance to get free access to top streaming services, software tools, and more.
        </p>

        {/* Giveaway Information Card */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">How to Enter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Follow us on social media and tag friends to enter our weekly giveaway!
              </p>
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Current Prize</h3>
                <p className="text-3xl font-bold text-primary mb-2">Netflix Premium Account</p>
                <p className="text-sm text-muted-foreground">Valid for 1 month - Full HD streaming</p>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Enter Giveaway on WhatsApp
              </Button>
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

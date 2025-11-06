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
        const response = await fetch('/api/giveaways');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch giveaway accounts');
        }

        setGiveawayAccounts(data);
      } catch (err: any) {
        setError(err.message);
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
          Here are your free accounts. You can use these for 2-3 days. If you'd like to purchase a subscription, check out our recommended products below.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {giveawayAccounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <CardTitle>{account.product_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{account.notes}</p>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap">{account.login_details}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-center mb-8">Recommended Products</h2>
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

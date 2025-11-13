import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Star,
  Target
} from 'lucide-react';
import { Product, StockType } from '@/data/products';

interface ProductAnalyticsProps {
  products: Product[];
}

interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
  avgPrice: number;
  inStock: number;
  outOfStock: number;
}

interface PriceRange {
  range: string;
  count: number;
  percentage: number;
}

interface StockAlert {
  type: 'low' | 'out' | 'unlimited';
  product: Product;
  message: string;
}

const ProductAnalytics: React.FC<ProductAnalyticsProps> = ({ products }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => 
      p.stock === true || p.stock === 'unlimited' || (typeof p.stock === 'number' && p.stock > 0)
    );
    const outOfStockProducts = products.filter(p => p.stock === false || p.stock === 0);
    const popularProducts = products.filter(p => p.popular);
    const lowStockProducts = products.filter(p => typeof p.stock === 'number' && p.stock > 0 && p.stock <= 5);

    // Price analytics
    const pricesArray = products
      .map(p => p.price.monthly || p.price.yearly || 0)
      .filter(price => price > 0);
    
    const avgPrice = pricesArray.length > 0 
      ? pricesArray.reduce((sum, price) => sum + price, 0) / pricesArray.length 
      : 0;
    
    const minPrice = pricesArray.length > 0 ? Math.min(...pricesArray) : 0;
    const maxPrice = pricesArray.length > 0 ? Math.max(...pricesArray) : 0;

    // Category breakdown
    const categoryMap = new Map<string, CategoryStats>();
    products.forEach(product => {
      const categories = product.category.split(',').map(c => c.trim());
      categories.forEach(category => {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            name: category,
            count: 0,
            percentage: 0,
            avgPrice: 0,
            inStock: 0,
            outOfStock: 0
          });
        }
        const stat = categoryMap.get(category)!;
        stat.count++;
        const isInStock = product.stock === true || product.stock === 'unlimited' || 
                         (typeof product.stock === 'number' && product.stock > 0);
        if (isInStock) stat.inStock++;
        else stat.outOfStock++;
      });
    });

    // Calculate percentages and average prices
    categoryMap.forEach((stat, category) => {
      stat.percentage = (stat.count / totalProducts) * 100;
      const categoryProducts = products.filter(p => p.category.includes(category));
      const categoryPrices = categoryProducts
        .map(p => p.price.monthly || p.price.yearly || 0)
        .filter(price => price > 0);
      stat.avgPrice = categoryPrices.length > 0 
        ? categoryPrices.reduce((sum, price) => sum + price, 0) / categoryPrices.length 
        : 0;
    });

    const categoryStats = Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count);

    // Price ranges
    const priceRanges: PriceRange[] = [
      { range: '₹0-500', count: 0, percentage: 0 },
      { range: '₹501-1000', count: 0, percentage: 0 },
      { range: '₹1001-2000', count: 0, percentage: 0 },
      { range: '₹2001-5000', count: 0, percentage: 0 },
      { range: '₹5000+', count: 0, percentage: 0 }
    ];

    products.forEach(product => {
      const price = product.price.monthly || product.price.yearly || 0;
      if (price <= 500) priceRanges[0].count++;
      else if (price <= 1000) priceRanges[1].count++;
      else if (price <= 2000) priceRanges[2].count++;
      else if (price <= 5000) priceRanges[3].count++;
      else if (price > 5000) priceRanges[4].count++;
    });

    priceRanges.forEach(range => {
      range.percentage = totalProducts > 0 ? (range.count / totalProducts) * 100 : 0;
    });

    // Stock alerts
    const stockAlerts: StockAlert[] = [
      ...outOfStockProducts.map(product => ({
        type: 'out' as const,
        product,
        message: `${product.name} is out of stock`
      })),
      ...lowStockProducts.map(product => ({
        type: 'low' as const,
        product,
        message: `${product.name} has only ${product.stock} units left`
      }))
    ];

    // Recent activity (products created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentProducts = products.filter(product => {
      if (!product.createdAt) return false;
      return new Date(product.createdAt) > thirtyDaysAgo;
    });

    return {
      totals: {
        products: totalProducts,
        inStock: inStockProducts.length,
        outOfStock: outOfStockProducts.length,
        popular: popularProducts.length,
        lowStock: lowStockProducts.length,
        categories: categoryStats.length
      },
      pricing: {
        average: avgPrice,
        min: minPrice,
        max: maxPrice,
        ranges: priceRanges
      },
      categories: categoryStats,
      alerts: stockAlerts,
      recent: recentProducts,
      trends: {
        stockHealth: inStockProducts.length / totalProducts * 100,
        popularityRate: popularProducts.length / totalProducts * 100,
        averageRating: products
          .filter(p => p.rating)
          .reduce((sum, p) => sum + (p.rating || 0), 0) / products.filter(p => p.rating).length || 0
      }
    };
  }, [products, timeRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into your product inventory</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {analytics.categories.map(category => (
                <SelectItem key={category.name} value={category.name.toLowerCase()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totals.products}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+{analytics.recent.length}</span>
              <span className="text-gray-600 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Health</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.trends.stockHealth.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">
                {analytics.totals.inStock} in stock, {analytics.totals.outOfStock} out
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{analytics.pricing.average.toFixed(0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">
                Range: ₹{analytics.pricing.min} - ₹{analytics.pricing.max}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Popular Items</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totals.popular}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600">
                {analytics.trends.popularityRate.toFixed(1)}% of total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categories.slice(0, 6).map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                      }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{category.count}</div>
                    <div className="text-sm text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Price Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.pricing.ranges.map((range, index) => (
                <div key={range.range} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{range.range}</span>
                    <span className="text-sm text-gray-600">
                      {range.count} products ({range.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${range.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      {analytics.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Stock Alerts ({analytics.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.alerts.slice(0, 10).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    {alert.type === 'out' ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium">{alert.product.name}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  <Badge variant={alert.type === 'out' ? 'destructive' : 'secondary'}>
                    {alert.type === 'out' ? 'Out of Stock' : 'Low Stock'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Popular Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products
                .filter(p => p.popular)
                .slice(0, 5)
                .map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || '/images/DefaultImage.jpg'}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/DefaultImage.jpg';
                        }}
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category.split(',')[0]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{product.price.monthly || product.price.yearly}</p>
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Additions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recent.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image || '/images/DefaultImage.jpg'}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/DefaultImage.jpg';
                      }}
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        Added {new Date(product.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">New</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductAnalytics;
import { products } from '@/data/products';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Create mock analytics data
    const mockAnalytics = {
      overview: {
        totalProducts: products.length,
        inStock: products.filter(p =>
          p.stock === true ||
          p.stock === 'unlimited' ||
          (typeof p.stock === 'number' && p.stock > 0)
        ).length,
        outOfStock: products.filter(p =>
          p.stock === false ||
          p.stock === 0
        ).length,
        totalCategories: [...new Set(products.map(p => p.category))].length,
        popularProducts: products.filter(p => p.popular).length,
        avgRating: products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length || 0
      },
      salesTrends: [
        { month: 'Jan', sales: 1200, revenue: 45000 },
        { month: 'Feb', sales: 1350, revenue: 52000 },
        { month: 'Mar', sales: 1100, revenue: 41000 },
        { month: 'Apr', sales: 1600, revenue: 68000 },
        { month: 'May', sales: 1800, revenue: 75000 },
        { month: 'Jun', sales: 2100, revenue: 89000 }
      ],
      categoryPerformance: [
        { category: 'Entertainment', count: 12, revenue: 125000, avgRating: 4.8 },
        { category: 'AI Tools', count: 8, revenue: 95000, avgRating: 4.6 },
        { category: 'Study Tools', count: 7, revenue: 78000, avgRating: 4.7 },
        { category: 'VPN', count: 6, revenue: 42000, avgRating: 4.5 },
        { category: 'Software', count: 5, revenue: 65000, avgRating: 4.9 }
      ],
      topProducts: [
        { id: 'netflix', name: 'Netflix Premium', sales: 450, revenue: 35000, rating: 4.9 },
        { id: 'spotify-premium', name: 'Spotify Premium', sales: 380, revenue: 28000, rating: 4.8 },
        { id: 'coursera-plus', name: 'Coursera Plus', sales: 220, revenue: 45000, rating: 4.7 },
        { id: 'ms-office-365', name: 'Microsoft Office 365', sales: 195, revenue: 18000, rating: 4.9 },
        { id: 'social-media-services', name: 'Social Media Services', sales: 850, revenue: 25000, rating: 4.6 }
      ],
      lowStockAlerts: [
        { id: 'uk-physical-sim', name: 'UK Physical SIM Card', stock: 0, status: 'out_of_stock' },
        { id: 'rdp-service', name: 'RDP (Remote Desktop)', stock: 2, status: 'low_stock' },
        { id: 'midjourney', name: 'Midjourney', stock: 3, status: 'low_stock' }
      ],
      recentActivity: [
        { date: '2025-08-26T10:30:00Z', action: 'product_updated', product: 'Netflix Premium', user: 'admin' },
        { date: '2025-08-26T09:15:00Z', action: 'stock_updated', product: 'Spotify Premium', user: 'admin' },
        { date: '2025-08-25T16:45:00Z', action: 'product_created', product: 'New VPN Service', user: 'admin' },
        { date: '2025-08-25T14:20:00Z', action: 'bulk_update', product: '5 products', user: 'admin' }
      ]
    };

    return res.status(200).json({
      success: true,
      data: mockAnalytics,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      details: error.message
    });
  }
}

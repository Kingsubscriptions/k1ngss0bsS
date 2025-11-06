import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'POST') {
      // Seed sample analytics data
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.VITE_SUPABASE_URL!;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Sample conversion events
      const sampleConversions = [
        { product_id: 'netflix', amount: 350, currency: 'PKR', event_type: 'product_purchase', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { product_id: 'spotify-premium', amount: 350, currency: 'PKR', event_type: 'product_purchase', created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
        { product_id: 'coursera-plus', amount: 4500, currency: 'PKR', event_type: 'product_purchase', created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { product_id: 'youtube-premium', amount: 300, currency: 'PKR', event_type: 'product_purchase', created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { product_id: 'netflix', amount: 500, currency: 'PKR', event_type: 'product_purchase', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { product_id: 'semrush-pro', amount: 1500, currency: 'PKR', event_type: 'product_purchase', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { product_id: 'quillbot-premium', amount: 400, currency: 'PKR', event_type: 'product_purchase', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { product_id: 'midjourney', amount: 3500, currency: 'PKR', event_type: 'product_purchase', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      ];

      const { error } = await supabase
        .from('conversion_events')
        .insert(sampleConversions);

      if (error) {
        console.error('Error seeding sample data:', error);
        return res.status(500).json({ error: 'Failed to seed sample data' });
      }

      return res.status(200).json({ message: 'Sample analytics data seeded successfully' });
    }

    if (req.method === 'GET') {
      // Get overview analytics
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, category, stock, popular');

      if (productsError) {
        console.error('Products fetch error:', productsError);
        return res.status(500).json({ error: 'Failed to fetch products data' });
      }

      // Calculate overview metrics
      const totalProducts = products.length;
      const inStock = products.filter(p => p.stock !== 'false' && p.stock !== '0').length;
      const outOfStock = totalProducts - inStock;

      // Get unique categories
      const categories = [...new Set(products.flatMap(p => p.category.split(',').map((c: string) => c.trim())))];
      const totalCategories = categories.length;

      const popularProducts = products.filter(p => p.popular).length;

      // Mock average rating (would be calculated from real reviews in production)
      const avgRating = 4.7;

      const overview = {
        totalProducts,
        inStock,
        outOfStock,
        totalCategories,
        popularProducts,
        avgRating
      };

      return res.status(200).json(overview);
    }

    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { promises as fs } from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'server', 'settings.json');

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      // Get products
      try {
        const settingsData = await fs.readFile(SETTINGS_FILE, 'utf8');
        const settings = JSON.parse(settingsData);
        const products = settings.products || [
          {
            id: 'netflix',
            name: 'Netflix Premium',
            category: 'Entertainment, Streaming',
            price: { monthly: 350, original: 1100, yearly: 4000 },
            description: 'Watch your favorite shows and movies in 4K UHD. Plans available for every need.',
            longDescription: 'Get uninterrupted access to Netflix\'s vast library. Choose between a cost-effective shared plan or a fully private plan.',
            features: ['Ultra HD 4K Streaming', 'Officially Paid & Renewable', 'Works on All Devices'],
            image: 'https://logo.clearbit.com/netflix.com',
            popular: true,
            stock: 'unlimited'
          }
        ];
        return res.status(200).json(products);
      } catch (error) {
        // Return default products if file doesn't exist
        return res.status(200).json([
          {
            id: 'netflix',
            name: 'Netflix Premium',
            category: 'Entertainment, Streaming',
            price: { monthly: 350, original: 1100, yearly: 4000 },
            description: 'Watch your favorite shows and movies in 4K UHD.',
            features: ['Ultra HD 4K Streaming', 'Officially Paid & Renewable'],
            image: 'https://logo.clearbit.com/netflix.com',
            popular: true,
            stock: 'unlimited'
          }
        ]);
      }
    }

    if (req.method === 'POST') {
      // Update products
      const newProducts = req.body;

      try {
        // Read existing settings
        let currentSettings = {};
        try {
          const settingsData = await fs.readFile(SETTINGS_FILE, 'utf8');
          currentSettings = JSON.parse(settingsData);
        } catch (error) {
          // File doesn't exist, use empty object
        }

        // Update products in settings
        const updatedSettings = { ...currentSettings, products: newProducts };

        // Try to save to file (will fail on Vercel read-only filesystem)
        try {
          await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));
          return res.status(200).json({ message: 'Products updated successfully' });
        } catch (fileError: any) {
          // If file system is read-only (like Vercel), return success but warn client
          if (fileError.code === 'EROFS') {
            console.warn('File system is read-only, products saved locally only');
            return res.status(200).json({
              message: 'Products updated locally (server filesystem is read-only)',
              warning: 'Changes saved locally only - use localStorage for persistence'
            });
          }
          throw fileError;
        }
      } catch (error) {
        console.error('Error updating products:', error);
        return res.status(500).json({ error: 'Failed to update products' });
      }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

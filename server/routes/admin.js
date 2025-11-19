import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const settings = req.app.locals.settings;

    const isValidPassword = await bcrypt.compare(password, settings.admin_password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product Controller login
router.post('/login/product-controller', async (req, res) => {
  try {
    const { password } = req.body;
    const correctPassword = process.env.PRODUCT_CONTROLLER_PASSWORD || 'admin123';

    if (password !== correctPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { role: 'product-controller' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin settings
router.get('/settings', (req, res) => {
  try {
    const settings = req.app.locals.settings;

    // Return all settings except admin_password
    const { admin_password, ...publicSettings } = settings;
    res.json(publicSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update admin settings
router.post('/settings', verifyAdmin, async (req, res) => {
  try {
    const newSettings = req.body;

    for (const key in newSettings) {
      if (Object.hasOwnProperty.call(newSettings, key)) {
        const value = newSettings[key];

        const { error } = await supabase
          .from('settings')
          .update({ value })
          .eq('key', key);

        if (error) {
          throw new Error(`Failed to update setting: ${key}. ${error.message}`);
        }
      }
    }

    // Update in memory
    req.app.locals.settings = { ...req.app.locals.settings, ...newSettings };

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products
router.get('/products', (req, res) => {
  try {
    const products = req.app.locals.products || [];
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update products
// Add a product
router.post('/products/add', verifyAdmin, async (req, res) => {
  try {
    const product = req.body;

    // Ensure features, price, stock are stringified if needed, or rely on Supabase handling JSONB
    // The previous code used JSON.stringify for these fields in lib/supabase.js, 
    // but here we are sending raw JSON. Supabase client usually handles JSON if the column type is JSONB.
    // If columns are text, we might need stringify. 
    // Let's assume columns are JSONB based on modern Supabase usage, or we match lib/supabase.js behavior.

    // server/lib/supabase.js uses JSON.stringify. Let's replicate that safety.
    const productToInsert = {
      ...product,
      features: typeof product.features === 'object' ? JSON.stringify(product.features) : product.features,
      price: typeof product.price === 'object' ? JSON.stringify(product.price) : product.price,
      stock: typeof product.stock === 'object' ? JSON.stringify(product.stock) : product.stock,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add product: ${error.message}`);
    }

    // Update in memory
    req.app.locals.products = [product, ...req.app.locals.products];

    res.json({ message: 'Product added successfully', product: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product
router.put('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const productToUpdate = {
      ...updates,
      features: typeof updates.features === 'object' ? JSON.stringify(updates.features) : updates.features,
      price: typeof updates.price === 'object' ? JSON.stringify(updates.price) : updates.price,
      stock: typeof updates.stock === 'object' ? JSON.stringify(updates.stock) : updates.stock,
    };

    const { data, error } = await supabase
      .from('products')
      .update(productToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    // Update in memory
    const index = req.app.locals.products.findIndex(p => p.id === id);
    if (index !== -1) {
      req.app.locals.products[index] = { ...req.app.locals.products[index], ...updates };
    }

    res.json({ message: 'Product updated successfully', product: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product
router.delete('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }

    // Update in memory
    req.app.locals.products = req.app.locals.products.filter(p => p.id !== id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk update products (Keep existing for backward compatibility if needed)
router.post('/products', verifyAdmin, async (req, res) => {
  try {
    const newProducts = req.body;

    // Upsert products into the database
    const { data, error } = await supabase
      .from('products')
      .upsert(newProducts, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to update products: ${error.message}`);
    }

    // Update in memory
    req.app.locals.products = newProducts;

    res.json({ message: 'Products updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the router
export default router;

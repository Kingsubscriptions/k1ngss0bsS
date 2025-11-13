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

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
router.post('/settings', (req, res) => {
  try {
    const newSettings = req.body;
    const currentSettings = req.app.locals.settings;

    // Update settings
    const updatedSettings = { ...currentSettings, ...newSettings };

    // Save to file
    const settingsFile = path.join(__dirname, 'settings.json');
    fs.writeFileSync(settingsFile, JSON.stringify(updatedSettings, null, 2));

    // Update in memory
    req.app.locals.settings = updatedSettings;

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products
router.get('/products', (req, res) => {
  try {
    const settings = req.app.locals.settings;
    const products = settings.products || [
      {
        id: 1,
        name: 'Premium Digital Tool',
        price: 29.99,
        description: 'High-quality digital tool for professionals',
        category: 'Tools',
        image: '/images/product1.jpg'
      },
      {
        id: 2,
        name: 'Advanced Software Suite',
        price: 49.99,
        description: 'Complete software solution for businesses',
        category: 'Software',
        image: '/images/product2.jpg'
      }
    ];
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update products
router.post('/products', (req, res) => {
  try {
    const newProducts = req.body;
    const currentSettings = req.app.locals.settings;

    // Update products in settings
    const updatedSettings = { ...currentSettings, products: newProducts };

    // Save to file
    const settingsFile = path.join(__dirname, 'settings.json');
    fs.writeFileSync(settingsFile, JSON.stringify(updatedSettings, null, 2));

    // Update in memory
    req.app.locals.settings = updatedSettings;

    res.json({ message: 'Products updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the router
export default router;

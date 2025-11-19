import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './lib/supabase.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import giveawayRoutes from './routes/giveaways.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize data from Supabase
const initializeSupabaseData = async () => {
  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('*');

  if (settingsError) {
    throw new Error(`Error fetching settings: ${settingsError.message}`);
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*');

  if (productsError) {
    throw new Error(`Error fetching products: ${productsError.message}`);
  }

  const appData = {
    settings: settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {}),
    products,
  };

  // Hash the admin password if it exists and is not already hashed
  if (appData.settings.admin_password && !appData.settings.admin_password.startsWith('$2a')) {
    appData.settings.admin_password = bcrypt.hashSync(appData.settings.admin_password, 10);
  }

  return appData;
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/giveaways', giveawayRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: `/uploads/${req.file.filename}`
  });
});

// Analytics endpoints
// Analytics endpoints
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // Fetch real data from Supabase
    const { count: totalOrders } = await supabase
      .from('conversion_events')
      .select('*', { count: 'exact', head: true });

    const { count: totalCustomers } = await supabase
      .from('user_interactions') // Assuming unique users are tracked here or in a users table
      .select('user_id', { count: 'exact', head: true }); // This is a rough approximation

    // Calculate total sales (sum of value in conversion_events)
    const { data: salesData, error: salesError } = await supabase
      .from('conversion_events')
      .select('value, created_at')
      .order('created_at', { ascending: true });

    let totalSales = 0;
    const salesByMonth = {};

    if (salesData) {
      salesData.forEach(event => {
        totalSales += event.value || 0;
        const month = new Date(event.created_at).toLocaleString('default', { month: 'short' });
        salesByMonth[month] = (salesByMonth[month] || 0) + (event.value || 0);
      });
    }

    const formattedSalesData = Object.entries(salesByMonth).map(([month, sales]) => ({
      month,
      sales
    }));

    // Conversion rate: orders / page_views * 100
    const { count: totalViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    const conversionRate = totalViews ? ((totalOrders || 0) / totalViews * 100).toFixed(2) : 0;

    const analytics = {
      totalSales: totalSales || 0,
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      conversionRate: Number(conversionRate),
      salesData: formattedSalesData.length > 0 ? formattedSalesData : [
        { month: 'Jan', sales: 0 },
        { month: 'Feb', sales: 0 },
        { month: 'Mar', sales: 0 }
      ]
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  // Ensure we always return JSON for API routes
  if (req.path.startsWith('/api/')) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
  } else {
    res.status(500).send('Internal Server Error');
  }
});

// Start server with storage initialization
const startServer = async () => {
  try {
    const appData = await initializeSupabaseData();
    app.locals.settings = appData.settings;
    app.locals.products = appData.products;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Data initialized from Supabase`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

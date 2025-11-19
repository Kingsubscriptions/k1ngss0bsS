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
import giveawayAdminRoutes from './routes/giveaway-admin.js';

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
    .select('*')
    .order('ordering', { ascending: true, nullsFirst: false });

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
app.use('/api/admin/giveaways', giveawayAdminRoutes);

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
app.get('/api/analytics/dashboard', (req, res) => {
  const analytics = {
    totalSales: 15420,
    totalOrders: 342,
    totalCustomers: 1250,
    conversionRate: 3.2,
    salesData: [
      { month: 'Jan', sales: 1200 },
      { month: 'Feb', sales: 1800 },
      { month: 'Mar', sales: 1600 },
      { month: 'Apr', sales: 2200 },
      { month: 'May', sales: 2800 },
      { month: 'Jun', sales: 3200 }
    ]
  };
  res.json(analytics);
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

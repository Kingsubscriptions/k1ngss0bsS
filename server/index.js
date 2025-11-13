import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import adminRoutes from './routes/admin.js';
import giveawayRoutes from './routes/giveaways.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Simple file-based storage for testing
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// Initialize storage
const initializeStorage = () => {
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      admin_password: bcrypt.hashSync('KingSubsAdmin2025!', 10),
      whatsappNumber: '+923276847960',
      whatsappDirectOrder: false,
      enablePurchaseNotifications: true,
      enableFloatingCart: true,
      showDiscountBadges: true,
      showBreadcrumbs: true,
      popupSettings: {
        enabled: true,
        title: 'Limited Time Offer',
        message: 'Get 10% off when you order on WhatsApp within the next 10 minutes.',
        buttonText: 'Order on WhatsApp',
        buttonHref: 'https://wa.me/923276847960?text=I%20want%20to%20claim%20the%20limited%20time%20offer',
        showTimer: true,
        timerDuration: 10,
        trigger: 'delay',
        delaySeconds: 6,
        frequency: 'once-per-session',
        theme: 'dark',
        pages: ['/', '/tools', '/product/:id']
      }
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
  }
  return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
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

// Products API endpoints
let products = [
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

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: products.length + 1,
    ...req.body
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
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
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server with storage initialization
const startServer = () => {
  try {
    const settings = initializeStorage();
    app.locals.settings = settings;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`File-based storage initialized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

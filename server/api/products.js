const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();

// For WhatsApp order saving and export
const whatsappOrdersPath = path.join(__dirname, '../../server/database/whatsapp_orders.json');
const ensureWhatsappOrdersFile = () => {
  if (!fs.existsSync(whatsappOrdersPath)) {
    fs.mkdirSync(path.dirname(whatsappOrdersPath), { recursive: true });
    fs.writeFileSync(whatsappOrdersPath, '[]', 'utf8');
  }
};

// Save WhatsApp order
router.post('/whatsapp-orders', (req, res) => {
  try {
    ensureWhatsappOrdersFile();
    const { name, email, phone, city, product, plan, duration, message } = req.body;
    if (!name || !phone || !product) {
      return res.status(400).json({ success: false, error: 'Name, phone, and product are required.' });
    }
    const order = {
      name,
      email,
      phone,
      city,
      product,
      plan,
      duration,
      message,
      date: new Date().toISOString()
    };
    const orders = JSON.parse(fs.readFileSync(whatsappOrdersPath, 'utf8'));
    orders.push(order);
    fs.writeFileSync(whatsappOrdersPath, JSON.stringify(orders, null, 2), 'utf8');
    res.json({ success: true, message: 'Order saved', order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save order', details: error.message });
  }
});

// Export WhatsApp orders as CSV
router.get('/whatsapp-orders/export/csv', (req, res) => {
  try {
    ensureWhatsappOrdersFile();
    const orders = JSON.parse(fs.readFileSync(whatsappOrdersPath, 'utf8'));
    if (!orders.length) return res.status(404).send('No orders found');
    const fields = Object.keys(orders[0]);
    const csv = [fields.join(',')].concat(
      orders.map(order => fields.map(f => '"' + String(order[f] || '').replace(/"/g, '""') + '"').join(','))
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="whatsapp_orders.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).send('Failed to export CSV: ' + error.message);
  }
});

// Export WhatsApp orders as XLSX
router.get('/whatsapp-orders/export/xlsx', async (req, res) => {
  try {
    ensureWhatsappOrdersFile();
    const orders = JSON.parse(fs.readFileSync(whatsappOrdersPath, 'utf8'));
    if (!orders.length) return res.status(404).send('No orders found');
    // Lazy require for performance
    const XLSX = require('xlsx');
    const ws = XLSX.utils.json_to_sheet(orders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="whatsapp_orders.xlsx"');
    res.send(buf);
  } catch (error) {
    res.status(500).send('Failed to export XLSX: ' + error.message);
  }
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../public/assets/products');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Auto-generate unique product ID
const generateProductId = (productName) => {
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
  const timestamp = Date.now();
  return `${cleanName}-${timestamp}`;
};

// Validate product data
const validateProduct = (product) => {
  const errors = [];
  
  if (!product.name || !product.name.trim()) {
    errors.push('Product name is required');
  }
  
  if (!product.category || !product.category.trim()) {
    errors.push('Category is required');
  }
  
  if (!product.description || !product.description.trim()) {
    errors.push('Description is required');
  }
  
  if (!product.price || (!product.price.monthly && !product.price.yearly)) {
    errors.push('At least one price (monthly or yearly) is required');
  }
  
  return errors;
};

// Add stock history entry
const addStockHistoryEntry = (product, oldStock, newStock, reason = 'Manual update') => {
  if (!product.stockHistory) {
    product.stockHistory = [];
  }
  
  if (oldStock !== newStock) {
    product.stockHistory.push({
      date: new Date().toISOString(),
      stock: newStock,
      previousStock: oldStock,
      reason: reason
    });
    
    // Keep only last 50 entries
    if (product.stockHistory.length > 50) {
      product.stockHistory = product.stockHistory.slice(-50);
    }
  }
  
  return product;
};

// Save products to TypeScript file
router.post('/save', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Products must be an array' 
      });
    }

    // Validate all products
    const allErrors = [];
    const validatedProducts = products.map((product, index) => {
      const errors = validateProduct(product);
      if (errors.length > 0) {
        allErrors.push(`Product ${index + 1}: ${errors.join(', ')}`);
      }
      
      // Auto-generate ID if missing
      if (!product.id) {
        product.id = generateProductId(product.name);
      }
      
      // Set timestamps
      const now = new Date().toISOString();
      if (!product.createdAt) {
        product.createdAt = now;
      }
      product.updatedAt = now;
      
      return product;
    });

    if (allErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation errors',
        details: allErrors
      });
    }

    // Create backup of existing file
    const productsFilePath = path.join(__dirname, '../../src/data/products.ts');
    const backupPath = path.join(__dirname, '../../src/data/products.backup.ts');
    
    if (fs.existsSync(productsFilePath)) {
      fs.copyFileSync(productsFilePath, backupPath);
    }

    // Generate TypeScript file content
    const fileContent = `// src/data/products.ts
// Auto-generated on ${new Date().toISOString()}

// Helper to create durations with auto-calculated prices
const createDurations = (
  monthlyPrice: number,
  monthlyOriginal: number,
  customPrices?: { [key: string]: number } // optional custom prices for special discounts
) => {
  const durations = [
    {
      duration: "1 Month",
      price: monthlyPrice,
      original: monthlyOriginal,
    },
    {
      duration: "3 Months",
      price: customPrices?.["3m"] || monthlyPrice * 3,
      original: monthlyOriginal * 3,
    },
    {
      duration: "6 Months",
      price: customPrices?.["6m"] || monthlyPrice * 6,
      original: monthlyOriginal * 6,
    },
    {
      duration: "1 Year",
      price: customPrices?.["12m"] || monthlyPrice * 12,
      original: monthlyOriginal * 12,
    },
  ];
  return durations;
};

// Product interfaces and types
export interface PlanDuration {
  duration: string;
  price: number;
  original?: number;
}

export interface PlanOption {
  type: string;
  description?: string;
  durations: PlanDuration[];
}

export type StockType = boolean | number | "unlimited";

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  images?: string[]; // Image gallery
  features: string[];
  price: {
    monthly?: number;
    yearly?: number;
    original?: number;
  };
  plans?: PlanOption[];
  description?: string;
  longDescription?: string;
  badge?: string;
  stock: StockType;
  stockHistory?: Array<{ date: string; stock: StockType; previousStock?: StockType; reason?: string }>; // Track stock changes
  rating?: number;
  popular?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Utility: Get default image if missing
export function getProductImage(image?: string): string {
  return image && image.length > 5 ? image : "/images/default.jpg";
}

// Utility: Get stock label
export function getStockLabel(stock: StockType): string {
  if (stock === false || stock === 0) return "Out of Stock";
  if (stock === true || stock === "unlimited") return "In Stock";
  if (typeof stock === "number" && stock > 0) return \`\${stock} left\`;
  return "Unknown";
}

// Utility: Is product in stock
export function isProductInStock(stock: StockType): boolean {
  if (stock === false || stock === 0) return false;
  if (stock === true || stock === "unlimited") return true;
  if (typeof stock === "number" && stock > 0) return true;
  return false;
}

export const products: Product[] = ${JSON.stringify(validatedProducts, null, 2)};

export const categories = [
  { id: "all", name: "All", count: products.length },
  { id: "entertainment", name: "Entertainment", count: products.filter(p => p.category.includes("Entertainment")).length },
  { id: "streaming", name: "Streaming", count: products.filter(p => p.category.includes("Streaming")).length },
  { id: "music", name: "Music", count: products.filter(p => p.category.includes("Music")).length },
  { id: "gaming", name: "Gaming", count: products.filter(p => p.category.includes("Gaming")).length },
  { id: "ai-tools", name: "AI Tools", count: products.filter(p => p.category.includes("AI Tools")).length },
  { id: "seo-tools", name: "SEO Tools", count: products.filter(p => p.category.includes("SEO Tools")).length },
  { id: "study-tools", name: "Study Tools", count: products.filter(p => p.category.includes("Study Tools")).length },
  { id: "writer-tools", name: "Writer Tools", count: products.filter(p => p.category.includes("Writer Tools")).length },
  { id: "social-media-services", name: "Social Media", count: products.filter(p => p.category.includes("Social Media")).length },
  { id: "vpn", name: "VPN", count: products.filter(p => p.category.includes("VPN")).length },
  { id: "software", name: "Software", count: products.filter(p => p.category.includes("Software")).length },
  { id: "productivity", name: "Productivity", count: products.filter(p => p.category.includes("Productivity")).length },
  { id: "courses", name: "Courses", count: products.filter(p => p.category.includes("Courses")).length },
  { id: "graphics-creative", name: "Graphics/Creative", count: products.filter(p => p.category.includes("Graphics/Creative")).length },
  { id: "business", name: "Business", count: products.filter(p => p.category.includes("Business")).length },
  { id: "services", name: "Services", count: products.filter(p => p.category.includes("Services")).length },
];`;

    // Write to file
    fs.writeFileSync(productsFilePath, fileContent, 'utf8');

    res.json({
      success: true,
      message: 'Products saved successfully',
      productsCount: validatedProducts.length,
      backupCreated: true
    });

  } catch (error) {
    console.error('Error saving products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save products',
      details: error.message
    });
  }
});

// Upload images
router.post('/upload-images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const processedImages = [];

    for (const file of req.files) {
      try {
        // Optimize image with Sharp
        const optimizedPath = path.join(
          path.dirname(file.path),
          `optimized-${file.filename}`
        );

        await sharp(file.path)
          .resize(400, 240, {
            fit: 'cover',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);

        // Remove original and rename optimized
        fs.unlinkSync(file.path);
        fs.renameSync(optimizedPath, file.path);

        processedImages.push({
          filename: file.filename,
          path: `/assets/products/${file.filename}`,
          size: fs.statSync(file.path).size,
          optimized: true
        });

      } catch (imageError) {
        console.error('Error processing image:', imageError);
        processedImages.push({
          filename: file.filename,
          path: `/assets/products/${file.filename}`,
          size: file.size,
          optimized: false,
          error: 'Optimization failed, using original'
        });
      }
    }

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: processedImages
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images',
      details: error.message
    });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    // Load current products
    const productsFilePath = path.join(__dirname, '../../src/data/products.ts');
    
    if (!fs.existsSync(productsFilePath)) {
      return res.status(404).json({
        success: false,
        error: 'Products file not found'
      });
    }

    // Since it's a TypeScript file, we need to parse it differently
    // For now, we'll create mock analytics data
    // In a real implementation, you'd have a database to track actual sales and views

    const mockAnalytics = {
      overview: {
        totalProducts: 45,
        inStock: 42,
        outOfStock: 3,
        totalCategories: 17,
        popularProducts: 8,
        avgRating: 4.7
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

    res.json({
      success: true,
      data: mockAnalytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      details: error.message
    });
  }
});

// Update single product stock with history tracking
router.put('/stock/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock, reason = 'Manual stock update' } = req.body;

    // This would typically update a database
    // For now, return success with stock history entry
    res.json({
      success: true,
      message: 'Stock updated successfully',
      stockHistory: {
        date: new Date().toISOString(),
        stock: stock,
        reason: reason
      }
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock',
      details: error.message
    });
  }
});

module.exports = router;
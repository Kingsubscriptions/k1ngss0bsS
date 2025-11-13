const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SQLiteDB {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(path.join(__dirname, 'premium_tools.db'), (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          this.initializeTables();
          resolve();
        }
      });
    });
  }

  async initializeTables() {
    const tables = [
      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        features TEXT, -- JSON array
        image TEXT,
        popular INTEGER DEFAULT 0,
        discount TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Pricing plans table
      `CREATE TABLE IF NOT EXISTS pricing_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT,
        plan_type TEXT, -- shared, semi-private, private
        duration TEXT, -- monthly, yearly, 3-months, 6-months
        price REAL,
        original_price REAL,
        stock_status TEXT DEFAULT 'available',
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,

      // Admin settings
      `CREATE TABLE IF NOT EXISTS admin_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE,
        setting_value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Page content management
      `CREATE TABLE IF NOT EXISTS page_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_name TEXT UNIQUE,
        content TEXT, -- JSON content
        seo_title TEXT,
        seo_description TEXT,
        seo_keywords TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Blog posts
      `CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        content TEXT,
        excerpt TEXT,
        author TEXT,
        published INTEGER DEFAULT 0,
        seo_title TEXT,
        seo_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // Insert default admin settings
    await this.seedDefaultData();
  }

  async seedDefaultData() {
    const defaultSettings = [
      ['whatsapp_number', '+923276847960'],
      ['admin_password', '$2b$10$defaultPasswordHash'], // Change in production
      ['website_title', 'Premium AI & SEO Tools'],
      ['purchase_notifications_enabled', '1'],
      ['popup_offers_enabled', '1']
    ];

    for (const [key, value] of defaultSettings) {
      await this.run(
        `INSERT OR IGNORE INTO admin_settings (setting_key, setting_value) VALUES (?, ?)`,
        [key, value]
      );
    }

    console.log('✅ Default admin settings seeded');
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = SQLiteDB;
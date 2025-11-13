class Product {
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    return await this.db.all(`
      SELECT p.*, 
             GROUP_CONCAT(
               json_object(
                 'plan_type', pp.plan_type,
                 'duration', pp.duration,
                 'price', pp.price,
                 'original_price', pp.original_price,
                 'stock_status', pp.stock_status
               )
             ) as pricing_plans
      FROM products p
      LEFT JOIN pricing_plans pp ON p.id = pp.product_id
      GROUP BY p.id
      ORDER BY p.popular DESC, p.name ASC
    `);
  }

  async getById(id) {
    const product = await this.db.get(`
      SELECT p.*, 
             GROUP_CONCAT(
               json_object(
                 'plan_type', pp.plan_type,
                 'duration', pp.duration,
                 'price', pp.price,
                 'original_price', pp.original_price,
                 'stock_status', pp.stock_status
               )
             ) as pricing_plans
      FROM products p
      LEFT JOIN pricing_plans pp ON p.id = pp.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    if (product && product.pricing_plans) {
      product.pricing_plans = JSON.parse(`[${product.pricing_plans}]`);
      product.features = JSON.parse(product.features || '[]');
    }

    return product;
  }

  async create(productData) {
    const { id, name, category, description, features, image, popular, discount, pricing_plans } = productData;
    
    // Insert product
    await this.db.run(`
      INSERT INTO products (id, name, category, description, features, image, popular, discount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, category, description, JSON.stringify(features), image, popular ? 1 : 0, discount]);

    // Insert pricing plans
    if (pricing_plans && pricing_plans.length > 0) {
      for (const plan of pricing_plans) {
        await this.db.run(`
          INSERT INTO pricing_plans (product_id, plan_type, duration, price, original_price, stock_status)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [id, plan.plan_type, plan.duration, plan.price, plan.original_price, plan.stock_status || 'available']);
      }
    }

    return await this.getById(id);
  }

  async update(id, productData) {
    const { name, category, description, features, image, popular, discount, pricing_plans } = productData;
    
    // Update product
    await this.db.run(`
      UPDATE products 
      SET name = ?, category = ?, description = ?, features = ?, image = ?, popular = ?, discount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, category, description, JSON.stringify(features), image, popular ? 1 : 0, discount, id]);

    // Delete existing pricing plans and re-insert
    await this.db.run(`DELETE FROM pricing_plans WHERE product_id = ?`, [id]);
    
    if (pricing_plans && pricing_plans.length > 0) {
      for (const plan of pricing_plans) {
        await this.db.run(`
          INSERT INTO pricing_plans (product_id, plan_type, duration, price, original_price, stock_status)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [id, plan.plan_type, plan.duration, plan.price, plan.original_price, plan.stock_status || 'available']);
      }
    }

    return await this.getById(id);
  }

  async delete(id) {
    await this.db.run(`DELETE FROM pricing_plans WHERE product_id = ?`, [id]);
    await this.db.run(`DELETE FROM products WHERE id = ?`, [id]);
    return true;
  }

  async getByCategory(category) {
    return await this.db.all(`
      SELECT p.*, 
             GROUP_CONCAT(
               json_object(
                 'plan_type', pp.plan_type,
                 'duration', pp.duration,
                 'price', pp.price,
                 'original_price', pp.original_price,
                 'stock_status', pp.stock_status
               )
             ) as pricing_plans
      FROM products p
      LEFT JOIN pricing_plans pp ON p.id = pp.product_id
      WHERE p.category = ?
      GROUP BY p.id
      ORDER BY p.popular DESC, p.name ASC
    `, [category]);
  }
}

module.exports = Product;
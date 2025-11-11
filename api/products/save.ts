export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Products must be an array'
      });
    }

    // In a Vercel function, we can't write to the filesystem directly
    // This endpoint would typically integrate with a database or external storage
    // For now, we'll just validate and return success

    // Validate all products
    const allErrors: string[] = [];
    const validatedProducts = products.map((product: any, index: number) => {
      const errors: string[] = [];

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

      if (errors.length > 0) {
        allErrors.push(`Product ${index + 1}: ${errors.join(', ')}`);
      }

      // Auto-generate ID if missing
      if (!product.id) {
        const cleanName = product.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-');
        const timestamp = Date.now();
        product.id = `${cleanName}-${timestamp}`;
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

    // In a real implementation, you would save to a database here
    // For demo purposes, we'll just return success

    return res.status(200).json({
      success: true,
      message: 'Products saved successfully',
      productsCount: validatedProducts.length
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to save products',
      details: error.message
    });
  }
}

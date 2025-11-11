export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
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

    // In a Vercel function, we can't write to the filesystem in the traditional way
    // For demo purposes, we'll just return success
    // In a production environment, you would save this to a database or external service

    return res.status(200).json({
      success: true,
      message: 'Order saved successfully',
      order
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to save order',
      details: error.message
    });
  }
}

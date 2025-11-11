// Simple in-memory products as fallback; in real use, connect to DB
const products = [
  {
    id: 'grammarly-premium',
    name: 'Grammarly Premium',
    category: 'Productivity',
    price: { monthly: 4.99, yearly: 39.99 },
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Streaming',
    price: { monthly: 3.99, yearly: 34.99 },
  },
];

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    // accept WhatsApp orders or product creation
    const body = req.body || {};
    return res.status(201).json({ received: true, body });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}

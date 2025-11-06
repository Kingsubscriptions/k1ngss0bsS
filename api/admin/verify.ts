import jwt from 'jsonwebtoken';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'POST') {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as jwt.JwtPayload;

        // Check if token has admin role
        if (decoded.role !== 'admin') {
          return res.status(403).json({ error: 'Invalid token role' });
        }

        return res.status(200).json({
          valid: true,
          message: 'Token is valid'
        });
      } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Verify API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

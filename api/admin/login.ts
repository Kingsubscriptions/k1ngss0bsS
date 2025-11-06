import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SETTINGS_FILE = path.join(process.cwd(), 'server', 'settings.json');

// Enhanced rate limiting with account lockout (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number; lockoutUntil?: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5; // 5 attempts per window
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes lockout after max attempts

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count, resetTime: record.resetTime };
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'POST') {
      // Get client IP for rate limiting
      const clientIP = req.headers['x-forwarded-for'] ||
                      req.headers['x-real-ip'] ||
                      req.connection.remoteAddress ||
                      req.socket.remoteAddress ||
                      'unknown';

      // Check rate limit
      const rateLimit = checkRateLimit(clientIP);
      if (!rateLimit.allowed) {
        const resetInSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
        res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
        res.setHeader('X-RateLimit-Reset', rateLimit.resetTime);
        res.setHeader('Retry-After', resetInSeconds);
        return res.status(429).json({
          error: 'Too many login attempts. Please try again later.',
          retryAfter: resetInSeconds
        });
      }

      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      // Basic input sanitization
      if (typeof password !== 'string' || password.length > 100) {
        return res.status(400).json({ error: 'Invalid password format' });
      }

      try {
        // Read settings to get admin password
        const settingsData = await fs.readFile(SETTINGS_FILE, 'utf8');
        const settings = JSON.parse(settingsData);

        if (!settings.admin_password) {
          return res.status(500).json({ error: 'Admin password not configured' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, settings.admin_password);

        if (!isValidPassword) {
          // Set rate limit headers even on failure
          res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
          res.setHeader('X-RateLimit-Reset', rateLimit.resetTime);
          return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate JWT token with secure secret
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || jwtSecret === 'default_secret') {
          console.error('JWT_SECRET not properly configured');
          return res.status(500).json({ error: 'Server configuration error' });
        }

        const token = jwt.sign(
          {
            role: 'admin',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          },
          jwtSecret,
          { expiresIn: '24h' }
        );

        // Clear rate limit on successful login
        rateLimitStore.delete(clientIP);

        return res.status(200).json({
          token,
          message: 'Login successful'
        });
      } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
      }
    }

    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

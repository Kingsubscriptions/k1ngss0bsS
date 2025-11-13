import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Middleware to verify user token
const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check for admin role
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

// Get all giveaway accounts (authenticated users)
router.get('/', verifyUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('free_giveaways')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch giveaway accounts.' });
  }
});

// Add a new giveaway account (admin only)
router.post('/', verifyUser, verifyAdmin, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('free_giveaways')
      .insert([{ email, password }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add giveaway account.' });
  }
});

// Delete a giveaway account (admin only)
router.delete('/:id', verifyUser, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('free_giveaways')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete giveaway account.' });
  }
});


export default router;

import express from 'express';
import { supabase } from '../lib/supabase.js';
import { verifyAdmin } from '../middleware/auth.js'; // Assuming a shared auth middleware

const router = express.Router();

// --- Giveaway Page Content Management ---

// Get the giveaway page content
router.get('/content', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('giveaway_page_content')
            .select('*')
            .limit(1)
            .single(); // We only ever want the first row

        if (error) throw error;
        res.json(data || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch giveaway page content', details: error.message });
    }
});

// Update the giveaway page content
router.post('/content', verifyAdmin, async (req, res) => {
    const content = req.body;
    try {
        const { data, error } = await supabase
            .from('giveaway_page_content')
            .update(content)
            .eq('id', 1) // Always update the single row
            .select();

        if (error) throw error;
        res.json({ message: 'Giveaway page content updated successfully', data: data[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update giveaway page content', details: error.message });
    }
});

// --- Individual Giveaway Item Management ---

// Get all giveaway items
router.get('/items', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('free_giveaways')
            .select('*')
            .order('ordering', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch giveaway items', details: error.message });
    }
});

// Add a new giveaway item
router.post('/items', verifyAdmin, async (req, res) => {
    const newItem = req.body;
    try {
        const { data, error } = await supabase
            .from('free_giveaways')
            .insert(newItem)
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Giveaway item added', data: data[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add giveaway item', details: error.message });
    }
});

// Update a giveaway item
router.put('/items/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const updatedItem = req.body;
    try {
        const { data, error } = await supabase
            .from('free_giveaways')
            .update(updatedItem)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ message: 'Giveaway item updated', data: data[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update giveaway item', details: error.message });
    }
});

// Delete a giveaway item
router.delete('/items/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('free_giveaways')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Giveaway item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete giveaway item', details: error.message });
    }
});

export default router;

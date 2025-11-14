require('dotenv').config();
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET /api/inventory/logs - Get all inventory logs
router.get('/logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory_logs')
      .select('*')
      .order('changed_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory logs',
      error: err.message
    });
  }
});

// GET /api/inventory/logs/:productId - Get inventory logs for a specific product
router.get('/logs/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('inventory_logs')
      .select('*')
      .eq('product_id', productId)
      .order('changed_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory logs',
      error: err.message
    });
  }
});

// GET /api/inventory/low-stock - Get products with low stock
router.get('/low-stock', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lt('stock', 'min_stock')
      .eq('is_active', true)
      .order('stock', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: err.message
    });
  }
});

// GET /api/inventory/price-changes - Get all price changes
router.get('/price-changes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('price_changes')
      .select('*')
      .order('changed_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price changes',
      error: err.message
    });
  }
});

// GET /api/inventory/price-changes/:productId - Get price changes for a specific product
router.get('/price-changes/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('price_changes')
      .select('*')
      .eq('product_id', productId)
      .order('changed_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching price changes',
      error: err.message
    });
  }
});

module.exports = router;
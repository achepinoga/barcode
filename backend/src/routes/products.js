require('dotenv').config();
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: err.message
    });
  }
});

// GET /api/products/barcode/:barcode - Get product by barcode
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: err.message
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: err.message
    });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category, description, image_url, sku, username } = req.body;

    // Validation
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    // Get current product data for logging
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update product
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (sku !== undefined) updateData.sku = sku;
    updateData.updated_at = new Date();

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log price change if applicable
    if (price !== undefined && price !== currentProduct.price) {
      const { error: priceLogError } = await supabase
        .from('price_changes')
        .insert({
          product_id: id,
          previous_price: currentProduct.price,
          new_price: price,
          reason: 'Manual update',
          changed_by: username || 'unknown'
        });

      if (priceLogError) console.error('Error logging price change:', priceLogError);
    }

    // Log stock change if applicable
    if (stock !== undefined && stock !== currentProduct.stock) {
      const changeAmount = stock - currentProduct.stock;
      const { error: stockLogError } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: id,
          previous_stock: currentProduct.stock,
          new_stock: stock,
          change_amount: changeAmount,
          reason: 'Manual adjustment',
          changed_by: username || 'unknown'
        });

      if (stockLogError) console.error('Error logging stock change:', stockLogError);
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: err.message
    });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const { barcode, name, category, price, cost, stock, min_stock, description, image_url, sku } = req.body;

    // Validation
    if (!barcode || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: barcode, name, price'
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        barcode,
        name,
        category,
        price,
        cost,
        stock: stock || 0,
        min_stock: min_stock || 0,
        description,
        image_url,
        sku
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: err.message
    });
  }
});

// DELETE /api/products/:id - Delete product (hard delete - permanent removal)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: err.message
    });
  }
});

module.exports = router;
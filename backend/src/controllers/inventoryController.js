const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const { db, uuidv4 } = require('../config/database');
const { generateNextNumber } = require('./numberGenerationController');

const getInventory = async (req, res) => {
  try {
    const { category, location, lowStock, search } = req.query;
    
    let query = `
      SELECT 
        id,
        item_code as sku,
        name,
        description,
        category_id as category,
        current_stock as quantity,
        unit_of_measure as unit,
        selling_price as price,
        supplier,
        location,
        minimum_stock as minStock,
        created_at as createdAt,
        updated_at as updatedAt
      FROM inventory_items 
      WHERE is_active = true
    `;
    
    const params = [];

    if (search) {
      query += ` AND (MATCH(name, description) AGAINST(?) OR name LIKE ? OR description LIKE ? OR item_code LIKE ? OR supplier LIKE ?)`;
      params.push(search, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (category) {
      query += ` AND category_id LIKE ?`;
      params.push(`%${category}%`);
    }
    
    if (location) {
      query += ` AND location LIKE ?`;
      params.push(`%${location}%`);
    }
    
    if (lowStock === 'true') {
      query += ` AND current_stock <= minimum_stock`;
    }
    
    query += ` ORDER BY name ASC`;
    
    const [inventoryItems] = await db.execute(query, params);
    
    res.json({
      success: true,
      data: inventoryItems,
      total: inventoryItems.length
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message
    });
  }
};

const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [items] = await db.execute(`
      SELECT 
        id,
        item_code as sku,
        name,
        description,
        category_id as category,
        current_stock as quantity,
        unit_of_measure as unit,
        selling_price as price,
        supplier,
        location,
        minimum_stock as minStock,
        created_at as createdAt,
        updated_at as updatedAt
      FROM inventory_items 
      WHERE id = ? AND is_active = true
    `, [id]);
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.json({
      success: true,
      data: items[0]
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory item',
      error: error.message
    });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      quantity,
      unit,
      price,
      supplier,
      location,
      minStock,
      description
    } = req.body;
    
    // Validate required fields
    if (!name || !sku || !category || quantity === undefined || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if SKU already exists
    const [existingItems] = await db.execute('SELECT id FROM inventory_items WHERE item_code = ?', [sku]);
    if (existingItems.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    
    const id = uuidv4();
    
    // Insert new inventory item
    await db.execute(`
      INSERT INTO inventory_items (
        id, item_code, name, description, category_id, current_stock, 
        unit_of_measure, selling_price, supplier, location, minimum_stock, 
        is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?)
    `, [
      id,
      sku,
      name,
      description || '',
      category,
      parseFloat(quantity),
      unit || 'pieces',
      parseFloat(price),
      supplier || '',
      location || 'Main Warehouse',
      parseInt(minStock) || 10,
      req.user.id
    ]);
    
    // Get the created item
    const [newItems] = await db.execute(`
      SELECT 
        id,
        item_code as sku,
        name,
        description,
        category_id as category,
        current_stock as quantity,
        unit_of_measure as unit,
        selling_price as price,
        supplier,
        location,
        minimum_stock as minStock,
        created_at as createdAt,
        updated_at as updatedAt
      FROM inventory_items 
      WHERE id = ?
    `, [id]);
    
    res.status(201).json({
      success: true,
      data: newItems[0],
      message: 'Inventory item created successfully'
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create inventory item',
      error: error.message
    });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      category,
      quantity,
      unit,
      price,
      supplier,
      location,
      minStock,
      description
    } = req.body;
    
    // Check if item exists
    const [existingItems] = await db.execute('SELECT id FROM inventory_items WHERE id = ?', [id]);
    if (existingItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // If SKU is being updated, check if new SKU already exists
    if (sku) {
      const [skuItems] = await db.execute('SELECT id FROM inventory_items WHERE item_code = ? AND id != ?', [sku, id]);
      if (skuItems.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }
    
    // Update the item
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (sku !== undefined) {
      updates.push('item_code = ?');
      params.push(sku);
    }
    if (category !== undefined) {
      updates.push('category_id = ?');
      params.push(category);
    }
    if (quantity !== undefined) {
      updates.push('current_stock = ?');
      params.push(parseFloat(quantity));
    }
    if (unit !== undefined) {
      updates.push('unit_of_measure = ?');
      params.push(unit);
    }
    if (price !== undefined) {
      updates.push('selling_price = ?');
      params.push(parseFloat(price));
    }
    if (supplier !== undefined) {
      updates.push('supplier = ?');
      params.push(supplier);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      params.push(location);
    }
    if (minStock !== undefined) {
      updates.push('minimum_stock = ?');
      params.push(parseInt(minStock));
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    params.push(id);
    
    await db.execute(`
      UPDATE inventory_items 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, params);
    
    // Get the updated item
    const [updatedItems] = await db.execute(`
      SELECT 
        id,
        item_code as sku,
        name,
        description,
        category_id as category,
        current_stock as quantity,
        unit_of_measure as unit,
        selling_price as price,
        supplier,
        location,
        minimum_stock as minStock,
        created_at as createdAt,
        updated_at as updatedAt
      FROM inventory_items 
      WHERE id = ?
    `, [id]);
    
    res.json({
      success: true,
      data: updatedItems[0],
      message: 'Inventory item updated successfully'
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item',
      error: error.message
    });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the item before deletion
    const [items] = await db.execute(`
      SELECT 
        id,
        item_code as sku,
        name,
        description,
        category_id as category,
        current_stock as quantity,
        unit_of_measure as unit,
        selling_price as price,
        supplier,
        location,
        minimum_stock as minStock,
        created_at as createdAt,
        updated_at as updatedAt
      FROM inventory_items 
      WHERE id = ?
    `, [id]);
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    // Soft delete by setting is_active to false
    await db.execute(
      'UPDATE inventory_items SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: items[0],
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory item',
      error: error.message
    });
  }
};

const adjustInventoryStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment, reason } = req.body;
    
    if (!adjustment || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment amount and reason are required'
      });
    }
    
    // Get current item details
    const [items] = await db.execute(
      'SELECT current_stock, name FROM inventory_items WHERE id = ? AND is_active = true',
      [id]
    );
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    const currentQuantity = items[0].current_stock;
    const newQuantity = currentQuantity + parseFloat(adjustment);
    
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for this adjustment'
      });
    }
    
    // Update the stock
    await db.execute(
      'UPDATE inventory_items SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQuantity, id]
    );
    
    // Log the adjustment in stock_movements table
    const movementId = uuidv4();
    const movementNumber = await generateNextNumber('STOCK_MOVEMENT');
    
    await db.execute(`
      INSERT INTO stock_movements (
        id, movement_number, item_id, movement_type, quantity, 
        reason, movement_date, created_by
      ) VALUES (?, ?, ?, 'adjustment', ?, ?, CURDATE(), ?)
    `, [movementId, movementNumber, id, parseFloat(adjustment), reason, req.user.id]);
    
    // Get the updated item
    const [updatedItems] = await db.execute(`
      SELECT 
        id,
        item_code as sku,
        name,
        description,
        category_id as category,
        current_stock as quantity,
        unit_of_measure as unit,
        selling_price as price,
        supplier,
        location,
        minimum_stock as minStock,
        created_at as createdAt,
        updated_at as updatedAt
      FROM inventory_items 
      WHERE id = ?
    `, [id]);
    
    const adjustmentLog = {
      itemId: id,
      adjustment: parseFloat(adjustment),
      reason,
      previousQuantity: currentQuantity,
      newQuantity,
      userId: req.user.id,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedItems[0],
      adjustment: adjustmentLog,
      message: 'Stock adjustment completed successfully'
    });
  } catch (error) {
    console.error('Error adjusting inventory stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to adjust inventory stock',
      error: error.message
    });
  }
};

const getInventoryStats = async (req, res) => {
  try {
    // Get total items and value
    const [totalStats] = await db.execute(`
      SELECT 
        COUNT(*) as totalItems,
        SUM(current_stock * selling_price) as totalValue
      FROM inventory_items 
      WHERE is_active = true
    `);
    
    // Get low stock items count
    const [lowStockStats] = await db.execute(`
      SELECT COUNT(*) as lowStockItems
      FROM inventory_items 
      WHERE is_active = true AND current_stock <= minimum_stock
    `);
    
    // Get category stats
    const [categoryStats] = await db.execute(`
      SELECT 
        category_id as category,
        COUNT(*) as itemCount,
        SUM(current_stock * selling_price) as totalValue
      FROM inventory_items 
      WHERE is_active = true
      GROUP BY category_id
    `);
    
    // Get recently updated items
    const [recentlyUpdated] = await db.execute(`
      SELECT 
        id,
        item_code as sku,
        name,
        description,
        category_id as category,
        current_stock as quantity,
        unit_of_measure as unit,
        selling_price as price,
        supplier,
        location,
        minimum_stock as minStock,
        created_at as createdAt,
        updated_at as updatedAt
      FROM inventory_items 
      WHERE is_active = true
      ORDER BY updated_at DESC
      LIMIT 5
    `);
    
    res.json({
      success: true,
      data: {
        totalItems: totalStats[0].totalItems,
        totalValue: parseFloat(totalStats[0].totalValue || 0),
        lowStockItems: lowStockStats[0].lowStockItems,
        categories: categoryStats.length,
        categoryBreakdown: categoryStats,
        recentlyUpdated
      }
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory statistics',
      error: error.message
    });
  }
};

module.exports = {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryStock,
  getInventoryStats
};

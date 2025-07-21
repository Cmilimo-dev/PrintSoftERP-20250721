const { db, uuidv4 } = require('../config/database');

// Get all parts
const getParts = async (req, res) => {
  try {
    const { order, search, category, status } = req.query;
    
    let query = `
      SELECT 
        i.id,
        i.sku,
        i.name,
        i.description,
        i.category_id,
        pc.name as category_name,
        i.quantity,
        i.unit,
        i.price,
        i.supplier,
        i.location,
        i.min_stock as minStock,
        i.is_active,
        i.created_at as createdAt,
        i.updated_at as updatedAt
      FROM inventory i
      LEFT JOIN product_categories pc ON i.category_id = pc.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (i.name LIKE ? OR i.sku LIKE ? OR i.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (category) {
      query += ` AND i.category_id = ?`;
      params.push(category);
    }
    
    if (status) {
      if (status === 'active') {
        query += ` AND i.is_active = 1`;
      } else if (status === 'inactive') {
        query += ` AND i.is_active = 0`;
      }
    }
    
    // Handle ordering
    if (order) {
      const [field, direction] = order.split('.');
      const validFields = ['name', 'sku', 'quantity', 'price', 'created_at'];
      const validDirections = ['asc', 'desc'];
      
      if (validFields.includes(field) && validDirections.includes(direction)) {
        query += ` ORDER BY i.${field} ${direction.toUpperCase()}`;
      } else {
        query += ` ORDER BY i.name ASC`;
      }
    } else {
      query += ` ORDER BY i.name ASC`;
    }
    
    const [parts] = await db.execute(query, params);
    
    res.json({
      success: true,
      data: parts,
      total: parts.length
    });
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parts',
      error: error.message
    });
  }
};

// Get a single part
const getPart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [parts] = await db.execute(`
      SELECT 
        i.id,
        i.sku,
        i.name,
        i.description,
        i.category_id,
        pc.name as category_name,
        i.quantity,
        i.unit,
        i.price,
        i.supplier,
        i.location,
        i.min_stock as minStock,
        i.is_active,
        i.created_at as createdAt,
        i.updated_at as updatedAt
      FROM inventory i
      LEFT JOIN product_categories pc ON i.category_id = pc.id
      WHERE i.id = ?
    `, [id]);
    
    if (parts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Part not found'
      });
    }
    
    res.json({
      success: true,
      data: parts[0]
    });
  } catch (error) {
    console.error('Error fetching part:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch part',
      error: error.message
    });
  }
};

// Create a new part
const createPart = async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      category_id,
      quantity = 0,
      unit = 'pcs',
      price = 0,
      supplier,
      location,
      minStock = 0
    } = req.body;
    
    // Validate required fields
    if (!sku || !name) {
      return res.status(400).json({
        success: false,
        message: 'SKU and name are required'
      });
    }
    
    // Check if SKU already exists
    const [existingParts] = await db.execute('SELECT id FROM inventory WHERE sku = ?', [sku]);
    if (existingParts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    
    const partId = uuidv4();
    
    await db.execute(`
      INSERT INTO inventory (
        id, sku, name, description, category_id, quantity, unit, price, 
        supplier, location, min_stock, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `, [
      partId,
      sku,
      name,
      description,
      category_id,
      quantity,
      unit,
      price,
      supplier,
      location,
      minStock
    ]);
    
    // Get the created part
    const [createdParts] = await db.execute(`
      SELECT 
        i.id,
        i.sku,
        i.name,
        i.description,
        i.category_id,
        pc.name as category_name,
        i.quantity,
        i.unit,
        i.price,
        i.supplier,
        i.location,
        i.min_stock as minStock,
        i.is_active,
        i.created_at as createdAt,
        i.updated_at as updatedAt
      FROM inventory i
      LEFT JOIN product_categories pc ON i.category_id = pc.id
      WHERE i.id = ?
    `, [partId]);
    
    res.status(201).json({
      success: true,
      data: createdParts[0],
      message: 'Part created successfully'
    });
  } catch (error) {
    console.error('Error creating part:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create part',
      error: error.message
    });
  }
};

// Update a part
const updatePart = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if part exists
    const [existingParts] = await db.execute('SELECT id FROM inventory WHERE id = ?', [id]);
    if (existingParts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Part not found'
      });
    }
    
    // If SKU is being updated, check for duplicates
    if (updates.sku) {
      const [duplicates] = await db.execute('SELECT id FROM inventory WHERE sku = ? AND id != ?', [updates.sku, id]);
      if (duplicates.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }
    
    // Build update query
    const updateFields = [];
    const params = [];
    
    const allowedFields = ['sku', 'name', 'description', 'category_id', 'quantity', 'unit', 'price', 'supplier', 'location', 'min_stock', 'is_active'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(updates[field]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = NOW()');
    params.push(id);
    
    await db.execute(`
      UPDATE inventory 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `, params);
    
    res.json({
      success: true,
      message: 'Part updated successfully'
    });
  } catch (error) {
    console.error('Error updating part:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update part',
      error: error.message
    });
  }
};

// Delete a part
const deletePart = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if part exists
    const [existingParts] = await db.execute('SELECT id FROM inventory WHERE id = ?', [id]);
    if (existingParts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Part not found'
      });
    }
    
    // Soft delete - set is_active to 0
    await db.execute('UPDATE inventory SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Part deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting part:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete part',
      error: error.message
    });
  }
};

// Adjust part stock
const adjustPartStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, adjustment_type, reason } = req.body;
    
    if (!quantity || !adjustment_type) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and adjustment type are required'
      });
    }
    
    // Check if part exists
    const [existingParts] = await db.execute('SELECT quantity FROM inventory WHERE id = ?', [id]);
    if (existingParts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Part not found'
      });
    }
    
    const currentQuantity = parseFloat(existingParts[0].quantity);
    let newQuantity;
    
    if (adjustment_type === 'increase') {
      newQuantity = currentQuantity + parseFloat(quantity);
    } else if (adjustment_type === 'decrease') {
      newQuantity = currentQuantity - parseFloat(quantity);
      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid adjustment type. Use "increase" or "decrease"'
      });
    }
    
    // Update the quantity
    await db.execute('UPDATE inventory SET quantity = ?, updated_at = NOW() WHERE id = ?', [newQuantity, id]);
    
    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        previousQuantity: currentQuantity,
        newQuantity: newQuantity,
        adjustment: parseFloat(quantity),
        adjustmentType: adjustment_type
      }
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to adjust stock',
      error: error.message
    });
  }
};

module.exports = {
  getParts,
  getPart,
  createPart,
  updatePart,
  deletePart,
  adjustPartStock
};

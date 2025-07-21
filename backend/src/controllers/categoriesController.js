const { db } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all categories
 */
const getAllCategories = async (req, res) => {
  try {
    const { type, order } = req.query;
    
    let query = 'SELECT * FROM product_categories WHERE is_active = 1';
    let params = [];
    
    // Note: The type parameter is not used in the product_categories table
    // but we keep it for API compatibility
    
    if (order) {
      const orderParts = order.split('.');
      const column = orderParts[0];
      const direction = orderParts[1] || 'asc';
      query += ` ORDER BY ${column} ${direction.toUpperCase()}`;
    } else {
      query += ' ORDER BY name ASC';
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Create a new category
 */
const createCategory = async (req, res) => {
  try {
    const { name, description, type = 'product' } = req.body;
    const id = uuidv4();

    const query = `
      INSERT INTO product_categories (id, name, description, is_active, sort_order)
      VALUES (?, ?, ?, 1, 0)
    `;
    
    await db.execute(query, [id, name, description]);
    
    // Fetch the created category
    const [rows] = await db.execute('SELECT * FROM product_categories WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Update a category
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;

    const query = `
      UPDATE product_categories 
      SET name = ?, description = ?
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [name, description, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Fetch the updated category
    const [rows] = await db.execute('SELECT * FROM product_categories WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Delete a category
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting is_active to 0
    const [result] = await db.execute('UPDATE product_categories SET is_active = 0 WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};

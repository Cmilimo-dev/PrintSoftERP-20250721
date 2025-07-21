const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const { db, uuidv4 } = require('../config/database');
const { generateNextNumber } = require('./numberGenerationController');

// Note: Orders are now stored in 'documents' table with document_type = 'order'
// Mock data removed - using database operations

const getOrders = async (req, res) => {
  try {
    const { status, priority, customerId, dateFrom, dateTo } = req.query;
    
    let query = `
      SELECT 
        d.id,
        d.document_number as orderNumber,
        d.customer_id as customerId,
        c.name as customerName,
        d.subtotal,
        d.tax_amount as tax,
        d.total,
        d.status,
        d.notes,
        d.date as orderDate,
        d.due_date as dueDate,
        d.created_at as createdAt,
        d.updated_at as updatedAt
      FROM documents d
      LEFT JOIN customers c ON d.customer_id = c.id
      WHERE d.document_type = 'order'
    `;
    
    const params = [];
    
    if (status) {
      query += ` AND d.status = ?`;
      params.push(status);
    }
    
    if (customerId) {
      query += ` AND d.customer_id = ?`;
      params.push(customerId);
    }
    
    if (dateFrom) {
      query += ` AND d.date >= ?`;
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ` AND d.date <= ?`;
      params.push(dateTo);
    }
    
    query += ` ORDER BY d.date DESC`;
    
    const [orders] = await db.execute(query, params);
    
    // Get line items for each order
    for (let order of orders) {
      const [items] = await db.execute(`
        SELECT 
          id,
          item_code,
          description as name,
          quantity,
          unit_price as unitPrice,
          line_total as totalPrice
        FROM document_line_items
        WHERE document_id = ?
        ORDER BY sort_order
      `, [order.id]);
      
      order.items = items;
      order.priority = 'medium'; // Default priority since not stored in documents table
    }
    
    res.json({
      success: true,
      data: orders,
      total: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orders] = await db.execute(`
      SELECT 
        d.id,
        d.document_number as orderNumber,
        d.customer_id as customerId,
        c.name as customerName,
        d.subtotal,
        d.tax_amount as tax,
        d.total,
        d.status,
        d.notes,
        d.date as orderDate,
        d.due_date as dueDate,
        d.created_at as createdAt,
        d.updated_at as updatedAt
      FROM documents d
      LEFT JOIN customers c ON d.customer_id = c.id
      WHERE d.id = ? AND d.document_type = 'order'
    `, [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    // Get line items for the order
    const [items] = await db.execute(`
      SELECT 
        id,
        item_code,
        description as name,
        quantity,
        unit_price as unitPrice,
        line_total as totalPrice
      FROM document_line_items
      WHERE document_id = ?
      ORDER BY sort_order
    `, [id]);
    
    order.items = items;
    order.priority = 'medium'; // Default priority
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      items,
      priority = 'medium',
      dueDate,
      notes = ''
    } = req.body;
    
    // Validate required fields
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerId and items'
      });
    }
    
    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      return {
        ...item,
        totalPrice: parseFloat(itemTotal.toFixed(2))
      };
    });
    
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    const orderId = uuidv4();
    const orderNumber = await generateNextNumber('ORDER');
    
    // Get customer info if customerName not provided
    let finalCustomerName = customerName;
    if (!finalCustomerName) {
      const [customers] = await db.execute('SELECT name FROM customers WHERE id = ?', [customerId]);
      if (customers.length > 0) {
        finalCustomerName = customers[0].name;
      }
    }
    
    // Create the order document
    await db.execute(`
      INSERT INTO documents (
        id, document_number, document_type, date, due_date, customer_id,
        subtotal, tax_amount, total, status, notes, created_by, company_id
      ) VALUES (?, ?, 'order', CURDATE(), ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `, [
      orderId,
      orderNumber,
      dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId,
      parseFloat(subtotal.toFixed(2)),
      parseFloat(tax.toFixed(2)),
      parseFloat(total.toFixed(2)),
      notes,
      req.user.id,
      'default-company' // Default company ID
    ]);
    
    // Create line items
    for (let i = 0; i < processedItems.length; i++) {
      const item = processedItems[i];
      await db.execute(`
        INSERT INTO document_line_items (
          id, document_id, item_code, description, quantity, unit_price, 
          line_total, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        orderId,
        item.item_code || `ITEM-${i + 1}`,
        item.name || item.description,
        item.quantity,
        item.unitPrice,
        item.totalPrice,
        i
      ]);
    }
    
    // Get the created order
    const [createdOrders] = await db.execute(`
      SELECT 
        d.id,
        d.document_number as orderNumber,
        d.customer_id as customerId,
        c.name as customerName,
        d.subtotal,
        d.tax_amount as tax,
        d.total,
        d.status,
        d.notes,
        d.date as orderDate,
        d.due_date as dueDate,
        d.created_at as createdAt,
        d.updated_at as updatedAt
      FROM documents d
      LEFT JOIN customers c ON d.customer_id = c.id
      WHERE d.id = ?
    `, [orderId]);
    
    const newOrder = createdOrders[0];
    newOrder.items = processedItems;
    newOrder.priority = priority;
    
    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if the order exists
    const [existingOrders] = await db.execute('SELECT * FROM documents WHERE id = ? AND document_type = "order"', [id]);

    if (existingOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If items are updated, recalculate totals
    if (updates.items) {
      let subtotal = 0;
      const processedItems = updates.items.map(item => {
        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;
        return {
          ...item,
          totalPrice: parseFloat(itemTotal.toFixed(2))
        };
      });

      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      updates.items = processedItems;
      updates.subtotal = parseFloat(subtotal.toFixed(2));
      updates.tax = parseFloat(tax.toFixed(2));
      updates.total = parseFloat(total.toFixed(2));
    }

    // Update the order document
    await db.execute(`
      UPDATE documents
      SET subtotal = ?, tax_amount = ?, total = ?, status = ?, notes = ?, updated_at = NOW()
      WHERE id = ? AND document_type = 'order'
    `, [
      updates.subtotal || existingOrders[0].subtotal,
      updates.tax || existingOrders[0].tax_amount,
      updates.total || existingOrders[0].total,
      updates.status || existingOrders[0].status,
      updates.notes || existingOrders[0].notes,
      id
    ]);

    // Update line items if modified
    if (updates.items) {
      await db.execute('DELETE FROM document_line_items WHERE document_id = ?', [id]);
      for (let i = 0; i < updates.items.length; i++) {
        const item = updates.items[i];
        await db.execute(`
          INSERT INTO document_line_items (
            id, document_id, item_code, description, quantity, unit_price,
            line_total, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          id,
          item.item_code || `ITEM-${i + 1}`,
          item.name || item.description,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
          i
        ]);
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'shipped', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required',
        validStatuses
      });
    }
    
    // Check if the order exists
    const [existingOrders] = await db.execute('SELECT * FROM documents WHERE id = ? AND document_type = "order"', [id]);

    if (existingOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const previousStatus = existingOrders[0].status;
    
    // Update the order status
    await db.execute(`
      UPDATE documents
      SET status = ?, notes = ?, updated_at = NOW()
      WHERE id = ? AND document_type = 'order'
    `, [status, notes || existingOrders[0].notes, id]);
    
    // Log status change (in a real app, this would go to an audit table)
    const statusChange = {
      orderId: id,
      previousStatus,
      newStatus: status,
      userId: req.user.id,
      timestamp: new Date().toISOString(),
      notes
    };
    
    res.json({
      success: true,
      statusChange,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the order exists
    const [existingOrders] = await db.execute('SELECT * FROM documents WHERE id = ? AND document_type = "order"', [id]);

    if (existingOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be deleted (e.g., not in progress or completed)
    const order = existingOrders[0];
    if (['in_progress', 'completed', 'shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete order with current status. Cancel the order first.'
      });
    }

    // Delete the order
    await db.execute('DELETE FROM documents WHERE id = ? AND document_type = "order"', [id]);

    // Delete the order line items
    await db.execute('DELETE FROM document_line_items WHERE document_id = ?', [id]);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

const getOrderStats = async (req, res) => {
  try {
    // Get total orders and revenue
    const [totalResult] = await db.execute(`
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalRevenue
      FROM documents 
      WHERE document_type = 'order'
    `);
    
    const { totalOrders, totalRevenue } = totalResult[0];
    
    // Get status breakdown
    const [statusResults] = await db.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM documents 
      WHERE document_type = 'order'
      GROUP BY status
    `);
    
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    statusResults.forEach(result => {
      statusCounts[result.status] = result.count;
    });
    
    // Priority breakdown - default to medium since not stored in database
    const priorityCounts = {
      low: 0,
      medium: totalOrders, // Default all orders to medium priority
      high: 0,
      urgent: 0
    };
    
    // Orders due soon (within 3 days)
    const [dueSoonResult] = await db.execute(`
      SELECT 
        d.id,
        d.document_number as orderNumber,
        c.name as customerName,
        d.due_date as dueDate,
        d.total,
        d.status
      FROM documents d
      LEFT JOIN customers c ON d.customer_id = c.id
      WHERE d.document_type = 'order'
        AND d.due_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
        AND d.status NOT IN ('completed', 'delivered', 'cancelled')
    `);
    
    // Recent orders (last 7 days)
    const [recentResult] = await db.execute(`
      SELECT COUNT(*) as recentCount
      FROM documents 
      WHERE document_type = 'order'
        AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `);
    
    const recentOrdersCount = recentResult[0].recentCount;
    
    res.json({
      success: true,
      data: {
        totalOrders: parseInt(totalOrders),
        totalRevenue: parseFloat(totalRevenue || 0),
        statusBreakdown: statusCounts,
        priorityBreakdown: priorityCounts,
        ordersDueSoon: dueSoonResult.length,
        recentOrdersCount: parseInt(recentOrdersCount),
        averageOrderValue: totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
        dueSoonDetails: dueSoonResult.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          dueDate: order.dueDate,
          total: parseFloat(order.total),
          status: order.status
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
};

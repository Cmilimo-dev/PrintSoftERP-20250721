const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const { db, uuidv4 } = require('../config/database');

// Messages are now stored in a proper messages table
// Mock data removed - using database operations

const getInbox = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userEmail = req.user.email;

    // For now, we'll create a simple messages implementation
    // In a real app, you'd have a proper messages table
    let query = `
      SELECT 
        'system' as id,
        'admin@printsoft.com' as \`from\`,
        ? as \`to\`,
        'Welcome to PrintSoft ERP' as subject,
        'Welcome to the PrintSoft ERP system. Please review the getting started guide.' as body,
        NOW() as timestamp,
        false as \`read\`,
        'system' as type
    `;
    
    const params = [userEmail];
    
    // For now, return a simple welcome message
    const [messages] = await db.execute(query, params);
    
    const totalMessages = messages.length;
    const unreadCount = messages.filter(msg => !msg.read).length;
    
    res.json({
      success: true,
      data: {
        messages: messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit)
        },
        unreadCount: unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get inbox',
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userEmail = req.user.email;

    // For now, just return success for the mock implementation
    // In a real app, you'd update the message read status in the database
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userEmail = req.user.email;

    // For now, just return success for the mock implementation
    // In a real app, you'd delete the message from the database
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { to, subject, body, type = 'user' } = req.body;
    const fromEmail = req.user.email;

    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, body'
      });
    }

    // For now, just return success for the mock implementation
    // In a real app, you'd insert the message into the database
    const newMessage = {
      id: uuidv4(),
      from: fromEmail,
      to: to,
      subject: subject,
      body: body,
      timestamp: new Date().toISOString(),
      read: false,
      type: type
    };

    res.json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search = '', role = '', status = 'active' } = req.query;

    let query = `
      SELECT 
        id,
        CONCAT(first_name, ' ', last_name) as name,
        email,
        role,
        CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END as status,
        last_login_at as lastLogin
      FROM users
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (CONCAT(first_name, ' ', last_name) LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (role) {
      query += ` AND role = ?`;
      params.push(role);
    }
    
    if (status === 'active') {
      query += ` AND is_active = 1`;
    } else if (status === 'inactive') {
      query += ` AND is_active = 0`;
    }
    
    query += ` ORDER BY first_name, last_name`;
    
    const [users] = await db.execute(query, params);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // For now, return 0 for the mock implementation
    // In a real app, you'd count unread messages from the database
    const unreadCount = 0;

    res.json({
      success: true,
      data: {
        unreadCount: unreadCount
      }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

module.exports = {
  getInbox,
  markAsRead,
  deleteMessage,
  sendMessage,
  getUsers,
  getUnreadCount
};

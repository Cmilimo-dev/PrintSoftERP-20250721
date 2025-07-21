const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  getInbox,
  markAsRead,
  deleteMessage,
  sendMessage,
  getUsers,
  getUnreadCount
} = require('../controllers/mailboxController');

// Get inbox messages
router.get('/inbox', authenticateToken, getInbox);

// Get unread message count
router.get('/unread-count', authenticateToken, getUnreadCount);

// Mark message as read
router.put('/messages/:messageId/read', authenticateToken, markAsRead);

// Delete message
router.delete('/messages/:messageId', authenticateToken, deleteMessage);

// Send message
router.post('/send', authenticateToken, sendMessage);

// Get users for messaging
router.get('/users', authenticateToken, getUsers);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryStock,
  getInventoryStats
} = require('../controllers/inventoryController');

// Inventory routes
router.use(authenticateToken);
router.get('/stats', getInventoryStats); // Must be before /:id route
router.get('/', getInventory);
router.get('/:id', getInventoryItem);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.patch('/:id/adjust', adjustInventoryStock);

module.exports = router;

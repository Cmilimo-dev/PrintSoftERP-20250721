const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoriesController');

// All categories routes require authentication
router.use(authenticateToken);

// Categories routes
router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {
  getParts,
  getPart,
  createPart,
  updatePart,
  deletePart,
  adjustPartStock
} = require('../controllers/partsController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Parts routes
router.get('/', getParts);
router.get('/:id', getPart);
router.post('/', createPart);
router.put('/:id', updatePart);
router.delete('/:id', deletePart);
router.patch('/:id/adjust', adjustPartStock);

module.exports = router;

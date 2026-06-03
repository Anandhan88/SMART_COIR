const express = require('express');
const router = express.Router();
const { getInventory, getInventorySummary, updateInventory, addInventory, restockInventory } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getInventory);
router.get('/summary', protect, getInventorySummary);
router.post('/', protect, roleCheck('admin', 'superadmin'), addInventory);
router.put('/:id', protect, roleCheck('admin', 'superadmin'), updateInventory);
router.post('/:id/restock', protect, roleCheck('admin', 'superadmin'), restockInventory);

module.exports = router;

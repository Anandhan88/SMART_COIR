const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier, addPurchase, rateSupplier } = require('../controllers/supplierController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('admin', 'superadmin'), getSuppliers);
router.get('/:id', protect, roleCheck('admin', 'superadmin'), getSupplier);
router.post('/', protect, roleCheck('admin', 'superadmin'), createSupplier);
router.put('/:id', protect, roleCheck('admin', 'superadmin'), updateSupplier);
router.delete('/:id', protect, roleCheck('admin', 'superadmin'), deleteSupplier);
router.post('/:id/purchase', protect, roleCheck('admin', 'superadmin'), addPurchase);
router.put('/:id/rate', protect, roleCheck('admin', 'superadmin'), rateSupplier);

module.exports = router;

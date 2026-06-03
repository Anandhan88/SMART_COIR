const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, updatePaymentStatus, getOrderStats } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, getOrders);
router.get('/stats', protect, roleCheck('admin', 'superadmin'), getOrderStats);
router.get('/:id', protect, getOrder);
router.post('/', protect, roleCheck('client'), createOrder);
router.put('/:id/status', protect, roleCheck('admin', 'superadmin'), updateOrderStatus);
router.put('/:id/payment', protect, roleCheck('admin', 'superadmin'), updatePaymentStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getSalesAnalytics, getProductionAnalytics, getClientDashboard } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/dashboard', protect, roleCheck('admin', 'superadmin'), getDashboardAnalytics);
router.get('/sales', protect, roleCheck('admin', 'superadmin'), getSalesAnalytics);
router.get('/production', protect, roleCheck('admin', 'superadmin'), getProductionAnalytics);
router.get('/client-dashboard', protect, getClientDashboard);

module.exports = router;

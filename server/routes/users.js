const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, getNotifications, markNotificationRead, markAllRead, getAdmins } = require('../controllers/userController');
const { getReports, createReport, updateReport, getProductionSummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// User management
router.get('/admins', protect, getAdmins);
router.get('/', protect, roleCheck('admin', 'superadmin'), getUsers);
router.put('/:id/role', protect, roleCheck('superadmin'), updateUserRole);


// Notifications
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.put('/notifications/read-all', protect, markAllRead);

module.exports = router;

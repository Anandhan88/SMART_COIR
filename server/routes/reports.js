const express = require('express');
const router = express.Router();
const { getReports, createReport, updateReport, getProductionSummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('admin', 'superadmin'), getReports);
router.get('/summary', protect, roleCheck('admin', 'superadmin'), getProductionSummary);
router.post('/', protect, roleCheck('admin', 'superadmin'), createReport);
router.put('/:id', protect, roleCheck('admin', 'superadmin'), updateReport);

module.exports = router;

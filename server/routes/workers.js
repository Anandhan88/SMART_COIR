const express = require('express');
const router = express.Router();
const { getWorkers, getWorker, createWorker, updateWorker, markAttendance, assignTask, getWorkerStats } = require('../controllers/workerController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', protect, roleCheck('admin', 'superadmin'), getWorkers);
router.get('/stats', protect, roleCheck('admin', 'superadmin'), getWorkerStats);
router.get('/:id', protect, roleCheck('admin', 'superadmin'), getWorker);
router.post('/', protect, roleCheck('admin', 'superadmin'), createWorker);
router.put('/:id', protect, roleCheck('admin', 'superadmin'), updateWorker);
router.post('/:id/attendance', protect, roleCheck('admin', 'superadmin'), markAttendance);
router.post('/:id/tasks', protect, roleCheck('admin', 'superadmin'), assignTask);

module.exports = router;

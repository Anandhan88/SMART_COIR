const express = require('express');
const router = express.Router();
const { chatWithAI, getBusinessInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/chat', chatWithAI);
router.get('/insights', protect, roleCheck('admin', 'superadmin'), getBusinessInsights);

module.exports = router;

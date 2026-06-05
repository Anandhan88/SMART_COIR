const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories, uploadImage } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.post('/upload-image', protect, roleCheck('admin', 'superadmin'), uploadImage);
router.get('/:id', getProduct);
router.post('/', protect, roleCheck('admin', 'superadmin'), createProduct);
router.put('/:id', protect, roleCheck('admin', 'superadmin'), updateProduct);
router.delete('/:id', protect, roleCheck('admin', 'superadmin'), deleteProduct);

module.exports = router;

const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12, qualityGrade } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (qualityGrade) query.qualityGrade = qualityGrade;
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    if (sort === 'price-asc') sortOptions['price.amount'] = 1;
    else if (sort === 'price-desc') sortOptions['price.amount'] = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else sortOptions.createdAt = -1;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('supplier', 'name company');

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier', 'name company');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Generate QR Code containing product specifications
    const QRCode = require('qrcode');
    const qrText = JSON.stringify({
      id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: `INR ${product.price?.amount || 0} per ${product.price?.perUnit || 'kg'}`,
      grade: product.qualityGrade
    });
    
    let qrCodeUrl = '';
    try {
      qrCodeUrl = await QRCode.toDataURL(qrText);
    } catch (qrErr) {
      console.error('QR code generation failed:', qrErr);
    }

    res.json({ success: true, data: { ...product.toObject(), qrCodeUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

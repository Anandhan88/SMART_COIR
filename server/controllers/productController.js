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
      query.$or = [
        { sku: search },
        { name: { $regex: search, $options: 'i' } }
      ];
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

    // Generate QR Code containing product SKU or ID
    const QRCode = require('qrcode');
    const qrText = product.sku || product._id.toString();
    
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

// @desc    Upload product image (base64)
// @route   POST /api/products/upload-image
exports.uploadImage = async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid base64 image format' });
    }

    const fs = require('fs');
    const path = require('path');
    const imageBuffer = Buffer.from(matches[2], 'base64');
    const extension = matches[1].split('/')[1] || 'png';
    const uniqueFileName = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
    const uploadPath = path.join(__dirname, '..', 'uploads', uniqueFileName);

    fs.writeFileSync(uploadPath, imageBuffer);

    res.json({
      success: true,
      data: {
        url: `/uploads/${uniqueFileName}`,
        alt: fileName || 'Uploaded product image',
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error saving image', error: error.message });
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

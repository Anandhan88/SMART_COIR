const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['coir-rope', 'coir-yarn', 'coir-bundle', 'raw-coir-fiber', 'coir-mat', 'coir-pith'],
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    maxlength: 200,
  },
  images: [{
    url: String,
    alt: String,
  }],
  qualityGrade: {
    type: String,
    enum: ['Premium', 'Standard', 'Economy', 'Export Grade', 'Industrial'],
    default: 'Standard',
  },
  weight: {
    value: { type: Number, required: true },
    unit: { type: String, default: 'kg', enum: ['kg', 'ton', 'lb'] },
  },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    perUnit: { type: String, default: 'kg' },
  },
  specifications: {
    length: String,
    diameter: String,
    tensileStrength: String,
    moistureContent: String,
    color: String,
    fiberType: String,
  },
  brochureUrl: String,
  sku: {
    type: String,
    unique: true,
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);

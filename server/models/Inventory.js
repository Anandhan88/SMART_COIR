const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  warehouse: {
    type: String,
    required: true,
    default: 'Main Warehouse',
  },
  location: {
    section: String,
    rack: String,
    bin: String,
  },
  minStock: {
    type: Number,
    default: 10,
  },
  maxStock: {
    type: Number,
    default: 1000,
  },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'reserved'],
    default: 'in-stock',
  },
  lastRestocked: {
    type: Date,
    default: Date.now,
  },
  qrCode: String,
  history: [{
    action: { type: String, enum: ['added', 'removed', 'adjusted', 'restocked'] },
    quantity: Number,
    date: { type: Date, default: Date.now },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  }],
}, {
  timestamps: true,
});

// Auto-update status based on quantity
inventorySchema.pre('save', function(next) {
  if (this.quantity <= 0) {
    this.status = 'out-of-stock';
  } else if (this.quantity <= this.minStock) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);

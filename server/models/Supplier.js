const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    required: true,
  },
  contact: {
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
  },
  products: [{
    name: String,
    category: String,
    unitPrice: Number,
  }],
  qualityRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  purchaseHistory: [{
    date: { type: Date, default: Date.now },
    items: [{
      product: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number,
    }],
    totalAmount: Number,
    invoiceNumber: String,
    status: { type: String, enum: ['pending', 'received', 'partial', 'cancelled'], default: 'pending' },
  }],
  paymentTerms: {
    type: String,
    default: 'Net 30',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Supplier', supplierSchema);

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
  },
  revenue: {
    total: { type: Number, default: 0 },
    byProduct: [{
      product: String,
      amount: Number,
    }],
  },
  profit: {
    type: Number,
    default: 0,
  },
  expenses: {
    raw_materials: { type: Number, default: 0 },
    labor: { type: Number, default: 0 },
    logistics: { type: Number, default: 0 },
    overhead: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  production: {
    totalOutput: { type: Number, default: 0 },
    byProduct: [{
      product: String,
      quantity: Number,
      unit: String,
    }],
    wastage: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 },
  },
  sales: {
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
  },
  inventory: {
    totalStock: { type: Number, default: 0 },
    lowStockItems: { type: Number, default: 0 },
    outOfStockItems: { type: Number, default: 0 },
  },
  customers: {
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    totalActive: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

analyticsSchema.index({ date: 1, type: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);

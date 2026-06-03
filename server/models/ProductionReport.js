const mongoose = require('mongoose');

const productionReportSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'night'],
    default: 'morning',
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
  },
  machineStatus: [{
    machineId: String,
    machineName: String,
    status: { type: String, enum: ['running', 'idle', 'maintenance', 'breakdown'], default: 'running' },
    operatingHours: Number,
    output: Number,
    notes: String,
  }],
  dailyOutput: {
    totalUnits: { type: Number, default: 0 },
    byProduct: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      quantity: Number,
      unit: String,
    }],
  },
  rawMaterialUsage: [{
    material: String,
    quantityUsed: Number,
    unit: String,
  }],
  wastage: {
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' },
    percentage: { type: Number, default: 0 },
    reason: String,
  },
  qualityChecks: [{
    product: String,
    samplesTested: Number,
    passedSamples: Number,
    failedSamples: Number,
    notes: String,
  }],
  issues: [{
    type: String,
    description: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    resolved: Boolean,
    resolvedBy: String,
  }],
  notes: String,
}, {
  timestamps: true,
});

productionReportSchema.index({ date: -1 });

module.exports = mongoose.model('ProductionReport', productionReportSchema);

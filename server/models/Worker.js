const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  employeeId: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['machine-operator', 'fiber-processor', 'quality-inspector', 'packaging', 'supervisor', 'driver', 'warehouse', 'maintenance'],
  },
  department: {
    type: String,
    required: true,
    enum: ['production', 'quality', 'packaging', 'logistics', 'maintenance', 'warehouse'],
  },
  contact: {
    phone: String,
    email: String,
    address: String,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  salary: {
    basic: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
  },
  attendance: [{
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'half-day', 'leave', 'holiday'], required: true },
    checkIn: String,
    checkOut: String,
  }],
  productivity: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  assignedTasks: [{
    title: String,
    description: String,
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    assignedDate: { type: Date, default: Date.now },
    dueDate: Date,
    completedDate: Date,
  }],
  performanceReviews: [{
    date: Date,
    rating: { type: Number, min: 1, max: 5 },
    reviewer: String,
    comments: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  avatar: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Worker', workerSchema);

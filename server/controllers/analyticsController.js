const Analytics = require('../models/Analytics');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Inventory = require('../models/Inventory');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalProducts = await Product.countDocuments({ isActive: true });

    const recentOrders = await Order.find()
      .populate('client', 'name company')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly revenue for last 12 months
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$grandTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    // Top products by order count
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalOrdered: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
    ]);

    // Inventory alerts
    const lowStockCount = await Inventory.countDocuments({ status: 'low-stock' });
    const outOfStockCount = await Inventory.countDocuments({ status: 'out-of-stock' });

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        pendingOrders,
        totalClients,
        totalProducts,
        recentOrders,
        monthlyRevenue,
        topProducts,
        inventoryAlerts: { lowStock: lowStockCount, outOfStock: outOfStockCount },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    const match = {};
    if (startDate && endDate) {
      match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    let groupBy;
    if (period === 'daily') {
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    } else if (period === 'weekly') {
      groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
    } else {
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    }

    const salesData = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$grandTotal' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$grandTotal' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Sales by category
    const salesByCategory = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalSales: { $sum: '$items.totalPrice' },
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    res.json({ success: true, data: { salesData, salesByCategory } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get production analytics
// @route   GET /api/analytics/production
exports.getProductionAnalytics = async (req, res) => {
  try {
    const ProductionReport = require('../models/ProductionReport');
    const reports = await ProductionReport.find()
      .sort({ date: -1 })
      .limit(30);

    const dailyOutput = reports.map(r => ({
      date: r.date,
      totalUnits: r.dailyOutput.totalUnits,
      wastage: r.wastage.quantity,
      efficiency: r.wastage.percentage ? 100 - r.wastage.percentage : 95,
    }));

    res.json({ success: true, data: { dailyOutput, reports } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get client dashboard data
// @route   GET /api/analytics/client-dashboard
exports.getClientDashboard = async (req, res) => {
  try {
    const clientOrders = await Order.find({ client: req.user.id })
      .populate('items.product', 'name category images')
      .sort({ createdAt: -1 })
      .limit(10);

    const orderStats = await Order.aggregate([
      { $match: { client: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const totalSpent = await Order.aggregate([
      { $match: { client: req.user._id, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    res.json({
      success: true,
      data: {
        recentOrders: clientOrders,
        orderStats,
        totalSpent: totalSpent[0]?.total || 0,
        totalOrders: await Order.countDocuments({ client: req.user.id }),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

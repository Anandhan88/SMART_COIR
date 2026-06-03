const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');

// @desc    Get all orders (Admin) or user orders (Client)
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort } = req.query;
    const query = {};

    // Clients only see their own orders
    if (req.user.role === 'client') {
      query.client = req.user.id;
    }
    if (status) query.status = status;

    const sortOptions = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('client', 'name email company')
      .populate('items.product', 'name category images')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name email company phone address')
      .populate('items.product', 'name category images qualityGrade')
      .populate('statusHistory.changedBy', 'name role');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Clients can only view their own orders
    if (req.user.role === 'client' && order.client._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create order (Client)
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes, paymentMethod } = req.body;
    
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const itemTotal = item.quantity * item.unitPrice;
      totalAmount += itemTotal;
      return { ...item, totalPrice: itemTotal };
    });

    const tax = totalAmount * 0.18; // 18% GST
    const shippingCost = totalAmount > 50000 ? 0 : 2000;
    const grandTotal = totalAmount + tax + shippingCost;

    const order = await Order.create({
      client: req.user.id,
      items: orderItems,
      totalAmount,
      tax,
      shippingCost,
      grandTotal,
      shippingAddress,
      notes,
      paymentMethod,
      statusHistory: [{
        status: 'pending',
        changedBy: req.user.id,
        notes: 'Order placed',
      }],
    });

    // Create notification for admins
    const User = require('../models/User');
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
    const io = req.app.get('io');
    for (const admin of admins) {
      const notif = await Notification.create({
        user: admin._id,
        title: 'New Order Received',
        message: `New order ${order.orderNumber} from ${req.user.name}`,
        type: 'order',
        priority: 'high',
        link: `/admin/orders/${order._id}`,
      });
      if (io) {
        io.to(admin._id.toString()).emit('new-notification', notif);
      }
    }

    const populated = await Order.findById(order._id)
      .populate('client', 'name email')
      .populate('items.product', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes, trackingNumber, carrier, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: req.user.id,
      notes,
    });

    if (trackingNumber || carrier || estimatedDelivery) {
      order.deliveryTracking = {
        ...order.deliveryTracking,
        ...(trackingNumber && { trackingNumber }),
        ...(carrier && { carrier }),
        ...(estimatedDelivery && { estimatedDelivery }),
      };
    }

    if (status === 'delivered') {
      order.deliveryTracking.actualDelivery = new Date();
    }

    await order.save();

    // Notify client
    const notif = await Notification.create({
      user: order.client,
      title: 'Order Status Updated',
      message: `Your order ${order.orderNumber} is now ${status}`,
      type: 'order',
      link: `/client/orders/${order._id}`,
    });
    const io = req.app.get('io');
    if (io) {
      io.to(order.client.toString()).emit('new-notification', notif);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update payment status (Admin)
// @route   PUT /api/orders/:id/payment
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$grandTotal' },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

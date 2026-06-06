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

// @desc    Generate PDF Invoice
// @route   GET /api/orders/:id/pdf
exports.generateOrderPDF = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const Order = require('../models/Order');

    const order = await Order.findById(req.params.id)
      .populate('client', 'name email company phone address')
      .populate('items.product', 'name category images qualityGrade');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Clients can only view their own orders
    if (req.user.role === 'client' && order.client._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Initialize PDF Document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

    doc.pipe(res);

    // Header Band
    doc.rect(0, 0, 595, 100).fill('#1B4332');
    doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('SMART COIR MANUFACTURING', 50, 35);
    doc.fontSize(9).font('Helvetica').text('Smart Coir Supply Chain & Production Management System', 50, 62);

    // Invoice Title
    doc.fillColor('#1A1A2E').fontSize(24).font('Helvetica-Bold').text('INVOICE', 50, 130);

    // Order Metadata
    doc.fontSize(10).font('Helvetica').fillColor('#5C5C6B');
    doc.text(`Invoice No: ${order.orderNumber}`, 350, 130, { align: 'right', width: 195 });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 145, { align: 'right', width: 195 });
    doc.text(`Status: ${order.status.toUpperCase()}`, 350, 160, { align: 'right', width: 195 });
    doc.text(`Payment: ${order.paymentStatus.toUpperCase()}`, 350, 175, { align: 'right', width: 195 });

    // Divider
    doc.strokeColor('#EAEAEA').lineWidth(1).moveTo(50, 200).lineTo(545, 200).stroke();

    // Shipping Address formatting
    let addressText = 'N/A';
    if (order.shippingAddress) {
      if (typeof order.shippingAddress === 'string') {
        addressText = order.shippingAddress;
      } else {
        const { street, city, state, zipCode, country } = order.shippingAddress;
        addressText = [street, city, state, zipCode, country].filter(Boolean).join(', ');
      }
    }

    // Bill To & From
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2D6A4F').text('BILL TO:', 50, 220);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1A1A2E').text(order.client?.name || 'Client Representative', 50, 235);
    doc.font('Helvetica').fillColor('#5C5C6B');
    doc.text(order.client?.company || 'Company Name', 50, 250);
    doc.text(`Email: ${order.client?.email || ''}`, 50, 265);
    doc.text(`Phone: ${order.client?.phone || ''}`, 50, 280);
    doc.text(`Shipping Address: ${addressText}`, 50, 295, { width: 230 });

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#2D6A4F').text('FROM:', 320, 220);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1A1A2E').text('Smart Coir Factory HQ', 320, 235);
    doc.font('Helvetica').fillColor('#5C5C6B');
    doc.text('100 Coir Industrial Park', 320, 250);
    doc.text('Pollachi, Tamil Nadu, India', 320, 265);
    doc.text('Email: billing@smartcoir.com', 320, 280);
    doc.text('Phone: +91 4259 222333', 320, 295);

    // Divider
    doc.strokeColor('#EAEAEA').lineWidth(1).moveTo(50, 360).lineTo(545, 360).stroke();

    // Table Header
    doc.rect(50, 380, 495, 20).fill('#2D6A4F');
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
    doc.text('Item Description', 60, 385);
    doc.text('Grade', 250, 385);
    doc.text('Qty', 330, 385, { width: 45, align: 'right' });
    doc.text('Unit Price', 385, 385, { width: 75, align: 'right' });
    doc.text('Total Price', 470, 385, { width: 65, align: 'right' });

    // Table Rows
    let currentY = 405;
    order.items.forEach((item) => {
      doc.fillColor('#1A1A2E').font('Helvetica').fontSize(9);
      doc.text(item.product?.name || 'Coir Product', 60, currentY, { width: 180 });
      doc.text(item.qualityGrade || item.product?.qualityGrade || 'N/A', 250, currentY);
      doc.text(`${item.quantity} kg`, 330, currentY, { width: 45, align: 'right' });
      doc.text(`₹${item.unitPrice.toLocaleString('en-IN')}`, 385, currentY, { width: 75, align: 'right' });
      doc.text(`₹${item.totalPrice.toLocaleString('en-IN')}`, 470, currentY, { width: 65, align: 'right' });

      doc.strokeColor('#F2F2F2').lineWidth(1).moveTo(50, currentY + 18).lineTo(545, currentY + 18).stroke();
      currentY += 25;
    });

    // Totals Block
    currentY += 10;
    doc.fontSize(9).font('Helvetica').fillColor('#5C5C6B');
    doc.text('Subtotal:', 310, currentY, { width: 140, align: 'right' });
    doc.font('Helvetica-Bold').fillColor('#1A1A2E');
    doc.text(`₹${order.totalAmount.toLocaleString('en-IN')}`, 460, currentY, { width: 75, align: 'right' });

    currentY += 18;
    doc.font('Helvetica').fillColor('#5C5C6B');
    doc.text('Estimated GST (18%):', 310, currentY, { width: 140, align: 'right' });
    doc.font('Helvetica-Bold').fillColor('#1A1A2E');
    doc.text(`₹${order.tax.toLocaleString('en-IN')}`, 460, currentY, { width: 75, align: 'right' });

    currentY += 18;
    doc.font('Helvetica').fillColor('#5C5C6B');
    doc.text('Shipping & Logistics:', 310, currentY, { width: 140, align: 'right' });
    doc.font('Helvetica-Bold').fillColor('#1A1A2E');
    doc.text(`₹${order.shippingCost.toLocaleString('en-IN')}`, 460, currentY, { width: 75, align: 'right' });

    currentY += 22;
    doc.rect(300, currentY - 5, 245, 25).fill('#E8F5E9');
    doc.font('Helvetica-Bold').fillColor('#2D6A4F').fontSize(10);
    doc.text('Grand Total:', 310, currentY);
    doc.text(`₹${order.grandTotal.toLocaleString('en-IN')}`, 460, currentY, { width: 75, align: 'right' });

    // Footer
    doc.fillColor('#8E8E9A').fontSize(9).font('Helvetica-Oblique');
    doc.text('Thank you for choosing Smart Coir for your natural fiber solutions!', 50, 750, { align: 'center', width: 495 });
    doc.text('This is a computer-generated document. No signature is required.', 50, 765, { align: 'center', width: 495 });

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


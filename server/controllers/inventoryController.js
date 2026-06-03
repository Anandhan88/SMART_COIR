const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// @desc    Get all inventory items
// @route   GET /api/inventory
exports.getInventory = async (req, res) => {
  try {
    const { status, warehouse, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (warehouse) query.warehouse = warehouse;

    const total = await Inventory.countDocuments(query);
    const inventory = await Inventory.find(query)
      .populate('product', 'name category qualityGrade price images')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: inventory,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get inventory summary
// @route   GET /api/inventory/summary
exports.getInventorySummary = async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments();
    const inStock = await Inventory.countDocuments({ status: 'in-stock' });
    const lowStock = await Inventory.countDocuments({ status: 'low-stock' });
    const outOfStock = await Inventory.countDocuments({ status: 'out-of-stock' });
    
    const totalValue = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$quantity', '$productInfo.price.amount'] } },
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        inStock,
        lowStock,
        outOfStock,
        totalValue: totalValue[0]?.totalValue || 0,
        totalQuantity: totalValue[0]?.totalQuantity || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update inventory
// @route   PUT /api/inventory/:id
exports.updateInventory = async (req, res) => {
  try {
    const { quantity, warehouse, minStock, notes } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    // Track history
    if (quantity !== undefined && quantity !== inventory.quantity) {
      const action = quantity > inventory.quantity ? 'added' : 'removed';
      inventory.history.push({
        action,
        quantity: Math.abs(quantity - inventory.quantity),
        performedBy: req.user.id,
        notes: notes || `Stock ${action}`,
      });
      inventory.quantity = quantity;
    }

    if (warehouse) inventory.warehouse = warehouse;
    if (minStock) inventory.minStock = minStock;

    await inventory.save();
    
    const updated = await Inventory.findById(req.params.id).populate('product');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add inventory item
// @route   POST /api/inventory
exports.addInventory = async (req, res) => {
  try {
    const inventory = await Inventory.create({
      ...req.body,
      history: [{
        action: 'added',
        quantity: req.body.quantity,
        performedBy: req.user.id,
        notes: 'Initial stock entry',
      }],
    });
    
    const populated = await Inventory.findById(inventory._id).populate('product');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Restock inventory
// @route   POST /api/inventory/:id/restock
exports.restockInventory = async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    inventory.quantity += quantity;
    inventory.lastRestocked = new Date();
    inventory.history.push({
      action: 'restocked',
      quantity,
      performedBy: req.user.id,
      notes: notes || 'Restocked',
    });

    await inventory.save();
    const updated = await Inventory.findById(req.params.id).populate('product');
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

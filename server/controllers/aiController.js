const config = require('../config/config');

const SYSTEM_PROMPT = `You are an AI assistant for Smart Coir Manufacturing & Supply Chain Management System. 
You help customers and staff with questions about:
- Coir products (rope, yarn, bundles, raw fiber, mats, pith)
- Manufacturing processes (husk collection, extraction, drying, bundling, rope making, packaging)
- Pricing and availability
- Order tracking and delivery
- Quality grades (Premium, Standard, Economy, Export Grade, Industrial)
- Company information

Be helpful, professional, and concise. If you don't know something specific about the company's current stock or orders, suggest they contact an admin or check their dashboard.

Key facts about coir manufacturing:
- Coir fiber comes from coconut husks
- Processing: Husk → Retting → Extraction → Drying → Grading → Products
- Main products: Coir rope, coir yarn, coir bundles, raw fiber, coir mats, coir pith
- Quality depends on fiber length, color, tensile strength, and moisture content
- Export grades require specific certifications and quality standards`;

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
exports.chatWithAI = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!config.openaiApiKey || config.openaiApiKey === 'your-openai-api-key-here') {
      // Fallback responses when no API key
      const fallbackResponses = {
        price: 'Our coir products range from ₹50/kg for raw fiber to ₹500/kg for premium export-grade coir rope. For exact pricing, please check our inventory page or contact the admin.',
        order: 'You can place orders through your client dashboard. Go to Inventory → Select Products → Add to Order → Checkout. Track your orders in the Orders section.',
        delivery: 'Standard delivery takes 5-7 business days for domestic orders and 15-21 days for international shipments. Express delivery options are available.',
        quality: 'We offer 5 quality grades: Premium, Standard, Economy, Export Grade, and Industrial. Each grade is tested for tensile strength, moisture content, and fiber uniformity.',
        process: 'Our manufacturing process: 1) Coconut Husk Collection 2) Retting & Fiber Extraction 3) Fiber Cleaning & Drying 4) Grading & Sorting 5) Product Manufacturing 6) Quality Inspection 7) Packaging & Export.',
        default: 'Thank you for your question! I can help with product information, pricing, orders, delivery, quality grades, and manufacturing processes. Could you please be more specific about what you\'d like to know?',
      };

      const lowerMsg = message.toLowerCase();
      let response = fallbackResponses.default;
      if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rate')) response = fallbackResponses.price;
      else if (lowerMsg.includes('order') || lowerMsg.includes('buy') || lowerMsg.includes('purchase')) response = fallbackResponses.order;
      else if (lowerMsg.includes('deliver') || lowerMsg.includes('ship') || lowerMsg.includes('track')) response = fallbackResponses.delivery;
      else if (lowerMsg.includes('quality') || lowerMsg.includes('grade') || lowerMsg.includes('standard')) response = fallbackResponses.quality;
      else if (lowerMsg.includes('process') || lowerMsg.includes('manufactur') || lowerMsg.includes('how') || lowerMsg.includes('make')) response = fallbackResponses.process;

      return res.json({ success: true, data: { message: response, isAI: true, isFallback: true } });
    }

    // OpenAI integration
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: config.openaiApiKey });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    res.json({
      success: true,
      data: {
        message: completion.choices[0].message.content,
        isAI: true,
        isFallback: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI service error',
      data: {
        message: 'I apologize, but I\'m having trouble connecting right now. Please try again or contact our support team.',
        isAI: true,
        isFallback: true,
      },
    });
  }
};

// @desc    Get AI business insights (Admin)
// @route   GET /api/ai/insights
exports.getBusinessInsights = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Inventory = require('../models/Inventory');

    // Generate insights from data
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(100);
    const inventory = await Inventory.find().populate('product', 'name category');

    const insights = [];

    // Low stock alerts
    const lowStockItems = inventory.filter(i => i.status === 'low-stock' || i.status === 'out-of-stock');
    if (lowStockItems.length > 0) {
      insights.push({
        type: 'warning',
        category: 'inventory',
        title: 'Low Stock Alert',
        message: `${lowStockItems.length} items are running low on stock. Consider restocking soon.`,
        items: lowStockItems.map(i => i.product?.name || 'Unknown').slice(0, 5),
        priority: 'high',
      });
    }

    // Order trends
    const thisMonth = recentOrders.filter(o => {
      const now = new Date();
      return o.createdAt.getMonth() === now.getMonth() && o.createdAt.getFullYear() === now.getFullYear();
    });
    const lastMonth = recentOrders.filter(o => {
      const now = new Date();
      const lastM = new Date(now.getFullYear(), now.getMonth() - 1);
      return o.createdAt.getMonth() === lastM.getMonth() && o.createdAt.getFullYear() === lastM.getFullYear();
    });

    const growth = lastMonth.length > 0 ? ((thisMonth.length - lastMonth.length) / lastMonth.length * 100).toFixed(1) : 0;
    insights.push({
      type: growth >= 0 ? 'success' : 'warning',
      category: 'sales',
      title: 'Monthly Growth',
      message: `Orders ${growth >= 0 ? 'increased' : 'decreased'} by ${Math.abs(growth)}% compared to last month.`,
      value: `${growth}%`,
      priority: 'medium',
    });

    // Pending orders alert
    const pendingCount = await Order.countDocuments({ status: 'pending' });
    if (pendingCount > 5) {
      insights.push({
        type: 'alert',
        category: 'orders',
        title: 'Pending Orders',
        message: `${pendingCount} orders are pending review. Process them to maintain customer satisfaction.`,
        priority: 'high',
      });
    }

    // Demand forecast (simple moving average)
    insights.push({
      type: 'info',
      category: 'forecast',
      title: 'Demand Forecast',
      message: `Based on recent trends, expected order volume next month: ~${Math.round(thisMonth.length * 1.1)} orders.`,
      priority: 'medium',
    });

    res.json({ success: true, data: { insights } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

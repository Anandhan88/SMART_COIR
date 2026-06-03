const ProductionReport = require('../models/ProductionReport');

// @desc    Get production reports
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const total = await ProductionReport.countDocuments(query);
    const reports = await ProductionReport.find(query)
      .populate('supervisor', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: reports, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create production report
exports.createReport = async (req, res) => {
  try {
    const report = await ProductionReport.create(req.body);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update production report
exports.updateReport = async (req, res) => {
  try {
    const report = await ProductionReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get production summary
exports.getProductionSummary = async (req, res) => {
  try {
    const last30 = await ProductionReport.find({
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    const totalOutput = last30.reduce((sum, r) => sum + (r.dailyOutput?.totalUnits || 0), 0);
    const totalWastage = last30.reduce((sum, r) => sum + (r.wastage?.quantity || 0), 0);
    const avgEfficiency = last30.length > 0
      ? last30.reduce((sum, r) => sum + (100 - (r.wastage?.percentage || 5)), 0) / last30.length
      : 0;

    // Machine status summary
    const latestReport = last30[0];
    const machineStatus = latestReport?.machineStatus || [];

    res.json({
      success: true,
      data: {
        last30Days: { totalOutput, totalWastage, avgEfficiency: avgEfficiency.toFixed(1), reportsCount: last30.length },
        machineStatus,
        dailyTrend: last30.map(r => ({
          date: r.date,
          output: r.dailyOutput?.totalUnits || 0,
          wastage: r.wastage?.quantity || 0,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

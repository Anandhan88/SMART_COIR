const Worker = require('../models/Worker');

// @desc    Get all workers
exports.getWorkers = async (req, res) => {
  try {
    const { department, role, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (department) query.department = department;
    if (role) query.role = role;

    const total = await Worker.countDocuments(query);
    const workers = await Worker.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: workers, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single worker
exports.getWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create worker
exports.createWorker = async (req, res) => {
  try {
    const worker = await Worker.create(req.body);
    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update worker
exports.updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { date, status, checkIn, checkOut } = req.body;
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const existingIdx = worker.attendance.findIndex(a => 
      new Date(a.date).toDateString() === new Date(date).toDateString()
    );
    
    if (existingIdx >= 0) {
      worker.attendance[existingIdx] = { date, status, checkIn, checkOut };
    } else {
      worker.attendance.push({ date, status, checkIn, checkOut });
    }

    await worker.save();
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Assign task
exports.assignTask = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    worker.assignedTasks.push(req.body);
    await worker.save();
    res.json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get worker stats
exports.getWorkerStats = async (req, res) => {
  try {
    const totalWorkers = await Worker.countDocuments({ isActive: true });
    const byDepartment = await Worker.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 }, avgProductivity: { $avg: '$productivity' } } },
    ]);
    const avgProductivity = await Worker.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avg: { $avg: '$productivity' } } },
    ]);

    res.json({
      success: true,
      data: { totalWorkers, byDepartment, avgProductivity: avgProductivity[0]?.avg || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

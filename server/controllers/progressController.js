const Progress = require('../models/Progress');

const getProgress = async (req, res, next) => {
  try {
    const data = await Progress.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(50);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const all    = await Progress.find({ user: userId }).sort({ date: 1 });

    const now   = new Date();
    const ago7  = new Date(now); ago7.setDate(now.getDate() - 6);
    const ago30 = new Date(now); ago30.setDate(now.getDate() - 29);

    const last30 = all.filter((e) => new Date(e.date) >= ago30);
    const last7  = all.filter((e) => new Date(e.date) >= ago7);

    const latest = all[all.length - 1] || null;
    const prev   = all[all.length - 2] || null;

    const weightTrend = (latest?.weight && prev?.weight)
      ? parseFloat((latest.weight - prev.weight).toFixed(1)) : 0;
    const bmiTrend = (latest?.bmi && prev?.bmi)
      ? parseFloat((latest.bmi - prev.bmi).toFixed(1)) : 0;

    const weekWorkouts = last7.filter((e) => (e.caloriesBurned || 0) > 100).length;
    const weekCals     = last7.reduce((s, e) => s + (e.caloriesBurned || 0), 0);

    const fmt = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' });

    const weightData   = last30.filter((e) => e.weight).map((e) => ({ date: fmt(e.date), Weight: e.weight }));
    const caloriesData = last7.map((e) => ({ date: fmt(e.date), Calories: e.caloriesBurned || 0 }));

    res.status(200).json({
      success: true,
      data: {
        currentWeight: latest?.weight || null,
        currentBMI:    latest?.bmi    || null,
        weightTrend,
        bmiTrend,
        weekWorkouts,
        weekCals,
        weightData,
        caloriesData,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createProgress = async (req, res, next) => {
  try {
    const { date, weight, bloodSugar, caloriesBurned, mood, notes } = req.body;
    if (!weight) {
      return res.status(400).json({ success: false, message: 'Weight is required' });
    }

    const userHeight = req.user?.profile?.height;
    const bmi = (weight && userHeight)
      ? parseFloat((weight / ((userHeight / 100) ** 2)).toFixed(1))
      : null;

    const targetDate   = date ? new Date(date) : new Date();
    const dayStart     = new Date(targetDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd       = new Date(targetDate); dayEnd.setHours(23, 59, 59, 999);
    const existing     = await Progress.findOne({ user: req.user._id, date: { $gte: dayStart, $lte: dayEnd } });

    let entry;
    if (existing) {
      entry = await Progress.findByIdAndUpdate(
        existing._id,
        { weight, bmi, bloodSugar, caloriesBurned, mood, notes },
        { new: true }
      );
    } else {
      entry = await Progress.create({
        user: req.user._id, date: targetDate,
        weight, bmi, bloodSugar, caloriesBurned, mood, notes,
      });
    }

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

const updateProgress = async (req, res, next) => {
  try {
    const entry = await Progress.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Progress.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteProgress = async (req, res, next) => {
  try {
    const entry = await Progress.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await entry.deleteOne();
    res.status(200).json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProgress, getStats, createProgress, updateProgress, deleteProgress };

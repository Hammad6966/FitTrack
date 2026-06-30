const User     = require('../models/User');
const Exercise = require('../models/Exercise');
const MealPlan = require('../models/MealPlan');
const Post     = require('../models/Post');
const Progress = require('../models/Progress');

const getDashboard = async (req, res, next) => {
  try {
    const now       = new Date();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0);

    const [totalUsers, totalExercises, totalMealPlans, totalPosts, newUsersThisWeek] = await Promise.all([
      User.countDocuments(),
      Exercise.countDocuments(),
      MealPlan.countDocuments(),
      Post.countDocuments({ isApproved: true }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role isActive createdAt');

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name')
      .select('title category isApproved createdAt author');

    res.status(200).json({
      success: true,
      data: { totalUsers, totalExercises, totalMealPlans, totalPosts, newUsersThisWeek, recentUsers, recentPosts },
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const data  = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    res.status(200).json({
      success: true,
      data,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'trainer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, data: { isActive: user.isActive } });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Progress.deleteMany({ user: user._id });
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();

    // monthly registrations — last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const count = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });
      monthlyData.push({
        month: start.toLocaleDateString('en-US', { month: 'short' }),
        users: count,
      });
    }

    // exercise category distribution
    const exerciseCats = await Exercise.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // post category distribution
    const postCats = await Post.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyRegistrations: monthlyData,
        exerciseCategories: exerciseCats.map((c) => ({ name: c._id, count: c.count })),
        postCategories:     postCats.map((c)     => ({ name: c._id, count: c.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Post.countDocuments();
    const data  = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email');
    res.status(200).json({
      success: true,
      data,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUsers, updateUserRole, toggleUserStatus, deleteUser, getAnalytics, getAllPosts };

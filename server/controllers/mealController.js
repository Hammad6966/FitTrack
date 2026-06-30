const MealPlan = require('../models/MealPlan');

const getMealPlans = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 6 } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await MealPlan.countDocuments(filter);
    const data  = await MealPlan.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

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

const getFeaturedMealPlans = async (req, res, next) => {
  try {
    const data = await MealPlan.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('createdBy', 'name');
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMealPlan = async (req, res, next) => {
  try {
    const plan = await MealPlan.findById(req.params.id).populate('createdBy', 'name');
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const createMealPlan = async (req, res, next) => {
  try {
    const { title, description, category, meals, totalCalories, duration, tags, imageUrl, isFeatured } = req.body;
    if (!title || !category) {
      return res.status(400).json({ success: false, message: 'Title and category are required' });
    }
    const plan = await MealPlan.create({
      title, description, category, meals, totalCalories, duration, tags, imageUrl, isFeatured,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const updateMealPlan = async (req, res, next) => {
  try {
    let plan = await MealPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }
    if (plan.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this meal plan' });
    }
    plan = await MealPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const deleteMealPlan = async (req, res, next) => {
  try {
    const plan = await MealPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }
    await plan.deleteOne();
    res.status(200).json({ success: true, message: 'Meal plan deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMealPlans, getFeaturedMealPlans, getMealPlan, createMealPlan, updateMealPlan, deleteMealPlan };

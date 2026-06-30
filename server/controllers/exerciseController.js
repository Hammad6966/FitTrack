const Exercise = require('../models/Exercise');

const getExercises = async (req, res, next) => {
  try {
    const { category, difficulty, search, sort, page = 1, limit = 6 } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (difficulty)                     filter.difficulty = difficulty;
    if (search)                         filter.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    let sortObj = { createdAt: -1 };
    if (sort === 'calories') sortObj = { caloriesBurn: -1 };
    if (sort === 'duration') sortObj = { duration: 1 };

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Exercise.countDocuments(filter);
    const data  = await Exercise.find(filter)
      .sort(sortObj)
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

const getFeaturedExercises = async (req, res, next) => {
  try {
    const data = await Exercise.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('createdBy', 'name');
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id).populate('createdBy', 'name');
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
};

const createExercise = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, duration, caloriesBurn, instructions, imageUrl, videoUrl, tags, isFeatured } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Title, description, and category are required' });
    }
    const exercise = await Exercise.create({
      title, description, category, difficulty, duration, caloriesBurn,
      instructions, imageUrl, videoUrl, tags, isFeatured,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
};

const updateExercise = async (req, res, next) => {
  try {
    let exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    if (exercise.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this exercise' });
    }
    exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
};

const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    await exercise.deleteOne();
    res.status(200).json({ success: true, message: 'Exercise deleted' });
  } catch (error) {
    next(error);
  }
};

const toggleFeatured = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    exercise.isFeatured = !exercise.isFeatured;
    await exercise.save();
    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExercises, getFeaturedExercises, getExercise, createExercise, updateExercise, deleteExercise, toggleFeatured };

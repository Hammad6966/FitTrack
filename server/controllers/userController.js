const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, profile } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (profile) {
      const allowed = ['age', 'gender', 'height', 'weight', 'diabetesStatus', 'diabetesType', 'fitnessLevel', 'fitnessGoal', 'dietaryPreferences'];
      allowed.forEach((field) => {
        if (profile[field] !== undefined) updateFields[`profile.${field}`] = profile[field];
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) return res.status(400).json({ success: false, message: 'avatarUrl is required' });
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar };

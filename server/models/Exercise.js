const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['cardio', 'strength', 'flexibility', 'balance', 'yoga', 'diabetes_friendly'],
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    duration: { type: Number, min: 0 },
    caloriesBurn: { type: Number, min: 0 },
    instructions: [{ type: String }],
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exercise', exerciseSchema);

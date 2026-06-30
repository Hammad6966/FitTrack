const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['weight_loss', 'weight_gain', 'diabetes_management', 'maintenance', 'muscle_building'],
    },
    meals: {
      breakfast: [mealItemSchema],
      lunch: [mealItemSchema],
      dinner: [mealItemSchema],
      snacks: [mealItemSchema],
    },
    totalCalories: { type: Number, default: 0 },
    duration: { type: String, default: '7 days' },
    tags: [{ type: String }],
    imageUrl: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MealPlan', mealPlanSchema);

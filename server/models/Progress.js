const mongoose = require('mongoose');

const exerciseLogSchema = new mongoose.Schema(
  {
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    duration: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    weight: { type: Number, min: 0 },
    bmi: { type: Number, min: 0 },
    bloodSugar: { type: Number, min: 0 },
    caloriesBurned: { type: Number, default: 0, min: 0 },
    workoutsCompleted: { type: Number, default: 0, min: 0 },
    exercisesLog: [exerciseLogSchema],
    notes: { type: String, default: '' },
    mood: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'bad', 'terrible'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', progressSchema);

const mongoose = require('mongoose');

const gameAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameQuestion',
      required: true,
      index: true,
    },
    userAnswer: {
      type: String,
      enum: ['fact', 'fake'],
      required: true,
    },
    correct: {
      type: Boolean,
      required: true,
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attempts (user can only answer a question once)
gameAttemptSchema.index({ userId: 1, questionId: 1 }, { unique: true });

// Index for level tracking
gameAttemptSchema.index({ userId: 1, level: 1 });

const GameAttempt = mongoose.model('GameAttempt', gameAttemptSchema);

module.exports = GameAttempt;


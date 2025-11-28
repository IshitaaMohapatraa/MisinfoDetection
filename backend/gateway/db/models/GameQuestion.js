const mongoose = require('mongoose');

const gameQuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    correctVerdict: {
      type: String,
      enum: ['fact', 'fake'],
      required: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    category: {
      type: String,
      default: 'general',
    },
    explanation: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for level-based queries
gameQuestionSchema.index({ level: 1 });

// Index for difficulty-based queries
gameQuestionSchema.index({ difficulty: 1 });

// Index for random selection
gameQuestionSchema.index({ createdAt: -1 });

const GameQuestion = mongoose.model('GameQuestion', gameQuestionSchema);

module.exports = GameQuestion;


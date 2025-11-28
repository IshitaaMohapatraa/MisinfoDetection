const mongoose = require('mongoose');

const factCheckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    inputText: {
      type: String,
      default: null,
    },
    inputMediaUrl: {
      type: String,
      default: null,
    },
    inputUrl: {
      type: String,
      default: null,
    },
    result: {
      verdict: {
        type: String,
        enum: ['true', 'false', 'mostly_true', 'mostly_false', 'mixed', 'unverified'],
        required: true,
      },
      confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      sources: [
        {
          title: String,
          url: String,
          snippet: String,
        },
      ],
      explanation: {
        type: String,
        required: true,
      },
      detectionMethods: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Index for user queries
factCheckSchema.index({ userId: 1, createdAt: -1 });

// Index for verdict queries
factCheckSchema.index({ 'result.verdict': 1 });

const FactCheck = mongoose.model('FactCheck', factCheckSchema);

module.exports = FactCheck;


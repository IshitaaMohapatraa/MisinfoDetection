const FactCheck = require('../models/FactCheck');
const mongoose = require('mongoose');

/**
 * Create a new fact-check record
 */
async function createFactCheck(factCheckData) {
  try {
    const factCheck = new FactCheck(factCheckData);
    await factCheck.save();
    return factCheck;
  } catch (error) {
    throw error;
  }
}

/**
 * Get fact-check by ID
 */
async function getFactCheckById(factCheckId) {
  try {
    const factCheck = await FactCheck.findById(factCheckId);
    return factCheck;
  } catch (error) {
    throw error;
  }
}

/**
 * Get fact-checks by user ID with pagination
 */
async function getUserFactChecks(userId, page = 1, limit = 10) {
  try {
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const skip = (page - 1) * limit;
    const factChecks = await FactCheck.find({ userId: userObjectId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await FactCheck.countDocuments({ userId: userObjectId });

    return {
      factChecks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createFactCheck,
  getFactCheckById,
  getUserFactChecks,
};


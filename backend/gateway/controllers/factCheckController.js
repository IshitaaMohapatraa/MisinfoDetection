const { performFactCheck } = require('../services/factCheckService');
const factCheckService = require('../db/services/factCheckService');
const mongoose = require('mongoose');

/**
 * POST /api/v1/fact-check
 * Perform fact-checking on text, URL, or image
 */
async function factCheck(req, res, next) {
  try {
    const { inputText, inputUrl, inputImageUrl } = req.body;
    const userId = req.user?.userId || null;

    // Validate input - at least one must be present
    if (!inputText && !inputUrl && !inputImageUrl) {
      return res.status(400).json({
        error: {
          status: 400,
          message: 'Invalid input',
          details: 'At least one of inputText, inputUrl, or inputImageUrl is required',
        },
      });
    }

    // Perform fact-check
    const result = await performFactCheck({
      inputText,
      inputUrl,
      inputImageUrl,
    });

    // Save to database
    const userObjectId = userId && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    const factCheckRecord = await factCheckService.createFactCheck({
      userId: userObjectId,
      inputText: inputText || null,
      inputUrl: inputUrl || null,
      inputMediaUrl: inputImageUrl || null,
      result: {
        verdict: result.verdict,
        confidence: result.confidence,
        sources: result.sources,
        explanation: result.explanation,
        detectionMethods: result.detectionMethods,
      },
    });

    // Return response (matching the spec)
    res.json({
      id: factCheckRecord._id.toString(),
      verdict: result.verdict,
      credibility: result.credibility,
      summary: result.summary,
      explanation: result.explanation,
      sources: result.sources,
      detectionMethods: result.detectionMethods,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  factCheck,
};


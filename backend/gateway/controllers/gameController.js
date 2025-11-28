const mongoose = require('mongoose');
const challengeService = require('../db/services/challengeService');
const leaderboardService = require('../db/services/leaderboardService');
const userService = require('../db/services/userService');
const gameService = require('../db/services/gameService');

/**
 * Get game challenges
 */
async function getChallenges(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const difficulty = req.query.difficulty ? parseInt(req.query.difficulty, 10) : null;
    
    // Get random challenges
    const challenges = await challengeService.getRandomChallenges(limit, difficulty);

    // Remove correctAnswer from response (game shouldn't reveal answers)
    const challengesForGame = challenges.map((challenge) => {
      const challengeObj = challenge.toObject();
      delete challengeObj.correctAnswer;
      return {
        id: challengeObj._id,
        title: challengeObj.title,
        mediaType: challengeObj.mediaType,
        prompt: challengeObj.prompt,
        imageUrl: challengeObj.imageUrl,
        explanation: challengeObj.explanation,
        difficulty: challengeObj.difficulty,
        createdAt: challengeObj.createdAt,
      };
    });

    res.json({
      challenges: challengesForGame,
      count: challengesForGame.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit game answer
 */
async function submitAnswer(req, res, next) {
  try {
    const { challengeId, answer } = req.body;
    const userId = req.body.userId || req.user?.userId;

    if (!challengeId || !answer) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'challengeId and answer are required' },
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'userId is required (provide in body or use authentication)' },
      });
    }

    if (!['real', 'fake'].includes(answer.toLowerCase())) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'answer must be "real" or "fake"' },
      });
    }

    // Validate answer
    const validation = await challengeService.validateAnswer(challengeId, answer);
    
    if (!validation) {
      return res.status(404).json({
        error: { status: 404, message: 'Challenge not found' },
      });
    }

    const isCorrect = validation.isCorrect;
    
    // Calculate XP based on difficulty (1-5 scale, each level = 10 XP)
    const baseXP = validation.difficulty * 10;
    const xpEarned = isCorrect ? baseXP : 0;

    // Convert userId to ObjectId if valid
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    // Update user XP and leaderboard
    let user;
    let leaderboard;
    try {
      const result = await leaderboardService.updateXP(userObjectId, xpEarned);
      user = result.user;
      leaderboard = result.leaderboard;
    } catch (userError) {
      // If user doesn't exist, create a basic entry
      // In production, you'd want proper user creation flow
      console.warn('User not found, skipping XP update:', userError.message);
    }

    // Get user stats
    const userStats = {
      total_xp: user?.xp || 0,
      level: user ? Math.floor(user.xp / 100) + 1 : 1,
      xp_earned: xpEarned,
    };

    res.json({
      correct: isCorrect,
      xp_earned: xpEarned,
      explanation: validation.explanation,
      user_stats: userStats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get leaderboard
 */
async function getLeaderboard(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '100', 10);
    const page = parseInt(req.query.page || '1', 10);

    // Get leaderboard from MongoDB
    const result = await leaderboardService.getLeaderboard(page, limit);

    // Format response
    const leaderboardFormatted = result.leaderboard.map((entry) => ({
      rank: entry.rank,
      user_id: entry.user?._id?.toString() || entry.user?.toString(),
      user_name: entry.user?.name || 'Unknown',
      user_email: entry.user?.email || '',
      xp: entry.xp,
      level: entry.level,
      badges: entry.user?.badges || [],
      last_updated: entry.lastUpdated,
    }));

    res.json({
      period: 'alltime', // MongoDB stores all-time leaderboard
      leaderboard: leaderboardFormatted,
      count: leaderboardFormatted.length,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/game/level
 * Get current level questions for "Fact or Fake?" game
 */
async function getCurrentLevelQuestions(req, res, next) {
  try {
    const userId = req.user?.userId || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: { status: 401, message: 'Unauthorized', details: 'User authentication required' },
      });
    }

    // Get user's current level
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: { status: 404, message: 'User not found' },
      });
    }

    const currentLevel = user.gameLevel || 1;

    // Get questions for this level
    const questions = await gameService.getLevelQuestions(userId, currentLevel);

    res.json({
      level: currentLevel,
      questions,
      count: questions.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/game/submit
 * Submit answer for "Fact or Fake?" game
 */
async function submitGameAnswer(req, res, next) {
  try {
    const { questionId, userAnswer } = req.body;
    const userId = req.user?.userId || req.body.userId;

    if (!questionId || !userAnswer) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'questionId and userAnswer are required' },
      });
    }

    if (!['fact', 'fake'].includes(userAnswer.toLowerCase())) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'userAnswer must be "fact" or "fake"' },
      });
    }

    if (!userId) {
      return res.status(401).json({
        error: { status: 401, message: 'Unauthorized', details: 'User authentication required' },
      });
    }

    // Submit answer
    const result = await gameService.submitAnswer(userId, questionId, userAnswer.toLowerCase());

    res.json(result);
  } catch (error) {
    if (error.message === 'Question not found') {
      return res.status(404).json({
        error: { status: 404, message: 'Question not found' },
      });
    }
    if (error.message === 'Question already answered') {
      return res.status(400).json({
        error: { status: 400, message: 'Question already answered' },
      });
    }
    if (error.message === 'User not found') {
      return res.status(404).json({
        error: { status: 404, message: 'User not found' },
      });
    }
    next(error);
  }
}

module.exports = {
  getChallenges,
  submitAnswer,
  getLeaderboard,
  getCurrentLevelQuestions,
  submitGameAnswer,
};


const GameQuestion = require('../models/GameQuestion');
const GameAttempt = require('../models/GameAttempt');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get questions for a level that the user hasn't answered yet
 */
async function getLevelQuestions(userId, level) {
  try {
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // Get all questions for this level
    const allQuestions = await GameQuestion.find({ level });

    // Get IDs of questions the user has already answered
    const answeredAttempts = await GameAttempt.find({
      userId: userObjectId,
      questionId: { $in: allQuestions.map((q) => q._id) },
    });

    const answeredQuestionIds = answeredAttempts.map((a) => a.questionId.toString());

    // Filter out answered questions
    const unansweredQuestions = allQuestions.filter(
      (q) => !answeredQuestionIds.includes(q._id.toString())
    );

    // Return up to 20 questions
    const questionsToReturn = unansweredQuestions.slice(0, 20);

    // Return only id and text (no correct answer)
    return questionsToReturn.map((q) => ({
      id: q._id.toString(),
      text: q.text,
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Submit a game answer
 */
async function submitAnswer(userId, questionId, userAnswer) {
  try {
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const questionObjectId = mongoose.Types.ObjectId.isValid(questionId)
      ? new mongoose.Types.ObjectId(questionId)
      : questionId;

    // Get the question
    const question = await GameQuestion.findById(questionObjectId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Check if user already answered this question
    const existingAttempt = await GameAttempt.findOne({
      userId: userObjectId,
      questionId: questionObjectId,
    });

    if (existingAttempt) {
      throw new Error('Question already answered');
    }

    // Determine if answer is correct
    const isCorrect = question.correctVerdict.toLowerCase() === userAnswer.toLowerCase();

    // Calculate XP (20 for correct, 0 for wrong)
    const xpEarned = isCorrect ? 20 : 0;

    // Get user to check current level
    const user = await User.findById(userObjectId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentLevel = user.gameLevel || 1;

    // Save the attempt
    const attempt = new GameAttempt({
      userId: userObjectId,
      questionId: questionObjectId,
      userAnswer,
      correct: isCorrect,
      xpEarned,
      level: currentLevel,
    });
    await attempt.save();

    // Update user stats
    const updateData = {
      $inc: {
        gameXp: xpEarned,
        gameQuestionsAnswered: 1,
      },
    };

    if (isCorrect) {
      updateData.$inc.gameCorrectAnswers = 1;
    }

    await User.findByIdAndUpdate(userObjectId, updateData);

    // Check if level is completed (20 questions answered)
    const levelAttempts = await GameAttempt.countDocuments({
      userId: userObjectId,
      level: currentLevel,
    });

    let levelCompleted = false;
    let newLevel = currentLevel;
    let reward = null;

    if (levelAttempts >= 20) {
      levelCompleted = true;
      newLevel = currentLevel + 1;

      // Update user level
      await User.findByIdAndUpdate(userObjectId, {
        $set: { gameLevel: newLevel },
      });

      // Calculate reward based on level or XP
      const updatedUser = await User.findById(userObjectId);
      const totalXp = updatedUser.gameXp || 0;

      reward = calculateReward(newLevel - 1, totalXp);

      if (reward) {
        // Add reward to user's gameRewards
        await User.findByIdAndUpdate(userObjectId, {
          $push: {
            gameRewards: {
              id: reward.id,
              name: reward.name,
              description: reward.description,
              levelEarned: newLevel - 1,
              xpEarned: totalXp,
            },
          },
        });
      }
    }

    // Get updated user for new XP
    const updatedUser = await User.findById(userObjectId);

    return {
      correct: isCorrect,
      xpEarned,
      newXp: updatedUser.gameXp || 0,
      levelCompleted,
      newLevel,
      reward,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Calculate reward based on level or XP
 */
function calculateReward(completedLevel, totalXp) {
  // Level-based rewards
  if (completedLevel === 1 || totalXp >= 400) {
    return {
      id: 'food-discount-1',
      name: 'Food Discount',
      description: '10% off on your next food order',
    };
  } else if (completedLevel === 2 || totalXp >= 800) {
    return {
      id: 'accessories-discount-1',
      name: 'Accessories Discount',
      description: '15% off on accessories',
    };
  } else if (completedLevel === 3 || totalXp >= 1200) {
    return {
      id: 'premium-discount-1',
      name: 'Premium Discount',
      description: '20% off on premium items',
    };
  } else if (completedLevel >= 5 || totalXp >= 2000) {
    return {
      id: 'exclusive-reward-1',
      name: 'Exclusive Reward',
      description: 'Special exclusive reward for top players',
    };
  }

  return null;
}

/**
 * Get user's current game stats
 */
async function getUserGameStats(userId) {
  try {
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const user = await User.findById(userObjectId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      gameXp: user.gameXp || 0,
      gameLevel: user.gameLevel || 1,
      gameQuestionsAnswered: user.gameQuestionsAnswered || 0,
      gameCorrectAnswers: user.gameCorrectAnswers || 0,
      gameRewards: user.gameRewards || [],
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getLevelQuestions,
  submitAnswer,
  getUserGameStats,
};


const express = require('express');
const { optionalAuth } = require('../middlewares/authMock');
const { getChallenges, submitAnswer, getLeaderboard, getCurrentLevelQuestions, submitGameAnswer } = require('../controllers/gameController');
const { getGameStats } = require('../controllers/statsController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/game/challenges:
 *   get:
 *     summary: Get game challenges
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of challenges to return
 *     responses:
 *       200:
 *         description: List of challenges
 */
router.get('/challenges', optionalAuth, getChallenges);

/**
 * @swagger
 * /api/v1/game/answer:
 *   post:
 *     summary: Submit answer to a challenge
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - challengeId
 *               - userId
 *               - answer
 *             properties:
 *               challengeId:
 *                 type: string
 *               userId:
 *                 type: string
 *               answer:
 *                 type: string
 *                 enum: [real, fake]
 *     responses:
 *       200:
 *         description: Answer result with XP earned
 *       400:
 *         description: Invalid input
 */
router.post('/answer', optionalAuth, submitAnswer);

/**
 * @swagger
 * /api/v1/game/leaderboard:
 *   get:
 *     summary: Get game leaderboard
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, alltime]
 *           default: alltime
 *         description: Leaderboard period
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of entries to return
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/leaderboard', optionalAuth, getLeaderboard);

/**
 * @swagger
 * /api/v1/game/stats:
 *   get:
 *     summary: Get game statistics
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (optional if authenticated)
 *     responses:
 *       200:
 *         description: Game statistics
 */
router.get('/stats', optionalAuth, getGameStats);

/**
 * @swagger
 * /api/v1/game/level:
 *   get:
 *     summary: Get current level questions for Fact or Fake game
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of questions for current level
 *       401:
 *         description: Unauthorized
 */
router.get('/level', optionalAuth, getCurrentLevelQuestions);

/**
 * @swagger
 * /api/v1/game/submit:
 *   post:
 *     summary: Submit answer for Fact or Fake game
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - userAnswer
 *             properties:
 *               questionId:
 *                 type: string
 *               userAnswer:
 *                 type: string
 *                 enum: [fact, fake]
 *     responses:
 *       200:
 *         description: Answer result with XP and level info
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/submit', optionalAuth, submitGameAnswer);

module.exports = router;


const express = require('express');
const { optionalAuth } = require('../middlewares/authMock');
const { factCheck } = require('../controllers/factCheckController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/fact-check:
 *   post:
 *     summary: Perform fact-checking on text, URL, or image
 *     tags: [FactCheck]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inputText:
 *                 type: string
 *                 description: Text content to fact-check
 *               inputUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to fact-check
 *               inputImageUrl:
 *                 type: string
 *                 format: uri
 *                 description: Image URL to fact-check (from /api/upload)
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Fact-check result
 *       400:
 *         description: Invalid input
 */
router.post('/', optionalAuth, factCheck);

module.exports = router;


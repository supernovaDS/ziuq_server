import express from 'express';
import { getMyHistory, getQuizLeaderboard, recordAttempt } from '../controllers/attemptController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Record a new attempt (Protected)
router.post('/', protect, recordAttempt);

// Get my personal history (Protected)
router.get('/my-history', protect, getMyHistory);

// Get leaderboard for a specific quiz (Public)
router.get('/leaderboard/:quizId', getQuizLeaderboard);

export default router;
import express from 'express';
import { createRound, getQuizRounds, updateRound, 
  deleteRound } from '../controllers/roundController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// Add a round to a quiz
router.post('/', protect, upload.single('media'), createRound);

// Get all rounds for a specific quiz
router.get('/:quizId', getQuizRounds);

// Update Round (Supports new media/video upload)
router.put('/:id', protect, upload.single('media'), updateRound);

// Delete Round (Also deletes all questions inside)
router.delete('/:id', protect, deleteRound);

export default router;
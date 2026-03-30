import express from 'express';
import { createQuestion, getRoundQuestions, updateQuestion, 
  deleteQuestion } from '../controllers/question.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';
import { submitAnswer, finishRound } from '../controllers/submission.controller.js';


const router = express.Router();

router.post('/', protect, upload.array('questionMedia', 5), createQuestion);
router.get('/round/:roundId', protect, getRoundQuestions);
router.post('/evaluate', protect, submitAnswer); // 👈 The evaluation endpoint
// Update Question (Supports new media uploads)
router.put('/:id', protect, upload.array('questionMedia', 5), updateQuestion);

// Delete Question
router.delete('/:id', protect, deleteQuestion);

router.post('/finish-round', protect, finishRound);

export default router;
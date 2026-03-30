import express from 'express';
import { createQuiz, getAllQuizzes, getMyQuizzes, updateQuiz, deleteQuiz } from '../controllers/quiz.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// Public Feed (anyone can see)
router.get('/', getAllQuizzes);

// My Quizzes (only logged-in user)
router.get('/my', protect, getMyQuizzes);

// Create Quiz
router.post('/', protect, upload.single('banner'), createQuiz);

//update quiz
router.put('/:id', protect, upload.single('banner'), updateQuiz);

//delete quiz
router.delete('/:id', protect, deleteQuiz);

export default router;
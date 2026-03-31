import express from 'express';
import { register, login, getMe, logout, googleAuth } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post("/google", googleAuth);
router.get('/me', protect, getMe);

export default router;
import Attempt from '../models/Attempt.js';
import User from '../models/User.js';

export const recordAttempt = async (req, res) => {
  try {
    const { quizId, score, accuracy } = req.body;
    const userId = req.user._id;

    // 1. Calculate which attempt number this is
    const previousAttempts = await Attempt.countDocuments({ userId, quizId });
    const currentAttemptNumber = previousAttempts + 1;

    // 2. Create the attempt record
    const newAttempt = await Attempt.create({
      userId,
      quizId,
      score,
      accuracy,
      attemptNumber: currentAttemptNumber
    });

    // 3. Update the User's aggregate stats
    const user = await User.findById(userId);
    const oldTotalQuizzes = user.stats.totalQuizzes || 0;
    const oldAccuracy = user.stats.accuracy || 0;
    const newTotalQuizzes = oldTotalQuizzes + 1;
    const newAccuracy = ((oldAccuracy * oldTotalQuizzes) + accuracy) / newTotalQuizzes;

    await User.findByIdAndUpdate(userId, {
      $inc: { 
        "stats.totalQuizzes": 1, 
        "stats.totalScore": score 
      },
      $set: {
        "stats.accuracy": newAccuracy
      }
    });

    res.status(201).json({
      message: "Attempt recorded!",
      attempt: newAttempt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all attempts for the logged-in user
export const getMyHistory = async (req, res) => {
  try {
    const history = await Attempt.find({ userId: req.user._id })
      .populate('quizId', 'title topic bannerUrl') // Pull in quiz details
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get leaderboard for a specific quiz
export const getQuizLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    const leaderboard = await Attempt.find({ quizId })
      .populate('userId', 'username firstName')
      .sort({ score: -1, accuracy: -1 }) // Highest score first
      .limit(10); // Top 10

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
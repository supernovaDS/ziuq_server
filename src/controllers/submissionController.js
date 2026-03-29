import Question from '../models/Question.js';
import RoundResult from '../models/RoundResult.js';
import User from '../models/User.js';
import { evaluateAnswer } from '../utils/aiGrader.js'; // Ensure this path is correct

// 1. Logic to grade a single question (The "AI" part)
export const submitAnswer = async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const result = await evaluateAnswer(userAnswer, question);

    res.status(200).json({
      message: "Grading complete",
      score: result.score,
      feedback: result.feedback,
      correctAnswer: question.correctAnswer
    });
  } catch (error) {
    res.status(500).json({ error: "Grading Error: " + error.message });
  }
};

// 2. Logic to save the entire round (The "Accountant" part)
export const finishRound = async (req, res) => {
  try {
    const { quizId, roundId, gradedAnswers } = req.body;
    const userId = req.user._id;

    const totalScore = gradedAnswers.reduce((acc, curr) => acc + (curr.score || 0), 0);

    const result = await RoundResult.create({
      userId,
      quizId,
      roundId,
      totalScore,
      answers: gradedAnswers
    });

    // User stats are now updated when the entire Attempt is recorded, not per round.

    res.status(201).json({
      message: "Round results saved successfully!",
      finalScore: totalScore,
      resultId: result._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
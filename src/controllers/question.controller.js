import Question from '../models/Question.js';
import Round from '../models/Round.js';
import Quiz from '../models/Quiz.js';
import { deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

export const createQuestion = async (req, res) => {
  try {
    const { 
      quizId, roundId, questionNumber, questionText, 
      correctAnswer, checkingInstruction, maxPoints 
    } = req.body;

    const mediaUrls = req.files ? req.files.map(file => file.path) : [];

    const question = await Question.create({
      quizId,
      roundId,
      questionNumber: Number(questionNumber),
      questionText,
      questionMedia: mediaUrls,
      correctAnswer,
      checkingInstruction: checkingInstruction || undefined, // Fallback to schema default
      maxPoints: Number(maxPoints) || 10
    });

    res.status(201).json({ message: "Question added!", question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoundQuestions = async (req, res) => {
  try {
    const { roundId } = req.params;

    // 1. Find the round first to get the quizId
    const round = await Round.findById(roundId);
    if (!round) return res.status(404).json({ message: "Round not found" });

    // 2. Find the parent Quiz to check visibility
    const quiz = await Quiz.findById(round.quizId);
    if (!quiz) return res.status(404).json({ message: "Parent quiz not found" });

    // 3. Authorization Check
    // If quiz is NOT public AND the requester is NOT the creator -> Deny access
    const isCreator = quiz.createdBy.toString() === req.user._id.toString();
    
    if (!quiz.isPublic && !isCreator) {
      return res.status(403).json({ 
        message: "This quiz is private. You don't have permission to view these questions." 
      });
    }

    // 4. If they pass the check, fetch and send the questions
    const questions = await Question.find({ roundId }).sort({ questionNumber: 1 });
    
    res.status(200).json({
      quizTitle: quiz.title,
      roundTitle: round.title,
      questions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    // ... (Ownership Check via Parent Quiz)

    const { questionText, correctAnswer, checkingInstruction, maxPoints } = req.body;

    // 1. Handle Multiple Media Swap
    if (req.files && req.files.length > 0) {
      // Delete ALL old files in the array from Cloudinary
      if (question.questionMedia && question.questionMedia.length > 0) {
        const deletePromises = question.questionMedia.map(url => deleteFromCloudinary(url));
        await Promise.all(deletePromises);
      }
      
      // Set the new media URLs
      question.questionMedia = req.files.map(file => file.path);
    }

    // 2. Update other fields
    if (questionText) question.questionText = questionText;
    if (correctAnswer) question.correctAnswer = correctAnswer;
    if (checkingInstruction) question.checkingInstruction = checkingInstruction;
    if (maxPoints) question.maxPoints = Number(maxPoints);

    const updatedQuestion = await question.save();
    res.status(200).json({ message: "Question updated; old media purged", question: updatedQuestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    // ... (Your existing ownership check)

    // 1. Delete all media in the array from Cloudinary
    if (question.questionMedia && question.questionMedia.length > 0) {
      const deletePromises = question.questionMedia.map(url => deleteFromCloudinary(url));
      await Promise.all(deletePromises);
    }

    // 2. Delete from DB
    await Question.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Question and all media deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
import Quiz from '../models/Quiz.js';
import { deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

export const createQuiz = async (req, res) => {
  try {
    const { title, topic, isPublic, numberOfRounds } = req.body;
    
    // Multer-Cloudinary puts the URL in req.file.path
    const bannerUrl = req.file ? req.file.path : "";

    const newQuiz = await Quiz.create({
      title,
      topic,
      bannerUrl,
      isPublic: isPublic === 'true' || isPublic === true, // Handle form-data strings
      numberOfRounds: Number(numberOfRounds),
      createdBy: req.user._id // Taken from the 'protect' middleware
    });

    res.status(201).json({
      message: "Quiz created successfully!",
      quiz: newQuiz
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all public quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    // Find quizzes where isPublic is true
    // .populate('createdBy', 'username') brings in the creator's username instead of just the ID
    const quizzes = await Quiz.find({ isPublic: true })
      .populate('createdBy', 'username firstName')
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get quizzes created by the logged-in user
export const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Ownership Check
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, description, topic, isPublic } = req.body;

    // 1. Handle Banner Swap
    if (req.file) {
      // Delete the old banner if it exists
      if (quiz.bannerUrl) {
        await deleteFromCloudinary(quiz.bannerUrl);
      }
      quiz.bannerUrl = req.file.path;
    }

    // 2. Update text fields
    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (topic) quiz.topic = topic;
    if (isPublic !== undefined) quiz.isPublic = isPublic === 'true';

    const updatedQuiz = await quiz.save();
    res.status(200).json({ message: "Quiz updated and old banner removed", quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 1. Delete the Banner from Cloudinary
    if (quiz.bannerUrl) {
      await deleteFromCloudinary(quiz.bannerUrl);
    }

    // 2. Delete the Quiz from DB
    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Quiz and banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
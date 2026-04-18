import Quiz from '../models/Quiz.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinaryHelper.js';

export const createQuiz = async (req, res) => {
  try {
    const { title, topic, isPublic, numberOfRounds } = req.body;

    const newQuiz = await Quiz.create({
      title,
      topic,
      bannerUrl: "", // Cloudinary URL will be updated asynchronously
      isPublic: isPublic === 'true' || isPublic === true,
      numberOfRounds: Number(numberOfRounds),
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Quiz created successfully!",
      quiz: newQuiz
    });

    // Hand off upload to background process
    if (req.file) {
      uploadToCloudinary(req.file.path, "quiz_banners")
        .then(async (url) => {
          newQuiz.bannerUrl = url;
          await newQuiz.save();
        })
        .catch(err => console.error("Failed to upload quiz banner:", err));
    }
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

export const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.json({
        success: false,
        message: "Quiz not found"
      })
    }
    res.status(200).json(quiz);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

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

    // 2. Update text fields
    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (topic) quiz.topic = topic;
    if (isPublic !== undefined) quiz.isPublic = isPublic === 'true';

    const updatedQuiz = await quiz.save();
    res.status(200).json({ message: "Quiz updated successfully", quiz: updatedQuiz });

    // 1. Handle Banner Swap Asynchronously
    if (req.file) {
      const oldBannerUrl = quiz.bannerUrl;
      uploadToCloudinary(req.file.path, "quiz_banners")
        .then(async (url) => {
          quiz.bannerUrl = url;
          await quiz.save();
          if (oldBannerUrl) {
            await deleteFromCloudinary(oldBannerUrl);
          }
        })
        .catch(err => console.error("Failed to upload/update quiz banner:", err));
    }
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
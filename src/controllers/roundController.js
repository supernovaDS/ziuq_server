import Round from '../models/Round.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import { deleteFromCloudinary } from '../utils/cloudinaryHelper.js';

export const createRound = async (req, res) => {
  try {
    const { quizId, title, description, numberOfQuestions, pointsCorrect, pointsNegative, roundNumber, timeLimit } = req.body;

    // 1. Verify Quiz ownership
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: This isn't your quiz" });
    }

    // 2. Handle Media
    let mediaUrl = "";
    let mediaType = "none";
    
    if (req.file) {
      mediaUrl = req.file.path;
      // Determine if it's a video or image based on file extension/mimetype
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    // 3. Create Round
    const round = await Round.create({
      quizId,
      title,
      description,
      mediaUrl,
      mediaType,
      numberOfQuestions: Number(numberOfQuestions),
      pointsCorrect: Number(pointsCorrect),
      pointsNegative: Number(pointsNegative),
      roundNumber: Number(roundNumber),
      timeLimit: Number(timeLimit)
    });

    res.status(201).json({ message: "Round added successfully", round });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Round number already exists for this quiz" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getQuizRounds = async (req, res) => {
  try {
    const rounds = await Round.find({ quizId: req.params.quizId }).sort({ roundNumber: 1 });
    res.status(200).json(rounds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a round
export const updateRound = async (req, res) => {
  try {
    const { id } = req.params;
    const round = await Round.findById(id);
    
    // ... (Ownership Check)

    // Check if a new file is being uploaded
    if (req.file) {
      // 1. Delete the OLD media from Cloudinary if it exists
      if (round.mediaUrl) {
        await deleteFromCloudinary(round.mediaUrl);
      }
      
      // 2. Set the NEW media details
      round.mediaUrl = req.file.path;
      round.mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    // ... (Update other text fields like title, description, etc.)

    const updatedRound = await round.save();
    res.status(200).json({ message: "Round updated and old media cleared!", round: updatedRound });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a round and its questions
export const deleteRound = async (req, res) => {
  try {
    const { id } = req.params;

    const round = await Round.findById(id);
    if (!round) return res.status(404).json({ message: "Round not found" });

    // ... (Ownership Check)

    // 1. Delete Round Media from Cloudinary
    if (round.mediaUrl) {
      await deleteFromCloudinary(round.mediaUrl);
    }

    // 2. Cascading Delete: Questions inside this round often have media too!
    // We should find them and delete their media first
    const questions = await Question.find({ roundId: id });
    for (const q of questions) {
      if (q.questionMedia && q.questionMedia.length > 0) {
        await Promise.all(q.questionMedia.map(url => deleteFromCloudinary(url)));
      }
    }
    await Question.deleteMany({ roundId: id });

    // 3. Finally, delete the Round from DB
    await Round.findByIdAndDelete(id);

    res.status(200).json({ message: "Round, its questions, and all media deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
import Round from '../models/Round.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../utils/cloudinaryHelper.js';

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
    let mediaType = "none";
    
    if (req.file) {
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    // 3. Create Round
    const round = await Round.create({
      quizId,
      title,
      description,
      mediaUrl: "", // Will be uploaded asynchronously
      mediaType,
      numberOfQuestions: Number(numberOfQuestions),
      pointsCorrect: Number(pointsCorrect),
      pointsNegative: Number(pointsNegative),
      roundNumber: Number(roundNumber),
      timeLimit: Number(timeLimit)
    });

    res.status(201).json({ message: "Round added!", round });

    // 4. Handle Upload Asynchronously
    if (req.file) {
      uploadToCloudinary(req.file.path, "quiz_rounds_media")
        .then(async (url) => {
          round.mediaUrl = url;
          await round.save();
        })
        .catch(err => console.error("Failed to upload round media:", err));
    }
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
    const file = req.file;
    const oldMediaUrl = round.mediaUrl;
    if (file) {
      // 2. Set the NEW media details immediately but wait for url
      round.mediaType = file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    // ... (Update other text fields like title, description, etc.)

    const updatedRound = await round.save();
    res.status(200).json({ message: "Round updated!", round: updatedRound });

    // Handle File Update Asynchronously
    if (file) {
      uploadToCloudinary(file.path, "quiz_rounds_media")
        .then(async (url) => {
          round.mediaUrl = url;
          await round.save();
          if (oldMediaUrl) {
           await deleteFromCloudinary(oldMediaUrl);
          }
        })
        .catch(err => console.error("Failed to upload/update round media:", err));
    }
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
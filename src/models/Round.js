import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  title: { type: String, required: true },
  description: { type: String },
  
  // Media Section
  mediaUrl: { type: String, default: "" },
  mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },

  // Scoring & Rules
  numberOfQuestions: { type: Number, required: true },
  pointsCorrect: { type: Number, default: 10 },
  pointsNegative: { type: Number, default: 0 },
  roundNumber: { type: Number, required: true }, // To keep them in order (1, 2, 3...)
  
}, { timestamps: true });

// Prevent duplicate round numbers in the same quiz
roundSchema.index({ quizId: 1, roundNumber: 1 }, { unique: true });

const Round = mongoose.model('Round', roundSchema);
export default Round;
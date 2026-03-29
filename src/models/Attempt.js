import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  quizId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quiz', 
    required: true 
  },
  score: { type: Number, required: true },
  accuracy: { type: Number, required: true }, // Percentage
  attemptNumber: { type: Number, required: true }, // 1st, 2nd, 3rd attempt
  // dateAttempted is handled by timestamps (createdAt)
}, { timestamps: true });

// Index for fast lookups of a user's history on a specific quiz
attemptSchema.index({ userId: 1, quizId: 1 });

export default mongoose.model('Attempt', attemptSchema);
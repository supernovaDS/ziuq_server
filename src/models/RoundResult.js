import mongoose from 'mongoose';

const roundResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  roundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Round', required: true },
  
  totalScore: { type: Number, required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    userAnswer: String,
    score: Number,
    feedback: String
  }],
  
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('RoundResult', roundResultSchema);
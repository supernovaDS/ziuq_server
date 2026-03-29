import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  roundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Round', required: true },
  
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  questionMedia: [{ type: String }], // Array for multiple files
  correctAnswer: { type: String, required: true },

  // 📝 The flexible instruction field
  checkingInstruction: { 
    type: String, 
    default: "Ignore minor spelling mistakes. Award full points if the meaning is correct." 
  },
  
  maxPoints: { type: Number, default: 10 } 
}, { timestamps: true });

questionSchema.index({ roundId: 1, questionNumber: 1 }, { unique: true });

export default mongoose.model('Question', questionSchema);
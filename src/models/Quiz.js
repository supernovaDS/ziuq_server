import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  topic: { type: String, required: true },
  bannerUrl: { type: String, default: "" }, // Populated by Cloudinary
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  isCompleted: { type: Boolean, default: false },
  numberOfRounds: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
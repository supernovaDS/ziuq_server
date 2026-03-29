import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  
  // Stats object with default values
  stats: {
    totalQuizzes: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 } // Percentage (0-100)
  }
}, { timestamps: true });

// Note: Mongoose automatically creates a unique 'userid' as '_id'
const User = mongoose.model('User', userSchema);
export default User;
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import 'dotenv/config';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import attemptRoutes from './routes/attempt.routes.js';
import roundRoutes from './routes/round.routes.js';
import questionRoutes from './routes/question.routes.js';
import userRoutes from './routes/user.routes.js'

const app = express();
const port = process.env.PORT || 4000


const allowedOrigins = [
  'http://localhost:5173',
  'https://ziuq-client.vercel.app'
];


const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};


app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
connectDB();


app.get('/', (req,res) => {
    res.status(200).send("API WORKING");
})


app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/rounds', roundRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/user', userRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
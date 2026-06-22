require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const AnalysisResult = require('./models/AnalysisResult');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(helmet());

// CORS configuration - restricted to frontend URL only
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendUrl,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const resumeAnalyzerRouter = require('./routes/resumeAnalyzer');
const interviewPracticeRouter = require('./routes/interviewPractice');
const resumeInterviewRouter = require('./routes/resumeInterview');
const techBuddyRouter = require('./routes/techBuddy');

app.use('/api/resume-analyzer', resumeAnalyzerRouter);
app.use('/api/interview', interviewPracticeRouter);
app.use('/api/resume-interview', resumeInterviewRouter);
app.use('/api/tech-buddy', techBuddyRouter);

// Dashboard Recent Activity Endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const lastResumeAnalysis = await AnalysisResult.findOne({ type: 'resume-analyzer' }).sort({ createdAt: -1 });
    const lastResumeInterview = await AnalysisResult.findOne({ type: 'resume-interview' }).sort({ createdAt: -1 });
    const lastTechInterview = await AnalysisResult.findOne({ type: 'tech-interview' }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      lastResumeAnalysisScore: lastResumeAnalysis ? lastResumeAnalysis.score : null,
      lastResumeInterviewScore: lastResumeInterview ? lastResumeInterview.score : null,
      lastTechInterviewScore: lastTechInterview ? lastTechInterview.score : null
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

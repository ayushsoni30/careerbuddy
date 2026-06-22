const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { callGemini } = require('../utils/gemini');
const AnalysisResult = require('../models/AnalysisResult');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup
const upload = multer({
  dest: uploadsDir,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/resume-interview/generate
router.post('/generate', aiRateLimiter, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a resume PDF file.' });
  }

  const tempFilePath = req.file.path;

  try {
    const fileBuffer = fs.readFileSync(tempFilePath);
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || !resumeText.trim()) {
      throw new Error('Could not extract text content from the uploaded PDF. It might be scanned or empty.');
    }

    const prompt = `You are a technical interviewer. Read this resume carefully and generate 12 personalized interview questions based on the candidate's projects, skills, and experience mentioned.
Resume: ${resumeText}
Return JSON array of question strings only. No numbering, no markdown fences.`;

    const responseText = await callGemini(prompt, '', true);
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleanJson);

    if (!Array.isArray(questions)) {
      throw new Error('Invalid format returned from AI helper (expected an array of questions)');
    }

    return res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Error generating resume interview questions:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate questions from resume.' });
  } finally {
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        console.error('Failed to delete temp file:', unlinkError);
      }
    }
  }
});

// POST /api/resume-interview/evaluate
router.post('/evaluate', aiRateLimiter, async (req, res) => {
  const { answers } = req.body; // answers is an array of { question, userAnswer }
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Answers are required for evaluation.' });
  }

  try {
    const questionsAndAnswers = JSON.stringify(answers, null, 2);
    const prompt = `You are a senior interviewer. Evaluate the following answers based on the candidate's resume context.
Questions and answers: ${questionsAndAnswers}
Return JSON with:
- totalScore: number (0-100)
- pros: array of strings (strong points)
- cons: array of strings (weak points, areas to improve)
- feedback: array of objects { question, userAnswer, verdict (correct/partial/wrong), suggestion }
Return only valid JSON, no markdown fences.`;

    const responseText = await callGemini(prompt, '', true);
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanJson);

    const newResult = new AnalysisResult({
      type: 'resume-interview',
      score: result.totalScore || 0,
      pros: result.pros || [],
      cons: result.cons || [],
      feedback: result.feedback || []
    });

    await newResult.save();

    return res.json({
      success: true,
      data: newResult
    });
  } catch (error) {
    console.error('Error evaluating resume-based interview:', error);
    return res.status(500).json({ error: error.message || 'Failed to evaluate interview answers.' });
  }
});

module.exports = router;

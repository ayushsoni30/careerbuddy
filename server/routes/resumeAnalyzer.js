const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { callGemini } = require('../utils/gemini');
const AnalysisResult = require('../models/AnalysisResult');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const upload = multer({
  dest: uploadsDir,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

router.post('/', aiRateLimiter, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a resume PDF file.' });
  }

  const { jobDescription } = req.body;
  if (!jobDescription || !jobDescription.trim()) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ error: 'Job description is required.' });
  }

  const tempFilePath = req.file.path;

  try {
    const fileBuffer = fs.readFileSync(tempFilePath);
    const pdfParser = new PDFParse({ data: fileBuffer });
    const parsedPdf = await pdfParser.getText();
    const resumeText = parsedPdf.text;
    await pdfParser.destroy();

    if (!resumeText || !resumeText.trim()) {
      throw new Error('Could not extract text content from the uploaded PDF. It might be scanned or empty.');
    }

    const prompt = `You are a professional resume reviewer. Given the resume and job description below, return a JSON object with:
- score: number (0-100)
- pros: array of strings (max 5)
- cons: array of strings (max 5)
Resume: ${resumeText}
Job Description: ${jobDescription}
Return only valid JSON, no explanation, no markdown fences.`;

    const geminiResponse = await callGemini(prompt, '', true);
    const cleanJson = geminiResponse.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanJson);

    const newResult = new AnalysisResult({
      type: 'resume-analyzer',
      score: result.score || 0,
      pros: result.pros || [],
      cons: result.cons || []
    });

    await newResult.save();

    return res.json({
      success: true,
      data: newResult
    });
  } catch (error) {
    console.error('Resume analysis endpoint error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during resume analysis.' });
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

module.exports = router;

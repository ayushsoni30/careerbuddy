const express = require('express');
const router = express.Router();
const { callGemini } = require('../utils/gemini');
const AnalysisResult = require('../models/AnalysisResult');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// POST /api/interview/generate
router.post('/generate', aiRateLimiter, async (req, res) => {
  console.log("=== GENERATE ROUTE HIT ===");
  console.log("Request Body:", req.body);

  const { technology } = req.body;

  if (!technology || !technology.trim()) {
    return res.status(400).json({ error: 'Technology is required.' });
  }

  try {
    const prompt = `Generate 15 top interview questions for ${technology}. Return JSON array of strings only. No numbering, no explanation, no markdown fences.`;

    console.log("Calling Gemini...");

    const responseText = await callGemini(prompt, '', true);

    console.log("Gemini Response:", responseText);

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
    console.error('Error generating tech interview questions:', error);

    return res.status(500).json({
      error: error.message || 'Failed to generate interview questions.'
    });
  }
});

// POST /api/interview/evaluate
router.post('/evaluate', aiRateLimiter, async (req, res) => {
  const { technology, answers } = req.body;

  if (!technology || !technology.trim()) {
    return res.status(400).json({ error: 'Technology is required.' });
  }

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({
      error: 'Interview answers are required for evaluation.'
    });
  }

  try {
    const questionsAndAnswers = JSON.stringify(answers, null, 2);

    const prompt = `You are a senior interviewer. Evaluate the following answers for ${technology} interview questions.

Questions and answers:
${questionsAndAnswers}

Return JSON with:
- totalScore: number (0-100)
- feedback: array of objects { question, userAnswer, verdict (correct/partial/wrong), suggestion }
- strengths: array of strings
- weaknesses: array of strings

Return only valid JSON, no markdown fences.`;

    const responseText = await callGemini(prompt, '', true);

    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanJson);

    const newResult = new AnalysisResult({
      type: 'tech-interview',
      technology,
      score: result.totalScore || 0,
      pros: result.strengths || [],
      cons: result.weaknesses || [],
      feedback: result.feedback || []
    });

    await newResult.save();

    return res.json({
      success: true,
      data: newResult
    });

  } catch (error) {
    console.error('Error evaluating tech interview:', error);

    return res.status(500).json({
      error: error.message || 'Failed to evaluate interview answers.'
      
    });
  }
});

module.exports = router;
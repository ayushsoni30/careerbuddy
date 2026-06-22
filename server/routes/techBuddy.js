const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const { callGemini } = require('../utils/gemini');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const SYSTEM_PROMPT = `You are Tech Buddy, a highly knowledgeable technical assistant. You ONLY answer questions related to technology, programming, software development, DevOps, career roadmaps in IT, and related technical topics. If someone asks about anything non-technical, politely decline and say you only discuss tech topics. Always format your responses using Markdown: use headings, bullet points, code blocks where relevant. Be concise but thorough.`;

// GET /api/tech-buddy/history - List all chat sessions
router.get('/history', async (req, res) => {
  try {
    const sessions = await ChatHistory.find({}, 'sessionId updatedAt messages')
      .sort({ updatedAt: -1 });

    const sessionList = sessions.map(s => {
      // Find the first user message to use as the title
      const firstUserMsg = s.messages.find(m => m.role === 'user');
      const title = firstUserMsg 
        ? (firstUserMsg.content.length > 30 ? firstUserMsg.content.substring(0, 30) + '...' : firstUserMsg.content)
        : 'New Chat';
      return {
        sessionId: s.sessionId,
        updatedAt: s.updatedAt,
        title
      };
    });

    return res.json({
      success: true,
      sessions: sessionList
    });
  } catch (error) {
    console.error('Error fetching chat history list:', error);
    return res.status(500).json({ error: 'Failed to fetch chat history list.' });
  }
});

// GET /api/tech-buddy/history/:sessionId - Get detailed history for a session
router.get('/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const chat = await ChatHistory.findOne({ sessionId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }
    return res.json({
      success: true,
      messages: chat.messages
    });
  } catch (error) {
    console.error('Error fetching chat session details:', error);
    return res.status(500).json({ error: 'Failed to fetch chat session details.' });
  }
});

// POST /api/tech-buddy/chat - Post a message and get a reply
router.post('/chat', aiRateLimiter, async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !sessionId.trim()) {
    return res.status(400).json({ error: 'Session ID is required.' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    // Find or create chat history
    let chat = await ChatHistory.findOne({ sessionId });
    if (!chat) {
      chat = new ChatHistory({
        sessionId,
        messages: []
      });
    }

    // Append user message
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Format messages for Gemini API
    const geminiContents = chat.messages.map(m => ({
      role: m.role,
      parts: [
        {
          text: m.content
        }
      ]
    }));

    // Call Gemini with history
    const reply = await callGemini(geminiContents, SYSTEM_PROMPT, false);

    // Append model response
    chat.messages.push({
      role: 'model',
      content: reply,
      timestamp: new Date()
    });

    // Save chat history
    await chat.save();

    return res.json({
      success: true,
      reply,
      sessionId
    });

  } catch (error) {
    console.error('Error in Tech Buddy chat endpoint:', error);
    return res.status(500).json({ error: error.message || 'Failed to communicate with Tech Buddy.' });
  }
});

module.exports = router;

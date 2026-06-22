const mongoose = require('mongoose');

const AnalysisResultSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['resume-analyzer', 'resume-interview', 'tech-interview'],
    required: true
  },
  technology: {
    type: String
  },
  score: {
    type: Number,
    required: true
  },
  pros: {
    type: [String],
    default: []
  },
  cons: {
    type: [String],
    default: []
  },
  feedback: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);

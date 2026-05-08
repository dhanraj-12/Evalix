const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  status: { type: String, enum: ['in_progress', 'submitted', 'graded'], default: 'in_progress' },
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  autoScore: { type: Number, default: 0 },
  manualScore: { type: Number, default: 0 },
  aiScore: { type: Number, default: 0 },
  aiSummary: { type: String, default: '' },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);

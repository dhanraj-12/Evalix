const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Option' }],
  textAnswer: { type: String, default: '' },
  numericalAnswer: { type: Number },
  fileUrl: { type: String, default: '' },
  isCorrect: { type: Boolean },
  marksAwarded: { type: Number, default: 0 },
  isAutoGraded: { type: Boolean, default: false },
  isManuallyGraded: { type: Boolean, default: false },
  isAiGraded: { type: Boolean, default: false },
  feedback: { type: String, default: '' },
  aiFeedback: { type: String, default: '' }
}, { timestamps: true });

responseSchema.index({ attempt: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);

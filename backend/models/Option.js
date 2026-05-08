const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  text: { type: String, required: true },
  textMr: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' }
}, { timestamps: true });

module.exports = mongoose.model('Option', optionSchema);

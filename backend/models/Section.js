const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  title: { type: String, required: true },
  titleMr: { type: String, default: '' },
  description: { type: String, default: '' },
  descriptionMr: { type: String, default: '' },
  order: { type: Number, default: 0 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);

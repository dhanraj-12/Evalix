const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  text: { type: String, required: true },
  textMr: { type: String, default: '' },
  type: { type: String, enum: ['SCMCQ', 'MCMCQ', 'Numerical', 'Text', 'FileUpload'], required: true },
  marks: { type: Number, default: 1 },
  correctAnswer: { type: String, default: '' },
  order: { type: Number, default: 0 },
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Option' }]
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);

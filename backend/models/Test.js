const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleMr: { type: String, default: '' },
  description: { type: String, default: '' },
  descriptionMr: { type: String, default: '' },
  type: { type: String, enum: ['MMSE', 'MoCA', 'ACE-III', 'CDR', 'Custom'], default: 'Custom' },
  duration: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  negativeMarking: { type: Boolean, default: false },
  negativeMarks: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }]
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);

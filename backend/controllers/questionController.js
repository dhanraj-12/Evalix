const Question = require('../models/Question');
const Section = require('../models/Section');
const Option = require('../models/Option');

exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    await Section.findByIdAndUpdate(req.body.section, { $push: { questions: question._id } });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestionsBySection = async (req, res) => {
  try {
    const questions = await Question.find({ section: req.params.sectionId })
      .populate('options')
      .populate('media')
      .sort('order');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('options').populate('media');
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    await Section.findByIdAndUpdate(question.section, { $pull: { questions: question._id } });
    await Option.deleteMany({ question: question._id });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

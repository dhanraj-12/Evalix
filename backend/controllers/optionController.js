const Option = require('../models/Option');
const Question = require('../models/Question');

exports.createOption = async (req, res) => {
  try {
    const option = await Option.create(req.body);
    await Question.findByIdAndUpdate(req.body.question, { $push: { options: option._id } });
    res.status(201).json(option);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOptionsByQuestion = async (req, res) => {
  try {
    const options = await Option.find({ question: req.params.questionId });
    res.json(options);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOption = async (req, res) => {
  try {
    const option = await Option.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!option) return res.status(404).json({ message: 'Option not found' });
    res.json(option);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteOption = async (req, res) => {
  try {
    const option = await Option.findByIdAndDelete(req.params.id);
    if (!option) return res.status(404).json({ message: 'Option not found' });
    await Question.findByIdAndUpdate(option.question, { $pull: { options: option._id } });
    res.json({ message: 'Option deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

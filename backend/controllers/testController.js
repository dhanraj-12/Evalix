const Test = require('../models/Test');
const Section = require('../models/Section');
const Question = require('../models/Question');
const Option = require('../models/Option');

exports.createTest = async (req, res) => {
  try {
    const test = await Test.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().populate('createdBy', 'name email').sort('-createdAt');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPublishedTests = async (req, res) => {
  try {
    const tests = await Test.find({ isPublished: true }).sort('-createdAt');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate({
        path: 'sections',
        populate: {
          path: 'questions',
          populate: [
            { path: 'options' },
            { path: 'media' }
          ]
        }
      });
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const sections = await Section.find({ test: test._id });
    for (const section of sections) {
      const questions = await Question.find({ section: section._id });
      for (const q of questions) {
        await Option.deleteMany({ question: q._id });
      }
      await Question.deleteMany({ section: section._id });
    }
    await Section.deleteMany({ test: test._id });
    await Test.findByIdAndDelete(req.params.id);

    res.json({ message: 'Test deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

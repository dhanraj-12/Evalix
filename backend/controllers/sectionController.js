const Section = require('../models/Section');
const Test = require('../models/Test');

exports.createSection = async (req, res) => {
  try {
    const section = await Section.create(req.body);
    await Test.findByIdAndUpdate(req.body.test, { $push: { sections: section._id } });
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSectionsByTest = async (req, res) => {
  try {
    const sections = await Section.find({ test: req.params.testId })
      .populate({ path: 'questions', populate: [{ path: 'options' }, { path: 'media' }] })
      .sort('order');
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    await Test.findByIdAndUpdate(section.test, { $pull: { sections: section._id } });
    res.json({ message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

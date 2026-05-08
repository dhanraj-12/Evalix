const Response = require('../models/Response');

exports.saveResponse = async (req, res) => {
  try {
    const { attempt, question, selectedOptions, textAnswer, numericalAnswer, fileUrl } = req.body;

    const response = await Response.findOneAndUpdate(
      { attempt, question },
      { selectedOptions, textAnswer, numericalAnswer, fileUrl },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getResponsesByAttempt = async (req, res) => {
  try {
    const responses = await Response.find({ attempt: req.params.attemptId })
      .populate({
        path: 'question',
        populate: [{ path: 'options' }, { path: 'media' }]
      });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadResponseFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { attempt, question } = req.body;
    const response = await Response.findOneAndUpdate(
      { attempt, question },
      { fileUrl: req.file.location },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

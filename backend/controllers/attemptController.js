const Attempt = require('../models/Attempt');
const Test = require('../models/Test');
const Response = require('../models/Response');

exports.startAttempt = async (req, res) => {
  try {
    const test = await Test.findById(req.body.testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Return existing in_progress attempt if one exists
    const existing = await Attempt.findOne({
      test: req.body.testId,
      user: req.user._id,
      status: 'in_progress'
    });
    if (existing) return res.json(existing);

    const attempt = await Attempt.create({
      test: req.body.testId,
      user: req.user._id,
      maxScore: test.totalMarks
    });
    res.status(201).json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status to submitted
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    await attempt.save();

    // Auto-grade immediately on submission
    const Question = require('../models/Question');
    const responses = await Response.find({ attempt: attempt._id });
    let autoScore = 0;

    for (const response of responses) {
      const question = await Question.findById(response.question).populate('options');
      if (!question) continue;

      let marks = 0;

      if (question.type === 'SCMCQ') {
        const correctOpt = question.options.find(o => o.isCorrect);
        if (correctOpt && response.selectedOptions.length === 1 &&
            response.selectedOptions[0].toString() === correctOpt._id.toString()) {
          marks = question.marks;
          response.isCorrect = true;
        }
        response.isAutoGraded = true;
      } else if (question.type === 'MCMCQ') {
        const correctIds = question.options.filter(o => o.isCorrect).map(o => o._id.toString());
        const selected = response.selectedOptions.map(o => o.toString());
        const correctSelected = selected.filter(s => correctIds.includes(s));
        const incorrectSelected = selected.filter(s => !correctIds.includes(s));

        if (correctIds.length > 0) {
          marks = (correctSelected.length / correctIds.length) * question.marks;
          if (incorrectSelected.length > 0) marks = Math.max(0, marks - (incorrectSelected.length * 0.5));
          marks = Math.round(marks * 100) / 100;
          response.isCorrect = correctSelected.length === correctIds.length && incorrectSelected.length === 0;
        }
        response.isAutoGraded = true;
      } else if (question.type === 'Numerical') {
        if (response.numericalAnswer !== undefined && response.numericalAnswer !== null) {
          const expected = parseFloat(question.correctAnswer);
          if (!isNaN(expected) && parseFloat(response.numericalAnswer) === expected) {
            marks = question.marks;
            response.isCorrect = true;
          }
        }
        response.isAutoGraded = true;
      }
      // Text and FileUpload are NOT auto-graded

      if (response.isAutoGraded) {
        response.marksAwarded = marks;
        await response.save();
        autoScore += marks;
      }
    }

    attempt.autoScore = autoScore;
    attempt.totalScore = autoScore;
    await attempt.save();

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttemptsByUser = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('test', 'title titleMr type totalMarks duration')
      .sort('-createdAt');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('test')
      .populate('user', 'name email');
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAttempts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.testId) filter.test = req.query.testId;
    if (req.query.status) filter.status = req.query.status;

    const attempts = await Attempt.find(filter)
      .populate('test', 'title titleMr type totalMarks')
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

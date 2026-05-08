const Attempt = require('../models/Attempt');
const Response = require('../models/Response');
const Question = require('../models/Question');
const Option = require('../models/Option');
const Test = require('../models/Test');

exports.autoGrade = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const test = await Test.findById(attempt.test);
    const responses = await Response.find({ attempt: attempt._id });
    let autoScore = 0;

    for (const response of responses) {
      const question = await Question.findById(response.question).populate('options');
      if (!question) continue;

      let correct = false;
      let marks = 0;

      if (question.type === 'SCMCQ') {
        const correctOption = question.options.find(o => o.isCorrect);
        if (correctOption && response.selectedOptions.length === 1 &&
            response.selectedOptions[0].toString() === correctOption._id.toString()) {
          correct = true;
          marks = question.marks;
        } else if (response.selectedOptions.length > 0 && test.negativeMarking) {
          marks = -(test.negativeMarks || 0);
        }
      } else if (question.type === 'MCMCQ') {
        const correctOptions = question.options.filter(o => o.isCorrect).map(o => o._id.toString());
        const selected = response.selectedOptions.map(o => o.toString());
        const correctSelected = selected.filter(s => correctOptions.includes(s));
        const incorrectSelected = selected.filter(s => !correctOptions.includes(s));

        if (correctOptions.length > 0) {
          marks = (correctSelected.length / correctOptions.length) * question.marks;
          if (incorrectSelected.length > 0 && test.negativeMarking) {
            marks -= (incorrectSelected.length * (test.negativeMarks || 0));
          }
          marks = Math.max(0, marks);
          correct = correctSelected.length === correctOptions.length && incorrectSelected.length === 0;
        }
      } else if (question.type === 'Numerical') {
        if (response.numericalAnswer !== undefined && response.numericalAnswer !== null) {
          const expected = parseFloat(question.correctAnswer);
          if (!isNaN(expected) && parseFloat(response.numericalAnswer) === expected) {
            correct = true;
            marks = question.marks;
          } else if (test.negativeMarking) {
            marks = -(test.negativeMarks || 0);
          }
        }
      }

      if (question.type === 'SCMCQ' || question.type === 'MCMCQ' || question.type === 'Numerical') {
        response.isCorrect = correct;
        response.marksAwarded = marks;
        response.isAutoGraded = true;
        await response.save();
        autoScore += marks;
      }
    }

    attempt.autoScore = autoScore;
    attempt.totalScore = autoScore + attempt.manualScore;
    await attempt.save();

    res.json({ autoScore, totalScore: attempt.totalScore, attempt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.manualGrade = async (req, res) => {
  try {
    const { responseId, marksAwarded, feedback } = req.body;
    const response = await Response.findById(responseId);
    if (!response) return res.status(404).json({ message: 'Response not found' });

    response.marksAwarded = marksAwarded;
    response.feedback = feedback || '';
    response.isManuallyGraded = true;
    await response.save();

    const attempt = await Attempt.findById(response.attempt);
    const allResponses = await Response.find({ attempt: attempt._id });

    let manualScore = 0;
    let autoScore = 0;
    for (const r of allResponses) {
      if (r.isAutoGraded) autoScore += r.marksAwarded;
      else if (r.isManuallyGraded) manualScore += r.marksAwarded;
    }

    attempt.autoScore = autoScore;
    attempt.manualScore = manualScore;
    attempt.totalScore = autoScore + manualScore;
    attempt.gradedBy = req.user._id;

    const allGraded = allResponses.every(r => r.isAutoGraded || r.isManuallyGraded);
    if (allGraded) attempt.status = 'graded';

    await attempt.save();

    res.json({ response, attempt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

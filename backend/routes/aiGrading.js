const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/aiGradingController');

// AI-powered grading for Text and FileUpload responses
router.post('/grade/:attemptId', auth, authorize('admin', 'tester'), ctrl.aiGradeAttempt);

// Generate AI cognitive summary for an attempt
router.post('/summary/:attemptId', auth, authorize('admin', 'tester'), ctrl.aiCognitiveSummary);

// Allow participants to view their own AI summary
router.get('/summary/:attemptId', auth, async (req, res) => {
  try {
    const Attempt = require('../models/Attempt');
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    res.json({ summary: attempt.aiSummary || '' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/gradingController');

router.post('/auto/:attemptId', auth, authorize('admin', 'tester'), ctrl.autoGrade);
router.post('/manual', auth, authorize('admin', 'tester'), ctrl.manualGrade);

module.exports = router;

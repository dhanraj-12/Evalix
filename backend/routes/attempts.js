const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/attemptController');

router.post('/start', auth, ctrl.startAttempt);
router.put('/:id/submit', auth, ctrl.submitAttempt);
router.get('/my', auth, ctrl.getAttemptsByUser);
router.get('/all', auth, authorize('admin', 'tester'), ctrl.getAllAttempts);
router.get('/:id', auth, ctrl.getAttemptById);

module.exports = router;

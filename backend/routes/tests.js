const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/testController');

router.get('/published', auth, ctrl.getPublishedTests);
router.get('/', auth, ctrl.getAllTests);
router.get('/:id', auth, ctrl.getTestById);
router.post('/', auth, authorize('admin'), ctrl.createTest);
router.put('/:id', auth, authorize('admin'), ctrl.updateTest);
router.delete('/:id', auth, authorize('admin'), ctrl.deleteTest);

module.exports = router;

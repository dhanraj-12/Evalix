const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/sectionController');

router.post('/', auth, authorize('admin'), ctrl.createSection);
router.get('/test/:testId', auth, ctrl.getSectionsByTest);
router.put('/:id', auth, authorize('admin'), ctrl.updateSection);
router.delete('/:id', auth, authorize('admin'), ctrl.deleteSection);

module.exports = router;

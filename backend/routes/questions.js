const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/questionController');

router.post('/', auth, authorize('admin'), ctrl.createQuestion);
router.get('/section/:sectionId', auth, ctrl.getQuestionsBySection);
router.get('/:id', auth, ctrl.getQuestionById);
router.put('/:id', auth, authorize('admin'), ctrl.updateQuestion);
router.delete('/:id', auth, authorize('admin'), ctrl.deleteQuestion);

module.exports = router;

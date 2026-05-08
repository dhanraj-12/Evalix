const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/optionController');

router.post('/', auth, authorize('admin'), ctrl.createOption);
router.get('/question/:questionId', auth, ctrl.getOptionsByQuestion);
router.put('/:id', auth, authorize('admin'), ctrl.updateOption);
router.delete('/:id', auth, authorize('admin'), ctrl.deleteOption);

module.exports = router;

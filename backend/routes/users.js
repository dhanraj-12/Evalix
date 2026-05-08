const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.get('/', auth, authorize('admin'), ctrl.getAllUsers);
router.put('/:id/role', auth, authorize('admin'), ctrl.updateUserRole);
router.delete('/:id', auth, authorize('admin'), ctrl.deleteUser);

module.exports = router;

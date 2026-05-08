const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/mediaController');
const { upload } = require('../config/s3');

router.post('/upload', auth, authorize('admin', 'tester'), upload.single('file'), ctrl.uploadMedia);
router.get('/', auth, ctrl.getAllMedia);
router.delete('/:id', auth, authorize('admin'), ctrl.deleteMedia);

module.exports = router;

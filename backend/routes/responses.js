const router = require('express').Router();
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/responseController');
const { upload } = require('../config/s3');

router.post('/', auth, ctrl.saveResponse);
router.get('/attempt/:attemptId', auth, ctrl.getResponsesByAttempt);
router.post('/upload', auth, upload.single('file'), ctrl.uploadResponseFile);

module.exports = router;

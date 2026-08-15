const express = require('express');
const router = express.Router();
const { downloadDigest, getDigests } = require('../controllers/digestController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Route to trigger download of digest .eml file
router.post('/download', protect, admin, downloadDigest);

// Route to get digest history
router.get('/', protect, admin, getDigests);

module.exports = router;

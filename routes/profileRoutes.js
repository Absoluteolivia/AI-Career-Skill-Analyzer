const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, setCareerGoal } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/career-goal', protect, setCareerGoal);

module.exports = router;

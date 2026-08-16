const express = require('express');
const router = express.Router();
const { analyzeUserSkills, updateTaskProgress } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeUserSkills);
router.patch('/progress/:taskId', protect, updateTaskProgress);

module.exports = router;

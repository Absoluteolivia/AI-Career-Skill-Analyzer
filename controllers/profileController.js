const User = require('../models/User');

// @desc    Get user profile details
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (education, skills, projects)
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { education, skills, projects } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (education !== undefined) user.education = education;
    if (skills !== undefined) {
      // Clean up skill strings: trim whitespace, remove duplicates
      user.skills = Array.from(new Set(skills.map(s => s.trim()).filter(Boolean)));
    }
    if (projects !== undefined) user.projects = projects;

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        skills: updatedUser.skills,
        education: updatedUser.education,
        projects: updatedUser.projects,
        careerGoal: updatedUser.careerGoal
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set/Update user career goal
// @route   PUT /api/profile/career-goal
// @access  Private
const setCareerGoal = async (req, res) => {
  try {
    const { careerGoal } = req.body;

    if (!careerGoal) {
      return res.status(400).json({ message: 'Please select a valid career goal' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.careerGoal = careerGoal;
    await user.save();

    res.json({
      message: 'Career goal updated successfully',
      careerGoal: user.careerGoal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  setCareerGoal
};

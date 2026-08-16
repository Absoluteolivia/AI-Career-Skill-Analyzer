const User = require('../models/User');
const axios = require('axios');

// Fallback logic in JavaScript if Python service is offline
const fallbackAnalysis = (userSkills = [], careerGoal = 'Full Stack Developer') => {
  const benchmarks = {
    'Full Stack Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Git'],
    'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS', 'Redux', 'Git'],
    'Backend Developer': ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Python', 'REST APIs', 'Docker', 'Git'],
    'Data Scientist': ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization', 'Scikit-Learn', 'Git'],
    'AI/ML Engineer': ['Python', 'PyTorch', 'TensorFlow', 'Machine Learning', 'Deep Learning', 'NLP', 'OpenCV', 'Git'],
    'DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Python', 'Bash', 'Terraform', 'Git']
  };

  const required = benchmarks[careerGoal] || benchmarks['Full Stack Developer'];
  const userSet = new Set(userSkills.map(s => s.toLowerCase().trim()));

  const matched = [];
  const missing = [];

  required.forEach(skill => {
    if (userSet.has(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const matchPercentage = Math.round((matched.length / required.length) * 100);

  const roadmap = missing.map((skill, index) => ({
    title: `Master ${skill}`,
    description: `Learn foundational and practical concepts of ${skill} to become job-ready for ${careerGoal}.`,
    level: index < 2 ? 'Beginner' : index < 4 ? 'Intermediate' : 'Advanced',
    resources: [`Official ${skill} Docs`, `FreeCodeCamp ${skill} Guide`, `Build a ${skill} mini-project`],
    completed: false
  }));

  if (missing.length === 0) {
    roadmap.push({
      title: `Build Capstone ${careerGoal} Portfolio Project`,
      description: `All core skills matched! Create a production-ready application for your resume.`,
      level: 'Advanced',
      resources: ['GitHub Portfolio Best Practices', 'Deployment on Vercel/Render'],
      completed: false
    });
  }

  return {
    match_percentage: matchPercentage,
    matched_skills: matched,
    missing_skills: missing,
    roadmap
  };
};

// @desc    Perform skill analysis & generate roadmap via FastAPI (or fallback)
// @route   POST /api/analysis/analyze
// @access  Private
const analyzeUserSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fastApiUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
    let analysisData;

    try {
      // Call Python FastAPI service
      console.log(`🤖 Sending analysis request to Python FastAPI (${fastApiUrl}/analyze)...`);
      const response = await axios.post(`${fastApiUrl}/analyze`, {
        user_skills: user.skills || [],
        career_goal: user.careerGoal || 'Full Stack Developer'
      }, { timeout: 3000 });

      analysisData = response.data;
      console.log('✅ FastAPI analysis response received successfully');
    } catch (apiError) {
      console.warn('⚠️ Python FastAPI service unreachable. Using Express fallback engine:', apiError.message);
      analysisData = fallbackAnalysis(user.skills, user.careerGoal);
    }

    // Save result in user model
    user.analysisResult = {
      matchPercentage: analysisData.match_percentage,
      matchedSkills: analysisData.matched_skills,
      missingSkills: analysisData.missing_skills,
      analyzedAt: new Date()
    };

    // Format roadmap for Mongoose
    user.roadmap = analysisData.roadmap.map(item => ({
      title: item.title,
      description: item.description,
      level: item.level,
      resources: item.resources,
      completed: false
    }));

    await user.save();

    res.json({
      message: 'Skill analysis completed successfully',
      careerGoal: user.careerGoal,
      analysisResult: user.analysisResult,
      roadmap: user.roadmap
    });
  } catch (error) {
    console.error('Analysis Controller Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle completion status of a roadmap task
// @route   PATCH /api/analysis/progress/:taskId
// @access  Private
const updateTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completed } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const task = user.roadmap.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Roadmap task not found' });
    }

    task.completed = completed !== undefined ? completed : !task.completed;
    await user.save();

    res.json({
      message: 'Task progress updated',
      task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  analyzeUserSkills,
  updateTaskProgress
};

const mongoose = require('mongoose');

const roadmapTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  resources: [{ type: String }],
  completed: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  education: [
    {
      degree: { type: String, trim: true },
      institution: { type: String, trim: true },
      passoutYear: { type: String, trim: true }
    }
  ],
  skills: [
    {
      type: String,
      trim: true
    }
  ],
  projects: [
    {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      techStack: [{ type: String, trim: true }]
    }
  ],
  careerGoal: {
    type: String,
    default: 'Full Stack Developer',
    trim: true
  },
  analysisResult: {
    matchPercentage: { type: Number, default: 0 },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    analyzedAt: { type: Date }
  },
  roadmap: [roadmapTaskSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

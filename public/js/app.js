// DOM Element References
const alertBox = document.getElementById('alertBox');
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userGreeting = document.getElementById('userGreeting');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard Elements
const careerGoalSelect = document.getElementById('careerGoalSelect');
const saveGoalBtn = document.getElementById('saveGoalBtn');
const skillsInput = document.getElementById('skillsInput');
const saveSkillsBtn = document.getElementById('saveSkillsBtn');
const analyzeBtn = document.getElementById('analyzeBtn');

// Results & Roadmap Elements
const targetRoleLabel = document.getElementById('targetRoleLabel');
const matchBadge = document.getElementById('matchBadge');
const progressBar = document.getElementById('progressBar');
const matchedSkillsList = document.getElementById('matchedSkillsList');
const missingSkillsList = document.getElementById('missingSkillsList');
const roadmapCountBadge = document.getElementById('roadmapCountBadge');
const roadmapList = document.getElementById('roadmapList');

// Global Application State
let token = localStorage.getItem('token') || null;
let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();

  if (token) {
    fetchProfile();
  } else {
    showAuthView();
  }
});

// Show Notification Alert
function showAlert(message, type = 'success') {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove('hidden');

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 4000);
}

// Event Listeners Configuration
function setupEventListeners() {
  // Tab Switcher
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // Auth Forms Submission
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  logoutBtn.addEventListener('click', handleLogout);

  // Profile Action Handlers
  saveGoalBtn.addEventListener('click', handleSaveGoal);
  saveSkillsBtn.addEventListener('click', handleSaveSkills);
  analyzeBtn.addEventListener('click', handleRunAnalysis);
}

// Helper headers
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Fetch Current Profile
async function fetchProfile() {
  try {
    const res = await fetch('/api/profile', {
      headers: getHeaders()
    });

    if (!res.ok) {
      throw new Error('Session expired or invalid token');
    }

    currentUser = await res.json();
    showDashboardView();
    populateDashboard(currentUser);
  } catch (error) {
    console.error('Fetch profile error:', error.message);
    handleLogout();
  }
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    token = data.token;
    localStorage.setItem('token', token);
    currentUser = data.user;

    showAlert('Welcome back, ' + currentUser.name + '!', 'success');
    showDashboardView();
    populateDashboard(currentUser);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Handle Registration
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    token = data.token;
    localStorage.setItem('token', token);
    currentUser = data.user;

    showAlert('Account created successfully!', 'success');
    showDashboardView();
    populateDashboard(currentUser);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Handle Logout
function handleLogout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  showAuthView();
  showAlert('Logged out successfully', 'success');
}

// Show/Hide Views
function showAuthView() {
  authSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
  userGreeting.textContent = 'Not logged in';
  logoutBtn.classList.add('hidden');
}

function showDashboardView() {
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  userGreeting.textContent = `👋 Hello, ${currentUser.name}`;
  logoutBtn.classList.remove('hidden');
}

// Populate Dashboard Fields
function populateDashboard(user) {
  if (user.careerGoal) {
    careerGoalSelect.value = user.careerGoal;
  }
  if (user.skills && Array.isArray(user.skills)) {
    skillsInput.value = user.skills.join(', ');
  }

  // Populate Analysis & Roadmap if already existing
  if (user.analysisResult && user.analysisResult.matchPercentage !== undefined) {
    renderAnalysisResults(user.careerGoal, user.analysisResult);
  }

  if (user.roadmap) {
    renderRoadmap(user.roadmap);
  }
}

// Save Career Goal
async function handleSaveGoal() {
  const careerGoal = careerGoalSelect.value;
  try {
    const res = await fetch('/api/profile/career-goal', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ careerGoal })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    showAlert('Target role saved: ' + careerGoal, 'success');
    if (currentUser) currentUser.careerGoal = careerGoal;
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Save User Skills
async function handleSaveSkills() {
  const skillsArray = skillsInput.value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ skills: skillsArray })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    showAlert('Skills updated successfully!', 'success');
    if (currentUser) currentUser.skills = skillsArray;
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Run AI Skill Analysis
async function handleRunAnalysis() {
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = '⏳ Analyzing Skills...';

  try {
    // 1. Ensure latest goal and skills are saved first
    await handleSaveGoal();
    await handleSaveSkills();

    // 2. Call analyze API
    const res = await fetch('/api/analysis/analyze', {
      method: 'POST',
      headers: getHeaders()
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    showAlert('Skill analysis complete! Roadmap generated.', 'success');

    // Render results
    renderAnalysisResults(data.careerGoal, data.analysisResult);
    renderRoadmap(data.roadmap);

    if (currentUser) {
      currentUser.analysisResult = data.analysisResult;
      currentUser.roadmap = data.roadmap;
    }
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = '⚡ Analyze Skills & Generate Roadmap';
  }
}

// Render Skill Analysis Overview
function renderAnalysisResults(careerGoal, result) {
  targetRoleLabel.textContent = `Target Role: ${careerGoal}`;
  const pct = result.matchPercentage || 0;
  matchBadge.textContent = `${pct}% Match`;
  progressBar.style.width = `${pct}%`;

  // Render matched skills
  matchedSkillsList.innerHTML = '';
  if (result.matchedSkills && result.matchedSkills.length > 0) {
    result.matchedSkills.forEach(skill => {
      const span = document.createElement('span');
      span.className = 'pill pill-green';
      span.textContent = `✓ ${skill}`;
      matchedSkillsList.appendChild(span);
    });
  } else {
    matchedSkillsList.innerHTML = '<span class="pill pill-gray">No matched skills yet</span>';
  }

  // Render missing skills
  missingSkillsList.innerHTML = '';
  if (result.missingSkills && result.missingSkills.length > 0) {
    result.missingSkills.forEach(skill => {
      const span = document.createElement('span');
      span.className = 'pill pill-orange';
      span.textContent = `+ ${skill}`;
      missingSkillsList.appendChild(span);
    });
  } else {
    missingSkillsList.innerHTML = '<span class="pill pill-green">🎉 All required skills matched!</span>';
  }
}

// Render Interactive Roadmap Checklist
function renderRoadmap(roadmapTasks) {
  if (!roadmapTasks || roadmapTasks.length === 0) {
    roadmapList.innerHTML = `
      <div class="placeholder-text">
        Click <strong>"Analyze Skills & Generate Roadmap"</strong> to generate your step-by-step career path!
      </div>
    `;
    roadmapCountBadge.textContent = '0 Tasks';
    return;
  }

  const completedCount = roadmapTasks.filter(t => t.completed).length;
  roadmapCountBadge.textContent = `${completedCount}/${roadmapTasks.length} Completed`;

  roadmapList.innerHTML = '';

  roadmapTasks.forEach((task, index) => {
    const item = document.createElement('div');
    item.className = `roadmap-item ${task.completed ? 'completed' : ''}`;

    const levelClass = task.level ? `level-${task.level.toLowerCase()}` : 'level-beginner';

    const resourcesHtml = (task.resources || [])
      .map(r => `<span class="resource-chip">📖 ${r}</span>`)
      .join(' ');

    item.innerHTML = `
      <input type="checkbox" class="task-checkbox" data-task-id="${task._id}" ${task.completed ? 'checked' : ''}>
      <div class="task-content">
        <div class="task-header">
          <span class="task-title">Step ${index + 1}: ${task.title}</span>
          <span class="level-tag ${levelClass}">${task.level || 'Beginner'}</span>
        </div>
        <p class="task-desc">${task.description}</p>
        <div class="resources-list">${resourcesHtml}</div>
      </div>
    `;

    // Attach checkbox toggle listener
    const checkbox = item.querySelector('.task-checkbox');
    checkbox.addEventListener('change', (e) => toggleTaskProgress(task._id, e.target.checked));

    roadmapList.appendChild(item);
  });
}

// Toggle Task Completion
async function toggleTaskProgress(taskId, completed) {
  try {
    const res = await fetch(`/api/analysis/progress/${taskId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ completed })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // Update local state
    if (currentUser && currentUser.roadmap) {
      const target = currentUser.roadmap.find(t => t._id === taskId);
      if (target) target.completed = completed;
      renderRoadmap(currentUser.roadmap);
    }
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

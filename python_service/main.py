from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="AI Career & Skill Analysis Service",
    description="Python FastAPI engine for calculating skill match percentage and generating learning roadmaps.",
    version="1.0.0"
)

# Benchmark database of career roles and required skills
ROLE_SKILL_BENCHMARKS = {
    "Full Stack Developer": [
        "HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "Git"
    ],
    "Frontend Developer": [
        "HTML", "CSS", "JavaScript", "React", "TypeScript", "Tailwind CSS", "Redux", "Git"
    ],
    "Backend Developer": [
        "JavaScript", "Node.js", "Express", "MongoDB", "SQL", "Python", "REST APIs", "Docker", "Git"
    ],
    "Data Scientist": [
        "Python", "SQL", "Pandas", "NumPy", "Machine Learning", "Data Visualization", "Scikit-Learn", "Git"
    ],
    "AI/ML Engineer": [
        "Python", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning", "NLP", "OpenCV", "Git"
    ],
    "DevOps Engineer": [
        "Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Python", "Bash", "Terraform", "Git"
    ]
}

# Request model
class SkillAnalysisRequest(BaseModel):
    user_skills: List[str]
    career_goal: str

# Response models
class RoadmapTask(BaseModel):
    title: str
    description: str
    level: str
    resources: List[str]

class SkillAnalysisResponse(BaseModel):
    career_goal: str
    match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    roadmap: List[RoadmapTask]

@app.get("/")
def read_root():
    return {
        "service": "AI Career & Skill Analysis Engine",
        "status": "active",
        "available_roles": list(ROLE_SKILL_BENCHMARKS.keys())
    }

@app.post("/analyze", response_model=SkillAnalysisResponse)
def analyze_skills(request: SkillAnalysisRequest):
    role = request.career_goal.strip()
    
    # Fallback to Full Stack Developer if role not directly matching key
    required_skills = ROLE_SKILL_BENCHMARKS.get(role)
    if not required_skills:
        # Case insensitive search fallback
        for key in ROLE_SKILL_BENCHMARKS:
            if key.lower() == role.lower():
                required_skills = ROLE_SKILL_BENCHMARKS[key]
                role = key
                break
        if not required_skills:
            required_skills = ROLE_SKILL_BENCHMARKS["Full Stack Developer"]
            role = "Full Stack Developer"

    # Normalize user skills (lowercase for accurate comparison)
    user_skills_set = set(s.strip().lower() for s in request.user_skills)
    
    matched_skills = []
    missing_skills = []

    for req_skill in required_skills:
        if req_skill.lower() in user_skills_set:
            matched_skills.append(req_skill)
        else:
            missing_skills.append(req_skill)

    # Calculate match percentage
    total_required = len(required_skills)
    matched_count = len(matched_skills)
    match_percentage = round((matched_count / total_required) * 100, 1) if total_required > 0 else 0.0

    # Generate customized learning roadmap for missing skills
    roadmap = []
    for index, skill in enumerate(missing_skills):
        level = "Beginner" if index < 2 else ("Intermediate" if index < 4 else "Advanced")
        roadmap.append(RoadmapTask(
            title=f"Master {skill}",
            description=f"Learn foundational and practical concepts of {skill} to become job-ready for {role}.",
            level=level,
            resources=[
                f"Official {skill} Documentation",
                f"FreeCodeCamp {skill} Tutorial",
                f"Build a mini project using {skill}"
            ]
        ))

    # Add a final portfolio project task if missing skills is empty or low
    if len(missing_skills) == 0:
        roadmap.append(RoadmapTask(
            title=f"Build Capstone {role} Project",
            description=f"You have matched all core skills! Build a full-featured showcase project for your portfolio.",
            level="Advanced",
            resources=["GitHub Portfolio Best Practices", "Deployment on Vercel/Render"]
        ))

    return SkillAnalysisResponse(
        career_goal=role,
        match_percentage=match_percentage,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        roadmap=roadmap
    )

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

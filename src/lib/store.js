import {
  initialUsers,
  initialScores,
  initialSkills,
  initialProjects,
  initialCertificates,
  initialCompanies,
  initialCourses,
  initialStudyMaterials,
  initialAdminStats
} from './data';

// Global in-memory cache for Next.js API routes (persists across hot-reloads)
global.__placement_db = global.__placement_db || {
  users: [...initialUsers],
  scores: { ...initialScores },
  skills: [...initialSkills],
  projects: [...initialProjects],
  certificates: [...initialCertificates],
  companies: [...initialCompanies],
  courses: [...initialCourses],
  materials: [...initialStudyMaterials],
  adminStats: { ...initialAdminStats }
};

export const db = global.__placement_db;

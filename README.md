# 🚀 PlacementPortal – Next.js Full-Stack Edition

A modern, intelligent, and scalable full-stack campus placement platform connecting **Students**, **Faculty Mentors**, and **Placement Administrators**. Designed to streamline the recruitment process, provide AI-driven career guidance, and manage academic evidence—all under one roof.

---

## 🛠️ Technology Stack

Built with a state-of-the-art modern web architecture to ensure performance, security, and scalability.

- **Framework**: [Next.js (App Router)](https://nextjs.org/) - Leverages Server-Side Rendering (SSR) and powerful Route Handlers.
- **Frontend & UI**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) for fluid, responsive, and premium glassmorphism styling, and [Lucide React](https://lucide.dev/) for crisp iconography.
- **Database & Authentication**: [Supabase](https://supabase.com/) - PostgreSQL database, native Authentication, and robust Row-Level Security (RLS).
- **AI Integration**: [Google Generative AI (Gemini API)](https://ai.google.dev/) - Powers the intelligent Career Coach widget.

---

## ✨ Full Feature Suite

### 🎓 1. Student Portal (`/dashboard`)
An empowering dashboard designed to make candidates placement-ready.
- **Skill Benchmarking & GitHub Heatmap**: Real-time integration and visualization of coding consistency.
- **Portfolio Evidence Submission**: Students can upload verified projects and certificates.
- **Assessment Readiness Breakdown**: Track readiness across multiple domains before the actual placement drives.
- **Resume ATS Scanner**: Built-in resume keyword matcher to ensure candidates pass the initial screening.

### 🤖 2. Interactive AI Career Coach (`/api/chatbot`)
Powered by Gemini API, this floating assistant provides round-the-clock guidance.
- **Real-Time Interview Advice**: Get tailored tips based on job descriptions.
- **ATS Resume Tips**: Suggestions to bypass Applicant Tracking Systems.
- **Company Preparation Blueprints**: On-demand roadmaps for top-tier companies.

### 📚 3. Learning Academy & Placement Prep (`/learning` & `/placement-prep`)
A structured environment for continuous upskilling.
- **Structured Curriculum**: Modules covering DSA, System Design, Aptitude, and Soft Skills.
- **Interactive Quizzes**: Test knowledge with real-time feedback.
- **Tier-1 Company Matching Matrix**: Match skillsets with expectations of Google, Microsoft, Amazon, etc.
- **Timed Mock Test Simulators**: Experience the pressure of real placement assessments.

### 👨‍🏫 4. Faculty Hub (`/faculty`)
Tools for mentors to guide and verify student progress.
- **Student Cohort Directory**: Monitor the performance of assigned student groups.
- **Evidence Verification Queue**: Streamlined interface to Approve or Reject student submissions.
- **Study Blueprint Uploads**: Seamlessly distribute study materials and resources to cohorts.

### 🛡️ 5. Admin Console (`/admin`)
Centralized control for placement administrators.
- **Placement Directorate KPIs**: High-level statistics on campus placement performance.
- **Campus User Role Management**: Govern access, roles, and security settings.
- **Recruitment Drive Launcher**: Announce and manage new company visits effortlessly.

---

## 🔑 Portal Access Credentials

Experience the platform from different perspectives using standard test credentials:

| Role | Username / Identifier | Password | Main Capabilities |
| :--- | :--- | :--- | :--- |
| **Master Admin** | `admin` (or `admin@portal.com`) | `admin@123` | Placement KPIs, Drive Publishing, Role Governance |
| **Faculty Mentor** | `faculty@portal.com` | `faculty123` | Evidence Verification, Study Materials Management |
| **Student Candidate**| `student@portal.com` | `student123` | Skill Benchmarking, Evidence Submission, AI Coach |

*Tip: The Master Admin can update credentials anytime via the **Admin Security & Credentials** modal in the Admin Console.*

---

## ⚙️ Quick Local Setup

1. **Install dependencies**: `npm install`
2. **Set up Environment Variables**: Configure `.env.local` with your Supabase keys and Gemini API key.
3. **Run the development server**: 
   ```bash
   npm run dev
   ```
4. **Open Application**: Navigate to `http://localhost:3000`

---

## 🔒 Security & Database (Supabase RLS)
The database schema includes hardened Row-Level Security policies defined in [`supabase_schema.sql`](supabase_schema.sql).
All tables (`users`, `companies`, `projects`, `certificates`, `scores`, `study_materials`, `courses`) have RLS enabled, restricting anonymous mutations and allowing only authorized roles (`FACULTY`, `ADMIN`) to modify sensitive records.

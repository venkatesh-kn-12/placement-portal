# PlacementPortal – Next.js Full-Stack Edition

A modern, full-stack campus placement intelligence platform connecting **Students**, **Faculty Mentors**, and **Placement Administrators**. Built entirely in **Next.js (App Router)** with **zero external Java Spring Boot or Supabase dependencies**.

---

## 🚀 Key Improvements & Architecture

1. **Pure Full-Stack Next.js (No Java Spring Boot Required)**:
   - Server-side Route Handlers (`/api/...`) manage all data persistence and API endpoints directly within Next.js.
   - Hot-reloading in-memory and client-side stores with instant updates across hot reloads.
2. **Removed Supabase Login & Registration**:
   - Zero remote JWKS network errors, no cloud dependencies.
   - Clean, modern authentication with **1-Click Test Profile Buttons** and standard credentials.
3. **Multi-Role Portals & Instant Role Switcher**:
   - 🎓 **Student Portal** (`/dashboard`): Assessment readiness breakdown, lockdown protection, verified projects, certificates, resume ATS scanner.
   - 📚 **Learning Academy** (`/learning`): Structured curriculum (DSA, System Design, Aptitude, Soft Skills), interactive lesson completion, and quiz engine.
   - 💼 **Placement Prep** (`/placement-prep`): Tier-1 company matching matrix (Google, Microsoft, Amazon, etc.), ATS keyword matcher, and timed mock test simulators.
   - 👨‍🏫 **Faculty Hub** (`/faculty`): Student cohort directory, pending evidence verification queue (Approve / Reject), and study blueprint uploads.
   - 🛡️ **Admin Console** (`/admin`): Department placement statistics, campus user role management, and new recruitment drive launcher.
4. **Interactive AI Career Coach**:
   - Persistent floating coach widget (`/api/chatbot`) providing real-time interview advice, ATS resume tips, and company preparation blueprints.

---

## 🏃 Quick Start

Navigate to the `placement-next` directory and run:

```powershell
cd placement-next
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔑 Portal Access Credentials

| Role | Username / Identifier | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Master Admin** | `admin` (or `admin@portal.com`) | `admin@123` | Placement Directorate KPIs, Drive Publishing, Role Governance, Security Settings |
| **Faculty Mentor** | `faculty@portal.com` | `faculty123` | Evidence Verification Queue (Approve/Reject student submissions), Study Materials |
| **Student Candidate**| `student@portal.com` | `student123` | Skill Benchmarking, Real-time GitHub Heatmap, Portfolio Evidence Submission |

Master Admin can now log in using admin (or admin@portal.com) with admin@123 via native Supabase Auth.

*Tip: You can change the Master Admin credentials anytime via the **Admin Security & Credentials** modal in the Admin Console.*

---

## 🛡️ Supabase Row Level Security (RLS)
The database schema with hardened Row-Level Security policies is defined in [`supabase_schema.sql`](supabase_schema.sql).
To apply or verify RLS in your Supabase dashboard:
1. Navigate to the **SQL Editor** in your Supabase Dashboard (`https://kemetwenttjawedzquqh.supabase.co`).
2. Paste and run [`supabase_schema.sql`](supabase_schema.sql).
3. All tables (`users`, `companies`, `projects`, `certificates`, `scores`, `study_materials`, `courses`) will have RLS enabled, restricting anonymous mutations and allowing only authorized roles (`FACULTY`, `ADMIN`) to modify sensitive records.

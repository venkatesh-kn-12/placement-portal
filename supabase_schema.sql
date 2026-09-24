-- ==============================================================================
-- Supabase Schema & Row-Level Security (RLS) for Placement Portal
-- ==============================================================================

-- 1. Ensure Tables Exist
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT',
  department TEXT DEFAULT 'Computer Science',
  usn TEXT,
  cgpa NUMERIC(3, 2) DEFAULT 8.5,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  soft_skills INTEGER DEFAULT 82,
  aptitude INTEGER DEFAULT 76,
  coding INTEGER DEFAULT 91,
  readiness_score INTEGER DEFAULT 84,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  ctc TEXT NOT NULL,
  location TEXT,
  min_cgpa NUMERIC(3, 2) DEFAULT 7.0,
  required_coding_score INTEGER DEFAULT 75,
  deadline DATE,
  status TEXT DEFAULT 'OPEN',
  skills TEXT[] DEFAULT ARRAY['DSA', 'Algorithms'],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_name TEXT NOT NULL,
  student_usn TEXT,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT,
  live_url TEXT,
  github_url TEXT,
  status TEXT DEFAULT 'PENDING',
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_name TEXT NOT NULL,
  student_usn TEXT,
  name TEXT NOT NULL,
  issuer TEXT,
  issue_date DATE,
  credential_id TEXT,
  status TEXT DEFAULT 'PENDING',
  evidence_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  instructor TEXT,
  total_lessons INTEGER DEFAULT 10,
  completed_lessons INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  badge TEXT,
  lessons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_materials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT DEFAULT 'PDF',
  author TEXT,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure optional student_id column exists safely
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS student_id TEXT;

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. DROP EXISTING POLICIES (TO AVOID DUPLICATE POLICY ERRORS)
-- ==============================================================================

DO $$
BEGIN
  -- Users
  DROP POLICY IF EXISTS "Public access for users" ON public.users;
  DROP POLICY IF EXISTS "Users viewable by everyone" ON public.users;
  DROP POLICY IF EXISTS "Users viewable by all" ON public.users;
  DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can update self or Admin can update all" ON public.users;
  DROP POLICY IF EXISTS "Only Admins can delete users" ON public.users;

  -- Companies
  DROP POLICY IF EXISTS "Public access for companies" ON public.companies;
  DROP POLICY IF EXISTS "Companies viewable by all" ON public.companies;
  DROP POLICY IF EXISTS "Only Admins can insert company drives" ON public.companies;
  DROP POLICY IF EXISTS "Only Admins can update company drives" ON public.companies;
  DROP POLICY IF EXISTS "Only Admins can delete company drives" ON public.companies;

  -- Projects
  DROP POLICY IF EXISTS "Public access for projects" ON public.projects;
  DROP POLICY IF EXISTS "Projects viewable by all" ON public.projects;
  DROP POLICY IF EXISTS "Students can submit projects" ON public.projects;
  DROP POLICY IF EXISTS "Faculty and Admin update access on projects" ON public.projects;
  DROP POLICY IF EXISTS "Student owner or Admin delete projects" ON public.projects;
  DROP POLICY IF EXISTS "Only Admins can delete projects" ON public.projects;

  -- Certificates
  DROP POLICY IF EXISTS "Public access for certificates" ON public.certificates;
  DROP POLICY IF EXISTS "Certificates viewable by all" ON public.certificates;
  DROP POLICY IF EXISTS "Students can submit certificates" ON public.certificates;
  DROP POLICY IF EXISTS "Faculty and Admin update access on certificates" ON public.certificates;
  DROP POLICY IF EXISTS "Student owner or Admin delete certificates" ON public.certificates;
  DROP POLICY IF EXISTS "Only Admins can delete certificates" ON public.certificates;

  -- Scores
  DROP POLICY IF EXISTS "Public access for scores" ON public.scores;
  DROP POLICY IF EXISTS "Scores viewable by authenticated users" ON public.scores;
  DROP POLICY IF EXISTS "Users can update own scores or Admin update all" ON public.scores;

  -- Study Materials
  DROP POLICY IF EXISTS "Public access for study_materials" ON public.study_materials;
  DROP POLICY IF EXISTS "Materials viewable by everyone" ON public.study_materials;
  DROP POLICY IF EXISTS "Faculty and Admin manage materials" ON public.study_materials;

  -- Courses
  DROP POLICY IF EXISTS "Public access for courses" ON public.courses;
  DROP POLICY IF EXISTS "Courses viewable by everyone" ON public.courses;
  DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
END $$;

-- ==============================================================================
-- 4. CREATE HARDENED ROW-LEVEL SECURITY POLICIES
-- ==============================================================================

-- A. USERS
CREATE POLICY "Users viewable by all"
ON public.users FOR SELECT
USING (true);

CREATE POLICY "Users can create their own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = id OR (auth.jwt() ->> 'role') = 'ADMIN');

CREATE POLICY "Users can update self or Admin can update all"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id OR (auth.jwt() ->> 'role') = 'ADMIN')
WITH CHECK (auth.uid()::text = id OR (auth.jwt() ->> 'role') = 'ADMIN');

CREATE POLICY "Only Admins can delete users"
ON public.users FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- B. COMPANIES (Corporate Recruitment Drives)
CREATE POLICY "Companies viewable by all"
ON public.companies FOR SELECT
USING (true);

CREATE POLICY "Only Admins can insert company drives"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role') = 'ADMIN');

CREATE POLICY "Only Admins can update company drives"
ON public.companies FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN')
WITH CHECK ((auth.jwt() ->> 'role') = 'ADMIN');

CREATE POLICY "Only Admins can delete company drives"
ON public.companies FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- C. PROJECTS (Student Evidence)
CREATE POLICY "Projects viewable by all"
ON public.projects FOR SELECT
USING (true);

CREATE POLICY "Students can submit projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only Faculty and Admins can approve/reject/update status
CREATE POLICY "Faculty and Admin update access on projects"
ON public.projects FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') IN ('FACULTY', 'ADMIN'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('FACULTY', 'ADMIN'));

CREATE POLICY "Only Admins can delete projects"
ON public.projects FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- D. CERTIFICATES (Student Evidence)
CREATE POLICY "Certificates viewable by all"
ON public.certificates FOR SELECT
USING (true);

CREATE POLICY "Students can submit certificates"
ON public.certificates FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only Faculty and Admins can approve/reject/verify certificates
CREATE POLICY "Faculty and Admin update access on certificates"
ON public.certificates FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role') IN ('FACULTY', 'ADMIN'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('FACULTY', 'ADMIN'));

CREATE POLICY "Only Admins can delete certificates"
ON public.certificates FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- E. SCORES
CREATE POLICY "Scores viewable by authenticated users"
ON public.scores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own scores or Admin update all"
ON public.scores FOR ALL
TO authenticated
USING (auth.uid()::text = user_id OR (auth.jwt() ->> 'role') = 'ADMIN')
WITH CHECK (auth.uid()::text = user_id OR (auth.jwt() ->> 'role') = 'ADMIN');

-- F. STUDY MATERIALS & COURSES
CREATE POLICY "Materials viewable by everyone"
ON public.study_materials FOR SELECT
USING (true);

CREATE POLICY "Faculty and Admin manage materials"
ON public.study_materials FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') IN ('FACULTY', 'ADMIN'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('FACULTY', 'ADMIN'));

CREATE POLICY "Courses viewable by everyone"
ON public.courses FOR SELECT
USING (true);

CREATE POLICY "Admins manage courses"
ON public.courses FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role') = 'ADMIN')
WITH CHECK ((auth.jwt() ->> 'role') = 'ADMIN');

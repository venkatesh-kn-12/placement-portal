-- ==============================================================================
-- Supabase Schema & Row-Level Security (RLS) for Placement Portal
-- ==============================================================================

-- 1. Users Table
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

-- 2. Scores Table
CREATE TABLE IF NOT EXISTS public.scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  soft_skills INTEGER DEFAULT 82,
  aptitude INTEGER DEFAULT 76,
  coding INTEGER DEFAULT 91,
  readiness_score INTEGER DEFAULT 84,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Companies Table
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

-- 4. Projects Table (Evidence)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_name TEXT NOT NULL,
  student_usn TEXT,
  student_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT,
  live_url TEXT,
  github_url TEXT,
  status TEXT DEFAULT 'PENDING',
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Certificates Table (Evidence)
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_name TEXT NOT NULL,
  student_usn TEXT,
  student_id TEXT,
  name TEXT NOT NULL,
  issuer TEXT,
  issue_date DATE,
  credential_id TEXT,
  status TEXT DEFAULT 'PENDING',
  evidence_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Courses Table
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

-- 7. Study Materials Table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT DEFAULT 'PDF',
  author TEXT,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) ACTIVATION
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- CLEAN UP ANY INSECURE LEGACY WILDCARD POLICIES
-- ==============================================================================

DO $$
BEGIN
  -- Drop legacy wide-open policies if they exist
  DROP POLICY IF EXISTS "Public access for users" ON public.users;
  DROP POLICY IF EXISTS "Public access for scores" ON public.scores;
  DROP POLICY IF EXISTS "Public access for companies" ON public.companies;
  DROP POLICY IF EXISTS "Public access for projects" ON public.projects;
  DROP POLICY IF EXISTS "Public access for certificates" ON public.certificates;
  DROP POLICY IF EXISTS "Public access for courses" ON public.courses;
  DROP POLICY IF EXISTS "Public access for study_materials" ON public.study_materials;
END $$;

-- ==============================================================================
-- 1. USERS POLICIES
-- ==============================================================================

-- Anyone (including prospective recruiters & campus members) can view directory profiles
CREATE POLICY "Users viewable by everyone"
ON public.users FOR SELECT
USING (true);

-- Authenticated users can insert their own profile on registration
CREATE POLICY "Users can create their own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'ADMIN');

-- Users can only update their own profile; Admins can update any
CREATE POLICY "Users can update self or Admin can update all"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'ADMIN');

-- Only Admins can delete user records
CREATE POLICY "Only Admins can delete users"
ON public.users FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');


-- ==============================================================================
-- 2. COMPANIES POLICIES (Corporate Recruitment Drives)
-- ==============================================================================

-- All users can view open company recruitment drives
CREATE POLICY "Companies viewable by all"
ON public.companies FOR SELECT
USING (true);

-- ONLY Admins can publish new campus drives (blocks anon & student injections)
CREATE POLICY "Only Admins can insert company drives"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- ONLY Admins can update drives (deadlines, requirements, statuses)
CREATE POLICY "Only Admins can update company drives"
ON public.companies FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- ONLY Admins can delete drives
CREATE POLICY "Only Admins can delete company drives"
ON public.companies FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');


-- ==============================================================================
-- 3. PROJECTS & CERTIFICATES POLICIES (Student Evidence & Faculty Verification)
-- ==============================================================================

-- Projects viewable by all (for portfolio showcases and verification)
CREATE POLICY "Projects viewable by all"
ON public.projects FOR SELECT
USING (true);

-- Authenticated students can submit projects
CREATE POLICY "Students can submit projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = student_id OR true);

-- Faculty and Admins can update review status and feedback
CREATE POLICY "Faculty and Admin update access on projects"
ON public.projects FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' IN ('FACULTY', 'ADMIN') OR auth.uid()::text = student_id)
WITH CHECK (auth.jwt() ->> 'role' IN ('FACULTY', 'ADMIN') OR auth.uid()::text = student_id);

-- Only Admins or the student owner can delete projects
CREATE POLICY "Student owner or Admin delete projects"
ON public.projects FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN' OR auth.uid()::text = student_id);


-- Certificates viewable by all
CREATE POLICY "Certificates viewable by all"
ON public.certificates FOR SELECT
USING (true);

-- Authenticated students can submit certificates
CREATE POLICY "Students can submit certificates"
ON public.certificates FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = student_id OR true);

-- Faculty and Admins can review/verify certificates
CREATE POLICY "Faculty and Admin update access on certificates"
ON public.certificates FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' IN ('FACULTY', 'ADMIN') OR auth.uid()::text = student_id)
WITH CHECK (auth.jwt() ->> 'role' IN ('FACULTY', 'ADMIN') OR auth.uid()::text = student_id);

-- Only Admins or the student owner can delete certificates
CREATE POLICY "Student owner or Admin delete certificates"
ON public.certificates FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN' OR auth.uid()::text = student_id);


-- ==============================================================================
-- 4. SCORES POLICIES (Candidate Assessment Metrics)
-- ==============================================================================

CREATE POLICY "Scores viewable by authenticated users"
ON public.scores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own scores or Admin update all"
ON public.scores FOR ALL
TO authenticated
USING (auth.uid()::text = user_id OR auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.uid()::text = user_id OR auth.jwt() ->> 'role' = 'ADMIN');


-- ==============================================================================
-- 5. STUDY MATERIALS & COURSES POLICIES
-- ==============================================================================

-- Study materials viewable by everyone
CREATE POLICY "Materials viewable by everyone"
ON public.study_materials FOR SELECT
USING (true);

-- Only Faculty and Admins can upload/modify study materials
CREATE POLICY "Faculty and Admin manage materials"
ON public.study_materials FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' IN ('FACULTY', 'ADMIN'))
WITH CHECK (auth.jwt() ->> 'role' IN ('FACULTY', 'ADMIN'));

-- Courses viewable by everyone
CREATE POLICY "Courses viewable by everyone"
ON public.courses FOR SELECT
USING (true);

-- Only Admins can modify course curriculum
CREATE POLICY "Admins manage courses"
ON public.courses FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

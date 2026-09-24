-- Supabase Schema for Placement Portal

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

-- 4. Projects Table
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

-- 5. Certificates Table
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

-- =======================================================
-- ROW LEVEL SECURITY (RLS) & OPEN POLICIES FOR PORTAL
-- =======================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Allow portal client read and write access
DO $$
BEGIN
  -- Users policy
  DROP POLICY IF EXISTS "Public access for users" ON public.users;
  CREATE POLICY "Public access for users" ON public.users FOR ALL USING (true) WITH CHECK (true);

  -- Scores policy
  DROP POLICY IF EXISTS "Public access for scores" ON public.scores;
  CREATE POLICY "Public access for scores" ON public.scores FOR ALL USING (true) WITH CHECK (true);

  -- Companies policy
  DROP POLICY IF EXISTS "Public access for companies" ON public.companies;
  CREATE POLICY "Public access for companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);

  -- Projects policy
  DROP POLICY IF EXISTS "Public access for projects" ON public.projects;
  CREATE POLICY "Public access for projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

  -- Certificates policy
  DROP POLICY IF EXISTS "Public access for certificates" ON public.certificates;
  CREATE POLICY "Public access for certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

  -- Courses policy
  DROP POLICY IF EXISTS "Public access for courses" ON public.courses;
  CREATE POLICY "Public access for courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

  -- Study Materials policy
  DROP POLICY IF EXISTS "Public access for study_materials" ON public.study_materials;
  CREATE POLICY "Public access for study_materials" ON public.study_materials FOR ALL USING (true) WITH CHECK (true);
END $$;

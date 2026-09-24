-- ==============================================================================
-- Migration: Create/Seed Native Master Admin into Supabase auth.users
-- ==============================================================================
-- This script natively creates or updates the master admin account in Supabase Auth.
-- It cryptographically hashes the password ('admin@123') and attaches the signed
-- 'role': 'ADMIN' claim inside raw_app_meta_data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  master_admin_id UUID := 'e0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c';
  admin_email TEXT := 'admin@portal.com';
  admin_pw TEXT := 'admin@123';
BEGIN
  -- 1. Insert or update in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    master_admin_id,
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_pw, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "ADMIN"}'::jsonb,
    '{"full_name": "System Administrator", "role": "ADMIN"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt(admin_pw, gen_salt('bf')),
    raw_app_meta_data = '{"provider": "email", "providers": ["email"], "role": "ADMIN"}'::jsonb,
    raw_user_meta_data = '{"full_name": "System Administrator", "role": "ADMIN"}'::jsonb,
    email_confirmed_at = now(),
    updated_at = now();

  -- 2. Insert or update identity in auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    master_admin_id::text,
    master_admin_id,
    json_build_object('sub', master_admin_id::text, 'email', admin_email),
    'email',
    admin_email,
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO UPDATE SET
    last_sign_in_at = now();

  -- 3. Ensure profile in public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    department,
    cgpa,
    avatar
  )
  VALUES (
    master_admin_id::text,
    admin_email,
    'System Administrator',
    'ADMIN',
    'Placement Directorate',
    9.8,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  )
  ON CONFLICT (email) DO UPDATE SET
    role = 'ADMIN',
    full_name = 'System Administrator',
    department = 'Placement Directorate';

  RAISE NOTICE 'Master Admin successfully created in auth.users and public.users!';
END $$;

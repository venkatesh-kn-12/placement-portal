-- ==============================================================================
-- Migration: Native Master Admin Seed in Supabase auth.users
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  master_admin_id UUID := 'e0a1b2c3-d4e5-4f6a-8b9c-0d1e2f3a4b5c';
  admin_email TEXT := 'admin@portal.com';
  admin_pw TEXT := 'admin@123';
BEGIN
  -- 1. Insert or Update in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    UPDATE auth.users
    SET 
      encrypted_password = crypt(admin_pw, gen_salt('bf')),
      raw_app_meta_data = '{"provider": "email", "providers": ["email"], "role": "ADMIN"}'::jsonb,
      raw_user_meta_data = '{"full_name": "System Administrator", "role": "ADMIN"}'::jsonb,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE email = admin_email;
  ELSE
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
    );
  END IF;

  -- 2. Fetch the assigned user ID
  SELECT id INTO master_admin_id FROM auth.users WHERE email = admin_email;

  -- 3. Insert or Update in auth.identities (id is of type UUID)
  IF EXISTS (SELECT 1 FROM auth.identities WHERE user_id = master_admin_id) THEN
    UPDATE auth.identities
    SET last_sign_in_at = now()
    WHERE user_id = master_admin_id;
  ELSE
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
      master_admin_id,
      master_admin_id,
      json_build_object('sub', master_admin_id::text, 'email', admin_email),
      'email',
      admin_email,
      now(),
      now(),
      now()
    );
  END IF;

  -- 4. Insert or Update in public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE email = admin_email) THEN
    UPDATE public.users
    SET 
      role = 'ADMIN',
      full_name = 'System Administrator',
      department = 'Placement Directorate'
    WHERE email = admin_email;
  ELSE
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
    );
  END IF;

  RAISE NOTICE 'Master Admin successfully created in auth.users and public.users!';
END $$;

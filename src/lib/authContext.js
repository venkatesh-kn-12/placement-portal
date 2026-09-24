'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers, initialScores } from './data';
import { supabase } from './supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [scores, setScores] = useState({ soft_skills: 0, aptitude: 0, coding: 0, readiness_score: 0 });
  const [isDemo, setIsDemo] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [alert, setAlert] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('placement_user');
    const savedScores = localStorage.getItem('placement_scores');
    const savedTheme = localStorage.getItem('placement_theme') || 'dark';
    const savedIsDemo = localStorage.getItem('placement_is_demo') === 'true';

    setIsDemo(savedIsDemo);

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const adminCreds = getMasterAdminCreds();

        // Prevent unauthorized role escalation via localStorage editing
        if (parsed?.role === 'ADMIN' && parsed?.id !== adminCreds.id && !savedIsDemo) {
          console.warn('Unauthorized client role detected, resetting to STUDENT');
          parsed.role = 'STUDENT';
          localStorage.setItem('placement_user', JSON.stringify(parsed));
        }

        setUser(parsed);
      } catch (e) {
        setUser(null);
      }
    }

    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        setScores(savedIsDemo ? initialScores : { soft_skills: 0, aptitude: 0, coding: 0, readiness_score: 0 });
      }
    } else if (savedIsDemo) {
      setScores(initialScores);
    }

    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Supabase Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setIsDemo(false);
        localStorage.setItem('placement_is_demo', 'false');

        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', currentSession.user.email)
            .maybeSingle();

          const githubUser =
            currentSession.user.user_metadata?.user_name ||
            currentSession.user.user_metadata?.preferred_username ||
            '';

          if (dbUser) {
            const merged = { ...dbUser, githubUsername: githubUser, isDemo: false };
            setUser(merged);
            localStorage.setItem('placement_user', JSON.stringify(merged));
          } else {
            // New user registration profile
            const newProfile = {
              id: currentSession.user.id,
              email: currentSession.user.email,
              fullName: currentSession.user.user_metadata?.full_name || currentSession.user.email.split('@')[0],
              role: currentSession.user.user_metadata?.role || 'STUDENT',
              department: 'Computer Science & Engineering',
              githubUsername: githubUser,
              cgpa: 8.5,
              isDemo: false
            };
            setUser(newProfile);
            localStorage.setItem('placement_user', JSON.stringify(newProfile));
            try {
              await supabase.from('users').upsert([newProfile]);
            } catch (e) {}
          }
        } catch (e) {
          console.warn('Could not fetch user profile from Supabase:', e);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('placement_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  // Master Admin Helper
  const getMasterAdminCreds = () => {
    if (typeof window === 'undefined') {
      return {
        id: 'master-admin-01',
        username: 'admin',
        email: 'admin@portal.com',
        password: 'admin@123',
        fullName: 'System Administrator',
        role: 'ADMIN',
        department: 'Placement Directorate',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isDemo: false
      };
    }
    const saved = localStorage.getItem('placement_master_admin_creds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const defaultAdmin = {
      id: 'master-admin-01',
      username: 'admin',
      email: 'admin@portal.com',
      password: 'admin@123',
      fullName: 'System Administrator',
      role: 'ADMIN',
      department: 'Placement Directorate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isDemo: false
    };
    localStorage.setItem('placement_master_admin_creds', JSON.stringify(defaultAdmin));
    return defaultAdmin;
  };

  // Update Master Admin Credentials (natively in Supabase Auth & local config)
  const updateAdminCredentials = async ({ username, email, password, fullName }) => {
    try {
      // 1. Native Supabase Auth update if currently signed into Supabase
      if (session?.user) {
        const updatePayload = {};
        if (password && password.trim()) updatePayload.password = password.trim();
        if (fullName && fullName.trim()) updatePayload.data = { full_name: fullName.trim() };
        if (email && email.trim().toLowerCase() !== session.user.email) {
          updatePayload.email = email.trim().toLowerCase();
        }
        if (Object.keys(updatePayload).length > 0) {
          const { error: supaErr } = await supabase.auth.updateUser(updatePayload);
          if (supaErr) console.warn('Supabase auth update notice:', supaErr.message);
        }
      }

      // 2. Synchronize local fallback configuration
      const current = getMasterAdminCreds();
      const updated = {
        ...current,
        username: (username || current.username).trim(),
        email: (email || current.email).trim().toLowerCase(),
        password: password ? password.trim() : current.password,
        fullName: fullName || current.fullName
      };
      localStorage.setItem('placement_master_admin_creds', JSON.stringify(updated));

      // If active user is Admin, update state as well
      if (user?.role === 'ADMIN') {
        const mergedUser = { ...user, ...updated };
        delete mergedUser.password;
        setUser(mergedUser);
        localStorage.setItem('placement_user', JSON.stringify(mergedUser));
      }

      showAlert('Admin credentials updated successfully!', 'success');
      return { success: true };
    } catch (e) {
      showAlert('Failed to update admin credentials', 'warning');
      return { success: false, error: e.message };
    }
  };

  // Send Password Reset Email for Admin or any user
  const sendAdminPasswordResetEmail = async (targetEmail) => {
    try {
      const emailToSend = targetEmail || getMasterAdminCreds().email;
      const { error } = await supabase.auth.resetPasswordForEmail(emailToSend, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
      });
      if (error) {
        console.warn('Supabase reset email notice:', error.message);
      }
      showAlert(`Password reset instructions sent to ${emailToSend}`, 'success');
      return { success: true };
    } catch (e) {
      showAlert(`Password reset request dispatched to ${targetEmail}`, 'info');
      return { success: true };
    }
  };

  // 1. Native Supabase Sign In (with Master Admin identifier mapping)
  const signInWithSupabase = async (identifier, password) => {
    setAuthLoading(true);
    try {
      const cleanId = (identifier || '').trim().toLowerCase();
      // Map 'admin' alias to the native master admin email
      const emailToAuth = cleanId === 'admin' ? 'admin@portal.com' : cleanId;

      // Primary: Native Supabase Auth signInWithPassword
      let authResult = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password
      });

      // Fallback: If native Supabase user is not yet migrated, verify local master admin
      if (authResult.error) {
        const adminCreds = getMasterAdminCreds();
        if ((cleanId === 'admin' || cleanId === adminCreds.email.toLowerCase()) && password === adminCreds.password) {
          setIsDemo(false);
          localStorage.setItem('placement_is_demo', 'false');
          const safeProfile = { ...adminCreds };
          delete safeProfile.password;
          setUser(safeProfile);
          localStorage.setItem('placement_user', JSON.stringify(safeProfile));
          showAlert(`Welcome back, ${adminCreds.fullName}!`, 'success');
          router.push('/admin');
          return { success: true };
        }
        throw authResult.error;
      }

      const { data } = authResult;
      setIsDemo(false);
      localStorage.setItem('placement_is_demo', 'false');

      let profile = null;
      try {
        const { data: userRecord } = await supabase
          .from('users')
          .select('*')
          .eq('email', emailToAuth)
          .maybeSingle();
        profile = userRecord;
      } catch (e) {}

      const resolvedRole = (
        data.user?.app_metadata?.role ||
        data.user?.user_metadata?.role ||
        profile?.role ||
        (emailToAuth === 'admin@portal.com' ? 'ADMIN' : 'STUDENT')
      ).toUpperCase();

      if (!profile) {
        profile = {
          id: data.user?.id || `u-${Date.now()}`,
          email: emailToAuth,
          fullName: data.user?.user_metadata?.full_name || emailToAuth.split('@')[0],
          role: resolvedRole,
          department: resolvedRole === 'ADMIN' ? 'Placement Directorate' : 'Computer Science & Engineering',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          isDemo: false
        };
      } else {
        profile = { ...profile, role: resolvedRole, isDemo: false };
      }

      setUser(profile);
      localStorage.setItem('placement_user', JSON.stringify(profile));
      showAlert(`Welcome back, ${profile.fullName}!`, 'success');

      if (profile.role === 'ADMIN') router.push('/admin');
      else if (profile.role === 'FACULTY') router.push('/faculty');
      else router.push('/dashboard');

      return { success: true };
    } catch (err) {
      showAlert(err.message || 'Login failed. Please verify your credentials.', 'warning');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Sign Up (Restricted: Users CANNOT create an ADMIN account)
  const signUpWithSupabase = async (email, password, fullName, roleChoice = 'STUDENT') => {
    setAuthLoading(true);
    try {
      const formattedEmail = (email || '').toLowerCase().trim();
      const adminCreds = getMasterAdminCreds();

      // Enforce strict prevention of admin account registration
      if (roleChoice === 'ADMIN' || formattedEmail === 'admin' || formattedEmail === adminCreds.email.toLowerCase()) {
        showAlert('Admin accounts cannot be self-registered. Please contact the Placement Cell.', 'warning');
        return { success: false, error: 'Admin registration prohibited' };
      }

      const assignedRole = roleChoice === 'FACULTY' ? 'FACULTY' : 'STUDENT';

      const { data, error } = await supabase.auth.signUp({
        email: formattedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            role: assignedRole
          }
        }
      });

      if (error) {
        throw error;
      }

      setIsDemo(false);
      localStorage.setItem('placement_is_demo', 'false');

      // Brand new user starts with 0 assessments completed
      const freshScores = { soft_skills: 0, aptitude: 0, coding: 0, readiness_score: 0 };
      setScores(freshScores);
      localStorage.setItem('placement_scores', JSON.stringify(freshScores));

      const newProfile = {
        id: data.user?.id || `u-${Date.now()}`,
        email: formattedEmail,
        fullName: fullName || formattedEmail.split('@')[0],
        role: assignedRole,
        department: 'Computer Science & Engineering',
        cgpa: 8.5,
        isDemo: false
      };

      try {
        await supabase.from('users').upsert([newProfile]);
      } catch (e) {}

      setUser(newProfile);
      localStorage.setItem('placement_user', JSON.stringify(newProfile));
      showAlert('Account successfully registered! Welcome to the portal.', 'success');

      if (assignedRole === 'FACULTY') router.push('/faculty');
      else router.push('/dashboard');

      return { success: true };
    } catch (err) {
      showAlert(err.message || 'Registration failed. Please try again.', 'warning');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // 3. Supabase OAuth (Google & GitHub)
  const signInWithOAuth = async (provider) => {
    setAuthLoading(true);
    try {
      setIsDemo(false);
      localStorage.setItem('placement_is_demo', 'false');
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : undefined
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      showAlert(err.message || `Failed to sign in with ${provider}`, 'warning');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. Enter Isolated Demo Mode
  const enterDemoMode = (demoRole = 'STUDENT') => {
    setIsDemo(true);
    localStorage.setItem('placement_is_demo', 'true');

    const demoUser = initialUsers.find(u => u.role === demoRole) || {
      ...initialUsers[0],
      role: demoRole
    };

    const isolatedDemoProfile = {
      ...demoUser,
      fullName: `[Demo] ${demoUser.fullName}`,
      isDemo: true
    };

    setUser(isolatedDemoProfile);
    setScores(initialScores);
    localStorage.setItem('placement_user', JSON.stringify(isolatedDemoProfile));
    localStorage.setItem('placement_scores', JSON.stringify(initialScores));

    showAlert(`Entered Demo Mode as ${demoRole} (Mock Data Active)`, 'info');

    if (demoRole === 'ADMIN') router.push('/admin');
    else if (demoRole === 'FACULTY') router.push('/faculty');
    else router.push('/dashboard');
  };

  // 5. Exit Demo Mode
  const exitDemoMode = () => {
    setIsDemo(false);
    localStorage.setItem('placement_is_demo', 'false');
    logout();
  };

  // Sign out
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setSession(null);
    setIsDemo(false);
    localStorage.removeItem('placement_user');
    localStorage.removeItem('placement_is_demo');
    router.push('/login');
    showAlert('You have been signed out.', 'info');
  };

  const switchRole = (newRole) => {
    if (isDemo) {
      enterDemoMode(newRole);
      return;
    }
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('placement_user', JSON.stringify(updated));
    showAlert(`Switched view to ${newRole} Profile`, 'success');

    if (newRole === 'ADMIN') router.push('/admin');
    else if (newRole === 'FACULTY') router.push('/faculty');
    else router.push('/dashboard');
  };

  const updateScores = (newScores) => {
    const merged = { ...scores, ...newScores };
    setScores(merged);
    localStorage.setItem('placement_scores', JSON.stringify(merged));
    showAlert('Assessment scores updated!', 'success');
  };

  const isOnboarded = scores.soft_skills > 0 && scores.aptitude > 0 && scores.coding > 0;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role: user?.role || 'STUDENT',
      scores,
      updateScores,
      isOnboarded,
      isDemo,
      enterDemoMode,
      exitDemoMode,
      signInWithSupabase,
      signUpWithSupabase,
      signInWithOAuth,
      updateAdminCredentials,
      sendAdminPasswordResetEmail,
      getMasterAdminCreds,
      logout,
      switchRole,
      theme,
      toggleTheme,
      alert,
      showAlert,
      authLoading,
      mounted
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

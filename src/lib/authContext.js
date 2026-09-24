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
        setUser(JSON.parse(savedUser));
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

  // 1. Supabase Sign In with Email & Password
  const signInWithSupabase = async (email, password) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      setIsDemo(false);
      localStorage.setItem('placement_is_demo', 'false');

      let profile = null;
      try {
        const { data: userRecord } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .maybeSingle();
        profile = userRecord;
      } catch (e) {}

      if (!profile) {
        profile = {
          id: data.user?.id || `u-${Date.now()}`,
          email: email.toLowerCase().trim(),
          fullName: data.user?.user_metadata?.full_name || email.split('@')[0],
          role: data.user?.user_metadata?.role || 'STUDENT',
          department: 'Computer Science & Engineering',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          isDemo: false
        };
      } else {
        profile.isDemo = false;
      }

      setUser(profile);
      localStorage.setItem('placement_user', JSON.stringify(profile));
      showAlert(`Welcome back, ${profile.fullName}!`, 'success');

      if (profile.role === 'ADMIN') router.push('/admin');
      else if (profile.role === 'FACULTY') router.push('/faculty');
      else router.push('/dashboard');

      return { success: true };
    } catch (err) {
      showAlert(err.message || 'Supabase login failed', 'warning');
      return { success: false, error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Supabase Sign Up with Email, Password, Full Name & Role
  const signUpWithSupabase = async (email, password, fullName, roleChoice = 'STUDENT') => {
    setAuthLoading(true);
    try {
      const formattedEmail = email.toLowerCase().trim();
      const { data, error } = await supabase.auth.signUp({
        email: formattedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            role: roleChoice
          }
        }
      });

      if (error) {
        throw error;
      }

      setIsDemo(false);
      localStorage.setItem('placement_is_demo', 'false');

      // Brand new user starts with 0 assessments completed (Lockdown active until taken!)
      const freshScores = { soft_skills: 0, aptitude: 0, coding: 0, readiness_score: 0 };
      setScores(freshScores);
      localStorage.setItem('placement_scores', JSON.stringify(freshScores));

      const newProfile = {
        id: data.user?.id || `u-${Date.now()}`,
        email: formattedEmail,
        fullName: fullName || formattedEmail.split('@')[0],
        role: roleChoice,
        department: 'Computer Science & Engineering',
        cgpa: 8.5,
        isDemo: false
      };

      try {
        await supabase.from('users').upsert([newProfile]);
      } catch (e) {}

      setUser(newProfile);
      localStorage.setItem('placement_user', JSON.stringify(newProfile));
      showAlert('Fresh account created in Supabase! Welcome!', 'success');

      if (roleChoice === 'ADMIN') router.push('/admin');
      else if (roleChoice === 'FACULTY') router.push('/faculty');
      else router.push('/dashboard');

      return { success: true };
    } catch (err) {
      showAlert(err.message || 'Supabase registration failed', 'warning');
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

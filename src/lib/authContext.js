'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers, initialScores } from './data';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Default to student user for quick preview, or load from localStorage
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState(initialScores);
  const [theme, setTheme] = useState('dark');
  const [alert, setAlert] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('placement_user');
    const savedScores = localStorage.getItem('placement_scores');
    const savedTheme = localStorage.getItem('placement_theme') || 'dark';

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(initialUsers[0]);
      }
    } else {
      setUser(initialUsers[0]); // default to Student Vamshi Krishna
    }

    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        setScores(initialScores);
      }
    }

    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  const login = (email, roleChoice) => {
    let target = initialUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!target) {
      // Find by role or create fallback
      target = initialUsers.find(u => u.role === (roleChoice || 'STUDENT')) || {
        id: `u-${Date.now()}`,
        email: email,
        fullName: email.split('@')[0],
        role: roleChoice || 'STUDENT',
        department: 'Computer Science',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
    }
    setUser(target);
    localStorage.setItem('placement_user', JSON.stringify(target));
    showAlert(`Welcome back, ${target.fullName}!`, 'success');

    if (target.role === 'ADMIN') router.push('/admin');
    else if (target.role === 'FACULTY') router.push('/faculty');
    else router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('placement_user');
    router.push('/login');
    showAlert('You have been signed out successfully.', 'info');
  };

  const switchRole = (newRole) => {
    const target = initialUsers.find(u => u.role === newRole) || {
      ...user,
      role: newRole
    };
    setUser(target);
    localStorage.setItem('placement_user', JSON.stringify(target));
    showAlert(`Switched view to ${newRole} Profile`, 'success');

    if (newRole === 'ADMIN') router.push('/admin');
    else if (newRole === 'FACULTY') router.push('/faculty');
    else router.push('/dashboard');
  };

  const updateScores = (newScores) => {
    const merged = { ...scores, ...newScores };
    setScores(merged);
    localStorage.setItem('placement_scores', JSON.stringify(merged));
    showAlert('Assessment scores updated successfully!', 'success');
  };

  const isOnboarded = scores.soft_skills > 0 && scores.aptitude > 0 && scores.coding > 0;

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || 'STUDENT',
      scores,
      updateScores,
      isOnboarded,
      login,
      logout,
      switchRole,
      theme,
      toggleTheme,
      alert,
      showAlert,
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

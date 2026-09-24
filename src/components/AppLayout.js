'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingAICoach from './FloatingAICoach';
import AssessmentLockdownModal from './AssessmentLockdownModal';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, role, mounted, isOnboarded, isDemo, exitDemoMode } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showLockdownModal, setShowLockdownModal] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    // Route access guard
    if (!user && pathname !== '/login') {
      router.push('/login');
      return;
    }

    // Role-based protection
    if (user) {
      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        router.push(role === 'FACULTY' ? '/faculty' : '/dashboard');
      } else if (pathname.startsWith('/faculty') && role !== 'FACULTY' && role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [mounted, user, role, pathname, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading Placement Portal...</span>
      </div>
    );
  }

  // If on login page, render children directly without app shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Isolated Demo Notice Bar */}
        {isDemo && (
          <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-amber-500 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Demo Mode Active • Displaying mock evaluation cohort data</span>
            </div>
            <button
              onClick={exitDemoMode}
              className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-all"
            >
              Exit Demo
            </button>
          </div>
        )}

        <Header />

        {/* Global Onboarding Warning Banner if student is not onboarded */}
        {role === 'STUDENT' && !isOnboarded && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-xs font-bold">Onboarding Assessment Lockdown Active</div>
                <div className="text-[11px] opacity-90">Complete Soft Skills, Aptitude, and Coding assessments to unlock full interview simulators and drive applications.</div>
              </div>
            </div>
            <button
              onClick={() => setShowLockdownModal(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0 ml-4"
            >
              Take Assessment
            </button>
          </div>
        )}

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Assistant & Assessment Modal */}
      <FloatingAICoach />
      <AssessmentLockdownModal
        isOpen={showLockdownModal}
        onClose={() => setShowLockdownModal(false)}
      />
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Users,
  CheckCircle2,
  FileCheck,
  BookOpen,
  ShieldCheck,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  ChevronRight,
  Lock,
  Unlock
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, role, switchRole, logout, theme, toggleTheme, isOnboarded } = useAuth();

  const getNavLinks = () => {
    if (role === 'ADMIN') {
      return [
        { label: 'Admin Console', href: '/admin', icon: LayoutDashboard },
        { label: 'Cohort Analytics', href: '/admin#analytics', icon: Briefcase },
        { label: 'Manage Roles', href: '/admin#users', icon: ShieldCheck }
      ];
    }
    if (role === 'FACULTY') {
      return [
        { label: 'Faculty Hub', href: '/faculty', icon: LayoutDashboard },
        { label: 'Verify Evidence', href: '/faculty#evidence', icon: FileCheck },
        { label: 'Study Resources', href: '/faculty#materials', icon: BookOpen }
      ];
    }
    return [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Learning Academy', href: '/learning', icon: GraduationCap },
      { label: 'Placement Prep', href: '/placement-prep', icon: Briefcase }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors duration-200 z-30">
      <div>
        {/* Logo and Brand */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-lg">
            PT
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white tracking-tight text-base leading-tight">
              PlacementPortal
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Next.js Edition
            </div>
          </div>
        </div>

        {/* Current Active Role Indicator */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Role
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              role === 'ADMIN' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
              role === 'FACULTY' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}>
              {role}
            </span>
          </div>

          {/* Quick Role Switcher Buttons */}
          <div className="grid grid-cols-3 gap-1 mt-2.5 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-lg">
            <button
              onClick={() => switchRole('STUDENT')}
              className={`text-[11px] py-1 font-semibold rounded transition-all ${
                role === 'STUDENT'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchRole('FACULTY')}
              className={`text-[11px] py-1 font-semibold rounded transition-all ${
                role === 'FACULTY'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => switchRole('ADMIN')}
              className={`text-[11px] py-1 font-semibold rounded transition-all ${
                role === 'ADMIN'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-3 uppercase tracking-wider mb-2">
            Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href.split('#')[0]));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Student Lockdown Status Widget */}
        {role === 'STUDENT' && (
          <div className="mx-3 mt-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                {isOnboarded ? <Unlock className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5 text-rose-500" />}
                Assessment Status
              </span>
              <span className={isOnboarded ? 'text-emerald-500' : 'text-amber-500'}>
                {isOnboarded ? 'Unlocked' : 'Lockdown'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isOnboarded
                ? 'All 3 foundation assessments cleared. All portal modules active.'
                : 'Complete Soft Skills, Aptitude & Coding to unlock placement modules.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Theme and Mode Switcher */}
        <div className="flex items-center justify-between px-2 py-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" /> Dark Mode
              </>
            )}
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

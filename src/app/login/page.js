'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  KeyRound,
  Terminal,
  Zap
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      login(email, selectedRole);
      setLoading(false);
    }, 400);
  };

  const handleQuickLogin = (quickEmail, role) => {
    setLoading(true);
    setTimeout(() => {
      login(quickEmail, role);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse"></div>

      <div className="max-w-6xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Side: Product Showcase */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Next.js Full-Stack Architecture</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Campus Placement <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Unified platform powering recruitment workflows, faculty evidence verification, AI interview readiness assessments, and candidate placement tracking.
            </p>
          </div>

          {/* Key Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-lg">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Full-Stack Next.js</h4>
                  <p className="text-[11px] text-slate-400">Zero Java or Supabase dependencies</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">AI Career Coach</h4>
                  <p className="text-[11px] text-slate-400">Contextual interview & ATS advice</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Role Access Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Quick Test Access (1-Click Login)</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">Instant Demo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@portal.com', 'STUDENT')}
                className="group p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500 text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Student</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Vamshi Krishna</div>
                <div className="text-[10px] text-slate-500">student@portal.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('faculty@portal.com', 'FACULTY')}
                className="group p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500 text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Faculty</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Dr. Ramesh Kumar</div>
                <div className="text-[10px] text-slate-500">faculty@portal.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@portal.com', 'ADMIN')}
                className="group p-3.5 rounded-2xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-500 text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">Admin</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">Placement Director</div>
                <div className="text-[10px] text-slate-500">admin@portal.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="lg:col-span-5">
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl relative">
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
              <p className="text-xs text-slate-400">Access your placement dashboard with your credentials</p>
            </div>

            <form onSubmit={handleCustomLogin} className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Role</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {['STUDENT', 'FACULTY', 'ADMIN'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`text-xs font-bold py-2 rounded-lg transition-all ${
                        selectedRole === r
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'STUDENT' ? 'student@portal.com' : selectedRole === 'FACULTY' ? 'faculty@portal.com' : 'admin@portal.com'}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Access Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500">
                Standalone Next.js mode active • Supabase login disabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

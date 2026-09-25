'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  Mail,
  KeyRound,
  User as UserIcon,
  CheckCircle2,
  Briefcase,
  Lock,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const {
    signInWithSupabase,
    signUpWithSupabase,
    signInWithOAuth,
    signInWithGoogleIdToken,
    enterDemoMode,
    authLoading,
    showAlert
  } = useAuth();
  const [mode, setMode] = useState('sign_in'); // 'sign_in' or 'sign_up'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('STUDENT');

  const gsiInitializedRef = useRef(false);
  const callbackRef = useRef(signInWithGoogleIdToken);

  useEffect(() => {
    callbackRef.current = signInWithGoogleIdToken;
  }, [signInWithGoogleIdToken]);

  // Initialize Google Identity Services (GIS) strictly once
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    let isMounted = true;

    const setupGSI = () => {
      if (typeof window === 'undefined' || !window.google?.accounts?.id) return;

      // Ensure initialize is only invoked once across StrictMode mounts
      if (!gsiInitializedRef.current) {
        gsiInitializedRef.current = true;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response?.credential) {
              await callbackRef.current(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }

      const btnEl = document.getElementById('googleSignInBtn');
      if (btnEl && isMounted && !btnEl.hasChildNodes()) {
        try {
          window.google.accounts.id.renderButton(btnEl, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            shape: 'rectangular',
            width: 260,
          });
        } catch (err) {
          console.warn('GSI render notice:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGSI();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          setupGSI();
        }
      }, 200);
      return () => {
        isMounted = false;
        clearInterval(timer);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGoogleClick = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      showAlert('To use direct Google Sign-In, please add NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file.', 'warning');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      signInWithOAuth('google');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    if (mode === 'sign_in') {
      await signInWithSupabase(identifier, password);
    } else {
      await signUpWithSupabase(identifier, password, fullName, selectedRole);
    }
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
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Campus Placement Directorate • Career Portal</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Campus Placement <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Centralized student readiness tracking, recruiter drive shortlisting, faculty assessment verification, and automated career milestones.
            </p>
          </div>

          {/* Key Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-lg">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Verified Skill Benchmarks</h4>
                  <p className="text-[11px] text-slate-400">Proctored aptitude, DSA & profile audits</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Recruitment Drive Matching</h4>
                  <p className="text-[11px] text-slate-400">Tier-1 drives & real-time offer analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clearly Separated Demo Sandbox Mode */}
          <div className="space-y-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>Evaluator Sandbox Mode</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  Instant Preview
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Explore preloaded cohort records</span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluating the platform? Launch test role views with pre-seeded data without modifying production accounts:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => enterDemoMode('STUDENT')}
                className="group p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Student Preview</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300">Vamshi Krishna</div>
                <div className="text-[10px] text-slate-500">Skill Portfolio & Heatmap</div>
              </button>

              <button
                type="button"
                onClick={() => enterDemoMode('FACULTY')}
                className="group p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Faculty Preview</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300">Dr. Ramesh Kumar</div>
                <div className="text-[10px] text-slate-500">Verification Queue</div>
              </button>

              <button
                type="button"
                onClick={() => enterDemoMode('ADMIN')}
                className="group p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Admin Preview</span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-rose-300">Placement Officer</div>
                <div className="text-[10px] text-slate-500">Analytics & Drives</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Professional Auth Form */}
        <div className="lg:col-span-5">
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-2xl relative">
            {/* Social OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Google Button (Pixel-perfect uniformity with GitHub) */}
              <div
                className="relative group rounded-xl overflow-hidden cursor-pointer active:scale-98 transition-all"
                onClick={handleGoogleClick}
              >
                {/* Visual Face: Styled identically to GitHub button */}
                <div className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 group-hover:bg-slate-900 text-xs font-semibold text-white transition-all select-none">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </div>

                {/* Transparent GIS Button on top to capture genuine user click */}
                <div
                  id="googleSignInBtn"
                  className="absolute inset-0 opacity-[0.001] z-10 overflow-hidden cursor-pointer flex items-center justify-center [&>div]:!w-full [&>div]:!h-full [&>div>iframe]:!w-full [&>div>iframe]:!h-full [&>div>iframe]:!cursor-pointer [&>div>iframe]:!scale-150"
                  title="Sign in with Google"
                />
              </div>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={() => signInWithOAuth('github')}
                disabled={authLoading}
                className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-xs font-semibold text-white transition-all active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider shrink-0">
                Or with credentials
              </span>
              <div className="border-t border-slate-800 w-full"></div>
            </div>

            {/* Sign In vs Sign Up Toggle */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setMode('sign_in')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'sign_in'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('sign_up')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'sign_up'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-5 space-y-1">
              <h2 className="text-xl font-bold text-white">
                {mode === 'sign_in' ? 'Sign In to Portal' : 'Register New Account'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'sign_in'
                  ? 'Access your placement dashboard and candidate tracking'
                  : 'Register a student or faculty mentor profile'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name for Sign Up */}
              {mode === 'sign_up' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Role selection for Sign Up: RESTRICTED to STUDENT and FACULTY only */}
              {mode === 'sign_up' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {['STUDENT', 'FACULTY'].map((r) => (
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
                        {r === 'STUDENT' ? 'Student Candidate' : 'Faculty Mentor'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Identifier (Username or Email) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {mode === 'sign_in' ? 'Username or Email Address' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={mode === 'sign_in' ? 'Username or email address' : 'student@university.edu'}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all mt-1 disabled:opacity-50"
              >
                <span>
                  {authLoading
                    ? 'Authenticating...'
                    : mode === 'sign_in'
                    ? 'Sign In to Portal'
                    : 'Create Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <span className="text-[11px] text-slate-500">
                Placement & Training Directorate • Career Platform
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

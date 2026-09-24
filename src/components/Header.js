'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  Bell,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Header() {
  const { user, role, alert, theme } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Google Recruitment Drive 2026', time: '10m ago', unread: true },
    { id: 2, title: 'System Design Mock Test is now active', time: '1h ago', unread: true },
    { id: 3, title: 'Faculty reviewed your Cloud Project', time: '1d ago', unread: false }
  ];

  return (
    <>
      {/* Toast Alert Banner if present */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md transition-all animate-bounce ${
          alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
          alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' :
          'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
        }`}>
          {alert.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {alert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
          {alert.type === 'info' && <Info className="w-5 h-5" />}
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
        {/* Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies, learning modules, students, drives..."
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 text-xs text-slate-900 dark:text-white rounded-xl pl-9 pr-4 py-2 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-4">
          {/* Quick Recruiter Live Badge */}
          <div className="hidden md:flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span>14 Active Campus Drives</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
                  <button onClick={() => setShowNotifications(false)}>
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs flex flex-col gap-1 transition-colors ${
                        n.unread
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Preview */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.fullName || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user?.fullName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {user?.department || 'Engineering'}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

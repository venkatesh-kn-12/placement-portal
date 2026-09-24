'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  ShieldCheck,
  Building,
  TrendingUp,
  Users,
  Award,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  BarChart,
  Calendar,
  CheckCircle2,
  Briefcase,
  KeyRound,
  Lock,
  Mail
} from 'lucide-react';

export default function AdminPage() {
  const { user, showAlert, updateAdminCredentials, sendAdminPasswordResetEmail, getMasterAdminCreds } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Admin Credentials form state
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminEmail, setAdminEmail] = useState('admin@portal.com');
  const [adminFullName, setAdminFullName] = useState('System Administrator');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  const [newDrive, setNewDrive] = useState({
    name: '',
    role: '',
    ctc: '',
    minCgpa: 7.5,
    requiredCodingScore: 80,
    deadline: '2026-11-30',
    skills: 'DSA, System Design'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof getMasterAdminCreds === 'function') {
      const creds = getMasterAdminCreds();
      setAdminUsername(creds.username || 'admin');
      setAdminEmail(creds.email || 'admin@portal.com');
      setAdminFullName(creds.fullName || 'System Administrator');
    }
  }, [getMasterAdminCreds]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users')
        ]);
        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        setStats(statsData);
        setUsers(usersData);
      } catch (e) {
        console.error('Error loading admin data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showAlert(`User role updated to ${newRole}!`, 'success');
    } catch (e) {
      showAlert('Failed to update user role', 'warning');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showAlert('User removed from system', 'info');
    } catch (e) {
      showAlert('Failed to delete user', 'warning');
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!newDrive.name || !newDrive.role) return;
    try {
      await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDrive)
      });
      setShowDriveModal(false);
      showAlert(`Recruitment drive for ${newDrive.name} published!`, 'success');
    } catch (e) {
      showAlert('Failed to publish drive', 'warning');
    }
  };

  const handleUpdateAdminCreds = async (e) => {
    e.preventDefault();
    if (adminPassword && adminPassword !== adminPasswordConfirm) {
      showAlert('Passwords do not match!', 'warning');
      return;
    }
    const res = await updateAdminCredentials({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword || undefined,
      fullName: adminFullName
    });
    if (res?.success) {
      setShowAdminModal(false);
      setAdminPassword('');
      setAdminPasswordConfirm('');
    }
  };

  const handleSendResetEmail = async () => {
    setSendingReset(true);
    await sendAdminPasswordResetEmail(adminEmail);
    setSendingReset(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Placement Directorate Control Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Admin Placement Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Cohort recruitment analytics, corporate company drive scheduling, and campus user access governance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Admin Security & Credentials</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDriveModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Company Drive</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Placement Conversion
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.placementRate}
            </div>
            <div className="text-[11px] text-slate-500">
              {stats.placedStudents} / {stats.totalStudents} Candidates
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Average CTC Package
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.averageCtc}
            </div>
            <div className="text-[11px] text-slate-500">Median compensation across branches</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Highest Package
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
              {stats.highestCtc}
            </div>
            <div className="text-[11px] text-slate-500">Tier-1 International / FAANG</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Drives
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-500">
              {stats.activeDrives} Open
            </div>
            <div className="text-[11px] text-slate-500">68 Total Recruiting Partners</div>
          </div>
        </div>
      )}

      {/* Department Breakdown Table */}
      {stats && (
        <div id="analytics" className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Branch-wise Placement Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Placed Students</th>
                  <th className="pb-3">Total Eligible</th>
                  <th className="pb-3">Placement Rate</th>
                  <th className="pb-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.departmentBreakdown.map((row) => (
                  <tr key={row.dept} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{row.dept}</td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{row.placed}</td>
                    <td className="py-3 text-slate-500">{row.total}</td>
                    <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">{row.rate}</td>
                    <td className="py-3 w-40">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: row.rate }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Management & Role Toggling */}
      <div id="users" className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>Campus User Management & Role Access</span>
            </h3>
            <p className="text-xs text-slate-500">
              Instantly toggle user roles between Student, Faculty, and Admin
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">{users.length} Users</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <div
              key={u.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                  alt={u.fullName}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {u.fullName}
                  </div>
                  <div className="text-[11px] text-slate-400">{u.email} • {u.department || 'General'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {u.id === 'master-admin-01' || u.email === adminEmail || (u.role === 'ADMIN' && u.email?.toLowerCase().includes('admin')) ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Permanent Master Admin</span>
                  </span>
                ) : (
                  <>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-colors ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                          : u.role === 'FACULTY'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY">Faculty</option>
                      <option value="ADMIN">Admin</option>
                    </select>

                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                      title="Remove User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Security & Credentials Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Master Admin Credentials & Security
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure your permanent admin credentials or trigger a password reset
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateAdminCreds} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 outline-none border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminFullName}
                    onChange={(e) => setAdminFullName(e.target.value)}
                    placeholder="System Administrator"
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 outline-none border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Admin Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@portal.com"
                    className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 outline-none border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={sendingReset}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all text-[11px] whitespace-nowrap flex items-center gap-1.5"
                    title="Send password reset link to this email"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{sendingReset ? 'Sending...' : 'Email Reset Link'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Change Password (Leave blank to keep current)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 outline-none border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={adminPasswordConfirm}
                      onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 outline-none border border-transparent focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30"
                >
                  Save Admin Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Launch Drive Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Launch New Campus Recruitment Drive
            </h3>
            <form onSubmit={handleCreateDrive} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Systems"
                  value={newDrive.name}
                  onChange={(e) => setNewDrive({ ...newDrive, name: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Job Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer - Cloud Infrastructure"
                  value={newDrive.role}
                  onChange={(e) => setNewDrive({ ...newDrive, role: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">CTC Package</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 18.0 LPA"
                    value={newDrive.ctc}
                    onChange={(e) => setNewDrive({ ...newDrive, ctc: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Minimum CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDrive.minCgpa}
                    onChange={(e) => setNewDrive({ ...newDrive, minCgpa: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, Docker, Networking, Linux"
                  value={newDrive.skills}
                  onChange={(e) => setNewDrive({ ...newDrive, skills: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDriveModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Publish Campus Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

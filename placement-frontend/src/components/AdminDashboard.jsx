import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import api from '../services/api';
import { useAlert } from './AlertContext';

export default function AdminDashboard() {
  const { showAlert } = useAlert();
  const alert = (msg) => showAlert(msg);
  const [stats, setStats] = useState({
    total_students: 0,
    total_faculty: 0,
    total_companies: 0,
    average_readiness_base: 3.5,
    badge_statistics: {}
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittingCompany, setSubmittingCompany] = useState(false);

  // Form State for Company Registration
  const [compName, setCompName] = useState('');
  const [compRole, setCompRole] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [aptThreshold, setAptThreshold] = useState('3.5');
  const [codeThreshold, setCodeThreshold] = useState('3.5');
  const [softThreshold, setSoftThreshold] = useState('3.5');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const techSkillsList = ['Java', 'Python', 'SQL', 'React', 'Node.js', 'C++', 'AWS', 'Docker', 'Kubernetes', 'JavaScript'];

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      const usersRes = await api.get('/admin/users');
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Error loading admin stats/users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      alert(`User role updated successfully to ${newRole}!`);
      fetchAdminData();
    } catch (err) {
      alert("Failed to update user role: " + err.message);
    }
  };

  const handleSkillToggle = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleRegisterCompany = async (e) => {
    e.preventDefault();
    if (!compName.trim() || !compRole.trim() || !compDesc.trim() || selectedSkills.length === 0) {
      alert('Please fill out all fields and select at least one required skill tag.');
      return;
    }

    setSubmittingCompany(true);
    try {
      const payload = {
        name: compName.trim(),
        role: compRole.trim(),
        description: compDesc.trim(),
        min_test_scores: {
          aptitude: parseFloat(aptThreshold),
          coding: parseFloat(codeThreshold),
          soft_skills: parseFloat(softThreshold)
        },
        skills: selectedSkills
      };

      await api.post('/admin/companies', payload);
      alert('Company placement drive registered successfully!');
      
      // Reset Form
      setCompName('');
      setCompRole('');
      setCompDesc('');
      setAptThreshold('3.5');
      setCodeThreshold('3.5');
      setSoftThreshold('3.5');
      setSelectedSkills([]);
      
      // Refresh Data
      fetchAdminData();
    } catch (err) {
      alert('Company registration failed: ' + err.message);
    } finally {
      setSubmittingCompany(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recharts data conversions
  const roleData = [
    { name: 'Students', value: users.filter(u => u.role === 'STUDENT').length, color: '#6366f1' },
    { name: 'Faculty', value: users.filter(u => u.role === 'FACULTY').length, color: '#f59e0b' },
    { name: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, color: '#10b981' }
  ];

  const badgeChartData = Object.entries(stats.badge_statistics).map(([name, count]) => ({
    name: name.replace(" Badge", ""),
    count: Number(count)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Control Panel</h1>
        <p className="text-xs text-slate-400 mt-1">Manage user privilege overrides, review system metrics, and register new hiring company drive requirements.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Registered Students</span>
          <span className="block text-3xl font-extrabold text-slate-100 mt-1">{stats.total_students}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Faculty Members</span>
          <span className="block text-3xl font-extrabold text-slate-100 mt-1">{stats.total_faculty}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Registered Companies</span>
          <span className="block text-3xl font-extrabold text-slate-100 mt-1">{stats.total_companies}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Readiness Threshold</span>
          <span className="block text-3xl font-extrabold text-indigo-400 mt-1">{stats.average_readiness_base} <span className="text-xs text-slate-500">/ 5.0</span></span>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Roles Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Platform Role Demographics</h3>
          <p className="text-[11px] text-slate-500 mb-6">Distribution of active accounts registered across Students, Faculty, and System Admins.</p>
          
          <div className="h-60 flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {roleData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px', color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="w-1/2 space-y-3 pl-4">
              {roleData.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-950 border border-slate-850/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }}></span>
                    <span className="font-semibold text-slate-300">{r.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-400">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Digital Badges Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Academy Badge Issuances</h3>
          <p className="text-[11px] text-slate-500 mb-6">Visual breakdown of digital competency badges unlocked by students in the Learning Academy.</p>
          
          <div className="h-60">
            {badgeChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                No badges awarded to render.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={badgeChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px', color: '#f1f5f9' }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {badgeChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#6366f1' : '#a855f7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Badges metrics and user roles manager split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User directory role manager */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">System Privileges Directory</h3>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Filter by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none transition-colors"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="pb-3 pl-2">User Details</th>
                  <th className="pb-3">Registered At</th>
                  <th className="pb-3 pr-2 text-right">System Privilege Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500 italic">No users found.</td>
                  </tr>
                ) : null}
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="py-3 pl-2">
                      <span className="block font-bold text-slate-200">{u.fullName || 'No Name Set'}</span>
                      <span className="block text-[10px] text-slate-550 mt-0.5">{u.email}</span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-250 font-semibold outline-none cursor-pointer"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Badges and statistics card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Academy Badge Distribution</h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Volume of active course badges successfully claimed by student profiles across the system.
          </p>
          <div className="space-y-2">
            {Object.keys(stats.badge_statistics).length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No course badges have been awarded yet.</p>
            ) : null}
            {Object.entries(stats.badge_statistics).map(([badgeName, count], idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-850/80 rounded-xl flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="font-bold text-slate-350">{badgeName}</span>
                </div>
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded font-bold text-indigo-400 text-[10px]">{count} Awarded</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Register Company Placement Drive Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Register Placement Drive & Thresholds</h3>
        
        <form onSubmit={handleRegisterCompany} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Company details columns */}
          <div className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Job Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Software Engineer"
                  value={compRole}
                  onChange={(e) => setCompRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Role Description</label>
              <textarea
                placeholder="Provide details about requirements, CGPA threshold, visit schedule..."
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none h-24 resize-none transition-colors"
                required
              />
            </div>

            {/* Standard score thresholds */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standard MCQ Assessment Thresholds (1.0 to 5.0)</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-semibold mb-1">Aptitude</label>
                  <select
                    value={aptThreshold}
                    onChange={(e) => setAptThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    {['3.0', '3.5', '4.0', '4.5', '5.0'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-semibold mb-1">Coding</label>
                  <select
                    value={codeThreshold}
                    onChange={(e) => setCodeThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    {['3.0', '3.5', '4.0', '4.5', '5.0'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-semibold mb-1">Soft Skills</label>
                  <select
                    value={softThreshold}
                    onChange={(e) => setSoftThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    {['3.0', '3.5', '4.0', '4.5', '5.0'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Requirements list multi-select column */}
          <div className="space-y-4 p-5 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between">
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required Skill Focus</label>
              <p className="text-[9px] text-slate-500 leading-normal">
                Select one or more core framework or programming language skills required for candidates to qualify.
              </p>
              
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {techSkillsList.map((skill) => {
                  const selected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`flex items-center space-x-2 px-3 py-2 border rounded-lg text-left transition-all ${
                        selected 
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center text-[9px] font-bold ${selected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700 bg-slate-950'}`}>
                        {selected && '✓'}
                      </span>
                      <span className="text-[10px] font-semibold">{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingCompany}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {submittingCompany ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Drive</span>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

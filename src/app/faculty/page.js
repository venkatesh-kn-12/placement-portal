'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  Users,
  FileCheck,
  CheckCircle,
  XCircle,
  BookOpen,
  Plus,
  ExternalLink,
  GitBranch,
  Award,
  Download,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

export default function FacultyPage() {
  const { user, showAlert } = useAuth();
  const [students, setStudents] = useState([]);
  const [pendingEvidence, setPendingEvidence] = useState({ projects: [], certificates: [] });
  const [materials, setMaterials] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', category: 'Technical DSA', format: 'PDF' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacultyData() {
      try {
        const [studRes, evidRes, matRes] = await Promise.all([
          fetch('/api/faculty/students'),
          fetch('/api/faculty/evidence/pending'),
          fetch('/api/faculty/materials')
        ]);
        const studData = await studRes.json();
        const evidData = await evidRes.json();
        const matData = await matRes.json();
        setStudents(studData);
        setPendingEvidence(evidData);
        setMaterials(matData);
      } catch (e) {
        console.error('Error loading faculty data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadFacultyData();
  }, []);

  const handleReviewEvidence = async (id, type, status) => {
    try {
      await fetch('/api/faculty/evidence/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, status, feedback: status === 'APPROVED' ? 'Approved by Faculty' : 'Revisions required' })
      });

      if (type === 'PROJECT') {
        setPendingEvidence(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.id !== id)
        }));
      } else {
        setPendingEvidence(prev => ({
          ...prev,
          certificates: prev.certificates.filter(c => c.id !== id)
        }));
      }
      showAlert(`Submission marked as ${status}!`, 'success');
    } catch (e) {
      showAlert('Failed to update evidence status', 'warning');
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.title) return;
    try {
      const res = await fetch('/api/faculty/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      });
      const created = await res.json();
      setMaterials([created, ...materials]);
      setShowMaterialModal(false);
      setNewMaterial({ title: '', category: 'Technical DSA', format: 'PDF' });
      showAlert('Study material uploaded to repository!', 'success');
    } catch (e) {
      showAlert('Failed to upload material', 'warning');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Faculty Mentorship & Verification Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Faculty Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Evaluate engineering projects, verify external credentials, and upload core placement preparation blueprints.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
            Pending Queue: {pendingEvidence.projects.length + pendingEvidence.certificates.length}
          </div>
          <button
            onClick={() => setShowMaterialModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Guide</span>
          </button>
        </div>
      </div>

      {/* Pending Evidence Verification Queue */}
      <div id="evidence" className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-500" />
              <span>Pending Student Evidence Queue</span>
            </h3>
            <p className="text-xs text-slate-500">
              Submissions requiring faculty verification before recruiters can view them
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {pendingEvidence.projects.length + pendingEvidence.certificates.length} items awaiting review
          </span>
        </div>

        {pendingEvidence.projects.length === 0 && pendingEvidence.certificates.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-xs">
            🎉 All student evidence submissions have been reviewed and verified!
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending Projects */}
            {pendingEvidence.projects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">
                      Project
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">{proj.description}</p>
                  <div className="text-[10px] text-slate-400">
                    Candidate: <strong className="text-slate-700 dark:text-slate-300">{proj.studentName}</strong> ({proj.studentUsn}) • Stack: {proj.techStack}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors"
                      title="Inspect Code"
                    >
                      <GitBranch className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleReviewEvidence(proj.id, 'PROJECT', 'REJECTED')}
                    className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition-all"
                  >
                    Request Edit
                  </button>
                  <button
                    onClick={() => handleReviewEvidence(proj.id, 'PROJECT', 'APPROVED')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}

            {/* Pending Certificates */}
            {pendingEvidence.certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                      Certificate
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cert.name}</h4>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Issuer: {cert.issuer} • Candidate: <strong className="text-slate-700 dark:text-slate-300">{cert.studentName}</strong> ({cert.studentUsn})
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReviewEvidence(cert.id, 'CERTIFICATE', 'REJECTED')}
                    className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleReviewEvidence(cert.id, 'CERTIFICATE', 'APPROVED')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Verify & Sign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cohort Student Directory & Study Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Student Cohort (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student Cohort Status
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">CGPA</th>
                    <th className="pb-3">Readiness</th>
                    <th className="pb-3">Verified Projects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 flex items-center gap-2.5">
                        <img
                          src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                          alt={st.fullName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{st.fullName}</div>
                          <div className="text-[10px] text-slate-400">{st.usn || '1DS21CS101'}</div>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{st.cgpa}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-[10px]">
                          {st.scores?.readiness_score || 84}%
                        </span>
                      </td>
                      <td className="py-3 font-bold text-emerald-500">
                        {st.verifiedProjects || 1} Verified
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Study Materials Repository (5 cols) */}
        <div id="materials" className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span>Placement Resources</span>
              </h3>
              <span className="text-xs text-indigo-500 font-bold">{materials.length} Guides</span>
            </div>

            <div className="space-y-3">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {mat.title}
                    </h5>
                    <span className="text-[9px] font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded shrink-0">
                      {mat.format}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{mat.category}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upload Study Resource / Blueprint
            </h3>
            <form onSubmit={handleUploadMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dynamic Programming Top 50 Problems"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={newMaterial.category}
                  onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                >
                  <option>Coding & Algorithms</option>
                  <option>System Design</option>
                  <option>Core Engineering (OS/DBMS/CN)</option>
                  <option>Aptitude</option>
                  <option>Behavioral & STAR</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

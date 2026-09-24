'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  Sparkles,
  Award,
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch,
  Plus,
  FileText,
  Upload,
  BarChart3,
  TrendingUp,
  Briefcase,
  AlertCircle,
  Building,
  ChevronRight,
  ShieldCheck,
  Brain,
  Code2,
  Lock
} from 'lucide-react';
import AssessmentLockdownModal from '@/components/AssessmentLockdownModal';

export default function StudentDashboard() {
  const { user, scores, updateScores, isOnboarded, showAlert } = useAuth();
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showLockdownModal, setShowLockdownModal] = useState(false);
  const [atsScore, setAtsScore] = useState(88);
  const [analyzingResume, setAnalyzingResume] = useState(false);

  // New Project Form
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: ''
  });

  // New Certificate Form
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    credentialId: '',
    evidenceUrl: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, certRes, compRes] = await Promise.all([
          fetch('/api/student/projects'),
          fetch('/api/student/certificates'),
          fetch('/api/companies')
        ]);
        const projData = await projRes.json();
        const certData = await certRes.json();
        const compData = await compRes.json();
        setProjects(projData);
        setCertificates(certData);
        setCompanies(compData);
      } catch (e) {
        console.error('Error fetching student data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title) return;
    try {
      const res = await fetch('/api/student/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      const created = await res.json();
      setProjects([created, ...projects]);
      setShowProjectModal(false);
      setNewProject({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '' });
      showAlert('Project submitted for faculty verification!', 'success');
    } catch (err) {
      showAlert('Failed to submit project', 'warning');
    }
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    if (!newCert.name) return;
    try {
      const res = await fetch('/api/student/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert)
      });
      const created = await res.json();
      setCertificates([created, ...certificates]);
      setShowCertModal(false);
      setNewCert({ name: '', issuer: '', credentialId: '', evidenceUrl: '' });
      showAlert('Certificate submitted for faculty review!', 'success');
    } catch (err) {
      showAlert('Failed to submit certificate', 'warning');
    }
  };

  const handleSimulateResume = () => {
    setAnalyzingResume(true);
    setTimeout(() => {
      setAtsScore(94);
      setAnalyzingResume(false);
      showAlert('Resume analyzed! ATS match scored at 94%.', 'success');
    }, 1200);
  };

  const readinessPercentage = Math.round(
    ((scores.soft_skills || 0) + (scores.aptitude || 0) + (scores.coding || 0)) / 3
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-500/20 shadow-xl overflow-hidden text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Campus Recruitment Batch 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-sm text-indigo-200/80 max-w-xl">
              Track your placement readiness, verify engineering projects, and apply to tier-1 campus drives.
            </p>
          </div>

          {/* Quick Lockdown / Assessment Status */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-4 rounded-2xl border border-indigo-500/20 shrink-0">
            <div className="text-right">
              <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Readiness Index
              </div>
              <div className="text-2xl font-black text-indigo-400">
                {readinessPercentage}%
              </div>
            </div>
            <button
              onClick={() => setShowLockdownModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <span>{isOnboarded ? 'Retake Tests' : 'Unlock Portal'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Foundation Assessment Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Soft Skills</h4>
                <p className="text-[11px] text-slate-500">STAR behavioral & comms</p>
              </div>
            </div>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400">{scores.soft_skills}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${scores.soft_skills}%` }}></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Aptitude & Quants</h4>
                <p className="text-[11px] text-slate-500">Logical reasoning & speed math</p>
              </div>
            </div>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400">{scores.aptitude}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${scores.aptitude}%` }}></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Coding Assessment</h4>
                <p className="text-[11px] text-slate-500">DSA & complexity analysis</p>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{scores.coding}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${scores.coding}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & Resume Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Student Projects (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Technical Project Showcase
                </h3>
                <p className="text-xs text-slate-500">
                  Projects reviewed and signed off by department faculty coordinators
                </p>
              </div>
              <button
                onClick={() => setShowProjectModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Project</span>
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-500/50 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {proj.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        proj.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {proj.status === 'APPROVED' ? 'Faculty Verified' : 'Review Pending'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      {proj.techStack}
                    </span>
                    <div className="flex items-center gap-3">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Certifications */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Industry Certifications
                </h3>
                <p className="text-xs text-slate-500">
                  Cloud, framework, and security certificates reviewed for graduation credits
                </p>
              </div>
              <button
                onClick={() => setShowCertModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certificate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {cert.name}
                    </h5>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        cert.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {cert.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{cert.issuer}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {cert.credentialId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: ATS Resume Analyzer & Active Drives (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* ATS Analyzer Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">ATS Resume Analyzer</h3>
              </div>
              <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-400/20">
                Score: {atsScore}%
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Scan your resume against Tier-1 requirements (quantified metrics, action verbs, keyword density).
            </p>

            <button
              onClick={handleSimulateResume}
              disabled={analyzingResume}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <Upload className="w-4 h-4" />
              <span>{analyzingResume ? 'Analyzing Resume...' : 'Analyze & Optimize Resume'}</span>
            </button>
          </div>

          {/* Active Recruitment Drives */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>Featured Campus Drives</span>
              </h3>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                {companies.length} Open
              </span>
            </div>

            <div className="space-y-3">
              {companies.slice(0, 3).map((comp) => (
                <div
                  key={comp.companyId}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {comp.name}
                    </span>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                      {comp.ctc}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{comp.role}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Min CGPA: {comp.minCgpa}</span>
                    <span className="text-indigo-500 font-semibold">{comp.applicationStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Submission Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Submit New Project for Faculty Review
            </h3>
            <form onSubmit={handleAddProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Queue"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Briefly describe what you built and key technical highlights..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tech Stack</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js, Go, Redis, Docker"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Submission Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Industry Certificate
            </h3>
            <form onSubmit={handleAddCertificate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Certificate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Developer Associate"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Issuing Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services / Coursera"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Credential ID / Verification Link</label>
                <input
                  type="text"
                  placeholder="e.g. AWS-DEV-98124 or https://..."
                  value={newCert.credentialId}
                  onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 outline-none border border-transparent focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assessment Lockdown Modal */}
      <AssessmentLockdownModal
        isOpen={showLockdownModal}
        onClose={() => setShowLockdownModal(false)}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  Sparkles,
  FileCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowRight,
  Award
} from 'lucide-react';

export default function PlacementPrepPage() {
  const { user, scores, showAlert } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testScore, setTestScore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedMap, setAppliedMap] = useState({});

  useEffect(() => {
    fetch('/api/companies')
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data);
        if (data.length > 0) setSelectedCompany(data[0]);
      });
  }, []);

  const handleApply = (comp) => {
    setAppliedMap((prev) => ({ ...prev, [comp.companyId]: true }));
    showAlert(`Application successfully submitted to ${comp.name}!`, 'success');
  };

  const handleRunMockTest = () => {
    setTestScore(92);
    showAlert(`Mock Assessment Cleared! 92% scored for ${selectedCompany?.name}`, 'success');
    setTimeout(() => {
      setShowTestModal(false);
    }, 1400);
  };

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Targeted Company Matching & Mock Testing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Placement Prep & Drives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Evaluate your match against recruiting companies, run timed role-specific mock tests, and submit applications.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, tech skill..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Grid: Companies (Left) & Match Detail/Mock Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Drives List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((comp) => {
              const isApplied = appliedMap[comp.companyId];
              const isSelected = selectedCompany?.companyId === comp.companyId;

              return (
                <div
                  key={comp.companyId}
                  onClick={() => setSelectedCompany(comp)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-lg ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {comp.name}
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {comp.ctc}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {comp.role}
                      </h4>
                      <p className="text-[11px] text-slate-400">{comp.location}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {comp.skills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                      Match: {comp.eligibilityMatch}%
                    </span>
                    <span className={`text-[10px] font-bold ${isApplied ? 'text-emerald-500' : 'text-slate-500'}`}>
                      {isApplied ? 'Application Sent' : comp.applicationStatus.split(' - ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Company Intelligence & Test Simulator (5 cols) */}
        {selectedCompany && (
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedCompany.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCompany.role}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {selectedCompany.ctc}
                  </div>
                  <div className="text-[10px] text-slate-400">Package CTC</div>
                </div>
              </div>

              {/* Eligibility Radar Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Candidate Match Factor</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{selectedCompany.eligibilityMatch}% Compatible</span>
                </div>
                <div className="w-full bg-indigo-200/50 dark:bg-indigo-900/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${selectedCompany.eligibilityMatch}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <div>Min CGPA: <span className="font-bold text-slate-900 dark:text-white">{selectedCompany.minCgpa}</span></div>
                  <div>Coding Benchmark: <span className="font-bold text-slate-900 dark:text-white">{selectedCompany.requiredCodingScore}%</span></div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setShowTestModal(true)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Launch {selectedCompany.name} Mock Test Simulator</span>
                </button>

                <button
                  onClick={() => handleApply(selectedCompany)}
                  disabled={appliedMap[selectedCompany.companyId]}
                  className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {appliedMap[selectedCompany.companyId]
                      ? 'Application Already Submitted'
                      : `Apply for ${selectedCompany.name} Campus Drive`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mock Test Modal */}
      {showTestModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCompany.name} Technical Assessment Simulator
                </h3>
                <p className="text-xs text-slate-500">Duration: 45 Mins • 2 Coding + 3 System Design MCQs</p>
              </div>
              <div className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>44:30</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-white">
                Problem: Given an array of integers representing stock prices, find the maximum profit from at most 2 transactions.
              </div>
              <p className="text-slate-500">Optimal dynamic programming approach requires maintaining states for buy1, sell1, buy2, sell2.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Exit Simulator
              </button>
              <button
                type="button"
                onClick={handleRunMockTest}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Submit Solutions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

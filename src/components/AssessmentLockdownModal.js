'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { ShieldAlert, CheckCircle, Brain, Terminal, MessageSquare, Play, Sparkles } from 'lucide-react';

export default function AssessmentLockdownModal({ isOpen, onClose }) {
  const { scores, updateScores } = useAuth();
  const [activeTab, setActiveTab] = useState('soft_skills');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const testQuestions = {
    soft_skills: [
      {
        q: 'During an unexpected system outage before a release, how do you communicate with stakeholders?',
        options: [
          'Wait until the issue is 100% resolved before saying anything.',
          'Send an immediate transparent status update outlining the impact, mitigation steps, and ETA.',
          'Blame the infrastructure provider publicly.',
          'Hand off the communication to junior members.'
        ],
        correct: 1
      },
      {
        q: 'When receiving critical feedback on your pull request from a senior engineer, what is your approach?',
        options: [
          'Take it constructively, review the architectural reasoning, and clarify ambiguities.',
          'Argue that your approach works regardless.',
          'Ignore the comments and merge.',
          'Abandon the PR completely.'
        ],
        correct: 0
      }
    ],
    aptitude: [
      {
        q: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
        options: ['65 sec', '89 sec', '100 sec', '75 sec'],
        correct: 1
      },
      {
        q: 'If 6 workers can complete a web development project in 14 days, how many days will 8 workers take?',
        options: ['10.5 days', '12 days', '11 days', '9.5 days'],
        correct: 0
      }
    ],
    coding: [
      {
        q: 'What is the optimal time complexity to find the lowest common ancestor (LCA) in a Binary Search Tree?',
        options: ['O(N)', 'O(H) where H is tree height', 'O(1)', 'O(N log N)'],
        correct: 1
      },
      {
        q: 'Which data structure is most appropriate to implement an LRU (Least Recently Used) cache with O(1) get and put?',
        options: ['Array + Stack', 'HashMap + Doubly Linked List', 'Max Heap + Binary Search', 'Binary Tree'],
        correct: 1
      }
    ]
  };

  const handleCompleteCurrent = (type, score = 88) => {
    updateScores({ [type]: score });
  };

  const handleInstantUnlockAll = () => {
    setSubmitting(true);
    setTimeout(() => {
      updateScores({
        soft_skills: 85,
        aptitude: 82,
        coding: 94,
        readiness_score: 87
      });
      setSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Onboarding Foundation Assessments</h2>
              <p className="text-xs text-indigo-200/80">Complete all 3 baseline assessments to unlock portal drives & tests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500"
          >
            Close
          </button>
        </div>

        {/* Assessment Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <button
            onClick={() => setActiveTab('soft_skills')}
            className={`p-3.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'soft_skills'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Soft Skills {scores.soft_skills > 0 && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline ml-1" />}
          </button>
          <button
            onClick={() => setActiveTab('aptitude')}
            className={`p-3.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'aptitude'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Brain className="w-4 h-4" />
            Aptitude {scores.aptitude > 0 && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline ml-1" />}
          </button>
          <button
            onClick={() => setActiveTab('coding')}
            className={`p-3.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'coding'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Coding {scores.coding > 0 && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline ml-1" />}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              Sample {activeTab.replace('_', ' ')} Questions
            </h3>
            {testQuestions[activeTab].map((item, qIdx) => (
              <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {qIdx + 1}. {item.q}
                </div>
                <div className="space-y-1.5 pl-2">
                  {item.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400">
                      <input type="radio" name={`q-${activeTab}-${qIdx}`} defaultChecked={oIdx === item.correct} className="text-indigo-600" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={handleInstantUnlockAll}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? 'Unlocking...' : 'Instant Clear & Unlock All (Dev Mode)'}
          </button>

          <button
            onClick={() => handleCompleteCurrent(activeTab, 85)}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 active:scale-95"
          >
            <Play className="w-4 h-4" />
            Submit {activeTab.replace('_', ' ')}
          </button>
        </div>
      </div>
    </div>
  );
}

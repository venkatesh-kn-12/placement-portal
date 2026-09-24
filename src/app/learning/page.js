'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  GraduationCap,
  PlayCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  Sparkles,
  Layers,
  HelpCircle,
  Lock
} from 'lucide-react';
import AssessmentLockdownModal from '@/components/AssessmentLockdownModal';

export default function LearningAcademy() {
  const { isOnboarded, showAlert } = useAuth();
  const [courses, setCourses] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showLockdownModal, setShowLockdownModal] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0]);
      });
  }, []);

  const handleToggleLesson = async (courseId, lessonId) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId })
      });
      const updatedCourses = await res.json();
      setCourses(updatedCourses);
      const updatedSelected = updatedCourses.find((c) => c.id === courseId);
      if (updatedSelected) setSelectedCourse(updatedSelected);
      showAlert('Lesson progress updated!', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteQuiz = () => {
    setQuizScore(100);
    showAlert('Assessment quiz cleared! 100% Score recorded.', 'success');
    setTimeout(() => {
      setShowQuizModal(false);
    }, 1200);
  };

  const filteredCourses =
    activeCategory === 'All'
      ? courses
      : courses.filter((c) => c.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Structured Interview Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Learning Academy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Master core engineering topics, distributed systems, FAANG interview patterns, and STAR behavioral strategies.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {['All', 'Technical', 'System Design', 'Aptitude', 'Soft Skills'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Courses Catalog (left) & Active Track Lessons (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Course Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCourse(c)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedCourse?.id === c.id
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-lg ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      {c.category}
                    </span>
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {c.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{c.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${c.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Track Lessons & Quizzes (5 cols) */}
        {selectedCourse && (
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Active Module
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedCourse.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowQuizModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Take Quiz</span>
                </button>
              </div>

              {/* Instructor badge */}
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Instructor: {selectedCourse.instructor}</span>
              </div>

              {/* Lessons Checklist */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Lessons ({selectedCourse.completedLessons} / {selectedCourse.lessons.length} Completed)
                </div>

                <div className="space-y-2">
                  {selectedCourse.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => handleToggleLesson(selectedCourse.id, lesson.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        lesson.completed
                          ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle
                          className={`w-4 h-4 ${
                            lesson.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                        <span className="text-xs font-semibold">{lesson.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      {showQuizModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              <span>{selectedCourse.title} – Assessment Quiz</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Question 1: In high-scale distributed architectures, which caching eviction policy removes the least recently requested key?
              </div>
              <div className="space-y-1.5 pl-2 text-slate-600 dark:text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="quiz-ans" defaultChecked />
                  <span>LRU (Least Recently Used)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="quiz-ans" />
                  <span>FIFO (First In First Out)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="quiz-ans" />
                  <span>LFU (Least Frequently Used)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowQuizModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCompleteQuiz}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                Submit Answers
              </button>
            </div>
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

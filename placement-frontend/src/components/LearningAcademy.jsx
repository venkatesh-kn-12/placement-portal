import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAlert } from './AlertContext';

export default function LearningAcademy() {
  const { showAlert } = useAlert();
  const alert = (msg) => showAlert(msg);
  const [courses, setCourses] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active study state
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // Quiz state
  const [takingQuiz, setTakingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);

  const fetchCoursesData = async () => {
    try {
      const coursesRes = await api.get('/courses');
      const progressRes = await api.get('/courses/progress');
      setCourses(coursesRes.data);
      setProgressList(progressRes.data);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesData();
  }, []);

  const handleStartStudy = async (courseId) => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${courseId}`);
      setActiveCourse(res.data);
      setActiveCourseId(courseId);
      setActiveLessonIdx(0);
      setTakingQuiz(false);
      setQuizResult(null);
    } catch (err) {
      alert("Failed to load course details.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    const lesson = activeCourse.lessons[activeLessonIdx];
    try {
      await api.post(`/courses/${activeCourseId}/lesson`, { lessonId: lesson.id });
      
      // Update local progress list
      const progRes = await api.get('/courses/progress');
      setProgressList(progRes.data);

      // Slide to next lesson if exists
      if (activeLessonIdx < activeCourse.lessons.length - 1) {
        setActiveLessonIdx(prev => prev + 1);
      }
    } catch (err) {
      alert("Failed to complete lesson.");
    }
  };

  const handleStartQuiz = () => {
    setQuizQuestions(activeCourse.quiz);
    setQuizAnswers(activeCourse.quiz.map(() => -1));
    setCurrentQIdx(0);
    setQuizResult(null);
    setTakingQuiz(true);
  };

  const handleQuizAnswer = (qIdx, selectionIdx) => {
    setQuizAnswers(prev => {
      const next = [...prev];
      next[qIdx] = selectionIdx;
      return next;
    });
  };

  const handleSubmitQuiz = async () => {
    const unanswered = quizAnswers.filter(a => a === -1).length;
    if (unanswered > 0) {
      alert(`Please answer all ${unanswered} question(s) before submitting.`);
      return;
    }

    try {
      const res = await api.post(`/courses/${activeCourseId}/quiz`, { answers: quizAnswers });
      setQuizResult(res.data);
    } catch (err) {
      alert("Quiz submission failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  // Quiz View
  if (takingQuiz && activeCourse) {
    if (quizResult) {
      return (
        <div className="max-w-xl mx-auto p-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-lg">
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4 ${quizResult.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {quizResult.passed 
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                }
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-slate-100 mb-1">{quizResult.passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
            <p className="text-slate-400 text-xs mb-6">Score: {quizResult.score}% ({quizResult.correctCount} of {quizResult.total} correct)</p>
            
            <div className="text-xs text-slate-300 leading-normal max-w-sm mx-auto mb-6 bg-slate-950 p-4 border border-slate-800 rounded-lg">
              {quizResult.passed 
                ? `Awesome! You scored ${quizResult.score}% and earned the **${activeCourse.badge_name}** badge. Check your dashboard profile to view it.`
                : 'You need at least **70%** to pass the evaluation and claim your badge. Go back, review lessons, and try again!'
              }
            </div>

            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => {
                  setTakingQuiz(false);
                  setQuizResult(null);
                }}
                className="px-4 py-2 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors font-semibold"
              >
                Review Lessons
              </button>
              {quizResult.passed ? (
                <button
                  onClick={() => {
                    setActiveCourseId(null);
                    setActiveCourse(null);
                    fetchCoursesData();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs text-white rounded-lg transition-colors font-semibold"
                >
                  Academy Home
                </button>
              ) : (
                <button
                  onClick={handleStartQuiz}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs text-white rounded-lg transition-colors font-semibold"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    const currentQ = quizQuestions[currentQIdx];
    const selection = quizAnswers[currentQIdx];

    return (
      <div className="max-w-xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-200">Syllabus Evaluation Quiz</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{activeCourse.title}</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Question {currentQIdx+1} of {quizQuestions.length}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-slate-200 font-semibold text-sm mb-4 leading-normal">{currentQ?.question}</h3>
          <div className="space-y-2">
            {currentQ?.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleQuizAnswer(currentQIdx, oIdx)}
                className={`w-full flex items-center space-x-3 p-3 text-xs text-left border rounded-lg transition-all ${
                  selection === oIdx
                    ? 'bg-indigo-600/15 border-indigo-500 text-slate-200 font-medium'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selection === oIdx ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700 bg-slate-950'}`}>
                  {selection === oIdx && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQIdx(prev => Math.max(0, prev - 1))}
            disabled={currentQIdx === 0}
            className="px-4 py-2 text-xs font-semibold bg-slate-850 hover:bg-slate-850 rounded-lg text-slate-450 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Previous
          </button>
          
          {currentQIdx === quizQuestions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-4 py-2 text-xs font-semibold bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQIdx(prev => prev + 1)}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  // Course Detail study page
  if (activeCourseId && activeCourse) {
    const progress = progressList.find(p => p.course_id === activeCourseId) || { lessons_completed: [], badge_earned: false };
    const activeLesson = activeCourse.lessons[activeLessonIdx];
    const isCompleted = progress.lessons_completed.includes(activeLesson?.id);
    const quizUnlocked = progress.lessons_completed.length === activeCourse.lessons.length;

    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <button
              onClick={() => {
                setActiveCourseId(null);
                setActiveCourse(null);
                fetchCoursesData();
              }}
              className="text-xs font-bold text-indigo-400 hover:underline flex items-center mb-2"
            >
              &larr; Back to Academy catalog
            </button>
            <h1 className="text-xl font-bold tracking-tight">{activeCourse.title}</h1>
          </div>
          {progress.badge_earned && (
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-full">
              Badge Earned ({activeCourse.badge_name})
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Lessons list sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 h-fit">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">Lessons</h3>
            <div className="space-y-1">
              {activeCourse.lessons.map((lesson, idx) => {
                const completed = progress.lessons_completed.includes(lesson.id);
                const isActive = idx === activeLessonIdx;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonIdx(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-medium border text-left transition-all ${
                      isActive 
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <span>{lesson.title}</span>
                    {completed ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-800"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={!quizUnlocked}
              className="mt-4 w-full py-2 bg-green-600 hover:bg-green-500 text-white font-semibold text-xs rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Take Course Quiz
            </button>
            {!quizUnlocked && (
              <p className="text-[10px] text-amber-500 text-center mt-1.5 font-medium">Complete all lessons to unlock evaluation</p>
            )}
          </div>

          {/* Lesson Content box */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-between min-h-[350px]">
            {activeLesson ? (
              <>
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-2">{activeLesson.title}</h2>
                  <div className="text-slate-350 text-xs leading-relaxed space-y-2" style={{ whiteSpace: 'pre-wrap' }}>
                    {activeLesson.content}
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-800 pt-6 mt-8">
                  {isCompleted ? (
                    <span className="text-xs text-green-400 font-semibold flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Lesson Completed
                    </span>
                  ) : (
                    <button
                      onClick={handleMarkComplete}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Complete & Next Lesson
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 italic p-12">No lessons uploaded for this course yet.</div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Course Grid (default view)
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Academy</h1>
        <p className="text-xs text-slate-400 mt-1">Enroll in specialized bridging courses to patch skill gaps and claim validation badges.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const prog = progressList.find(p => p.course_id === course.id);
          const completedCount = prog ? prog.lessons_completed.length : 0;
          const totalLessons = course.lessons?.length || 2; // seed fallback
          const percent = Math.round((completedCount / totalLessons) * 100);
          const earned = prog ? prog.badge_earned : false;

          return (
            <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between min-h-[220px] hover:border-slate-700 transition-all hover:-translate-y-0.5">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-slate-200 leading-snug">{course.title}</h3>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${earned ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{course.description}</p>
                
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[9px] text-slate-500 font-semibold mb-1">
                    <span>Lessons: {completedCount}/{totalLessons}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-1 bg-indigo-500 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-850 pt-4 mt-6">
                <span className={`text-[10px] font-bold ${earned ? 'text-green-400' : 'text-amber-500'}`}>
                  {earned ? 'Badge Active (' + course.badge_name + ')' : 'Course Incomplete'}
                </span>
                <button
                  onClick={() => handleStartStudy(course.id)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-semibold text-[11px] rounded-md"
                >
                  {completedCount > 0 ? 'Resume Study' : 'Enroll & Study'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

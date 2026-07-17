import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAlert } from './AlertContext';

export default function PlacementPrep() {
  const { showAlert } = useAlert();
  const alert = (msg) => showAlert(msg);
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Prep Board State
  const [activeCompany, setActiveCompany] = useState(null);
  const [prepTasks, setPrepTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'mock' | 'materials'

  // Mock Test State
  const [takingMock, setTakingMock] = useState(false);
  const [mockQuestions, setMockQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [mockAnswers, setMockAnswers] = useState([]);
  const [mockResult, setMockResult] = useState(null);

  const fetchDrivesData = async () => {
    try {
      const res = await api.get('/student/dashboard');
      setDrives(res.data);
    } catch (err) {
      console.error("Failed to load placement drives:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivesData();
  }, []);

  const handleOpenPrep = async (company) => {
    setLoading(true);
    try {
      const tasksRes = await api.get(`/companies/${company.companyId}/tasks`);
      const materialsRes = await api.get('/faculty/materials'); // Fetch all faculty guides
      
      // Filter materials matching this company
      const companyMaterials = materialsRes.data.filter(m => m.company?.id === company.companyId);

      setPrepTasks(tasksRes.data);
      setMaterials(companyMaterials);
      setActiveCompany(company);
      setActiveTab('questions');
      setTakingMock(false);
      setMockResult(null);
    } catch (err) {
      alert("Failed to load prep board tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartMock = (mockTask) => {
    setMockQuestions(mockTask.content);
    setMockAnswers(mockTask.content.map(() => -1));
    setCurrentQIdx(0);
    setMockResult(null);
    setTakingMock(true);
  };

  const handleMockAnswerSelect = (qIdx, selectionIdx) => {
    setMockAnswers(prev => {
      const next = [...prev];
      next[qIdx] = selectionIdx;
      return next;
    });
  };

  const handleSubmitMockTest = async () => {
    const unanswered = mockAnswers.filter(a => a === -1).length;
    if (unanswered > 0) {
      alert(`Please answer all ${unanswered} question(s) before submitting.`);
      return;
    }

    try {
      const res = await api.post(`/companies/${activeCompany.companyId}/mock-test/submit`, { answers: mockAnswers });
      setMockResult(res.data);
    } catch (err) {
      alert("Mock test submission failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  // Mock Test View
  if (takingMock && activeCompany) {
    if (mockResult) {
      return (
        <div className="max-w-xl mx-auto p-8 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-400 mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-100 mb-1">Mock Exam Completed!</h2>
            <p className="text-slate-400 text-xs mb-6">Score: {mockResult.score}% ({mockResult.correct} of {mockResult.total} correct)</p>
            
            <div className="text-xs text-slate-300 leading-normal max-w-sm mx-auto mb-6 bg-slate-950 p-4 border border-slate-800 rounded-lg">
              This score has been submitted to your profile. Faculties can review your mock history. Taking mock exams updates your skill rating dynamically!
            </div>

            <button
              onClick={() => {
                setTakingMock(false);
                setMockResult(null);
                handleOpenPrep(activeCompany);
              }}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs text-white rounded-lg transition-colors font-semibold"
            >
              Return to Prep Board
            </button>
          </div>
        </div>
      );
    }

    const currentQ = mockQuestions[currentQIdx];
    const selection = mockAnswers[currentQIdx];

    return (
      <div className="max-w-xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-200">Company Placement Mock Test</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{activeCompany.companyName} - {activeCompany.role}</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">Question {currentQIdx+1} of {mockQuestions.length}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-slate-200 font-semibold text-sm mb-4 leading-normal">{currentQ?.question}</h3>
          <div className="space-y-2">
            {currentQ?.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleMockAnswerSelect(currentQIdx, oIdx)}
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
          
          {currentQIdx === mockQuestions.length - 1 ? (
            <button
              onClick={handleSubmitMockTest}
              className="px-4 py-2 text-xs font-semibold bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors"
            >
              Submit Mock Test
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

  // Active Prep Board view
  if (activeCompany) {
    const interviewQ = prepTasks.find(t => t.type === 'question');
    const mockTest = prepTasks.find(t => t.type === 'mock_test');

    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
        <div className="border-b border-slate-800 pb-4">
          <button
            onClick={() => {
              setActiveCompany(null);
              setPrepTasks([]);
              setMaterials([]);
              fetchDrivesData();
            }}
            className="text-xs font-bold text-indigo-400 hover:underline flex items-center mb-2"
          >
            &larr; Back to Opportunities list
          </button>
          <h1 className="text-xl font-bold tracking-tight">{activeCompany.companyName} Drive Prep</h1>
          <p className="text-xs text-slate-400 mt-1">Syllabus focus: **{activeCompany.role}** criteria.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-2 border-b border-slate-850 pb-2">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'questions' ? 'bg-slate-850 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Interview Q&A
          </button>
          <button
            onClick={() => setActiveTab('mock')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'mock' ? 'bg-slate-850 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Mock Exam
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${activeTab === 'materials' ? 'bg-slate-850 text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Guides & References
          </button>
        </div>

        {/* Tab Panels */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
          
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{interviewQ ? interviewQ.title : 'Interview Question'}</h3>
              <div
                className="text-slate-350 text-xs leading-relaxed space-y-2"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{
                  __html: (interviewQ?.content || 'Study guides are being compiled. Check back shortly.')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\`(.*?)\`/g, '<code class="bg-black/30 px-1 py-0.5 rounded text-indigo-300 font-mono">$1</code>')
                }}
              />
            </div>
          )}

          {activeTab === 'mock' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{mockTest ? mockTest.title : 'Mock Exam'}</h3>
              <p className="text-slate-400 text-xs leading-normal">
                Test your skills in actual drive conditions. Submitting will file a review record to updates your readiness profile.
              </p>
              {mockTest ? (
                <button
                  onClick={() => handleStartMock(mockTest)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors mt-2"
                >
                  Start Mock Test
                </button>
              ) : (
                <p className="text-slate-500 text-xs italic">No mock exams loaded for this drive context yet.</p>
              )}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Faculty Study Materials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {materials.length === 0 ? (
                  <p className="text-slate-500 text-xs italic col-span-2">No study guides uploaded specifically for this company yet.</p>
                ) : null}
                {materials.map(m => (
                  <div key={m.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-600/10 text-indigo-400 text-[9px] font-bold rounded-full uppercase tracking-wider">{m.type}</span>
                      <h4 className="font-semibold text-slate-200 text-xs mt-2">{m.title}</h4>
                    </div>
                    {m.type === 'link' ? (
                      <a href={m.urlOrContent} target="_blank" className="mt-4 text-center py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-xs text-slate-300 font-semibold">Open External Link</a>
                    ) : (
                      <button
                        onClick={() => alert(m.urlOrContent)}
                        className="mt-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-xs text-slate-300 font-semibold"
                      >
                        Read Document
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    );
  }

  // Drives Grid view (default)
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Placement Drives</h1>
        <p className="text-xs text-slate-400 mt-1">Review your eligibility across current active hiring company schedules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drives.map((drive) => {
          const eligible = drive.gaps.length === 0;

          return (
            <div key={drive.companyId} className={`bg-slate-900 border rounded-xl p-6 flex flex-col justify-between min-h-[250px] transition-all hover:-translate-y-0.5 ${eligible ? 'border-green-900/40 hover:border-green-800' : 'border-slate-800 hover:border-slate-700'}`}>
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">{drive.companyName}</h3>
                    <h4 className="text-xs text-indigo-400 font-semibold mt-0.5">{drive.role}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${eligible ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {eligible ? 'Eligible' : 'Gaps Identified'}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">{drive.description}</p>

                {/* Score gaps breakdown */}
                {!eligible && (
                  <div className="mt-4 bg-amber-500/5 border border-amber-500/15 p-3 rounded-lg text-[10px] text-amber-500 space-y-1">
                    <strong>Gaps to bridge:</strong>
                    {drive.gaps.map((g, idx) => (
                      <p key={idx}>• {g.skillName} rating: {g.currentRating.toFixed(1)} / {g.requiredRating.toFixed(1)} required</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end border-t border-slate-850 pt-4 mt-6">
                {eligible ? (
                  <button
                    onClick={() => handleOpenPrep(drive)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>Prepare Board</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/learning')}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Bridge Skill Gap
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

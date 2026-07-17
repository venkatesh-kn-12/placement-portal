import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAlert } from './AlertContext';

export default function ReviewProjects() {
  const { showAlert } = useAlert();
  const alert = (msg) => showAlert(msg);
  const [pendings, setPendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingInput, setRatingInput] = useState({});
  const [feedbackInput, setFeedbackInput] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchPendings = async () => {
    try {
      const res = await api.get('/faculty/projects/pending');
      setPendings(res.data);
    } catch (err) {
      console.error("Error loading pending projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendings();
  }, []);

  const handleGrade = async (projectId) => {
    const rating = ratingInput[projectId];
    const feedback = feedbackInput[projectId] || '';

    if (!rating || rating < 1 || rating > 5) {
      alert('Please select a valid rating between 1 and 5.');
      return;
    }

    setSubmittingId(projectId);
    try {
      await api.post(`/faculty/projects/${projectId}/review`, {
        rating: parseFloat(rating),
        feedback: feedback.trim()
      });
      alert('Project review submitted successfully!');
      
      setRatingInput(prev => {
        const copy = { ...prev };
        delete copy[projectId];
        return copy;
      });
      setFeedbackInput(prev => {
        const copy = { ...prev };
        delete copy[projectId];
        return copy;
      });

      fetchPendings();
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 font-sans animate-fadeIn">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review Student Projects</h1>
        <p className="text-xs text-slate-400 mt-1">Grade student implementation source code, download documentation, and inspect uploaded ER diagrams or schemas.</p>
      </div>

      {pendings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-350">All Caught Up!</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">There are currently no pending project uploads requiring faculty review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendings.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between gap-6 hover:border-slate-700 transition-colors">
              
              {/* Project details */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-bold uppercase tracking-wider">Project Submission</span>
                    <span className="text-[10px] text-slate-500">Submitted: {new Date(p.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mt-2">{p.title}</h3>
                  <span className="text-xs text-slate-400">By Student: <strong>{p.student?.fullName || 'Anonymous'}</strong> ({p.student?.email})</span>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                </div>

                {/* Git/Hosted links */}
                {(p.gitLink || p.hostedLink) && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {p.gitLink && (
                      <a
                        href={p.gitLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>Git Repository Link</span>
                      </a>
                    )}
                    {p.hostedLink && (
                      <a
                        href={p.hostedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span>Hosted Demo URL</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Uploaded files (document/diagram) */}
                {(p.documentPath || p.diagramPath) && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2.5">
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Submitted Assets</span>
                    <div className="flex flex-wrap gap-4 text-xs">
                      {p.documentPath && (
                        <a
                          href={p.documentPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline flex items-center space-x-1.5"
                        >
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download Project Document</span>
                        </a>
                      )}
                      {p.diagramPath && (
                        <a
                          href={p.diagramPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline flex items-center space-x-1.5"
                        >
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>View ER Diagram / Screenshots</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Review and grading panel */}
              <div className="w-full md:w-80 p-5 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evaluate & Grade</h4>
                  
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-semibold mb-1">Star Rating (1.0 to 5.0)</label>
                    <select
                      value={ratingInput[p.id] || ''}
                      onChange={(e) => setRatingInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-colors"
                    >
                      <option value="">Select Score</option>
                      <option value="5.0">5.0 - Excellent Architecture</option>
                      <option value="4.5">4.5 - Great Implementation</option>
                      <option value="4.0">4.0 - Good Work</option>
                      <option value="3.5">3.5 - Solid Baseline</option>
                      <option value="3.0">3.0 - Satisfactory</option>
                      <option value="2.5">2.5 - Needs Improvements</option>
                      <option value="2.0">2.0 - Poor Execution</option>
                      <option value="1.0">1.0 - Unacceptable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-semibold mb-1">Feedback Comments</label>
                    <textarea
                      placeholder="Provide critical review feedback..."
                      value={feedbackInput[p.id] || ''}
                      onChange={(e) => setFeedbackInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none h-20 resize-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleGrade(p.id)}
                  disabled={submittingId === p.id}
                  className="w-full mt-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {submittingId === p.id ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Grade</span>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

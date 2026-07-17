import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAlert } from './AlertContext';

export default function ReviewCerts() {
  const { showAlert } = useAlert();
  const alert = (msg) => showAlert(msg);
  const [pendings, setPendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingInput, setRatingInput] = useState({});
  const [feedbackInput, setFeedbackInput] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchPendings = async () => {
    try {
      const res = await api.get('/faculty/certificates/pending');
      setPendings(res.data);
    } catch (err) {
      console.error("Error loading pending certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendings();
  }, []);

  const handleGrade = async (certId, status) => {
    const rating = ratingInput[certId];
    const feedback = feedbackInput[certId] || '';

    if (status === 'APPROVED' && (!rating || rating < 1 || rating > 5)) {
      alert('Please select a valid rating between 1 and 5 before approving.');
      return;
    }

    setSubmittingId(certId);
    try {
      await api.post(`/faculty/certificates/${certId}/review`, {
        status,
        rating: rating ? parseFloat(rating) : null,
        feedback: feedback.trim()
      });
      alert(`Certificate review saved: ${status}`);
      
      setRatingInput(prev => {
        const copy = { ...prev };
        delete copy[certId];
        return copy;
      });
      setFeedbackInput(prev => {
        const copy = { ...prev };
        delete copy[certId];
        return copy;
      });

      fetchPendings();
    } catch (err) {
      alert('Failed to verify certificate: ' + err.message);
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
        <h1 className="text-2xl font-bold tracking-tight">Verify Student Certificates</h1>
        <p className="text-xs text-slate-400 mt-1">Audit student credentials, verify online accreditation links, view uploaded PDFs or images, and approve certified skill levels.</p>
      </div>

      {pendings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-300">All Audited</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">There are currently no pending student certificates awaiting verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendings.map((c) => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between gap-6 hover:border-slate-700 transition-colors">
              
              {/* Left cert info panel */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-[9px] font-bold uppercase tracking-wider">Credential</span>
                    <span className="text-[10px] text-slate-500">Uploaded: {new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mt-2">{c.title}</h3>
                  <span className="text-xs text-slate-400">By Student: <strong>{c.student?.fullName || 'Anonymous'}</strong> ({c.student?.email})</span>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accreditation Authority</span>
                  <p className="text-xs text-slate-300 font-semibold">{c.issuingAuthority}</p>
                </div>

                {c.skill && (
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Linked Portal Skill</span>
                    <span className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-xs font-bold text-indigo-400">{c.skill.name}</span>
                  </div>
                )}

                {/* Uploaded Certificate Document Preview link */}
                {(c.filePath || c.verificationLink) && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {c.filePath && (
                      <a
                        href={c.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-750 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download PDF / View Certificate File</span>
                      </a>
                    )}
                    {c.verificationLink && (
                      <a
                        href={c.verificationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-750 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14.5a2.5 2.5 0 003.5 0l4-4a2.5 2.5 0 00-3.5-3.5l-1.1 1.1" />
                        </svg>
                        <span>Verification URL</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Review / verification inputs */}
              <div className="w-full md:w-80 p-5 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verify & Grade</h4>
                  
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-semibold mb-1">Skill Star Rating (1.0 to 5.0)</label>
                    <select
                      value={ratingInput[c.id] || ''}
                      onChange={(e) => setRatingInput(prev => ({ ...prev, [c.id]: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-colors"
                    >
                      <option value="">Select Score</option>
                      <option value="5.0">5.0 - Expert Level</option>
                      <option value="4.5">4.5 - Advanced Skill</option>
                      <option value="4.0">4.0 - Proficient</option>
                      <option value="3.5">3.5 - Intermediate</option>
                      <option value="3.0">3.0 - Foundational</option>
                      <option value="2.0">2.0 - Substandard</option>
                      <option value="1.0">1.0 - Invalid / Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-semibold mb-1">Accreditation Remarks</label>
                    <textarea
                      placeholder="Add auditing comments..."
                      value={feedbackInput[c.id] || ''}
                      onChange={(e) => setFeedbackInput(prev => ({ ...prev, [c.id]: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none h-20 resize-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleGrade(c.id, 'APPROVED')}
                    disabled={submittingId === c.id}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-xs font-bold text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleGrade(c.id, 'REJECTED')}
                    disabled={submittingId === c.id}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-xs font-bold text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    Reject
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

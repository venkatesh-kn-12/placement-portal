import { useState, useEffect } from 'react';
import api from '../services/api';

export default function FacultyDashboard() {
  const [students, setStudents] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchFacultyData = async () => {
    try {
      const studentsRes = await api.get('/faculty/students');
      const pendingRes = await api.get('/faculty/evidence/pending');
      setStudents(studentsRes.data);
      setPendingCount(pendingRes.data.length);
    } catch (err) {
      console.error("Error loading faculty data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getReadinessColor = (val) => {
    if (val >= 4.0) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (val >= 3.0) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  // Average calculations
  const classAverage = students.length > 0
    ? (students.reduce((acc, curr) => acc + curr.overall_readiness, 0) / students.length).toFixed(2)
    : '0.00';

  // Cohort Gaps & Mock Analytics Calculations
  const cohortGaps = {};
  let totalMockScore = 0;
  let mockCount = 0;

  students.forEach(s => {
    if (s.skill_gaps) {
      const studentMissingSkills = new Set();
      s.skill_gaps.forEach(gap => {
        if (gap.missingSkills) {
          gap.missingSkills.forEach(skill => studentMissingSkills.add(skill));
        }
      });
      studentMissingSkills.forEach(skill => {
        cohortGaps[skill] = (cohortGaps[skill] || 0) + 1;
      });
    }

    if (s.mock_tests) {
      s.mock_tests.forEach(m => {
        totalMockScore += m.score;
        mockCount++;
      });
    }
  });

  const mockAverage = mockCount > 0 ? (totalMockScore / mockCount).toFixed(1) : '0.0';

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
        <h1 className="text-2xl font-bold tracking-tight">Student Tracking Portal</h1>
        <p className="text-xs text-slate-400 mt-1">Monitor overall student readiness, review pending projects and credentials, and review skill gaps.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Tracked Students</span>
            <span className="block text-3xl font-extrabold text-slate-100 mt-1">{students.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Class Readiness Average</span>
            <span className="block text-3xl font-extrabold text-indigo-400 mt-1">{classAverage} <span className="text-xs text-slate-500">/ 5.0</span></span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pending Student Reviews</span>
            <span className="block text-3xl font-extrabold text-amber-400 mt-1">{pendingCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Cohort Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cohort Skill Gaps Tracker */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Cohort Skill-Gap Analytics</h3>
          <p className="text-[11px] text-slate-500 mb-4">Percentage of the tracked student batch lacking required technical skills for upcoming placement drives.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(cohortGaps).length === 0 ? (
              <p className="text-xs text-slate-550 italic col-span-2 py-4">No student skill gaps identified across drives.</p>
            ) : null}
            {Object.entries(cohortGaps).map(([skill, count]) => {
              const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
              return (
                <div key={skill} className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-350">{skill}</span>
                    <span className="text-red-400 font-extrabold">{percentage}% lacking</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-1.5 bg-red-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mock Exam Activity logs overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">Mock Campaign Tracker</h3>
            <p className="text-[11px] text-slate-500 mb-4">Aggregated student activity metrics across active company mock testing pipelines.</p>
          </div>
          
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex justify-between items-center mb-4">
            <div>
              <span className="text-[9px] text-slate-550 uppercase font-black">Cohort Average Mock Score</span>
              <span className="block text-2xl font-black text-indigo-400 mt-1">{mockAverage}%</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-550 uppercase font-black">Total Mocks Attempted</span>
              <span className="block text-2xl font-black text-slate-350 mt-1">{mockCount}</span>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-500 leading-normal">
            Real-time telemetry showing overall performance trajectories. Higher mock scores strongly correlate with successful recruiter interviews.
          </p>
        </div>
      </div>

      {/* Main Student Table Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Student Readiness Directory</h3>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 outline-none transition-colors"
            />
            <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="pb-3 pl-2">Student Name</th>
                <th className="pb-3 text-center">Soft Skills</th>
                <th className="pb-3 text-center">Aptitude</th>
                <th className="pb-3 text-center">Coding</th>
                <th className="pb-3 text-center">Projects</th>
                <th className="pb-3 text-center">Certifications</th>
                <th className="pb-3 text-center">Readiness Index</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 italic">No matching students located.</td>
                </tr>
              ) : null}
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="py-4 pl-2">
                    <span className="block font-bold text-slate-200">{student.name}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{student.email}</span>
                  </td>
                  <td className="py-4 text-center font-semibold text-slate-300">{student.scores.soft || '0.0'}/5</td>
                  <td className="py-4 text-center font-semibold text-slate-300">{student.scores.aptitude || '0.0'}/5</td>
                  <td className="py-4 text-center font-semibold text-slate-300">{student.scores.coding || '0.0'}/5</td>
                  <td className="py-4 text-center font-semibold text-slate-300">{student.scores.projects || '0.0'}/5</td>
                  <td className="py-4 text-center font-semibold text-slate-300">{student.scores.certificates || '0.0'}/5</td>
                  <td className="py-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getReadinessColor(student.overall_readiness)}`}>
                      {student.overall_readiness} / 5.0
                    </span>
                  </td>
                  <td className="py-4 pr-2 text-right">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Inspect Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Inspect Student Profile Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end animate-fadeIn">
          
          {/* Modal content body */}
          <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-slideLeft">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-200">{selectedStudent.name}</h2>
                  <span className="text-xs text-slate-400">{selectedStudent.email}</span>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Speedy overall indicator */}
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center space-x-6">
                <div className="w-16 h-16 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-indigo-400">{selectedStudent.overall_readiness}</span>
                  <span className="text-[7px] text-slate-500 uppercase font-black">Score</span>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Placement Target Match</span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Student readiness indicator aggregate tracking. Recommended eligibility filter threshold represents an index level of <strong>3.5</strong>.
                  </p>
                </div>
              </div>

              {/* Earned Badges */}
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2.5">Academic Syllabus Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.badges?.length === 0 ? (
                    <span className="text-xs italic text-slate-600">No academy badges unlocked yet.</span>
                  ) : null}
                  {selectedStudent.badges?.map((badge, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-[10px] font-bold flex items-center space-x-1.5"
                    >
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span>{badge}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume ATS score */}
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Resume ATS Metric</h4>
                <div className="flex items-center space-x-4">
                  <span className={`text-2xl font-black ${selectedStudent.resume_ats >= 80 ? 'text-green-400' : selectedStudent.resume_ats >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {selectedStudent.resume_ats ? `${selectedStudent.resume_ats}%` : 'Not Checked'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-normal">
                    Keyword scan verification score matching industry targets.
                  </span>
                </div>
              </div>

              {/* Company Match Gaps */}
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2.5">Target Skill Gaps</h4>
                <div className="space-y-2">
                  {selectedStudent.skill_gaps?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No current company skill gaps. Student is fully qualified for all drives.</p>
                  ) : null}
                  {selectedStudent.skill_gaps?.map((gap, i) => (
                    <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-850/60 text-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-slate-300">{gap.company}</span>
                        <span className="text-[9px] text-slate-500 tracking-wider font-semibold">{gap.role}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {gap.missingSkills?.map((skill, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[9px] font-bold">
                            Missing: {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Test Records */}
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2.5">Mock Test Logs</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedStudent.mock_tests?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No mock exams recorded.</p>
                  ) : null}
                  {selectedStudent.mock_tests?.map((mock, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-850/40 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-slate-300">{mock.company_name} Drive Mock</span>
                        <span className="block text-[9px] text-slate-500 mt-0.5">
                          {new Date(mock.taken_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <span className="font-bold text-indigo-400">{mock.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold rounded-xl transition-all"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

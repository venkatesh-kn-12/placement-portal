import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAlert } from './AlertContext';

export default function StudentDashboard() {
  const { showAlert } = useAlert();
  const alert = (msg) => showAlert(msg);
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('overview'); // overview | profile | skills | projects | certificates | resume

  const [scores, setScores] = useState({
    soft_skills: 0, aptitude: 0, coding: 0, projects: 0, certificates: 0, overall_readiness: 0
  });
  const [loading, setLoading] = useState(true);

  // Profile States
  const [profile, setProfile] = useState({
    phone: '', gender: '', dob: '', relocationCities: '', temporaryAddress: '',
    aadharNumber: '', passportNumber: '', panCardNumber: '',
    parentName: '', parentPhone: '', parentRelation: '',
    highestDegree: '', highestYop: '',
    sslcPercentage: '', sslcYop: '',
    pucPercentage: '', pucYop: '', pucYearGap: 'No',
    degreeCgpa: '', degreeYop: '', degreeName: '', degreeStream: '', degreeCollege: '', degreeUniversity: '', degreeYearGap: 'No',
    hasPg: false, pgDegree: '', pgStream: '', pgCollege: '', pgUniversity: '', pgYop: '', pgYearGap: 'No',
    pgSem1Cgpa: '', pgSem2Cgpa: '', pgSem3Cgpa: '', pgSem4Cgpa: '', pgSem5Cgpa: '', pgSem6Cgpa: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Skills States
  const [studentSkills, setStudentSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('BEGINNER');
  const [newSkillCertFile, setNewSkillCertFile] = useState(null);
  const [hasSkillCert, setHasSkillCert] = useState(false);

  // Project States
  const [projects, setProjects] = useState([]);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projRepo, setProjRepo] = useState('');
  const [projHosted, setProjHosted] = useState('');
  const [projDocFile, setProjDocFile] = useState(null);
  const [projDiagFile, setProjDiagFile] = useState(null);

  // Certificates States
  const [certs, setCerts] = useState([]);
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certLink, setCertLink] = useState('');
  const [certFile, setCertFile] = useState(null);
  const [certSkillId, setCertSkillId] = useState('');

  // Resume States
  const [resumeText, setResumeText] = useState('');
  const [targetCompanyId, setTargetCompanyId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [uploadedResumeFile, setUploadedResumeFile] = useState(null);

  // Onboarding Assessment (Original) States
  const [activeTest, setActiveTest] = useState(null); // 'soft_skills' | 'aptitude' | 'coding' | 'skills_mock' | null
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [testResult, setTestResult] = useState(null);

  // Learning and Badges
  const [progress, setProgress] = useState([]);
  const [courses, setCourses] = useState([]);

  const fetchData = async () => {
    try {
      const scoresRes = await api.get(`/student/scores`);
      const progressRes = await api.get(`/courses/progress`);
      const coursesRes = await api.get(`/courses`);
      const companiesRes = await api.get(`/companies`);
      
      setScores(scoresRes.data);
      setProgress(progressRes.data);
      setCourses(coursesRes.data);
      setCompanies(companiesRes.data);

      // Fetch Profile
      const profileRes = await api.get('/student/profile');
      if (profileRes.data) {
        setProfile(profileRes.data);
      }

      // Fetch Skills
      const skillsRes = await api.get('/student/skills');
      setStudentSkills(skillsRes.data);

      // Fetch Projects
      const projectsRes = await api.get('/student/projects');
      setProjects(projectsRes.data);

      // Fetch Certificates
      const certsRes = await api.get('/student/certificates');
      setCerts(certsRes.data);

      // Fetch Resume
      const resumeRes = await api.get(`/student/resume`);
      setResumeAnalysis(resumeRes.data);
      if (resumeRes.data) {
        setResumeText(resumeRes.data.resumeText || '');
      }
    } catch (err) {
      console.error("Error loading student data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Profile Text Info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/student/profile', profile);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  // Upload Profile Photo
  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!profilePhoto) return;
    const formData = new FormData();
    formData.append('file', profilePhoto);
    try {
      await api.post('/student/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profile photo uploaded!');
      setProfilePhoto(null);
      fetchData();
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    }
  };

  // Add Skill
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const formData = new FormData();
    formData.append('skillName', newSkillName.trim());
    formData.append('level', newSkillLevel);
    if (hasSkillCert && newSkillCertFile) {
      formData.append('certificate', newSkillCertFile);
    }

    try {
      await api.post('/student/skills', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Skill added!');
      setNewSkillName('');
      setNewSkillLevel('BEGINNER');
      setHasSkillCert(false);
      setNewSkillCertFile(null);
      fetchData();
    } catch (err) {
      alert('Failed to add skill: ' + err.message);
    }
  };

  // Remove Skill
  const handleRemoveSkill = async (skillId) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;
    try {
      await api.delete(`/student/skills/${skillId}`);
      fetchData();
    } catch (err) {
      alert('Failed to remove skill: ' + err.message);
    }
  };

  // Submit Project
  const handleUploadProject = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', projTitle);
    formData.append('description', projDesc);
    formData.append('gitLink', projRepo);
    formData.append('hostedLink', projHosted);
    if (projDocFile) formData.append('document', projDocFile);
    if (projDiagFile) formData.append('diagram', projDiagFile);

    try {
      await api.post('/student/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Project submitted for faculty review!');
      setProjTitle('');
      setProjDesc('');
      setProjRepo('');
      setProjHosted('');
      setProjDocFile(null);
      setProjDiagFile(null);
      fetchData();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  // Upload Certificate
  const handleUploadCert = async (e) => {
    e.preventDefault();
    if (!certFile) {
      alert('Please select a certificate file (PDF or Image).');
      return;
    }
    const formData = new FormData();
    formData.append('title', certTitle);
    formData.append('issuingAuthority', certIssuer);
    formData.append('verificationLink', certLink);
    formData.append('file', certFile);
    if (certSkillId) {
      formData.append('skillId', certSkillId);
    }

    try {
      await api.post('/student/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Certificate uploaded for faculty verification!');
      setCertTitle('');
      setCertIssuer('');
      setCertLink('');
      setCertFile(null);
      setCertSkillId('');
      fetchData();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  // Upload Resume File
  const handleUploadResumeFile = async (e) => {
    e.preventDefault();
    if (!uploadedResumeFile) return;
    setAnalyzingResume(true);
    const formData = new FormData();
    formData.append('file', uploadedResumeFile);

    try {
      const res = await api.post('/student/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeAnalysis(res.data);
      setResumeText(res.data.resumeText);
      alert('Resume parsed and analyzed successfully!');
      setUploadedResumeFile(null);
      fetchData();
    } catch (err) {
      alert('Resume upload failed: ' + err.message);
    } finally {
      setAnalyzingResume(false);
    }
  };

  // Analyze Plain Text Resume
  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    setAnalyzingResume(true);
    try {
      const res = await api.post('/student/resume/analyze', {
        resumeText,
        targetCompanyId: targetCompanyId ? parseInt(targetCompanyId, 10) : null
      });
      setResumeAnalysis(res.data);
      alert('Resume keyword analysis completed!');
      fetchData();
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setAnalyzingResume(false);
    }
  };

  // Tailor Resume
  const handleTailorResume = async () => {
    if (!targetCompanyId) {
      alert('Please select a target placement drive first.');
      return;
    }
    setAnalyzingResume(true);
    try {
      const res = await api.post('/student/resume/tailor', {
        targetCompanyId: parseInt(targetCompanyId, 10)
      });
      setResumeAnalysis(res.data);
      setResumeText(res.data.resumeText);
      alert('Resume tailored to company ATS requirements!');
      fetchData();
    } catch (err) {
      alert('Tailoring failed: ' + err.message);
    } finally {
      setAnalyzingResume(false);
    }
  };

  // Auto Generate Resume
  const handleGenerateResume = async () => {
    setAnalyzingResume(true);
    try {
      const res = await api.get('/student/resume/generate');
      setResumeText(res.data.resumeText);
      alert('Resume generated from profile data! Tailor it or download as PDF.');
      fetchData();
    } catch (err) {
      alert('Resume generation failed: Make sure you completed your profile data.' + err.message);
    } finally {
      setAnalyzingResume(false);
    }
  };

  // Download PDF Resume
  const handleDownloadPdf = () => {
    window.open('/api/student/resume/download', '_blank');
  };

  // Trigger Onboarding Tests
  const startOnboardingTest = async (type) => {
    try {
      const res = await api.get(`/student/tests/${type}`);
      setTestQuestions(res.data.questions);
      setTestAnswers(res.data.questions.map(q => ({ id: q.id, selected: -1 })));
      setCurrentQIdx(0);
      setTestResult(null);
      setActiveTest(type);
    } catch (err) {
      alert("Failed to load test questions.");
    }
  };

  // Trigger Dynamic Skills Mock Test
  const startSkillsMockTest = async () => {
    try {
      const res = await api.get('/student/skills/mocktest');
      setTestQuestions(res.data.questions);
      setTestAnswers(res.data.questions.map(q => ({ id: q.id, selected: -1 })));
      setCurrentQIdx(0);
      setTestResult(null);
      setActiveTest('skills_mock');
    } catch (err) {
      alert(err.response?.data?.error || "Failed to load mock test questions.");
    }
  };

  const handleOptionSelect = (qId, optionIdx) => {
    setTestAnswers(prev => prev.map(a => a.id === qId ? { ...a, selected: optionIdx } : a));
  };

  const handleSubmitTest = async () => {
    const unanswered = testAnswers.filter(a => a.selected === -1).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    try {
      let res;
      if (activeTest === 'skills_mock') {
        res = await api.post('/student/skills/mocktest/submit', { answers: testAnswers });
      } else {
        res = await api.post(`/student/tests/${activeTest}/submit`, { answers: testAnswers });
      }
      setTestResult(res.data);
    } catch (err) {
      alert("Failed to submit assessment.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  // Active MCQ Test window (Onboarding or Skills Mock Test)
  if (activeTest) {
    if (testResult) {
      return (
        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center mb-6 shadow-xl">
            <h2 className="text-2xl font-bold text-green-500 mb-2">Test Completed!</h2>
            <p className="text-slate-400 text-sm mb-6">Your ratings have been calculated and saved.</p>
            <div className="flex justify-center space-x-12 mb-6">
              <div>
                <span className="block text-3xl font-bold text-slate-200">{testResult.score} / {testResult.max_score}</span>
                <span className="text-xs text-slate-500 uppercase font-semibold">Correct Answers</span>
              </div>
              <div className="border-l border-slate-800"></div>
              <div>
                <span className="block text-3xl font-bold text-indigo-400">{testResult.rating} / 5</span>
                <span className="text-xs text-slate-500 uppercase font-semibold">Readiness Rating</span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTest(null);
                setTestResult(null);
                fetchData();
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-semibold text-xs rounded-lg shadow-lg"
            >
              Return to Dashboard
            </button>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Question Review</h3>
          <div className="space-y-4">
            {testResult.breakdown.map((b, i) => (
              <div key={i} className={`p-6 bg-slate-900 border rounded-xl ${b.isCorrect ? 'border-green-900/40 bg-green-500/5' : 'border-red-900/40 bg-red-500/5'}`}>
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-slate-200 text-sm">Question {i+1}: {b.questionText}</h4>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${b.isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {b.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className="mt-3 text-xs space-y-1">
                  <p><span className="text-slate-500 font-medium">Your selection:</span> <span className={b.isCorrect ? 'text-green-400' : 'text-red-400'}>{b.selectedOption}</span></p>
                  {!b.isCorrect && <p><span className="text-slate-500 font-medium">Correct answer:</span> <span className="text-green-400">{b.correctOption}</span></p>}
                </div>
                {b.explanation && (
                  <div className="mt-3 bg-slate-950 p-3 rounded text-xs text-slate-400">
                    <strong>Explanation:</strong> {b.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const currentQ = testQuestions[currentQIdx];
    const userSelection = testAnswers[currentQIdx]?.selected;

    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-300">
            {activeTest === 'skills_mock' ? 'Skills Mock Evaluation' : 'Onboarding Test'}
          </h2>
          <span className="text-xs text-slate-500 font-medium">Question {currentQIdx + 1} of {testQuestions.length}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-slate-250 font-medium mb-4 text-sm leading-normal">{currentQ?.question}</h3>
          <div className="space-y-2">
            {currentQ?.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleOptionSelect(currentQ.id, oIdx)}
                className={`w-full flex items-center space-x-3 p-3.5 text-xs text-left border rounded-lg transition-colors ${
                  userSelection === oIdx
                    ? 'bg-indigo-600/15 border-indigo-500 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${userSelection === oIdx ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700 bg-slate-950'}`}>
                  {userSelection === oIdx && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
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
            className="px-4 py-2 text-xs font-semibold bg-slate-850 hover:bg-slate-800 rounded-lg text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            Previous
          </button>
          
          {currentQIdx === testQuestions.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              className="px-5 py-2 text-xs font-semibold bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={() => setCurrentQIdx(prev => prev + 1)}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  // Badges Earned Calculations
  const badgesEarned = courses.map(course => {
    const prog = progress.find(p => p.course_id === course.id);
    return {
      title: course.badge_name,
      icon: course.badge_icon,
      unlocked: prog ? prog.badge_earned : false
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Tab Navigation header */}
      <div className="border-b border-slate-800 pb-2 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">ReadyBound Workspace</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage details, evaluate technical skills, align your resume, and upload evidence.</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'overview', label: 'Dashboard Overview' },
            { id: 'profile', label: 'My Profile' },
            { id: 'skills', label: 'Skills & Mock Tests' },
            { id: 'projects', label: 'My Projects' },
            { id: 'certificates', label: 'Certifications' },
            { id: 'resume', label: 'Resume Center' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Readiness, Core assessments */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core assessments */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-4">Placement Skill Assessments</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Soft Skills Evaluation</h4>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">Behavioral mock questions, interview communication patterns.</p>
                  </div>
                  <button
                    onClick={() => startOnboardingTest('soft_skills')}
                    className="mt-4 w-full py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 rounded-lg text-[10px] text-slate-300 font-bold"
                  >
                    {scores.soft_skills > 0 ? `Retake (${scores.soft_skills}/5)` : 'Start Evaluation'}
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Quantitative Aptitude</h4>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">Solve mathematical patterns, speed problems, and logical puzzles.</p>
                  </div>
                  <button
                    onClick={() => startOnboardingTest('aptitude')}
                    className="mt-4 w-full py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 rounded-lg text-[10px] text-slate-300 font-bold"
                  >
                    {scores.aptitude > 0 ? `Retake (${scores.aptitude}/5)` : 'Start Evaluation'}
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Core Coding Test</h4>
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">Verify foundational data structures, algorithms, and simple SQL logic.</p>
                  </div>
                  <button
                    onClick={() => startOnboardingTest('coding')}
                    className="mt-4 w-full py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-750 hover:bg-slate-850 rounded-lg text-[10px] text-slate-300 font-bold"
                  >
                    {scores.coding > 0 ? `Retake (${scores.coding}/5)` : 'Start Evaluation'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Profile Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 shadow-xl">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500 bg-slate-950 flex items-center justify-center shrink-0">
                {profile.profilePhotoPath ? (
                  <img src={profile.profilePhotoPath} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <h3 className="text-lg font-bold text-slate-200">{profile.user?.fullName}</h3>
                <p className="text-xs text-slate-450">Degree: {profile.degreeName || 'Not specified'} in {profile.degreeStream || 'Not specified'} ({profile.degreeCollege || 'Not specified'})</p>
                {profile.hasPg && <p className="text-xs text-indigo-400">Post Grad: {profile.pgDegree} in {profile.pgStream} (YOP: {profile.pgYop})</p>}
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-3.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-bold text-slate-350 transition-colors"
                >
                  View Full Profile & Upload Photo
                </button>
              </div>
            </div>

          </div>

          {/* Right column: radial score, badges */}
          <div className="space-y-6">
            {/* Readiness Index */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center shadow-xl">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-6">Placement Readiness</h3>
              
              <div className="relative w-36 h-36 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner mb-4">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-indigo-400">{scores.overall_readiness}</span>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">Ready Index</span>
                </div>
                <svg className="absolute top-0 left-0 w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="6" className="text-slate-855" fill="transparent" />
                  <circle
                    cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="6" className="text-indigo-500" fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 64}`}
                    strokeDashoffset={`${2 * Math.PI * 64 * (1 - scores.overall_readiness / 5.0)}`}
                  />
                </svg>
              </div>

              <div className="w-full space-y-3 text-left mt-2">
                {[
                  { label: 'Soft Skills', value: scores.soft_skills },
                  { label: 'Quantitative Aptitude', value: scores.aptitude },
                  { label: 'Core Coding', value: scores.coding },
                  { label: 'Projects Graded', value: scores.projects },
                  { label: 'Verified Certifications', value: scores.certificates }
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.value}/5</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${item.value * 20}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-4">Unlocked Badges</h3>
              <div className="space-y-2">
                {badgesEarned.map((b, i) => (
                  <div key={i} className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${b.unlocked ? 'bg-green-500/5 border-green-900/40 text-slate-200' : 'bg-slate-950 border-slate-850 text-slate-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${b.unlocked ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{b.title}</h4>
                      <span className="text-[10px] text-slate-550">{b.unlocked ? 'Credential Active' : 'Syllabus evaluation pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFILE DETAILS TAB */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Left Column: Picture and Photo Upload */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/20 bg-slate-950 flex items-center justify-center mx-auto mb-4">
                {profile.profilePhotoPath ? (
                  <img src={profile.profilePhotoPath} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-slate-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-200">{profile.user?.fullName}</h3>
              <p className="text-xs text-slate-500 mb-6">{profile.user?.email}</p>

              <form onSubmit={handleUploadPhoto} className="space-y-3 bg-slate-950 p-4 border border-slate-850 rounded-xl">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Upload Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePhoto(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border file:border-slate-800 file:bg-slate-900 file:text-[10px] file:font-semibold file:text-slate-300 file:cursor-pointer"
                />
                <button
                  type="submit"
                  disabled={!profilePhoto}
                  className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-650 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  Upload Photo
                </button>
              </form>
            </div>
          </div>

          {/* Right Columns: Profile display and edit form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">Personal & Academic Details</h3>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold rounded-lg text-slate-300"
                >
                  {isEditingProfile ? 'Cancel Edit' : 'Edit Profile Form'}
                </button>
              </div>

              {!isEditingProfile ? (
                // Profile Information Read-only View
                <div className="space-y-6 text-xs text-slate-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Phone Number</span> {profile.phone || '--'}</p>
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Gender</span> {profile.gender || '--'}</p>
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Date of Birth</span> {profile.dob || '--'}</p>
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Relocation Cities</span> {profile.relocationCities || '--'}</p>
                    <p className="md:col-span-2"><span className="text-slate-500 font-semibold block uppercase text-[10px]">Temporary Address</span> {profile.temporaryAddress || '--'}</p>
                  </div>

                  <hr className="border-slate-850" />

                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Document Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Aadhar Status</span> {profile.aadharNumber ? `Verified (${profile.aadharNumber})` : 'No'}</p>
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Passport Status</span> {profile.passportNumber ? `Verified (${profile.passportNumber})` : 'No'}</p>
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">PanCard Status</span> {profile.panCardNumber ? `Verified (${profile.panCardNumber})` : 'No'}</p>
                  </div>

                  <hr className="border-slate-850" />

                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Parents/Guardian Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Name</span> {profile.parentName || '--'}</p>
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Phone Number</span> {profile.parentPhone || '--'}</p>
                    <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Relation</span> {profile.parentRelation || '--'}</p>
                  </div>

                  <hr className="border-slate-850" />

                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Education Details</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Highest Degree</span> {profile.highestDegree || '--'}</p>
                      <p><span className="text-slate-500 font-semibold block uppercase text-[10px]">Highest Year of Passing</span> {profile.highestYop || '--'}</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <h5 className="font-bold text-slate-400">Secondary / 10th Standard</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <p><span className="text-slate-500 block text-[9px] uppercase">Percentage</span> {profile.sslcPercentage ? `${profile.sslcPercentage}%` : '--'}</p>
                        <p><span className="text-slate-500 block text-[9px] uppercase">Year of Passing</span> {profile.sslcYop || '--'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <h5 className="font-bold text-slate-400">Pre-University (PUC/12th)</h5>
                      <div className="grid grid-cols-3 gap-4">
                        <p><span className="text-slate-500 block text-[9px] uppercase">Percentage</span> {profile.pucPercentage ? `${profile.pucPercentage}%` : '--'}</p>
                        <p><span className="text-slate-500 block text-[9px] uppercase">Year of Passing</span> {profile.pucYop || '--'}</p>
                        <p><span className="text-slate-500 block text-[9px] uppercase">Year Gap</span> {profile.pucYearGap || '--'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                      <h5 className="font-bold text-slate-400">Degree Details</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <p><span className="text-slate-500 block text-[9px] uppercase">Degree Name</span> {profile.degreeName || '--'}</p>
                        <p><span className="text-slate-500 block text-[9px] uppercase">Stream</span> {profile.degreeStream || '--'}</p>
                        <p><span className="text-slate-500 block text-[9px] uppercase">CGPA</span> {profile.degreeCgpa || '--'}</p>
                        <p><span className="text-slate-500 block text-[9px] uppercase">Year of Passing</span> {profile.degreeYop || '--'}</p>
                        <p className="md:col-span-2"><span className="text-slate-500 block text-[9px] uppercase">College</span> {profile.degreeCollege || '--'}</p>
                        <p className="md:col-span-2"><span className="text-slate-500 block text-[9px] uppercase">University</span> {profile.degreeUniversity || '--'}</p>
                      </div>
                    </div>

                    {profile.hasPg && (
                      <div className="bg-slate-955 p-4 rounded-xl border border-slate-850 space-y-3">
                        <h5 className="font-bold text-indigo-400">Post Graduate (PG) Details</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <p><span className="text-slate-500 block text-[9px] uppercase">Degree Name</span> {profile.pgDegree || '--'}</p>
                          <p><span className="text-slate-500 block text-[9px] uppercase">Stream</span> {profile.pgStream || '--'}</p>
                          <p><span className="text-slate-500 block text-[9px] uppercase">Year of Passing</span> {profile.pgYop || '--'}</p>
                          <p><span className="text-slate-500 block text-[9px] uppercase">Year Gap</span> {profile.pgYearGap || '--'}</p>
                          <p className="md:col-span-2"><span className="text-slate-500 block text-[9px] uppercase">College</span> {profile.pgCollege || '--'}</p>
                          <p className="md:col-span-2"><span className="text-slate-500 block text-[9px] uppercase">University</span> {profile.pgUniversity || '--'}</p>
                        </div>
                        <div className="border-t border-slate-850 pt-2 mt-2">
                          <h6 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Semester CGPAs</h6>
                          <div className="grid grid-cols-6 gap-2 text-center">
                            {[1,2,3,4,5,6].map(sem => (
                              <div key={sem} className="bg-slate-950 p-2 border border-slate-900 rounded-lg">
                                <span className="block text-[8px] text-slate-500 uppercase">Sem {sem}</span>
                                <span className="font-bold text-indigo-400">{profile[`pgSem${sem}Cgpa`] || '--'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Edit Profile Form
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* General Profile fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="+919876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</label>
                      <select
                        value={profile.gender || ''}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-855 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={profile.dob || ''}
                        onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Relocation Cities</label>
                      <input
                        type="text"
                        value={profile.relocationCities || ''}
                        onChange={(e) => setProfile({ ...profile, relocationCities: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="Bangalore, Pune, Delhi"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temporary Address</label>
                      <textarea
                        value={profile.temporaryAddress || ''}
                        onChange={(e) => setProfile({ ...profile, temporaryAddress: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200 h-16 resize-none"
                        placeholder="Complete Temporary Address..."
                      />
                    </div>
                  </div>

                  {/* Documents info */}
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-6">Documents Numbers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Aadhar Number</label>
                      <input
                        type="text"
                        value={profile.aadharNumber || ''}
                        onChange={(e) => setProfile({ ...profile, aadharNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="Aadhar Number"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passport Number</label>
                      <input
                        type="text"
                        value={profile.passportNumber || ''}
                        onChange={(e) => setProfile({ ...profile, passportNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="Passport Number"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">PanCard Number</label>
                      <input
                        type="text"
                        value={profile.panCardNumber || ''}
                        onChange={(e) => setProfile({ ...profile, panCardNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="PanCard Number"
                      />
                    </div>
                  </div>

                  {/* Parents/Guardian details */}
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-6">Parents/Guardian details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Name</label>
                      <input
                        type="text"
                        value={profile.parentName || ''}
                        onChange={(e) => setProfile({ ...profile, parentName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="Parent Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profile.parentPhone || ''}
                        onChange={(e) => setProfile({ ...profile, parentPhone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="+919876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Relation</label>
                      <input
                        type="text"
                        value={profile.parentRelation || ''}
                        onChange={(e) => setProfile({ ...profile, parentRelation: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="Mother / Father"
                      />
                    </div>
                  </div>

                  {/* Education details */}
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-6">Education Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Highest Degree</label>
                      <input
                        type="text"
                        value={profile.highestDegree || ''}
                        onChange={(e) => setProfile({ ...profile, highestDegree: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="Degree / PG"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Highest Year of Passing</label>
                      <input
                        type="number"
                        value={profile.highestYop || ''}
                        onChange={(e) => setProfile({ ...profile, highestYop: parseInt(e.target.value, 10) || '' })}
                        className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        placeholder="2025"
                      />
                    </div>
                  </div>

                  {/* SSC section */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                    <h5 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Secondary / 10th Standard</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Percentage</label>
                        <input
                          type="number"
                          step="0.01"
                          value={profile.sslcPercentage || ''}
                          onChange={(e) => setProfile({ ...profile, sslcPercentage: parseFloat(e.target.value) || '' })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="87.04"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year of Passing</label>
                        <input
                          type="number"
                          value={profile.sslcYop || ''}
                          onChange={(e) => setProfile({ ...profile, sslcYop: parseInt(e.target.value, 10) || '' })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PUC section */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                    <h5 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Pre-University (PUC/12th)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Percentage</label>
                        <input
                          type="number"
                          step="0.01"
                          value={profile.pucPercentage || ''}
                          onChange={(e) => setProfile({ ...profile, pucPercentage: parseFloat(e.target.value) || '' })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="82.66"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year of Passing</label>
                        <input
                          type="number"
                          value={profile.pucYop || ''}
                          onChange={(e) => setProfile({ ...profile, pucYop: parseInt(e.target.value, 10) || '' })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="2022"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year Gap</label>
                        <select
                          value={profile.pucYearGap || 'No'}
                          onChange={(e) => setProfile({ ...profile, pucYearGap: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Degree section */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                    <h5 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Degree Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Degree Name</label>
                        <input
                          type="text"
                          value={profile.degreeName || ''}
                          onChange={(e) => setProfile({ ...profile, degreeName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="Bachelor Of Computer Application"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stream</label>
                        <input
                          type="text"
                          value={profile.degreeStream || ''}
                          onChange={(e) => setProfile({ ...profile, degreeStream: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">CGPA</label>
                        <input
                          type="number"
                          step="0.01"
                          value={profile.degreeCgpa || ''}
                          onChange={(e) => setProfile({ ...profile, degreeCgpa: parseFloat(e.target.value) || '' })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="8.88"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year of Passing</label>
                        <input
                          type="number"
                          value={profile.degreeYop || ''}
                          onChange={(e) => setProfile({ ...profile, degreeYop: parseInt(e.target.value, 10) || '' })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="2025"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">College</label>
                        <input
                          type="text"
                          value={profile.degreeCollege || ''}
                          onChange={(e) => setProfile({ ...profile, degreeCollege: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="College Name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">University</label>
                        <input
                          type="text"
                          value={profile.degreeUniversity || ''}
                          onChange={(e) => setProfile({ ...profile, degreeUniversity: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          placeholder="University Name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PG section toggle */}
                  <div className="flex items-center space-x-3 bg-slate-950 p-4 border border-slate-850 rounded-xl">
                    <input
                      type="checkbox"
                      id="hasPg"
                      checked={profile.hasPg}
                      onChange={(e) => setProfile({ ...profile, hasPg: e.target.checked })}
                      className="rounded border-slate-850 bg-slate-900 text-indigo-650"
                    />
                    <label htmlFor="hasPg" className="text-xs font-semibold text-slate-300">I have started Post Graduation (PG) / Masters details</label>
                  </div>

                  {profile.hasPg && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                      <h5 className="font-bold text-xs text-indigo-400 uppercase tracking-widest">Post Graduate (PG) Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">PG Degree Name</label>
                          <input
                            type="text"
                            value={profile.pgDegree || ''}
                            onChange={(e) => setProfile({ ...profile, pgDegree: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                            placeholder="MCA / MBA / MTech"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stream</label>
                          <input
                            type="text"
                            value={profile.pgStream || ''}
                            onChange={(e) => setProfile({ ...profile, pgStream: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                            placeholder="Computer Applications"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year of Passing</label>
                          <input
                            type="number"
                            value={profile.pgYop || ''}
                            onChange={(e) => setProfile({ ...profile, pgYop: parseInt(e.target.value, 10) || '' })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                            placeholder="2027"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">PG Year Gap</label>
                          <select
                            value={profile.pgYearGap || 'No'}
                            onChange={(e) => setProfile({ ...profile, pgYearGap: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">College</label>
                          <input
                            type="text"
                            value={profile.pgCollege || ''}
                            onChange={(e) => setProfile({ ...profile, pgCollege: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                            placeholder="PG College"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">University</label>
                          <input
                            type="text"
                            value={profile.pgUniversity || ''}
                            onChange={(e) => setProfile({ ...profile, pgUniversity: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                            placeholder="PG University"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-900 pt-4 mt-2">
                        <h6 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Semester-wise CGPA Details (MCA/PG)</h6>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                          {[1,2,3,4,5,6].map(sem => (
                            <div key={sem}>
                              <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Semester {sem}</label>
                              <input
                                type="number"
                                step="0.01"
                                value={profile[`pgSem${sem}Cgpa`] || ''}
                                onChange={(e) => setProfile({ ...profile, [`pgSem${sem}Cgpa`]: parseFloat(e.target.value) || '' })}
                                className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none text-slate-200 text-center font-semibold"
                                placeholder="--.--"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-550 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg"
                    >
                      Save Profile Updates
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SKILLS & TESTS TAB */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Add Skill form & Evaluation launcher */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-4">Add Technical Skill</h3>
              <form onSubmit={handleAddSkill} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Skill Name</label>
                  <select
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                  >
                    <option value="">Select Skill</option>
                    <option value="Java">Java</option>
                    <option value="SQL">SQL</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="React">React</option>
                    <option value="HTML/CSS">HTML/CSS</option>
                    <option value="Spring Boot">Spring Boot</option>
                    <option value="Node.js">Node.js</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Proficiency Level</label>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 outline-none text-slate-200"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 border-t border-slate-850 pt-3">
                  <input
                    type="checkbox"
                    id="hasSkillCert"
                    checked={hasSkillCert}
                    onChange={(e) => setHasSkillCert(e.target.checked)}
                    className="rounded border-slate-850 bg-slate-900 text-indigo-650"
                  />
                  <label htmlFor="hasSkillCert" className="text-[11px] font-semibold text-slate-400">Do you have a certificate for this?</label>
                </div>

                {hasSkillCert && (
                  <div className="space-y-1.5 animate-slideUp">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Upload Certificate File (PDF/Photo)</label>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setNewSkillCertFile(e.target.files[0])}
                      required={hasSkillCert}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border file:border-slate-800 file:bg-slate-900 file:text-[10px] file:font-semibold file:text-slate-350"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md"
                >
                  Register Technical Skill
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Ready to evaluate?</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Take a customized **20-Question Skills Mock Test** generated dynamically based on your registered technical skills.
              </p>
              <button
                onClick={startSkillsMockTest}
                disabled={studentSkills.length === 0}
                className="w-full py-2.5 bg-green-600 hover:bg-green-550 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Launch Skills Mock Test
              </button>
            </div>
          </div>

          {/* Skill List display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-4">My Technical Skills</h3>
              
              {studentSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No skills registered yet. Choose your languages and databases on the left!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentSkills.map((ss) => (
                    <div key={ss.id} className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{ss.skill?.name}</h4>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Proficiency: {ss.level}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveSkill(ss.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3">
                        <div>
                          <span className="block text-[8px] uppercase text-slate-500">Evaluation Rating</span>
                          <span className="text-xs font-bold text-indigo-400">
                            {ss.rating ? `${ss.rating} / 5` : 'Not evaluated yet'}
                          </span>
                        </div>
                        
                        {ss.certificateFilePath ? (
                          <div className="text-right">
                            <span className="block text-[8px] uppercase text-slate-500">Certificate Status</span>
                            <a
                              href={ss.certificateFilePath}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold hover:underline ${
                                ss.certificateStatus === 'APPROVED'
                                  ? 'bg-green-500/10 text-green-400'
                                  : ss.certificateStatus === 'REJECTED'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {ss.certificateStatus || 'PENDING'}
                            </a>
                            {ss.certificateFeedback && (
                              <p className="text-[8px] text-slate-500 italic mt-1 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={ss.certificateFeedback}>
                                {ss.certificateFeedback}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-600 italic">No cert uploaded</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. MY PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Upload Project Form */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-4">Upload Project Details</h3>
              <form onSubmit={handleUploadProject} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 text-slate-200 outline-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Short Description & tech stack used..."
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 text-slate-200 outline-none h-20 resize-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Git Repository Link</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projRepo}
                    onChange={(e) => setProjRepo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 text-slate-200 outline-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Hosted / Live Demo Link</label>
                  <input
                    type="url"
                    placeholder="https://myproject.com/..."
                    value={projHosted}
                    onChange={(e) => setProjHosted(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 text-slate-200 outline-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Project Documentation (PDF/Docx)</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setProjDocFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border file:border-slate-800 file:bg-slate-900 file:text-[10px] file:font-semibold file:text-slate-350"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Screenshots / Architecture Diagrams</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProjDiagFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border file:border-slate-800 file:bg-slate-900 file:text-[10px] file:font-semibold file:text-slate-350"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md"
                >
                  Submit Project
                </button>
              </form>
            </div>
          </div>

          {/* Projects List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350 mb-4">My Projects & Assets</h3>
              
              {projects.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No projects uploaded yet.</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((p) => (
                    <div key={p.id} className="p-5 bg-slate-950 rounded-xl border border-slate-850 hover:border-slate-750 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{p.title}</h4>
                          <p className="text-xs text-slate-450 mt-1 leading-relaxed">{p.description}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${p.rating !== null ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {p.rating !== null ? `Rating: ${p.rating}/5` : 'Pending Review'}
                        </span>
                      </div>

                      {/* Clickable Github/Hosted Links */}
                      {(p.gitLink || p.hostedLink) && (
                        <div className="mt-3 flex flex-wrap gap-4 text-xs">
                          {p.gitLink && (
                            <a href={p.gitLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-1 font-semibold">
                              <span>Git Repository Link</span>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                          {p.hostedLink && (
                            <a href={p.hostedLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center space-x-1 font-semibold">
                              <span>Hosted Link / Demo</span>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Attached Documents and Screenshots */}
                      {(p.documentPath || p.diagramPath) && (
                        <div className="mt-4 bg-slate-900/40 p-3 rounded-lg border border-slate-900 flex flex-wrap gap-4 text-[11px] text-slate-400">
                          {p.documentPath && (
                            <a href={p.documentPath} target="_blank" rel="noreferrer" className="hover:text-indigo-400 hover:underline flex items-center">
                              <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Download Project Document</span>
                            </a>
                          )}
                          {p.diagramPath && (
                            <a href={p.diagramPath} target="_blank" rel="noreferrer" className="hover:text-indigo-400 hover:underline flex items-center">
                              <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>View Diagram / Screenshot</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Review feedback */}
                      {p.feedback && (
                        <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 text-amber-500 rounded-lg text-xs leading-relaxed">
                          <strong>Faculty Feedback:</strong> {p.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CERTIFICATIONS TAB */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Upload Certification form */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-4">Register Certification</h3>
              <form onSubmit={handleUploadCert} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Credential Name"
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 text-slate-200 outline-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Issuing Authority (e.g. AWS, Oracle)"
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 text-slate-200 outline-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="Verification Link (URL)"
                    value={certLink}
                    onChange={(e) => setCertLink(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 text-slate-200 outline-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Link to Technical Skill (Optional)</label>
                  <select
                    value={certSkillId}
                    onChange={(e) => setCertSkillId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 text-slate-200 outline-none"
                  >
                    <option value="">Do Not Link</option>
                    {studentSkills.map(ss => (
                      <option key={ss.id} value={ss.skill?.id}>{ss.skill?.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Certificate File (PDF or Image)</label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => setCertFile(e.target.files[0])}
                    required
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border file:border-slate-800 file:bg-slate-900 file:text-[10px] file:font-semibold file:text-slate-350"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md"
                >
                  Upload Certificate
                </button>
              </form>
            </div>
          </div>

          {/* Certifications list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-355 mb-4">My Credentials</h3>
              
              {certs.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No credentials uploaded yet. Upload a PDF/image on the left!</p>
              ) : (
                <div className="space-y-4">
                  {certs.map((c) => (
                    <div key={c.id} className="p-5 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-between hover:border-slate-755 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{c.title}</h4>
                          <p className="text-xs text-slate-450 mt-1">Issuer: {c.issuingAuthority}</p>
                          {c.verificationLink && (
                            <a href={c.verificationLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline mt-1.5 text-xs inline-block">
                              Verification URL
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'APPROVED'
                              ? 'bg-green-500/10 text-green-400'
                              : c.status === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {c.status || 'PENDING'}
                          </span>
                          {c.rating && <p className="text-[10px] text-indigo-400 font-bold mt-1">Faculty Score: {c.rating}/5</p>}
                        </div>
                      </div>

                      {c.filePath && (
                        <div className="mt-4 border-t border-slate-900 pt-3 text-xs flex justify-between items-center">
                          <span className="text-slate-500">Document Source:</span>
                          <a
                            href={c.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:underline font-semibold flex items-center space-x-1"
                          >
                            <span>Download PDF / View Image</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      )}

                      {c.feedback && (
                        <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 text-amber-500 rounded-lg text-xs leading-relaxed">
                          <strong>Feedback:</strong> {c.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. RESUME CENTER TAB */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Controls column */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Resume Management</h3>
              
              {/* Parse resume file upload */}
              <form onSubmit={handleUploadResumeFile} className="space-y-3 bg-slate-950 p-4 border border-slate-850 rounded-xl">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left">Upload Resume (PDF/Docx)</label>
                <input
                  type="file"
                  accept="application/pdf,.docx,.txt"
                  onChange={(e) => setUploadedResumeFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border file:border-slate-850 file:bg-slate-900 file:text-[10px]"
                />
                <button
                  type="submit"
                  disabled={!uploadedResumeFile || analyzingResume}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {analyzingResume ? 'Parsing...' : 'Upload & Parse Resume'}
                </button>
              </form>

              {/* Generate and Download buttons */}
              <div className="space-y-2 border-t border-slate-850 pt-4">
                <button
                  onClick={handleGenerateResume}
                  className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-indigo-400 hover:text-indigo-350 rounded-lg transition-colors"
                >
                  Build Resume from Profile
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Current Resume PDF</span>
                </button>
              </div>
            </div>

            {/* ATS Optimizer and Company Tailoring Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">ATS Tailoring Drive</h3>
              <div>
                <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Target Placement Drive</label>
                <select
                  value={targetCompanyId}
                  onChange={(e) => setTargetCompanyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs rounded-lg px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="">Choose Drive Target...</option>
                  {companies.map(c => (
                    <option key={c.companyId} value={c.companyId}>{c.companyName} - {c.role}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleTailorResume}
                disabled={!targetCompanyId || analyzingResume}
                className="w-full py-2.5 bg-green-600 hover:bg-green-550 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tailor Resume for Selected Drive
              </button>
            </div>
          </div>

          {/* ATS report card and text display */}
          <div className="lg:col-span-2 space-y-6">
            {resumeAnalysis && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-6">
                <div className="relative w-20 h-20 rounded-full border-4 border-indigo-500/25 flex items-center justify-center shrink-0">
                  <span className="text-xl font-extrabold text-indigo-400">{resumeAnalysis.atsScore}%</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">ATS Keyword Alignment Report</h4>
                  <div className="space-y-1.5 text-xs text-slate-400 leading-normal">
                    {resumeAnalysis.critique?.map((c, i) => (
                      <p key={i} className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        <span>{c}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-350">Resume Raw Plain Text</h3>
              <form onSubmit={handleAnalyzeResume} className="space-y-4">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs rounded-xl px-4 py-3 text-slate-200 outline-none h-96 font-mono resize-none leading-relaxed"
                  placeholder="Paste or generate your resume plain text details here to view compatibility reports..."
                  required
                />
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500">Character Count: {resumeText.length}</span>
                  <button
                    type="submit"
                    disabled={analyzingResume}
                    className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 transition-colors text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md"
                  >
                    {analyzingResume ? 'Analyzing...' : 'Re-verify ATS Scores'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
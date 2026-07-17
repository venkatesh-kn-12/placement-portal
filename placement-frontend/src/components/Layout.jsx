import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAlert } from './AlertContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();
  const [dbUser, setDbUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your **Placement AI Coach**.\n\nI can clarify database concepts, check skill compliance, or recommend resume improvements based on target companies. What would you like to review?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [targetCompanyId, setTargetCompanyId] = useState('');
  const [typing, setTyping] = useState(false);
  const msgEndRef = useRef(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setDbUser(res.data);
      } catch (err) {
        console.error("Error fetching db user info:", err);
        navigate('/login');
      }
    };
    fetchMe();
  }, []);

  const [scores, setScores] = useState(null);

  useEffect(() => {
    if (dbUser?.role === 'STUDENT') {
      api.get('/companies').then(res => setCompanies(res.data)).catch(console.error);
      api.get('/student/scores').then(res => setScores(res.data)).catch(console.error);
    }
  }, [dbUser]);

  const onboarded = !scores || (scores.soft_skills > 0 && scores.aptitude > 0 && scores.coding > 0);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typing]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setTyping(true);

    try {
      const res = await api.post('/chatbot', {
        message: userMsg,
        companyId: targetCompanyId ? parseInt(targetCompanyId, 10) : null
      });
      setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I failed to connect to the coaching server.' }]);
    } finally {
      setTyping(false);
    }
  };

  const getNavLinks = () => {
    if (!dbUser) return [];
    
    if (dbUser.role === 'ADMIN') {
      return [
        { name: 'Control Panel', path: '/admin', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
      ];
    }
    
    if (dbUser.role === 'FACULTY') {
      return [
        { name: 'Student Tracking', path: '/faculty', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { name: 'Review Projects', path: '/faculty/projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm11 3v4M8 12h8' },
        { name: 'Review Certs', path: '/faculty/certs', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
        { name: 'Study Materials', path: '/faculty/materials', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }
      ];
    }

    return [
      { name: 'Dashboard', path: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zm10 0a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
      { name: 'Learning Academy', path: '/learning', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', locked: !onboarded },
      { name: 'Placement Prep', path: '/placement-prep', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', locked: !onboarded }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">ReadyBound</span>
          </div>

          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
              if (link.locked) {
                return (
                  <div
                    key={link.path}
                    onClick={() => showAlert('Lockdown: Please complete your 3 Onboarding Assessments (Soft Skills, Aptitude, Coding) on your Dashboard to unlock this page.')}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed hover:bg-slate-900/50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                      </svg>
                      <span className="opacity-40">{link.name}</span>
                    </div>
                    <svg className="w-4 h-4 text-amber-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active 
                      ? 'bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                  </svg>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              setAuthToken(null);
              navigate('/login');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm text-slate-400 font-medium">Workspace</h2>
            <span className="text-slate-600">/</span>
            <span className="text-sm text-slate-200 font-semibold uppercase tracking-wider">
              {dbUser?.role || 'STUDENT'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all duration-200 mr-2 flex items-center justify-center shadow-inner"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                // Sun Icon
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              ) : (
                // Moon Icon
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {dbUser && (
              <>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-200">{dbUser.fullName}</span>
                  <span className="text-xs text-indigo-400 font-semibold tracking-wider">{dbUser.role}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {dbUser.fullName ? dbUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Dynamic Nested Routes Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Outlet />
        </main>
      </div>

      {/* Floating Chatbot Assistant - Students Only */}
      {dbUser?.role === 'STUDENT' && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
          >
            {chatOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            )}
          </button>

          {/* Chatbot Window */}
          {chatOpen && (
            <div className="absolute bottom-20 right-0 w-96 h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
              
              {/* Header */}
              <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex items-center space-x-3">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-semibold text-slate-200">Placement AI Coach</span>
              </div>

              {/* Message Lists */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white self-end rounded-br-none'
                        : 'bg-slate-800 text-slate-200 self-start rounded-bl-none border border-slate-700/50'
                    }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\`(.*?)\`/g, '<code class="bg-black/30 px-1 py-0.5 rounded text-indigo-300 font-mono">$1</code>')
                    }}
                  />
                ))}
                {typing && (
                  <div className="bg-slate-800 text-slate-400 self-start rounded-xl rounded-bl-none p-3 text-xs border border-slate-700/50 italic animate-pulse">
                    Coach is thinking...
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>

              {/* Target Selector Context */}
              <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Role:</span>
                <select
                  value={targetCompanyId}
                  onChange={(e) => setTargetCompanyId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-0.5 text-xs outline-none"
                >
                  <option value="">None (General Prep)</option>
                  {companies.map(c => (
                    <option key={c.companyId} value={c.companyId}>{c.companyName} - {c.role}</option>
                  ))}
                </select>
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask Coach or type 'optimize resume'..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendChat}
                  className="px-3 bg-indigo-600 rounded-lg text-white font-medium text-xs hover:bg-indigo-500 transition-colors"
                >
                  Send
                </button>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}

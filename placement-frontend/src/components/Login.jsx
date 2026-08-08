import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState('sign_in');
  const [isAnimating, setIsAnimating] = useState(true);

  // Force Light Mode exactly for this page
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    // Stop initial animations after they complete so they don't re-trigger on state change
    const timer = setTimeout(() => setIsAnimating(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const syncRes = await api.post('/auth/sync', { 
            email: session.user.email, 
            fullName: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
          });
          const user = syncRes.data;
          
          if (user.role === 'ADMIN') {
            navigate('/admin');
          } else if (user.role === 'FACULTY') {
            navigate('/faculty');
          } else {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-white font-sans antialiased text-slate-900 overflow-hidden relative">
      <style>
        {`
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-60px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInLeftRotate {
            from { opacity: 0; transform: translateX(-150px) translateY(30px) rotate(-15deg); }
            to { opacity: 1; transform: translateX(0) translateY(0) rotate(-8deg); }
          }
          @keyframes splitBack {
            from { transform: translate(80px, -40px) scale(0.8); opacity: 0; }
            to { transform: translate(0, 0) scale(1); opacity: 0.9; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.4); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes dropIn {
            0% { opacity: 0; transform: translateY(-150px) scale(0.9); }
            60% { opacity: 1; transform: translateY(15px) scale(1); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes float {
            0% { transform: translateY(0px) rotate(-8deg); }
            50% { transform: translateY(-12px) rotate(-8deg); }
            100% { transform: translateY(0px) rotate(-8deg); }
          }
          @keyframes floatSimple {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
          @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(40px); }
            to { opacity: 1; transform: translateX(0); }
          }

          .animate-slide-left { animation: slideInLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-scale-in { animation: scaleIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          .animate-drop-float { animation: dropIn 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, floatSimple 4s ease-in-out 1.2s infinite; }
          .animate-slide-left-rotate-float { animation: slideInLeftRotate 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards, float 5s ease-in-out 1.4s infinite; }
          .animate-split-back { animation: splitBack 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-right { animation: fadeInRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          .animate-delay-100 { animation-delay: 150ms; }
          .animate-delay-200 { animation-delay: 300ms; }
          .animate-delay-300 { animation-delay: 450ms; }
          .animate-delay-400 { animation-delay: 600ms; }
        `}
      </style>

      {/* The Massive Curve Background (Left Side) */}
      <div className="hidden lg:block absolute top-[-25%] left-[-20%] w-[70vw] h-[150vh] bg-[#222226] rounded-r-[45%] shadow-2xl z-0 pointer-events-none"></div>

      {/* Left Pane - Branding Content */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col p-16 xl:p-24 justify-center pointer-events-none">
        
        <div className="relative max-w-lg mt-[-10%] ml-4 xl:ml-12">
          
          {/* Logo */}
          <div className={`inline-flex items-center space-x-3 mb-16 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl opacity-0 ${isAnimating ? 'animate-slide-left' : 'opacity-100'}`}>
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full shadow-sm bg-white p-1" />
            <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">PlacementTracker</span>
          </div>

          {/* Accent Shapes */}
          <div className={`absolute top-[18%] left-[42%] w-3 h-3 bg-white rounded-full opacity-0 ${isAnimating ? 'animate-scale-in animate-delay-300' : 'opacity-100'}`}></div>
          <div className={`absolute top-[32%] right-[5%] xl:right-[-5%] w-[130px] h-[130px] bg-[#fc5630] rounded-full opacity-0 shadow-lg ${isAnimating ? 'animate-drop-float animate-delay-200' : 'opacity-100'}`}></div>

          {/* Text Content */}
          <div className="relative z-10 mt-10">
            <h1 className={`text-[2.4rem] xl:text-[2.8rem] font-medium tracking-tight text-white mb-6 leading-[1.15] opacity-0 ${isAnimating ? 'animate-slide-left animate-delay-100' : 'opacity-100'}`}>
              Accelerate your<br/>career journey.
            </h1>
            <p className={`text-[15px] text-zinc-400 font-light mb-16 max-w-[280px] leading-[1.6] opacity-0 ${isAnimating ? 'animate-slide-left animate-delay-200' : 'opacity-100'}`}>
              Join thousands of students mastering interviews, tracking skills, and securing their dream roles.
            </p>
          </div>

          {/* Floating Image Collage */}
          <div className={`absolute top-[85%] right-[-5%] xl:right-[-15%] w-72 h-56 opacity-0 ${isAnimating ? 'animate-slide-left-rotate-float animate-delay-300' : 'opacity-100 rotate-[-8deg]'}`}>
            {/* Back image */}
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
              alt="Back image" 
              className={`absolute left-[-20%] top-[20%] w-40 h-40 object-cover rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 border-white ${isAnimating ? 'animate-split-back animate-delay-400 opacity-0' : 'opacity-90'}`} 
            />
            {/* Front Image */}
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
              alt="Students collaborating" 
              className="absolute left-0 top-0 w-full h-full object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-[5px] border-white" 
            />
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Container */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10 opacity-0 ${isAnimating ? 'animate-fade-right animate-delay-200' : 'opacity-100'}`}>
        
        {/* Top Right Toggle */}
        <div className="absolute top-8 right-8 hidden sm:flex items-center space-x-4">
          <span className="text-sm font-medium text-slate-400">
            {view === 'sign_in' ? 'Not a member?' : 'Already a member?'}
          </span>
          <button
            onClick={() => setView(view === 'sign_in' ? 'sign_up' : 'sign_in')}
            className="px-6 py-2.5 bg-[#fc5630] hover:bg-[#e04522] text-white text-[13px] font-bold rounded-full transition-colors shadow-md active:scale-95"
          >
            {view === 'sign_in' ? 'SIGN UP' : 'SIGN IN'}
          </button>
        </div>

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden flex flex-col items-center mb-10 w-full pt-8">
          <img src="/logo.png" alt="PlacementTracker Logo" className="w-14 h-14 mb-4 rounded-xl shadow-md border border-slate-100" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            PlacementTracker
          </h1>
          <button
            onClick={() => setView(view === 'sign_in' ? 'sign_up' : 'sign_in')}
            className="mt-6 text-sm font-semibold text-[#fc5630] hover:underline"
          >
            {view === 'sign_in' ? 'Create an account instead' : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Auth Form Container */}
        <div className="w-full max-w-sm xl:max-w-md xl:pl-16">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[1.75rem] font-medium text-slate-900 mb-2">
              {view === 'sign_in' ? 'Sign in to PlacementTracker' : 'Create an account'}
            </h2>
            <p className="text-[15px] text-slate-500">Enter your details below</p>
          </div>

          <Auth
            supabaseClient={supabase}
            view={view}
            showLinks={false}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#fc5630', // Solid Dribbble Orange
                    brandAccent: '#e04522',
                    inputText: '#0f172a',
                    inputBackground: '#ffffff',
                    inputBorder: '#e2e8f0', // Very subtle border like in dribbble
                    inputBorderFocus: '#fc5630',
                    inputBorderHover: '#cbd5e1',
                    messageText: '#64748b',
                    defaultButtonBackground: '#ffffff',
                    defaultButtonBackgroundHover: '#f8fafc',
                    defaultButtonBorder: '#e2e8f0',
                    defaultButtonText: '#0f172a',
                    dividerBackground: '#f1f5f9',
                  },
                  space: {
                    buttonPadding: '0.875rem 1rem',
                    inputPadding: '0.875rem 1rem',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                  fonts: {
                    bodyFontFamily: 'inherit',
                    buttonFontFamily: 'inherit',
                    inputFontFamily: 'inherit',
                    labelFontFamily: 'inherit',
                  }
                }
              },
              className: {
                button: 'shadow-sm font-semibold transition-all duration-200 active:scale-95',
                input: 'transition-all duration-200 shadow-sm focus:shadow-md outline-none focus:ring-0',
                label: 'text-[13px] font-medium text-slate-700 mb-2 hidden', // Hide labels if Dribbble hides them, but let's keep them small
              }
            }}
            theme="default" // Force light mode for the widget
            providers={['google', 'github']}
            redirectTo={`${window.location.origin}/dashboard`}
          />
        </div>
      </div>
    </div>
  );
}

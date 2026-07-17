import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAlert } from './AlertContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectDashboard, setRedirectDashboard] = useState(false);
  const location = useLocation();
  const { showAlert } = useAlert();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const user = res.data;
        setDbUser(user);

        if (user.role === 'STUDENT') {
          const scoresRes = await api.get('/student/scores');
          const sc = scoresRes.data;
          const onboarded = sc.soft_skills > 0 && sc.aptitude > 0 && sc.coding > 0;
          
          if (!onboarded && (location.pathname.startsWith('/learning') || location.pathname.startsWith('/placement-prep'))) {
            showAlert('Lockdown: Please complete your 3 Onboarding Assessments (Soft Skills, Aptitude, Coding) to unlock other portal features.');
            setRedirectDashboard(true);
          }
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (redirectDashboard) {
    return <Navigate to="/dashboard" replace />;
  }

  const token = localStorage.getItem('token');
  if (!token || !dbUser) {
    return <Navigate to="/register" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(dbUser.role)) {
    if (dbUser.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (dbUser.role === 'FACULTY') return <Navigate to="/faculty" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

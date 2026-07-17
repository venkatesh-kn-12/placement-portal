import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import LearningAcademy from './components/LearningAcademy';
import PlacementPrep from './components/PlacementPrep';
import FacultyDashboard from './components/FacultyDashboard';
import ReviewProjects from './components/ReviewProjects';
import ReviewCerts from './components/ReviewCerts';
import StudyMaterials from './components/StudyMaterials';
import AdminDashboard from './components/AdminDashboard';
import { AlertProvider } from './components/AlertContext';

function App() {
  return (
    <AlertProvider>
      <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated Workspace Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Student Area */}
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="learning" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <LearningAcademy />
            </ProtectedRoute>
          } />
          <Route path="placement-prep" element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <PlacementPrep />
            </ProtectedRoute>
          } />

          {/* Faculty Area */}
          <Route path="faculty" element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } />
          <Route path="faculty/projects" element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <ReviewProjects />
            </ProtectedRoute>
          } />
          <Route path="faculty/certs" element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <ReviewCerts />
            </ProtectedRoute>
          } />
          <Route path="faculty/materials" element={
            <ProtectedRoute allowedRoles={['FACULTY']}>
              <StudyMaterials />
            </ProtectedRoute>
          } />

          {/* Admin Area */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Fallback to default route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
import { Navigate } from 'react-router-dom';

export default function Register() {
  // Supabase Auth component handles both Login and Registration in one unified view.
  return <Navigate to="/login" replace />;
}

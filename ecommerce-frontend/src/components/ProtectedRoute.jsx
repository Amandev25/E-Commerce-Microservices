import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Wrap any page that requires login. If the user isn't logged in, we send them
// to /login and remember where they were trying to go (so we can return there).
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While we're still checking the session on first load, show nothing yet.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-fog">Loading…</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

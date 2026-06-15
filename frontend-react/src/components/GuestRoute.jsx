import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();

  const currentToken = token || localStorage.getItem('bbms_token');
  const storedUser = localStorage.getItem('bbms_user');
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

  const redirectMap = {
    donor: '/donor-dashboard',
    recipient: '/patient-dashboard',
    staff: '/hospital-dashboard',
    admin: '/admin-dashboard',
  };

  // BFCache guard: when the browser restores /login from the cache after
  // the user presses Back, React doesn't re-run. The `pageshow` event always
  // fires though, so we use it to redirect logged-in users back to their dashboard.
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        const bfToken = localStorage.getItem('bbms_token');
        const bfUserRaw = localStorage.getItem('bbms_user');
        if (bfToken && bfUserRaw) {
          try {
            const bfUser = JSON.parse(bfUserRaw);
            const dest = redirectMap[bfUser?.role] || '/';
            navigate(dest, { replace: true });
          } catch {
            navigate('/', { replace: true });
          }
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [navigate]);

  if (loading) return null;

  if (currentToken && currentUser) {
    return <Navigate to={redirectMap[currentUser.role] || '/'} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;

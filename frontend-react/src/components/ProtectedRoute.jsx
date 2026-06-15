import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();

  // Fallback check to localStorage to prevent batching race condition
  const currentToken = token || localStorage.getItem('bbms_token');
  const storedUser = localStorage.getItem('bbms_user');
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

  const isAuthenticated = !!(currentToken && currentUser);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Push a duplicate history entry so the first "Back" press pops this
    // dummy entry instead of leaving the protected page.
    history.pushState(null, '', window.location.href);

    const blockBack = () => {
      // Re-push so every subsequent "Back" press is also blocked
      history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', blockBack);

    // BFCache guard: if browser restores page from cache and user is logged out,
    // redirect to login.
    const handlePageShow = (e) => {
      if (e.persisted) {
        const bfToken = localStorage.getItem('bbms_token');
        if (!bfToken) {
          navigate('/login', { replace: true });
        }
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', blockBack);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [isAuthenticated, navigate]);

  if (loading) return null;

  if (!currentToken) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

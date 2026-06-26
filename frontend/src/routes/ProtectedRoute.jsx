import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C8A97E] border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#C8A97E] uppercase tracking-widest text-xs font-display">Klare Homes</p>
        </div>
      </div>
    );
  }

  if (!token) {
    // Redirect to login but save current location to return to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

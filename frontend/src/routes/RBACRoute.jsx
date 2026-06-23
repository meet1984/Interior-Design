import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RBACRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C8A97E] border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#C8A97E] uppercase tracking-widest text-xs font-display">SIGNATURE</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role;

  if (!allowedRoles.includes(userRole)) {
    // Redirect user to their respective allowed dashboard
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'manager') {
      return <Navigate to="/manager" replace />;
    } else if (userRole === 'client') {
      return <Navigate to="/client" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Add a 'roles' prop for role-based authorization
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth status
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // 1. Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if route requires specific roles and if user has one
  if (roles && !roles.includes(user.role)) {
    // Redirect to home page (or a dedicated "Access Denied" page)
    return <Navigate to="/" replace />;
  }

  // If authenticated and (if required) authorized, render the children
  return children;
};

export default ProtectedRoute;
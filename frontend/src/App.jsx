import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterOrg from './pages/RegisterOrg';
import Dashboard from './pages/Dashboard';
import ToolInventory from './pages/ToolInventory';
import Transactions from './pages/Transactions';
import ManageUsers from './pages/ManageUsers';
import Reports from './pages/Reports';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import OrgSettings from './pages/OrgSettings';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-org" element={<RegisterOrg />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Private Routes — all wrapped in MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* SuperAdmin only */}
        <Route path="/superadmin" element={
          <ProtectedRoute roles={['SuperAdmin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />

        {/* Tenant user routes  */}
        <Route path="/" element={
          <ProtectedRoute roles={['Admin', 'Manager', 'Employee']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/tools" element={
          <ProtectedRoute roles={['Admin', 'Manager', 'Employee']}>
            <ToolInventory />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute roles={['Admin', 'Manager', 'Employee']}>
            <Transactions />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute roles={['Admin']}>
            <ManageUsers />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute roles={['Admin', 'Manager']}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute roles={['Admin']}>
            <OrgSettings />
          </ProtectedRoute>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
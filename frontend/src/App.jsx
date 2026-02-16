import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ToolInventory from './pages/ToolInventory';
import Transactions from './pages/Transactions';
import ManageUsers from './pages/ManageUsers';
import Reports from './pages/Reports'; // Add this line
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import TestTailwind from './TestTailwind';

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/test" element={<TestTailwind />} />

      {/* Private Routes (all wrapped in MainLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/tools" element={<ToolInventory />} />
        <Route path="/transactions" element={<Transactions />} />

        {/* Role-based routes */}
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

      </Route>

      {/* TODO: Add a 404 Not Found page */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;
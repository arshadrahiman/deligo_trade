import React from 'react';
import { useApp } from './context/AppContext';
import LoginPage from './components/LoginPage';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const { isAdminLoggedIn } = useApp();

  // 1. Strict Authentication Gate:
  // Without login, no one can use or view any part of the webapp.
  if (!isAdminLoggedIn) {
    return <LoginPage />;
  }

  // 2. Single Unified Application Path:
  // A single unified interface for all agent roles (Sales Agent, Finance Agent, Admin Agent, Super Admin).
  // All navigation tabs, actions, and datasets are dynamically rendered based strictly on role permissions and access.
  return <AdminPortal />;
}

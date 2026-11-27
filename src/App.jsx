import React from 'react';
import { useApp } from './context/AppContext';
import LoginPage from './components/LoginPage';
import AdminPortal from './components/AdminPortal';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const { isAdminLoggedIn } = useApp();

  // 1. Strict Authentication Gate:
  // Without login, no one can use or view any part of the webapp.
  return (
    <>
      {!isAdminLoggedIn ? <LoginPage /> : <AdminPortal />}
      {/* Floating Corner Theme Switcher (System / Light / Dark - System by default) */}
      <ThemeToggle variant="corner" />
    </>
  );
}

import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './pages/LoginPage.jsx'
import RegistrationPage from './pages/RegisterPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminRegisterPage from './pages/AdminRegisterPage.jsx'
import AdminResetPasswordPage from './pages/AdminResetPage.jsx'
import AdminDashboard from './pages/AdminDashboardPage.jsx'

import { ToastProvider } from './components/toast.jsx'
import TermsAndConditions from './pages/TermnsAndConditions.jsx'
import AccountPage from './pages/PartnerAccountPage.jsx'
import ContactForm from './pages/ParnterSupportPage.jsx'
import TeamMembers from './pages/AdminTeammembers.jsx'
import PartnerTeamMembers from './pages/Partnerteammember.jsx'

function Root() {
  // ── Partner auth ────────────────────────────────────────────────────────────
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [partner, setPartner] = useState(() => {
    const p = localStorage.getItem("partner");
    return p ? JSON.parse(p) : null;
  });

  // ── Admin auth ──────────────────────────────────────────────────────────────
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken") || null);
  const [admin, setAdmin] = useState(() => {
    const a = localStorage.getItem("admin");
    return a ? JSON.parse(a) : null;
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("partner", JSON.stringify(data.partner));
    setToken(data.token);
    setPartner(data.partner);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("partner");
    setToken(null);
    setPartner(null);
  };

  const handleAdminLogin = (data) => {
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("admin", JSON.stringify(data.partner)); // backend returns same shape
    setAdminToken(data.token);
    setAdmin(data.partner);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    setAdminToken(null);
    setAdmin(null);
  };

  return (
    <Routes>
      {/* ── Partner routes ── */}
      <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/reset" element={<ResetPasswordPage />} />
      <Route path="/support" element={<ContactForm />} />
      <Route path='/account' element={ token
      ? <AccountPage token={token} onLogout={handleLogout} />
      : <Navigate to="/" replace />}/>
       <Route path='/partner-teammember' element={ token
      ? <PartnerTeamMembers token={token} onLogout={handleLogout} />
      : <Navigate to="/" replace />}/>
     <Route
  path="/dashboard"
  element={
    token
      ? <DashboardPage token={token} partnerName={partner?.username} partner={partner} onLogout={handleLogout} />
      : <Navigate to="/" replace />
  }
/>

      {/* ── Admin routes ── */}
      <Route path="/admin" element={<AdminLoginPage onLogin={handleAdminLogin} />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />
      <Route path="/admin/reset" element={<AdminResetPasswordPage />} />
      <Route
        path="/admin/dashboard"
        element={
          adminToken
            ? <AdminDashboard token={adminToken} adminName={admin?.username} onLogout={handleAdminLogout} />
            : <Navigate to="/admin" replace />
        }
      />
       <Route
        path="/admin/teammember"
        element={
          adminToken
            ? <TeamMembers token={adminToken} adminName={admin?.username} onLogout={handleAdminLogout} />
            : <Navigate to="/admin" replace />
        }
      />
      <Route path='/terms' element={<TermsAndConditions/>}/>
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider duration={4000} maxToasts={4}>
    <BrowserRouter basename="/app">
        <Root />
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
)
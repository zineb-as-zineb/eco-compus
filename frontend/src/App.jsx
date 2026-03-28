// Tasks #6 #8 #9 — Navigation principale par état + routing selon rôle
import { useState, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EtudiantDashboard from './pages/EtudiantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SignalementDetail from './pages/SignalementDetail';

export default function App() {
  const [page, setPage]                   = useState('login');
  const [user, setUser]                   = useState(null);
  const [selectedSig, setSelectedSig]     = useState(null);

  // Restore session on mount
  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const u = JSON.parse(userData);
        setUser(u);
        setPage(u.role === 'admin' ? 'admin' : 'dashboard');
      } catch {
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Task #9 — adapt navigation according to role
    setPage(userData.role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedSig(null);
    setPage('login');
  };

  const goDetail = (sig) => {
    setSelectedSig(sig);
    setPage('detail');
  };

  const goBack = () => {
    setSelectedSig(null);
    setPage(user?.role === 'admin' ? 'admin' : 'dashboard');
  };

  // Also handle 'nouveau' shortcut from Navbar
  const handleNavigate = (p) => {
    if (p === 'nouveau') {
      // Pass signal to dashboard via a flag; simplest: redirect to dashboard and let it handle
      setPage('nouveau');
    } else {
      setPage(p);
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onGoRegister={() => setPage('register')} />;

      case 'register':
        return <RegisterPage onGoLogin={() => setPage('login')} />;

      case 'dashboard':
      case 'nouveau':
        return (
          <EtudiantDashboard
            user={user}
            initialView={page === 'nouveau' ? 'form' : 'list'}
            onViewDetail={goDetail}
          />
        );

      case 'admin':
        return <AdminDashboard user={user} onViewDetail={goDetail} />;

      case 'detail':
        return <SignalementDetail id={selectedSig} user={user} onBack={goBack} />;

      default:
        return <LoginPage onLogin={handleLogin} onGoRegister={() => setPage('register')} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {user && (
        <Navbar
          user={user}
          page={page}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      <main>{renderPage()}</main>
    </div>
  );
}

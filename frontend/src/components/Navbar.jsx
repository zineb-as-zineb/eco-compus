// Tasks #7 #8 #9 — Navbar responsive + routes + état connexion
import { useState } from 'react';

const NAV_LINKS_ETUDIANT = [
  { id: 'dashboard', label: '🌿 Mes signalements' },
  { id: 'nouveau',   label: '➕ Nouveau' },
];

const NAV_LINKS_ADMIN = [
  { id: 'admin', label: '📋 Tous les signalements' },
];

export default function Navbar({ user, page, onNavigate, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = user?.role === 'admin' ? NAV_LINKS_ADMIN : NAV_LINKS_ETUDIANT;

  const handleNav = (id) => { onNavigate(id); setMenuOpen(false); };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <div style={styles.logo} onClick={() => handleNav(user?.role === 'admin' ? 'admin' : 'dashboard')}>
          <span style={styles.logoIcon}>🌱</span>
          <span style={styles.logoText}>Campus<strong>Éco</strong></span>
        </div>

        {/* Desktop links */}
        <div style={styles.linksDesktop} className="nav-links-desktop">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => handleNav(l.id)}
              style={{ ...styles.link, ...(page === l.id ? styles.linkActive : {}) }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* User info + logout — desktop */}
        <div style={styles.userDesktop} className="nav-user-desktop">
          <div style={styles.avatar}>{user?.nom?.[0]?.toUpperCase() ?? '?'}</div>
          <span style={styles.userName}>{user?.nom}</span>
          <span style={styles.roleBadge}>{user?.role === 'admin' ? '👑 Admin' : '🎓 Étudiant'}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Déconnexion</button>
        </div>

        {/* Hamburger */}
        <button style={styles.hamburger} className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <span style={{ ...styles.bar, opacity: menuOpen ? 0 : 1 }} />
          <span style={{ ...styles.bar, transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu} className="nav-mobile-menu">
          {links.map(l => (
            <button key={l.id} onClick={() => handleNav(l.id)}
              style={{ ...styles.mobileLink, ...(page === l.id ? styles.mobileLinkActive : {}) }}>
              {l.label}
            </button>
          ))}
          <div style={styles.mobileDivider} />
          <div style={styles.mobileUser}>
            <span>👤 {user?.nom} · <em>{user?.role}</em></span>
          </div>
          <button onClick={() => { onLogout(); setMenuOpen(false); }} style={styles.mobileLogout}>
            🚪 Déconnexion
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'linear-gradient(135deg, #1e4d2b 0%, #2d7a45 100%)',
    boxShadow: '0 2px 20px rgba(30,77,43,0.3)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
    height: 64, display: 'flex', alignItems: 'center', gap: 24,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    textDecoration: 'none', flex: '0 0 auto',
  },
  logoIcon: { fontSize: '1.5rem' },
  logoText: {
    fontFamily: 'Fraunces, serif', fontSize: '1.2rem',
    color: '#e8f5e9', letterSpacing: '-0.02em',
  },
  linksDesktop: {
    display: 'flex', gap: 4, flex: 1,
  },
  link: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.8)', fontFamily: 'Nunito, sans-serif',
    fontSize: '0.9rem', fontWeight: 600, padding: '8px 14px',
    borderRadius: 8, transition: 'all 0.2s',
  },
  linkActive: {
    background: 'rgba(255,255,255,0.18)', color: '#fff',
  },
  userDesktop: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginLeft: 'auto', flexShrink: 0,
  },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
  },
  userName: { color: '#e8f5e9', fontSize: '0.88rem', fontWeight: 600 },
  roleBadge: {
    background: 'rgba(255,255,255,0.15)', color: '#b8f0c8',
    padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700,
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
    fontSize: '0.82rem', fontWeight: 600, padding: '6px 14px', borderRadius: 8,
    transition: 'all 0.2s',
  },
  hamburger: {
    display: 'none', flexDirection: 'column', gap: 5,
    background: 'none', border: 'none', cursor: 'pointer', padding: 6,
    marginLeft: 'auto',
  },
  bar: {
    width: 24, height: 2.5, background: '#fff',
    borderRadius: 2, transition: 'all 0.3s', display: 'block',
  },
  mobileMenu: {
    background: '#1a3d24', padding: '12px 24px 20px',
    display: 'flex', flexDirection: 'column', gap: 4,
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  mobileLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.85)', fontFamily: 'Nunito, sans-serif',
    fontSize: '0.95rem', fontWeight: 600, padding: '10px 0',
    textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  mobileLinkActive: { color: '#7ee8a2' },
  mobileDivider: { height: 1, background: 'rgba(255,255,255,0.1)', margin: '6px 0' },
  mobileUser: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', padding: '4px 0' },
  mobileLogout: {
    background: 'rgba(255,100,100,0.2)', border: '1px solid rgba(255,100,100,0.3)',
    color: '#fca5a5', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
    fontSize: '0.9rem', fontWeight: 600, padding: '10px', borderRadius: 8,
    marginTop: 8, textAlign: 'left',
  },
};


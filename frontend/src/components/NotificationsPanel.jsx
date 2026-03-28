import { useState, useEffect } from 'react';
import { notificationsAPI } from '../api/api';

export default function NotificationsPanel({ onClose }) {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifs(); }, []);

  async function fetchNotifs() {
    try {
      const data = await notificationsAPI.getAll();
      setNotifs(data);
    } catch { /* silent */ }
    setLoading(false);
  }

  const marquerToutLu = async () => {
    await notificationsAPI.marquerToutLu();
    setNotifs(n => n.map(x => ({ ...x, lu: true })));
  };

  const marquerLu = async (id) => {
    await notificationsAPI.marquerLu(id);
    setNotifs(n => n.map(x => x.id === id ? { ...x, lu: true } : x));
  };

  return (
    <div style={{
      position: 'absolute', top: 68, right: 16, zIndex: 200,
      background: '#fff', borderRadius: 12, width: 340,
      boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      border: '1px solid #dde8d5', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', borderBottom: '1px solid #dde8d5',
        background: '#f4f1eb',
      }}>
        <h3 style={{ fontSize: '0.95rem', color: '#1e4d2b', margin: 0 }}>
          🔔 Notifications
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={marquerToutLu} style={{
            fontSize: '0.72rem', color: '#2d7a45', background: 'none',
            border: 'none', cursor: 'pointer', fontWeight: 700,
          }}>Tout lire</button>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1rem', color: '#6b7280',
          }}>✕</button>
        </div>
      </div>

      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#7a8a6a' }}>⏳ Chargement...</div>
        ) : notifs.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#7a8a6a' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
            Aucune notification
          </div>
        ) : notifs.map(n => (
          <div key={n.id} onClick={() => marquerLu(n.id)} style={{
            padding: '12px 16px', cursor: 'pointer',
            background: n.lu ? '#fff' : '#f0fdf4',
            borderBottom: '1px solid #f3f4f6',
            borderLeft: `3px solid ${n.lu ? 'transparent' : '#2d7a45'}`,
          }}>
            <div style={{ fontSize: '0.88rem', color: '#1a2510', fontWeight: n.lu ? 400 : 700 }}>
              {n.message}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7a8a6a', marginTop: 4 }}>
              {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short',
                hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
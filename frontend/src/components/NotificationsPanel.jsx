import { useState, useEffect } from 'react';
import { notificationsAPI } from '../api/api';

export default function NotificationsPanel({ onClose }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.getAll()
      .then(data => setNotifs(data))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
   await notificationsAPI.markAllRead();
   setNotifs([]); 
  };

  return (
    <div style={{
      position: 'absolute', top: 44, right: 0, zIndex: 200,
      width: 340, background: '#fff', borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      border: '1px solid #e5e7eb', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid #f0f0f0',
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>🔔 Notifications</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {notifs.some(n => !n.lu) && (
            <button onClick={handleMarkAllRead} style={{
              background: 'none', border: 'none', color: '#2d7a45',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
            }}>
              Tout lire
            </button>
          )}
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.1rem', color: '#999', lineHeight: 1,
          }}>✕</button>
        </div>
      </div>

      {/* Liste */}
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
            Chargement...
          </div>
        ) : notifs.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>📭</div>
            <p style={{ color: '#aaa', marginTop: 8 }}>Aucune notification</p>
          </div>
        ) : (
          notifs.map(n => (
            <div key={n.id} style={{
              padding: '12px 16px',
              background: n.lu ? '#fff' : '#f0fdf4',
              borderBottom: '1px solid #f5f5f5',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              {/* Point rouge si non lu */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: n.lu ? 'transparent' : '#ef4444',
                marginTop: 5,
              }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#333', lineHeight: 1.4 }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '0.72rem', color: '#aaa', marginTop: 4, display: 'block' }}>
                  {new Date(n.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
// Tasks #42 #43 #44 #45 #46 #36 #37 #38 #39 #40 #41
// Détail signalement + suggestion + bouton retour
import { useState, useEffect } from 'react';
import { signalementsAPI } from '../api/api';
import StatusBadge from '../components/StatusBadge';

const CAT_LABELS = { energie: '⚡ Énergie', eau: '💧 Eau', eclairage: '💡 Éclairage', autre: '🌿 Autre' };
const STATUTS    = ['en_attente', 'en_cours', 'traite'];
const STATUT_LABELS = { en_attente: 'En attente', en_cours: 'En cours', traite: 'Traité' };

export default function SignalementDetail({ id, user, onBack }) {
  // id can be a number or a full object (passed from list)
  const [sig, setSig]               = useState(typeof id === 'object' ? id : null);
  const [loading, setLoading]       = useState(typeof id !== 'object');
  const [suggestion, setSuggestion] = useState(sig?.suggestion ?? '');
  const [loadingSug, setLoadingSug] = useState(false);
  const [updating, setUpdating]     = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError]           = useState('');

  const sigId = typeof id === 'object' ? id?.id : id;

  // Load suggestion on mount (Task #40)
  useEffect(() => {
    if (sig?.suggestion) {
      setSuggestion(sig.suggestion);
    } else if (sigId) {
      fetchSuggestion();
    }
  }, [sigId]);

  async function fetchSuggestion() {
    setLoadingSug(true);
    try {
      const res = await signalementsAPI.getSuggestion(sigId);
      setSuggestion(res.suggestion ?? res.message ?? '');
      if (sig) setSig(s => ({ ...s, suggestion: res.suggestion }));
    } catch { /* suggestion optional */ }
    setLoadingSug(false);
  }

  const handleStatut = async (newStatut) => {
    setUpdating(true);
    try {
      await signalementsAPI.updateStatut(sigId, newStatut);
      setSig(s => ({ ...s, statut: newStatut }));
      flash('✅ Statut mis à jour');
    } catch (err) {
      setError(err.message);
    }
    setUpdating(false);
  };

  function flash(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  }

  if (loading) return <div className="page-content"><div className="spinner" /></div>;
  if (!sig)    return (
    <div className="page-content">
      <button className="detail-back" onClick={onBack}>← Retour</button>
      <div className="alert alert-error">Signalement introuvable</div>
    </div>
  );

  const date = new Date(sig.createdAt || sig.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="page-content">
      {/* Bouton retour — Task #46 */}
      <button className="detail-back" onClick={onBack}>
        ← Retour à la liste
      </button>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error      && <div className="alert alert-error" onClick={() => setError('')}>⚠️ {error}</div>}

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main card */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span className="sig-card-cat" style={{ marginBottom: 8, display: 'inline-block' }}>
                  {CAT_LABELS[sig.categorie] ?? sig.categorie}
                </span>
                <h2 style={{ color: 'var(--green-dark)', fontSize: '1.5rem', marginTop: 6 }}>
                  {sig.titre}
                </h2>
              </div>
              <StatusBadge statut={sig.statut} />
            </div>

            {/* Meta — Task #28 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '14px 0',
              borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              marginBottom: 20 }}>
              <div style={metaStyle}>
                <span style={metaLabel}>📍 Localisation</span>
                <span style={metaValue}>{sig.localisation}</span>
              </div>
              <div style={metaStyle}>
                <span style={metaLabel}>📅 Date</span>
                <span style={metaValue}>{date}</span>
              </div>
              {sig.User && (
                <div style={metaStyle}>
                  <span style={metaLabel}>👤 Signalé par</span>
                  <span style={metaValue}>{sig.User.nom}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 style={{ color: 'var(--text-mid)', fontSize: '0.8rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Description
              </h4>
              <p style={{ color: 'var(--text-dark)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                {sig.description}
              </p>
            </div>

            {/* Photo — Task #45 */}
            {sig.photo && (
              <div style={{ marginTop: 20 }}>
                <h4 style={{ color: 'var(--text-mid)', fontSize: '0.8rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  📷 Photo
                </h4>
                <img
                  src={`http://localhost:5000/${sig.photo}`}
                  alt="Photo signalement"
                  style={{ maxHeight: 360, borderRadius: 10, objectFit: 'cover', width: '100%' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Suggestion éco — Tasks #36-#41 */}
          <div className="suggestion-box">
            <h4>
              <span>🤖</span> Suggestion éco-responsable
            </h4>
            {loadingSug ? (
              <div style={{ color: 'var(--text-light)', fontSize: '0.88rem' }}>⏳ Chargement de la suggestion...</div>
            ) : suggestion ? (
              <p style={{ color: 'var(--text-mid)', fontSize: '0.93rem', lineHeight: 1.75 }}>
                {suggestion}
              </p>
            ) : (
              <div>
                <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: 12 }}>
                  Aucune suggestion disponible.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={fetchSuggestion}>
                  💡 Générer une suggestion
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — statut + actions */}
        <div className="detail-sidebar" style={{ position: 'sticky', top: 80 }}>
          <div className="card">
            <h3 style={{ color: 'var(--green-dark)', fontSize: '1rem', marginBottom: 16 }}>
              🏷 Statut du signalement
            </h3>
            <div style={{ marginBottom: 16 }}>
              <StatusBadge statut={sig.statut} />
            </div>

            {/* Admin can update statut — Task #34 */}
            {user?.role === 'admin' && (
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem',
                  color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Changer le statut
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {STATUTS.map(st => (
                    <button
                      key={st}
                      disabled={sig.statut === st || updating}
                      onClick={() => handleStatut(st)}
                      className={`btn ${sig.statut === st ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ justifyContent: 'flex-start', opacity: sig.statut === st ? 1 : 0.85 }}
                    >
                      {sig.statut === st ? '● ' : '○ '}
                      {STATUT_LABELS[st]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ color: 'var(--green-dark)', fontSize: '1rem', marginBottom: 12 }}>
              ℹ️ Informations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'ID', value: `#${sig.id}` },
                { label: 'Catégorie', value: CAT_LABELS[sig.categorie] ?? sig.categorie },
                { label: 'Zone', value: sig.localisation },
                { label: 'Date', value: date },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{row.label}</span>
                  <span style={{ color: 'var(--text-dark)', fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const metaStyle = { display: 'flex', flexDirection: 'column', gap: 2 };
const metaLabel = { fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const metaValue = { fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' };

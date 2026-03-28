// Tasks #25 #26 #27 #28 #29 #30 #31 #32 #33 #34 #35 — Admin dashboard
import { useState, useEffect, useMemo } from 'react';
import { signalementsAPI } from '../api/api';
import StatusBadge from '../components/StatusBadge';

const CAT_LABELS = { energie: '⚡ Énergie', eau: '💧 Eau', eclairage: '💡 Éclairage', autre: '🌿 Autre' };
const STATUTS    = ['en_attente', 'en_cours', 'traite'];
const STATUT_LABELS = { en_attente: 'En attente', en_cours: 'En cours', traite: 'Traité' };

export default function AdminDashboard({ user, onViewDetail }) {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState(null); // id being updated
  const [error, setError]               = useState('');
  const [successMsg, setSuccessMsg]     = useState('');

  // Filters & sort — Tasks #29 #30
  const [filterStatut, setFilterStatut]   = useState('');
  const [filterCat, setFilterCat]         = useState('');
  const [sortBy, setSortBy]               = useState('date_desc');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const data = await signalementsAPI.getAll();
      setSignalements(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // Task #33 #34 #35 — update statut
  const handleStatut = async (id, newStatut) => {
    setUpdating(id);
    try {
      await signalementsAPI.updateStatut(id, newStatut);
      setSignalements(prev =>
        prev.map(s => s.id === id ? { ...s, statut: newStatut } : s)
      );
      flash('✅ Statut mis à jour');
    } catch (err) {
      setError(err.message);
    }
    setUpdating(null);
  };

  function flash(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  }

  // Computed list with filters + sort
  const displayed = useMemo(() => {
    let list = [...signalements];
    if (filterStatut) list = list.filter(s => s.statut === filterStatut);
    if (filterCat)    list = list.filter(s => s.categorie === filterCat);
    if (sortBy === 'date_desc') list.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
    if (sortBy === 'date_asc')  list.sort((a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at));
    if (sortBy === 'statut')    list.sort((a, b) => STATUTS.indexOf(a.statut) - STATUTS.indexOf(b.statut));
    return list;
  }, [signalements, filterStatut, filterCat, sortBy]);

  // Stats counters
  const counts = useMemo(() => ({
    total:      signalements.length,
    en_attente: signalements.filter(s => s.statut === 'en_attente').length,
    en_cours:   signalements.filter(s => s.statut === 'en_cours').length,
    traite:     signalements.filter(s => s.statut === 'traite').length,
  }), [signalements]);

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>📋 Gestion des signalements</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            Bienvenue, <strong>{user?.nom}</strong>
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAll}>🔄 Actualiser</button>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total', value: counts.total, color: 'var(--green-dark)', bg: 'var(--green-pale)' },
          { label: 'En attente', value: counts.en_attente, color: '#b45309', bg: '#fef3c7' },
          { label: 'En cours', value: counts.en_cours, color: '#1d4ed8', bg: '#dbeafe' },
          { label: 'Traités', value: counts.traite, color: '#15803d', bg: '#dcfce7' },
        ].map(k => (
          <div key={k.label} style={{
            background: k.bg, borderRadius: 12, padding: '16px 20px',
            border: `1px solid ${k.color}22`,
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: k.color, fontFamily: 'Fraunces, serif' }}>
              {k.value}
            </div>
            <div style={{ fontSize: '0.82rem', color: k.color, fontWeight: 700, marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error      && <div className="alert alert-error" onClick={() => setError('')}>⚠️ {error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Filters — Tasks #29 #30 */}
      <div className="filters-bar">
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </select>

        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Toutes catégories</option>
          {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date_desc">📅 Plus récents</option>
          <option value="date_asc">📅 Plus anciens</option>
          <option value="statut">🏷 Par statut</option>
        </select>

        <span style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 600 }}>
          {displayed.length} résultat(s)
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="spinner" />
      ) : displayed.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
          <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>Aucun signalement trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayed.map(s => (
            <div key={s.id} className="card" style={{ padding: '18px 20px' }}>
              {/* Task #28 — afficher type, zone, date, statut */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span className="sig-card-cat">{CAT_LABELS[s.categorie] ?? s.categorie}</span>
                    <StatusBadge statut={s.statut} size="sm" />
                  </div>
                  <div className="sig-card-title" style={{ fontSize: '1rem', marginBottom: 6 }}>
                    {s.titre}
                  </div>
                  <div className="sig-card-meta">
                    <span>📍 {s.localisation}</span>
                    <span>·</span>
                    <span>📅 {new Date(s.createdAt || s.created_at).toLocaleDateString('fr-FR')}</span>
                    {s.User && <><span>·</span><span>👤 {s.User.nom}</span></>}
                  </div>
                </div>

                {/* Actions — Task #34 #35 */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                  <select
                    value={s.statut}
                    disabled={updating === s.id}
                    onChange={e => handleStatut(s.id, e.target.value)}
                    style={{
                      padding: '6px 10px', border: '2px solid var(--border)',
                      borderRadius: 8, fontFamily: 'Nunito, sans-serif',
                      fontSize: '0.82rem', fontWeight: 700, background: 'var(--white)',
                      cursor: 'pointer', outline: 'none', color: 'var(--text-dark)',
                    }}
                  >
                    {STATUTS.map(st => <option key={st} value={st}>{STATUT_LABELS[st]}</option>)}
                  </select>

                  <button className="btn btn-secondary btn-sm"
                    onClick={() => onViewDetail(s)}>
                    👁 Voir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tasks #11 #13 #14 #15 #17 #18 #20 #22 #23
// Étudiant : formulaire signalement + upload photo + validation + liste
import { useState, useEffect, useRef } from 'react';
import { signalementsAPI } from '../api/api';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = ['energie', 'eau', 'eclairage', 'autre'];
const CAT_LABELS  = { energie: '⚡ Énergie', eau: '💧 Eau', eclairage: '💡 Éclairage', autre: '🌿 Autre' };

function validate(fields, photo) {
  const errors = {};
  if (!fields.titre.trim())       errors.titre       = 'Titre requis';
  if (!fields.description.trim()) errors.description = 'Description requise';
  if (!fields.categorie)          errors.categorie   = 'Catégorie requise';
  if (!fields.localisation.trim()) errors.localisation = 'Localisation requise';
  if (photo && photo.size > 5 * 1024 * 1024) errors.photo = 'Photo < 5 Mo';
  return errors;
}

const EMPTY = { titre: '', description: '', categorie: '', localisation: '' };

export default function EtudiantDashboard({ user, onViewDetail, initialView = 'list' }) {
  const [view, setView]       = useState(initialView); // 'list' | 'form'
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [fields, setFields]   = useState(EMPTY);
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [sending, setSending] = useState(false);
  const [successId, setSuccessId] = useState(null);
  const [suggestion, setSuggestion] = useState('');
  const fileRef = useRef();

  useEffect(() => { fetchSignalements(); }, []);

  async function fetchSignalements() {
    setLoading(true);
    try {
      const data = await signalementsAPI.getAll();
      // Filter by current user
      const mine = data.filter(s => s.user_id === user?.id);
      setSignalements(mine);
    } catch { /* silent */ }
    setLoading(false);
  }

  const setField = (k) => (e) => {
    setFields(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: '' }));
  };

  const handlePhoto = (file) => {
    if (!file) return;
    setPhoto(file);
    setErrors(er => ({ ...er, photo: '' }));
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handlePhoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields, photo);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSending(true);
    setApiError('');
    try {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      const res = await signalementsAPI.create(fd);
      setSuccessId(res.id ?? res.signalement?.id);

      // Fetch suggestion
      try {
        const sug = await signalementsAPI.getSuggestion(res.id ?? res.signalement?.id);
        setSuggestion(sug.suggestion ?? sug.message ?? '');
      } catch { /* optional */ }

      setFields(EMPTY);
      setPhoto(null);
      setPreview(null);
      await fetchSignalements();
      setView('success');
    } catch (err) {
      setApiError(err.message || 'Erreur lors de la soumission');
    } finally {
      setSending(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (view === 'success') {
    return (
      <div className="page-content">
        <div className="card" style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>✅</div>
          <h2 style={{ color: 'var(--green-dark)', marginBottom: 8 }}>Signalement envoyé !</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: 24 }}>
            Votre signalement a été transmis aux équipes du campus.
          </p>

          {suggestion && (
            <div className="suggestion-box" style={{ textAlign: 'left' }}>
              <h4><span>🤖</span> Suggestion éco-responsable</h4>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.93rem', lineHeight: 1.7 }}>{suggestion}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
            <button className="btn btn-secondary" onClick={() => { setView('form'); setSuccessId(null); setSuggestion(''); }}>
              ➕ Nouveau signalement
            </button>
            <button className="btn btn-primary" onClick={() => setView('list')}>
              📋 Mes signalements
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div>
            <button className="detail-back" onClick={() => setView('list')}>← Retour</button>
            <h2>Nouveau signalement</h2>
          </div>
        </div>

        <div className="card" style={{ maxWidth: 680 }}>
          {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Titre *</label>
              <input type="text" placeholder="Ex: Fuite d'eau au bloc B" maxLength={120}
                value={fields.titre} onChange={setField('titre')}
                className={errors.titre ? 'error' : ''} />
              {errors.titre && <div className="field-error">⚠ {errors.titre}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Catégorie *</label>
                <select value={fields.categorie} onChange={setField('categorie')}
                  className={errors.categorie ? 'error' : ''}>
                  <option value="">-- Choisir --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
                {errors.categorie && <div className="field-error">⚠ {errors.categorie}</div>}
              </div>

              <div className="form-group">
                <label>Localisation *</label>
                <input type="text" placeholder="Bâtiment, salle..."
                  value={fields.localisation} onChange={setField('localisation')}
                  className={errors.localisation ? 'error' : ''} />
                {errors.localisation && <div className="field-error">⚠ {errors.localisation}</div>}
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea placeholder="Décrivez le problème en détail..." rows={4}
                value={fields.description} onChange={setField('description')}
                className={errors.description ? 'error' : ''} />
              {errors.description && <div className="field-error">⚠ {errors.description}</div>}
            </div>

            {/* Photo upload — Task #22 */}
            <div className="form-group">
              <label>Photo (optionnel)</label>
              <div
                className={`upload-zone ${preview ? 'active' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileRef.current.click()}
              >
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={(e) => handlePhoto(e.target.files[0])} />
                {preview ? (
                  <div>
                    <img src={preview} alt="preview"
                      style={{ maxHeight: 180, borderRadius: 8, marginBottom: 8 }} />
                    <p style={{ color: 'var(--green-mid)', fontSize: '0.82rem', fontWeight: 700 }}>
                      📷 {photo?.name} ({(photo?.size / 1024).toFixed(0)} Ko)
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
                    <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>
                      Glissez une photo ici ou cliquez
                    </p>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>JPG, PNG — max 5 Mo</p>
                  </div>
                )}
              </div>
              {errors.photo && <div className="field-error">⚠ {errors.photo}</div>}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setView('list')}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? '⏳ Envoi...' : '🌿 Soumettre le signalement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── List ────────────────────────────────────────────────────────────────
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2>🌿 Mes signalements</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            Bonjour, <strong>{user?.nom}</strong> — {signalements.length} signalement(s)
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setView('form')}>
          ➕ Nouveau signalement
        </button>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : signalements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
          <h3 style={{ color: 'var(--green-dark)', marginBottom: 8 }}>Aucun signalement</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: 24 }}>
            Vous n'avez pas encore soumis de signalement.
          </p>
          <button className="btn btn-primary" onClick={() => setView('form')}>
            ➕ Créer mon premier signalement
          </button>
        </div>
      ) : (
        <div className="sig-grid">
          {signalements.map(s => (
            <div key={s.id} className="sig-card" onClick={() => onViewDetail(s)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="sig-card-cat">{CAT_LABELS[s.categorie] ?? s.categorie}</span>
                <StatusBadge statut={s.statut} size="sm" />
              </div>
              <div className="sig-card-title">{s.titre}</div>
              <div className="sig-card-meta">
                <span>📍 {s.localisation}</span>
                <span>·</span>
                <span>{new Date(s.createdAt || s.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', lineHeight: 1.5,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {s.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

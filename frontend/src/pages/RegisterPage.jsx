// Tasks #4 #5 — Formulaire register + validation complète
import { useState } from 'react';
import { authAPI } from '../api/api';

function validate(fields) {
  const errors = {};
  if (!fields.nom.trim())                errors.nom = 'Le nom est requis';
  else if (fields.nom.trim().length < 2) errors.nom = 'Minimum 2 caractères';
  if (!fields.email.trim())              errors.email = 'L\'email est requis';
  else if (!/\S+@\S+\.\S+/.test(fields.email)) errors.email = 'Email invalide';
  if (!fields.mot_de_passe)             errors.mot_de_passe = 'Requis';
  else if (fields.mot_de_passe.length < 6) errors.mot_de_passe = 'Minimum 6 caractères';
  if (fields.confirm !== fields.mot_de_passe) errors.confirm = 'Les mots de passe ne correspondent pas';
  return errors;
}

export default function RegisterPage({ onGoLogin }) {
  const [fields, setFields]     = useState({ nom: '', email: '', mot_de_passe: '', confirm: '', role: 'etudiant' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const set = (k) => (e) => {
    setFields(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { nom, email, mot_de_passe, role } = fields;
      await authAPI.register({ nom, email, mot_de_passe, role });
      setSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-visual">
          <div className="auth-visual-icon">🎉</div>
          <h1>Bienvenue sur<br />CampusÉco !</h1>
          <p>Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter et commencer à signaler.</p>
        </div>
        <div className="auth-form-side">
          <div className="auth-form-box" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
            <h2>Inscription réussie !</h2>
            <p style={{ color: 'var(--text-light)', marginTop: 8, marginBottom: 28 }}>
              Votre compte <strong>{fields.role}</strong> a été créé.
            </p>
            <button onClick={onGoLogin} className="btn btn-primary btn-full">
              Se connecter maintenant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-visual">
        <div className="auth-visual-icon">🌿</div>
        <h1>Rejoignez<br />la communauté</h1>
        <p>Ensemble, faisons de notre campus un espace plus durable. Signalez, proposez, agissez.</p>
        <div className="auth-pills">
          <span className="auth-pill">🎓 Étudiants</span>
          <span className="auth-pill">👑 Admins</span>
          <span className="auth-pill">🌍 Durabilité</span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Créer un compte</h2>
          <p className="subtitle">Rejoignez le campus éco-responsable</p>

          {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="nom">Nom complet</label>
              <input id="nom" type="text" placeholder="Prénom Nom"
                value={fields.nom} onChange={set('nom')}
                className={errors.nom ? 'error' : ''} />
              {errors.nom && <div className="field-error">⚠ {errors.nom}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Adresse email</label>
              <input id="reg-email" type="email" placeholder="vous@universite.dz"
                value={fields.email} onChange={set('email')}
                className={errors.email ? 'error' : ''} />
              {errors.email && <div className="field-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Rôle</label>
              <select id="role" value={fields.role} onChange={set('role')}>
                <option value="etudiant">🎓 Étudiant</option>
                <option value="admin">👑 Administrateur</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reg-mdp">Mot de passe</label>
              <input id="reg-mdp" type="password" placeholder="Minimum 6 caractères"
                value={fields.mot_de_passe} onChange={set('mot_de_passe')}
                className={errors.mot_de_passe ? 'error' : ''} />
              {errors.mot_de_passe && <div className="field-error">⚠ {errors.mot_de_passe}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirmer le mot de passe</label>
              <input id="confirm" type="password" placeholder="Répétez le mot de passe"
                value={fields.confirm} onChange={set('confirm')}
                className={errors.confirm ? 'error' : ''} />
              {errors.confirm && <div className="field-error">⚠ {errors.confirm}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}
              style={{ marginTop: 8 }}>
              {loading ? '⏳ Création...' : '🌱 Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-light)', fontSize: '0.9rem' }}>
            Déjà un compte ?{' '}
            <button onClick={onGoLogin}
              style={{ background: 'none', border: 'none', color: 'var(--green-mid)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif' }}>
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

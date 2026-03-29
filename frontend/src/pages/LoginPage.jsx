// Tasks #4 #5 — Formulaire login + validation client + affichage erreurs serveur
import { useState } from 'react';
import { authAPI } from '../api/api';

function validate(fields) {
  const errors = {};
  if (!fields.email.trim())              errors.email = 'L\'email est requis';
  else if (!/\S+@\S+\.\S+/.test(fields.email)) errors.email = 'Email invalide';
  if (!fields.mot_de_passe)             errors.mot_de_passe = 'Le mot de passe est requis';
  else if (fields.mot_de_passe.length < 6) errors.mot_de_passe = 'Minimum 6 caractères';
  return errors;
}

export default function LoginPage({ onLogin, onGoRegister }) {
  const [fields, setFields]   = useState({ email: '', mot_de_passe: '' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const res = await authAPI.login(fields);
      onLogin(res.user, res.token);
    } catch (err) {
      setApiError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Visual panel */}
      <div className="auth-visual">
        <div className="auth-visual-icon">🌱</div>
        <h1>Campus<br />Éco-Responsable</h1>
        <p>Signalez les problèmes environnementaux de votre campus et contribuez à un environnement plus vert.</p>
        <div className="auth-pills">
          <span className="auth-pill">💡 Éclairage</span>
          <span className="auth-pill">💧 Eau</span>
          <span className="auth-pill">⚡ Énergie</span>
          <span className="auth-pill">🌿 Autre</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <h2>Bon retour 👋</h2>
          <p className="subtitle">Connectez-vous à votre compte campus</p>

          {apiError && <div className="alert alert-error">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email" type="email" placeholder="vous@gmail.com"
                value={fields.email} onChange={set('email')}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <div className="field-error">⚠ {errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="mot_de_passe">Mot de passe</label>
              <input
                id="mot_de_passe" type="password" placeholder="••••••••"
                value={fields.mot_de_passe} onChange={set('mot_de_passe')}
                className={errors.mot_de_passe ? 'error' : ''}
              />
              {errors.mot_de_passe && <div className="field-error">⚠ {errors.mot_de_passe}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}
              style={{ marginTop: 8 }}>
              {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-light)', fontSize: '0.9rem' }}>
            Pas encore de compte ?{' '}
            <button onClick={onGoRegister}
              style={{ background: 'none', border: 'none', color: 'var(--green-mid)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Nunito, sans-serif' }}>
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

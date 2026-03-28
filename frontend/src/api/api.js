const BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const jsonHeaders = () => ({ 'Content-Type': 'application/json' });

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur serveur');
  return data;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (payload) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  login: (payload) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),
};

// ── Signalements ─────────────────────────────────────────────────────────────
export const signalementsAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/signalements`, { headers: authHeaders() }).then(handleResponse),

  create: (formData) =>
    fetch(`${BASE_URL}/signalements`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type → browser sets multipart
      body: formData,
    }).then(handleResponse),

  updateStatut: (id, statut) =>
    fetch(`${BASE_URL}/signalements/${id}/statut`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ statut }),
    }).then(handleResponse),

  getSuggestion: (id) =>
    fetch(`${BASE_URL}/signalements/${id}/suggestion`, {
      headers: authHeaders(),
    }).then(handleResponse),
};

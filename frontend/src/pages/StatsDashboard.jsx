import { useState, useEffect } from 'react';
import { statsAPI } from '../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const PERIODES    = [
  { value: '7j', label: '7 jours' }, { value: '30j', label: '30 jours' },
  { value: '90j', label: '3 mois' }, { value: 'tout', label: 'Tout' },
];
const CAT_COLORS  = { energie: '#f59e0b', eau: '#3b82f6', eclairage: '#8b5cf6', autre: '#10b981' };
const STAT_COLORS = { en_attente: '#f59e0b', en_cours: '#3b82f6', traite: '#10b981' };
const CAT_LABELS  = { energie: '⚡ Énergie', eau: '💧 Eau', eclairage: '💡 Éclairage', autre: '🌿 Autre' };
const STAT_LABELS = { en_attente: 'En attente', en_cours: 'En cours', traite: 'Traité' };

export default function StatsDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('30j');
  const [error, setError]     = useState('');

  useEffect(() => { fetchStats(); }, [periode]);

  async function fetchStats() {
    setLoading(true);
    try { setStats(await statsAPI.get(periode)); }
    catch (err) { setError(err.message); }
    setLoading(false);
  }

  if (loading) return <div className="page-content"><div className="spinner" /></div>;
  if (error)   return <div className="page-content"><div className="alert alert-error">{error}</div></div>;

  const donutCat = {
    labels: stats.parCategorie.map(x => CAT_LABELS[x.categorie] ?? x.categorie),
    datasets: [{ data: stats.parCategorie.map(x => x.count),
      backgroundColor: stats.parCategorie.map(x => CAT_COLORS[x.categorie] ?? '#6b7280'),
      borderWidth: 2, borderColor: '#fff' }],
  };
  const donutStat = {
    labels: stats.parStatut.map(x => STAT_LABELS[x.statut] ?? x.statut),
    datasets: [{ data: stats.parStatut.map(x => x.count),
      backgroundColor: stats.parStatut.map(x => STAT_COLORS[x.statut] ?? '#6b7280'),
      borderWidth: 2, borderColor: '#fff' }],
  };
  const barMois = {
    labels: stats.parMois.map(x =>
      new Date(x.mois).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })),
    datasets: [{ label: 'Signalements', data: stats.parMois.map(x => x.count),
      backgroundColor: 'rgba(45,122,69,0.7)', borderColor: '#1e4d2b',
      borderWidth: 1, borderRadius: 6 }],
  };
  const kpis = [
    { label: 'Total',      value: stats.total, color: '#1e4d2b', bg: '#e8f5e9' },
    { label: 'En attente', value: stats.parStatut.find(x => x.statut === 'en_attente')?.count ?? 0, color: '#b45309', bg: '#fef3c7' },
    { label: 'En cours',   value: stats.parStatut.find(x => x.statut === 'en_cours')?.count   ?? 0, color: '#1d4ed8', bg: '#dbeafe' },
    { label: 'Traités',    value: stats.parStatut.find(x => x.statut === 'traite')?.count      ?? 0, color: '#15803d', bg: '#dcfce7' },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2>📊 Tableau de bord statistique</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: 4 }}>
            Vue d'ensemble des signalements campus
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODES.map(p => (
            <button key={p.value} onClick={() => setPeriode(p.value)}
              className={`btn btn-sm ${periode === p.value ? 'btn-primary' : 'btn-secondary'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 28 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 12, padding: 20, textAlign: 'center', border: `1px solid ${k.color}22` }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: k.color, fontFamily: 'Fraunces, serif' }}>{k.value}</div>
            <div style={{ fontSize: '0.82rem', color: k.color, fontWeight: 700, marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ color: 'var(--green-dark)', marginBottom: 16, fontSize: '1rem' }}>📂 Par catégorie</h3>
          <Doughnut data={donutCat} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--green-dark)', marginBottom: 16, fontSize: '1rem' }}>🏷 Par statut</h3>
          <Doughnut data={donutStat} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--green-dark)', marginBottom: 16, fontSize: '1rem' }}>📅 Évolution par mois</h3>
        <Bar data={barMois} options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        }} />
      </div>
    </div>
  );
}
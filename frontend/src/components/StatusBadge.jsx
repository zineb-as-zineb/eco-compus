// Task #50 — badges de statut colorés
const CONFIG = {
  en_attente: { label: 'En attente', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
  en_cours:   { label: 'En cours',   color: '#3b82f6', bg: '#dbeafe', icon: '🔄' },
  traite:     { label: 'Traité',     color: '#10b981', bg: '#d1fae5', icon: '✅' },
};

export default function StatusBadge({ statut, size = 'md' }) {
  const cfg = CONFIG[statut] ?? { label: statut, color: '#6b7280', bg: '#f3f4f6', icon: '•' };
  const fontSize = size === 'sm' ? '0.7rem' : '0.78rem';
  const padding  = size === 'sm' ? '2px 8px'  : '4px 12px';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: cfg.bg, color: cfg.color,
      border: `1.5px solid ${cfg.color}`,
      borderRadius: 20, fontSize, fontWeight: 700,
      padding, whiteSpace: 'nowrap',
      fontFamily: 'Nunito, sans-serif',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

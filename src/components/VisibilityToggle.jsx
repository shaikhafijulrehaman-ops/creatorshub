import './VisibilityToggle.css';

const OPTIONS = ['Public', 'Connections Only', 'Private'];

export const VisibilityToggle = ({ value = 'Private', onChange, compact = false }) => {
  const current = OPTIONS.indexOf(value);

  const handleClick = () => {
    const next = OPTIONS[(current + 1) % OPTIONS.length];
    onChange(next);
  };

  const colorMap = {
    'Public': { bg: 'rgba(34,197,94,0.08)', color: '#16a34a', border: 'rgba(34,197,94,0.25)', dot: '#22c55e' },
    'Connections Only': { bg: 'rgba(245,158,11,0.08)', color: '#b45309', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' },
    'Private': { bg: 'rgba(239,68,68,0.07)', color: '#dc2626', border: 'rgba(239,68,68,0.2)', dot: '#ef4444' },
  };

  const c = colorMap[value];

  return (
    <button
      type="button"
      className={`visibility-toggle${compact ? ' visibility-toggle--compact' : ''}`}
      style={{ background: c.bg, borderColor: c.border, color: c.color }}
      onClick={handleClick}
      title={`Visibility: ${value} — click to change`}
    >
      <span className="visibility-dot" style={{ background: c.dot }} />
      {!compact && <span className="visibility-label">{value}</span>}
    </button>
  );
};

export default VisibilityToggle;

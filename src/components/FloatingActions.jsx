import { useState } from 'react';
import { Plus, X, FolderKanban, Upload, Users, Briefcase, Calendar } from 'lucide-react';
import './FloatingActions.css';

const ACTIONS = [
  { id: 'create-req',    label: 'Create Requirement',   Icon: FolderKanban, color: '#000000' },
  { id: 'upload-port',   label: 'Upload Portfolio',      Icon: Upload,       color: '#000000' },
  { id: 'invite-inf',    label: 'Invite Influencer',     Icon: Users,        color: '#000000' },
  { id: 'invite-free',   label: 'Invite Freelancer',     Icon: Briefcase,    color: '#000000' },
  { id: 'schedule',      label: 'Schedule Meeting',      Icon: Calendar,     color: '#000000' },
];

export const FloatingActions = ({ onAction }) => {
  const [open, setOpen] = useState(false);

  const handleAction = (id) => {
    setOpen(false);
    onAction && onAction(id);
  };

  return (
    <div className="fab-root" role="region" aria-label="Quick actions">
      {/* Action Items */}
      <div className={`fab-menu${open ? ' fab-menu--open' : ''}`} aria-hidden={!open}>
        {ACTIONS.map(({ id, label, Icon, color }, i) => (
          <button
            key={id}
            className="fab-item"
            style={{ transitionDelay: open ? `${i * 45}ms` : `${(ACTIONS.length - i) * 25}ms` }}
            onClick={() => handleAction(id)}
            tabIndex={open ? 0 : -1}
          >
            <div className="fab-item-icon" style={{ background: color }}>
              <Icon size={14} style={{ color: '#fff' }} />
            </div>
            <span className="fab-item-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Main trigger */}
      <button
        className={`fab-trigger${open ? ' fab-trigger--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Quick actions"
        id="fab-trigger-btn"
      >
        {open ? <X size={20} /> : <Plus size={20} />}
      </button>
    </div>
  );
};

export default FloatingActions;

import { useState } from 'react';
import { Plus, X, FolderKanban, Upload, Users, Briefcase, Calendar } from 'lucide-react';
import './FloatingActions.css';

const ACTIONS = [
  { id: 'create-req',    label: 'Create Requirement',   Icon: FolderKanban, color: '#111111', roles: ['Business Holder'] },
  { id: 'upload-port',   label: 'Upload Portfolio',      Icon: Upload,       color: '#111111', roles: ['Freelancer', 'Influencer'] },
  { id: 'invite-inf',    label: 'Invite Influencer',     Icon: Users,        color: '#111111', roles: ['Business Holder'] },
  { id: 'invite-free',   label: 'Invite Freelancer',     Icon: Briefcase,    color: '#111111', roles: ['Business Holder'] },
  { id: 'schedule',      label: 'Schedule Meeting',      Icon: Calendar,     color: '#111111', roles: ['Business Holder', 'Freelancer', 'Influencer'] },
];

export const FloatingActions = ({ role, onAction }) => {
  const [open, setOpen] = useState(false);

  const filteredActions = ACTIONS.filter(action => !action.roles || action.roles.includes(role));

  const handleAction = (id) => {
    setOpen(false);
    onAction && onAction(id);
  };

  // If role is undefined or not found, don't render anything
  if (!role) return null;

  return (
    <div className="fab-root" role="region" aria-label="Quick actions">
      {/* Action Items */}
      <div className={`fab-menu${open ? ' fab-menu--open' : ''}`} aria-hidden={!open}>
        {filteredActions.map(({ id, label, Icon, color }, i) => (
          <button
            key={id}
            className="fab-item"
            style={{ transitionDelay: open ? `${i * 45}ms` : `${(filteredActions.length - i) * 25}ms` }}
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
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
};

export default FloatingActions;

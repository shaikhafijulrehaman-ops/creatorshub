import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  FolderKanban, Megaphone, Search, Users, ClipboardList, FileText, Share2,
  Upload, FilePlus, Send, Compass, Clock,
  Sparkles, Image, TrendingUp, UserCheck, Settings
} from 'lucide-react';
import './FloatingActions.css';

const ROLE_ACTIONS = {
  'Business Holder': [
    { id: 'create-campaign',     label: 'Create Brand Campaign',  Icon: Megaphone },
    { id: 'post-requirement',    label: 'Post Requirement',       Icon: FolderKanban },
    { id: 'find-freelancers',    label: 'Find Freelancers',       Icon: Search },
    { id: 'find-influencers',    label: 'Find Influencers',       Icon: Users },
    { id: 'active-requirements', label: 'My Requirements',        Icon: ClipboardList },
    { id: 'draft-requirements',  label: 'Draft Requirements',     Icon: FileText },
    { id: 'community-post',     label: 'Community Post',          Icon: Share2 },
  ],
  'Freelancer': [
    { id: 'upload-portfolio',    label: 'Upload Portfolio',        Icon: Upload },
    { id: 'add-project',         label: 'Add New Project',         Icon: FilePlus },
    { id: 'my-applications',     label: 'My Applications',         Icon: Send },
    { id: 'find-requirements',   label: 'Find Requirements',       Icon: Compass },
    { id: 'update-availability', label: 'Update Availability',     Icon: Clock },
  ],
  'Influencer': [
    { id: 'create-campaign-post', label: 'Create Campaign Post',   Icon: Sparkles },
    { id: 'upload-media-kit',     label: 'Upload Media Kit',        Icon: Image },
    { id: 'find-campaigns',       label: 'Find Brand Campaigns',    Icon: TrendingUp },
    { id: 'my-collaborations',    label: 'My Collaborations',       Icon: UserCheck },
    { id: 'update-profile',       label: 'Update Profile',          Icon: Settings },
  ]
};

export const FloatingActions = ({ role, onAction }) => {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  const actions = ROLE_ACTIONS[role];
  if (!actions) return null;

  const handleAction = (id) => {
    setOpen(false);
    onAction && onAction(id);
  };

  return createPortal(
    <>
      {/* Blurred overlay */}
      <div
        className={`fab-overlay${open ? ' fab-overlay--visible' : ''}`}
        onClick={() => setOpen(false)}
      />

      <div className="fab-root" role="region" aria-label="Quick actions">
        {/* Floating action list */}
        <div className={`fab-menu${open ? ' fab-menu--open' : ''}`} aria-hidden={!open}>
          {actions.map(({ id, label, Icon }, i) => (
            <button
              key={id}
              className="fab-action"
              style={{
                transitionDelay: open
                  ? `${i * 50}ms`
                  : `${(actions.length - i) * 25}ms`
              }}
              onClick={() => handleAction(id)}
              tabIndex={open ? 0 : -1}
            >
              <div className="fab-dot">
                <Icon size={18} />
              </div>
              <span className="fab-label">{label}</span>
            </button>
          ))}
        </div>

        {/* Main trigger — Plus rotates 45° to become X */}
        <button
          className={`fab-trigger${open ? ' fab-trigger--open' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-label="Quick actions"
          id="fab-trigger-btn"
        >
          <Plus size={24} />
        </button>
      </div>
    </>,
    document.body
  );
};

export default FloatingActions;

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Briefcase, Code, Megaphone,
  FolderKanban, Search, Users, ClipboardList, FileText, Share2,
  Upload, FilePlus, Send, Compass, Clock,
  Sparkles, Image, TrendingUp, UserCheck, Settings
} from 'lucide-react';
import './FloatingActions.css';

const ROLE_CONFIG = {
  'Business Holder': {
    TriggerIcon: Briefcase,
    actions: [
      { id: 'post-requirement',    label: 'Post New Requirement',    Icon: FolderKanban },
      { id: 'create-campaign',     label: 'Create Brand Campaign',   Icon: Megaphone },
      { id: 'find-freelancers',    label: 'Find Freelancers',        Icon: Search },
      { id: 'find-influencers',    label: 'Find Influencers',        Icon: Users },
      { id: 'active-requirements', label: 'My Active Requirements',  Icon: ClipboardList },
      { id: 'draft-requirements',  label: 'Draft Requirements',      Icon: FileText },
      { id: 'community-post',     label: 'Community Post',           Icon: Share2 },
    ]
  },
  'Freelancer': {
    TriggerIcon: Code,
    actions: [
      { id: 'upload-portfolio',    label: 'Upload Portfolio',         Icon: Upload },
      { id: 'add-project',         label: 'Add New Project',          Icon: FilePlus },
      { id: 'my-applications',     label: 'My Applications',          Icon: Send },
      { id: 'find-requirements',   label: 'Find Requirements',        Icon: Compass },
      { id: 'update-availability', label: 'Update Availability',      Icon: Clock },
    ]
  },
  'Influencer': {
    TriggerIcon: Sparkles,
    actions: [
      { id: 'create-campaign-post', label: 'Create Campaign Post',    Icon: Megaphone },
      { id: 'upload-media-kit',     label: 'Upload Media Kit',         Icon: Image },
      { id: 'find-campaigns',       label: 'Find Brand Campaigns',     Icon: TrendingUp },
      { id: 'my-collaborations',    label: 'My Collaborations',        Icon: UserCheck },
      { id: 'update-profile',       label: 'Update Profile',           Icon: Settings },
    ]
  }
};

export const FloatingActions = ({ role, onAction }) => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open, isMobile]);

  const config = ROLE_CONFIG[role];
  if (!config) return null;

  const { TriggerIcon, actions } = config;

  const handleAction = (id) => {
    setOpen(false);
    onAction && onAction(id);
  };

  // ── Mobile: Bottom Sheet ──
  if (isMobile) {
    return createPortal(
      <>
        {/* Dark overlay behind sheet */}
        <div
          className={`fab-sheet-overlay${open ? ' fab-sheet-overlay--visible' : ''}`}
          onClick={() => setOpen(false)}
        />

        {/* Bottom sheet */}
        <div className={`fab-sheet${open ? ' fab-sheet--open' : ''}`}>
          <div className="fab-sheet-handle" />
          <div className="fab-sheet-header">
            <span className="fab-sheet-title">Quick Actions</span>
            <button className="fab-sheet-close" onClick={() => setOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <div className="fab-sheet-actions">
            {actions.map(({ id, label, Icon }, i) => (
              <button
                key={id}
                className="fab-sheet-item"
                style={{ animationDelay: open ? `${i * 45}ms` : '0ms' }}
                onClick={() => handleAction(id)}
              >
                <div className="fab-sheet-item-icon">
                  <Icon size={20} />
                </div>
                <span className="fab-sheet-item-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAB trigger – elevated above overlay when open */}
        <div
          className="fab-root"
          role="region"
          aria-label="Quick actions"
          style={open ? { zIndex: 10002 } : undefined}
        >
          <button
            className={`fab-trigger${open ? ' fab-trigger--open' : ''}`}
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-label="Quick actions"
            id="fab-trigger-btn"
          >
            {open ? <X size={24} /> : <TriggerIcon size={24} />}
          </button>
        </div>
      </>,
      document.body
    );
  }

  // ── Desktop: Speed Dial ──
  return createPortal(
    <>
      {/* Subtle backdrop */}
      <div
        className={`fab-backdrop${open ? ' fab-backdrop--visible' : ''}`}
        onClick={() => setOpen(false)}
      />

      <div className="fab-root" role="region" aria-label="Quick actions">
        {/* Speed-dial menu */}
        <div className={`fab-menu${open ? ' fab-menu--open' : ''}`} aria-hidden={!open}>
          {actions.map(({ id, label, Icon }, i) => (
            <button
              key={id}
              className="fab-item"
              style={{
                transitionDelay: open
                  ? `${i * 40}ms`
                  : `${(actions.length - i) * 20}ms`
              }}
              onClick={() => handleAction(id)}
              tabIndex={open ? 0 : -1}
            >
              <div className="fab-item-icon">
                <Icon size={16} style={{ color: '#fff' }} />
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
          {open ? <X size={24} /> : <TriggerIcon size={24} />}
        </button>
      </div>
    </>,
    document.body
  );
};

export default FloatingActions;

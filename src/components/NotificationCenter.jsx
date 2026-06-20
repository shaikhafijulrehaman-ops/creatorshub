import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Bell, X, Check, CheckCheck, MessageSquare, UserCheck, Star, 
  IndianRupee, Briefcase, RefreshCw, UserPlus, FolderOpen, 
  Megaphone, Target, ShieldCheck 
} from 'lucide-react';
import './NotificationCenter.css';

const getConvIdFromNotif = (notifId) => {
  if (!notifId || !notifId.startsWith('notif-msg-')) return null;
  const withoutPrefix = notifId.substring('notif-msg-'.length);
  const lastDashIdx = withoutPrefix.lastIndexOf('-');
  if (lastDashIdx === -1) return withoutPrefix;
  return withoutPrefix.substring(0, lastDashIdx);
};

const ICONS = {
  accepted:    { icon: UserCheck,    color: '#22c55e',  bg: 'rgba(34,197,94,0.08)'  },
  shortlisted: { icon: Star,         color: '#f59e0b',  bg: 'rgba(245,158,11,0.08)' },
  viewed:      { icon: CheckCheck,   color: '#3b82f6',  bg: 'rgba(59,130,246,0.08)' },
  rejected:    { icon: X,            color: '#ef4444',  bg: 'rgba(239,68,68,0.07)'  },
  invitation:  { icon: Briefcase,    color: '#000000',  bg: 'rgba(0,0,0,0.05)'      },
  payment:     { icon: IndianRupee,  color: '#22c55e',  bg: 'rgba(34,197,94,0.08)'  },
  revision:    { icon: RefreshCw,    color: '#f59e0b',  bg: 'rgba(245,158,11,0.08)' },
  message:     { icon: MessageSquare,color: '#06b6d4',  bg: 'rgba(6,182,212,0.08)'  },
  new_message: { icon: MessageSquare,color: '#06b6d4',  bg: 'rgba(6,182,212,0.08)'  },
  connection_request: { icon: UserPlus, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  connection_accepted: { icon: UserCheck, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  portfolio: { icon: FolderOpen, color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  new_portfolio: { icon: FolderOpen, color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
  requirement: { icon: Megaphone, color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
  new_requirement: { icon: Megaphone, color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
  campaign: { icon: Target, color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  new_campaign: { icon: Target, color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  verification_approved: { icon: ShieldCheck, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
};

export const NotificationBell = ({ onClick }) => {
  const { notifications } = useContext(AppContext);
  const unread = (notifications || []).filter(n => !n.read).length;

  return (
    <button
      id="notification-bell-btn"
      onClick={onClick}
      className="notif-bell-btn"
      aria-label="Open notifications"
    >
      <Bell size={18} />
      {unread > 0 && (
        <span className="notif-badge" key={unread}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
};

export const NotificationCenter = ({ open, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    clearNotifications,
    setActiveConversationId,
    setActiveTabToRedirect,
    connectionRequests,
    acceptConnectionRequest,
    declineConnectionRequest,
    currentUser,
    showConfirmation
  } = useContext(AppContext);
  const [filter, setFilter] = useState('all');

  const list = notifications || [];
  const filtered = filter === 'unread' ? list.filter(n => !n.read) : list;

  const handleAction = (notif) => {
    markNotificationRead(notif.id);
    if (notif.actionConvId) {
      setActiveConversationId(notif.actionConvId);
      setActiveTabToRedirect('messages');
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`notif-overlay${open ? ' notif-overlay--open' : ''}`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside className={`notif-panel${open ? ' notif-panel--open' : ''}`} role="dialog" aria-label="Notifications">
        {/* Header */}
        <div className="notif-header">
          <div>
            <h3 className="notif-title">Notifications</h3>
            {list.filter(n => !n.read).length > 0 && (
              <span className="notif-count">{list.filter(n => !n.read).length} unread</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {list.length > 0 && (
              <button 
                className="notif-clear-btn" 
                onClick={async () => {
                  const confirmed = await showConfirmation({
                    title: 'Clear Notifications',
                    message: 'Are you sure you want to clear all notifications? This action cannot be undone.',
                    confirmText: 'Clear All',
                    cancelText: 'Cancel',
                    type: 'warning',
                    isDestructive: true
                  });
                  if (confirmed) {
                    clearNotifications();
                  }
                }}
              >
                Clear all
              </button>
            )}
            <button className="notif-close-btn" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="notif-filters">
          {['all', 'unread'].map(f => (
            <button
              key={f}
              className={`notif-filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="notif-list">
          {filtered.length === 0 ? (
            <div className="notif-empty">
              <Bell size={32} style={{ opacity: 0.2, marginBottom: '10px' }} />
              <p>{filter === 'unread' ? 'No unread notifications' : 'You are all caught up'}</p>
            </div>
          ) : (
            filtered.map((notif, i) => {
              const meta = ICONS[notif.type] || ICONS.message;
              const Icon = meta.icon;

              const isConnectionRequest = notif.type === 'connection_request';
              const req = isConnectionRequest && connectionRequests
                ? connectionRequests.find(r => r.sender_id === notif.sender_id && r.receiver_id === currentUser?.id)
                : null;

              return (
                <div
                  key={notif.id}
                  className={`notif-item${!notif.read ? ' notif-item--unread' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="notif-icon-wrap" style={{ background: meta.bg }}>
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>
                  <div 
                    className="notif-body"
                    onClick={() => {
                      markNotificationRead(notif.id);
                      if (notif.type === 'message' || notif.type === 'new_message') {
                        const convId = getConvIdFromNotif(notif.id);
                        if (convId) {
                          setActiveConversationId(convId);
                          setActiveTabToRedirect('messages');
                          onClose();
                        }
                      } else if (notif.type === 'connection_accepted' || notif.type === 'connection_request') {
                        setActiveTabToRedirect('dashboard');
                        onClose();
                      } else if (notif.type === 'portfolio' || notif.type === 'new_portfolio') {
                        setActiveTabToRedirect(currentUser?.role === 'Business Holder' ? 'explore' : 'dashboard');
                        onClose();
                      } else if (notif.type === 'requirement' || notif.type === 'new_requirement' || notif.type === 'campaign' || notif.type === 'new_campaign') {
                        setActiveTabToRedirect(currentUser?.role !== 'Business Holder' ? 'projects' : 'dashboard');
                        onClose();
                      } else if (notif.type === 'verification_approved') {
                        setActiveTabToRedirect('profile');
                        onClose();
                      }
                    }}
                    style={{ 
                      cursor: ['message', 'new_message', 'connection_accepted', 'connection_request', 'portfolio', 'new_portfolio', 'requirement', 'new_requirement', 'campaign', 'new_campaign', 'verification_approved'].includes(notif.type) ? 'pointer' : 'default', 
                      width: '100%' 
                    }}
                  >
                    <p className="notif-text">{notif.title}</p>
                    {(notif.message || notif.body) && <p className="notif-sub">{notif.message || notif.body}</p>}
                    <span className="notif-time">{notif.time || 'Just now'}</span>
                    {notif.actionLabel && (
                      <button
                        className="notif-action-btn"
                        onClick={() => handleAction(notif)}
                      >
                        {notif.actionLabel}
                      </button>
                    )}
                     {isConnectionRequest && (
                      req && req.status === 'Pending' ? (
                        <div className="notif-conn-actions" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button
                            className="notif-btn-accept"
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#22c55e',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              await acceptConnectionRequest(req.id, notif.sender_id);
                              markNotificationRead(notif.id);
                            }}
                          >
                            <Check size={11} /> Accept
                          </button>
                          <button
                            className="notif-btn-reject"
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              await declineConnectionRequest(req.id, notif.sender_id);
                              markNotificationRead(notif.id);
                            }}
                          >
                            <X size={11} /> Decline
                          </button>
                        </div>
                      ) : (
                        <span className="notif-conn-status" style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '6px', display: 'inline-block', fontStyle: 'italic' }}>
                          Request handled
                        </span>
                      )
                    )}
                  </div>
                  {!notif.read && (
                    <button
                      className="notif-read-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(notif.id);
                      }}
                      title="Mark as read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};

export default NotificationCenter;

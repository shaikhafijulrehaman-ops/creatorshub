import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Bell, X, Check, CheckCheck, MessageSquare, UserCheck, Star, IndianRupee, Briefcase, RefreshCw } from 'lucide-react';
import './NotificationCenter.css';

const ICONS = {
  accepted:    { icon: UserCheck,    color: '#22c55e',  bg: 'rgba(34,197,94,0.08)'  },
  shortlisted: { icon: Star,         color: '#f59e0b',  bg: 'rgba(245,158,11,0.08)' },
  viewed:      { icon: CheckCheck,   color: '#3b82f6',  bg: 'rgba(59,130,246,0.08)' },
  rejected:    { icon: X,            color: '#ef4444',  bg: 'rgba(239,68,68,0.07)'  },
  invitation:  { icon: Briefcase,    color: '#000000',  bg: 'rgba(0,0,0,0.05)'      },
  payment:     { icon: IndianRupee,  color: '#22c55e',  bg: 'rgba(34,197,94,0.08)'  },
  revision:    { icon: RefreshCw,    color: '#f59e0b',  bg: 'rgba(245,158,11,0.08)' },
  message:     { icon: MessageSquare,color: '#000000',  bg: 'rgba(0,0,0,0.05)'      },
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
  const { notifications, markNotificationRead, clearNotifications, setActiveConversationId, setActiveTabToRedirect } = useContext(AppContext);
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
              <button className="notif-clear-btn" onClick={clearNotifications}>
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
              return (
                <div
                  key={notif.id}
                  className={`notif-item${!notif.read ? ' notif-item--unread' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="notif-icon-wrap" style={{ background: meta.bg }}>
                    <Icon size={14} style={{ color: meta.color }} />
                  </div>
                  <div className="notif-body">
                    <p className="notif-text">{notif.title}</p>
                    {notif.body && <p className="notif-sub">{notif.body}</p>}
                    <span className="notif-time">{notif.time || 'Just now'}</span>
                    {notif.actionLabel && (
                      <button
                        className="notif-action-btn"
                        onClick={() => handleAction(notif)}
                      >
                        {notif.actionLabel}
                      </button>
                    )}
                  </div>
                  {!notif.read && (
                    <button
                      className="notif-read-btn"
                      onClick={() => markNotificationRead(notif.id)}
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

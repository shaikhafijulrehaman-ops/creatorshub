import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Bell, Menu, X } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';

export const Header = ({ onNavigate, currentPage }) => {
  const { currentUser, logoutUser, activityFeed } = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    onNavigate('landing');
    setMobileMenuOpen(false);
  };

  const handleLinkClick = (page, params = {}, anchor = null) => {
    setMobileMenuOpen(false);
    onNavigate(page, params);
    if (anchor) {
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      <header className="glass-panel" style={{
        position: 'sticky',
        top: '12px',
        margin: '0 24px',
        zIndex: 1000,
        padding: '12px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-glass)',
        borderRadius: '20px',
      }}>
        {/* Brand Signature Logo */}
        <div 
          onClick={() => handleLinkClick('landing')} 
          style={{ 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: '1',
            justifyContent: 'flex-start'
          }}
        >
          <AnimatedLogo fontSize="34px" animate={false} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '32px',
          flex: '0 0 auto',
          justifyContent: 'center'
        }}>
          <a 
            href="#explore" 
            onClick={(e) => { e.preventDefault(); handleLinkClick('explore'); }}
            style={{
              fontSize: '15px',
              fontWeight: '500',
              color: currentPage === 'explore' ? 'var(--text-white)' : 'var(--text-gray)',
              borderBottom: currentPage === 'explore' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              paddingBottom: '4px'
            }}
          >
            Explore
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => { e.preventDefault(); handleLinkClick('landing', {}, 'how-it-works'); }}
            style={{
              fontSize: '15px',
              fontWeight: '500',
              color: 'var(--text-gray)',
              borderBottom: '2px solid transparent',
              paddingBottom: '4px'
            }}
          >
            How It Works
          </a>


          {currentUser && (
            <a 
              href="#dashboard" 
              onClick={(e) => { e.preventDefault(); handleLinkClick('dashboard'); }}
              style={{
                fontSize: '15px',
                fontWeight: '500',
                color: currentPage === 'dashboard' ? 'var(--text-white)' : 'var(--text-gray)',
                borderBottom: currentPage === 'dashboard' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                paddingBottom: '4px'
              }}
            >
              Dashboard
            </a>
          )}
        </nav>

        {/* User Actions Section (Desktop only) */}
        <div className="desktop-actions" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          flex: '1',
          justifyContent: 'flex-end'
        }}>
          {currentUser ? (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-gray-light)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Bell size={18} />
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-cyan)',
                    boxShadow: 'var(--glow-cyan)'
                  }} />
                </button>

                {showNotifications && (
                  <div className="glass-panel animate-scale-up" style={{
                    position: 'absolute',
                    top: '52px',
                    right: '0',
                    width: '320px',
                    padding: '16px',
                    zIndex: 2000,
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>Activity Stream</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {activityFeed.map(act => (
                        <div key={act.id} style={{ fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--glass-border)' }}>
                          <p style={{ color: 'var(--text-gray-light)', lineHeight: '1.4' }}>{act.text}</p>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Avatar Control */}
              <div 
                onClick={() => handleLinkClick('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '4px 14px 4px 6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <img 
                  src={currentUser.profilePhoto || currentUser.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                  alt={currentUser.fullName}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid var(--accent-cyan-bright)'
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>
                    Dashboard
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => handleLinkClick('onboarding', { loginOnly: true })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPage === 'login' ? 'var(--text-white)' : 'var(--text-gray)',
                  borderBottom: currentPage === 'login' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  paddingBottom: '4px',
                  fontWeight: '500',
                  fontSize: '15px',
                  cursor: 'pointer',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  minHeight: '44px',
                  transition: 'var(--transition-fast)'
                }}
              >
                Login
              </button>
              <button 
                onClick={() => handleLinkClick('onboarding')}
                className="btn-primary"
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  minHeight: '44px',
                  background: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  boxShadow: currentPage === 'register' 
                    ? '0 0 16px var(--accent-cyan-glow), inset 0 0 8px var(--accent-cyan-glow)' 
                    : '0 0 12px var(--accent-cyan-glow)',
                  fontWeight: currentPage === 'register' ? '700' : '600'
                }}
              >
                Join Hub
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger menu Trigger */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-white)',
            cursor: 'pointer',
            display: 'none', // handled via CSS media query below
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px'
          }}
        >
          <Menu size={24} />
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '100%',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 1999,
        opacity: mobileMenuOpen ? 1 : 0,
        pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        transition: 'opacity 0.4s ease'
      }} onClick={() => setMobileMenuOpen(false)} />

      {/* SLIDE-OUT NAVIGATION DRAWER PANEL */}
      <div 
        className="glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '100%',
          maxWidth: '300px',
          background: 'rgba(255, 255, 255, 0.98)',
          borderLeft: '1px solid var(--glass-border)',
          zIndex: 2000,
          padding: '36px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        {/* Drawer Header with Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <AnimatedLogo fontSize="26px" animate={false} />
          <button 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: 'rgba(91, 174, 155, 0.06)',
              border: '1px solid var(--glass-border)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-white)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <button 
            onClick={() => handleLinkClick('explore')}
            className="drawer-nav-item"
            style={{
              background: currentPage === 'explore' ? 'var(--accent-cyan-glow)' : 'none',
              color: currentPage === 'explore' ? 'var(--accent-cyan)' : 'var(--text-white)',
              fontWeight: currentPage === 'explore' ? '700' : '600'
            }}
          >
            Explore Directory
          </button>
          
          <button 
            onClick={() => handleLinkClick('landing', {}, 'how-it-works')}
            className="drawer-nav-item"
          >
            How It Works
          </button>





          {currentUser && (
            <button 
              onClick={() => handleLinkClick('dashboard')}
              className="drawer-nav-item"
              style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}
            >
              Go to Dashboard
            </button>
          )}
        </div>

        {/* Drawer Auth Footer Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentUser ? (
            <button 
              onClick={handleLogout}
              className="btn-secondary"
              style={{ width: '100%', minHeight: '48px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
            >
              Log Out Session
            </button>
          ) : (
            <>
              <button 
                onClick={() => handleLinkClick('onboarding', { loginOnly: true })}
                className="btn-secondary"
                style={{ 
                  width: '100%', 
                  minHeight: '48px',
                  borderColor: currentPage === 'login' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
                  background: currentPage === 'login' ? 'rgba(0, 217, 255, 0.05)' : 'none',
                  fontWeight: currentPage === 'login' ? '700' : '600'
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => handleLinkClick('onboarding')}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  minHeight: '48px',
                  boxShadow: currentPage === 'register' ? '0 0 16px var(--accent-cyan-glow)' : '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
                  fontWeight: currentPage === 'register' ? '700' : '600'
                }}
              >
                Join Creators Hub
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .drawer-nav-item {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          color: var(--text-white);
          font-size: 16px;
          font-weight: 600;
          padding: 14px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 48px;
        }
        .drawer-nav-item:hover {
          background: var(--accent-cyan-glow);
          color: var(--accent-cyan);
          transform: translateX(4px);
        }
        @media (max-width: 768px) {
          .desktop-nav, .desktop-actions {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          header {
            margin: 12px 16px !important;
            padding: 10px 20px !important;
          }
        }
      `}</style>
    </>
  );
};

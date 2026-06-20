import { useState, useContext, useEffect } from 'react';
import { AppContext, AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Particles } from './components/Particles';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Landing } from './pages/Landing';
import { Onboarding } from './pages/Onboarding';
import { BusinessDashboard } from './pages/Dashboard/BusinessDashboard';
import { InfluencerDashboard } from './pages/Dashboard/InfluencerDashboard';
import { FreelancerDashboard } from './pages/Dashboard/FreelancerDashboard';
import { Workspace } from './pages/Dashboard/Shared/Workspace';
import { ProfileView } from './pages/Dashboard/Shared/ProfileView';
import { MessagingCenter } from './pages/Dashboard/Shared/MessagingCenter';
import { 
  Search, Briefcase, Sparkles, Home, MessageSquare, User, Bell, Menu, X, 
  CreditCard, BarChart2, ShieldCheck, LogOut, ChevronLeft, Calendar,
  Star, Award, BarChart3, LayoutDashboard, FileText, Users, CheckSquare, Upload,
  FolderKanban, UserCheck, Settings
} from 'lucide-react';
import { useToast } from './components/SuccessToast';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from './hooks/useResponsive';
import { NotificationCenter } from './components/NotificationCenter';
import { FloatingActions } from './components/FloatingActions';

const RedirectToLogin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);
  return null;
};

const DashboardSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
        <div>
          <div style={{ width: '180px', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '280px', height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginTop: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', height: '90px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ width: '40px', height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
            <div style={{ width: '80px', height: '22px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', marginTop: '12px' }}>
        <div style={{ height: '300px', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ height: '300px', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)' }} />
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

const MessagesSkeleton = () => {
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'rgba(10,11,18,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', overflow: 'hidden' }}>
      <div style={{ width: '320px', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ width: '100px', height: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
                <div style={{ width: '150px', height: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ width: '120px', height: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', height: '48px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }} />
      </div>
    </div>
  );
};

const ProfileSkeleton = () => {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ width: '150px', height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '100px', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );
};

const MobileHeader = ({ onOpenDrawer, onOpenNotifications, notificationCount, currentUser, onNavigate }) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '56px'
    }}>
      <div 
        onClick={() => onNavigate('landing')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <img 
          src="/creators-hub-logo.png" 
          alt="CH Logo" 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            objectFit: 'cover'
          }}
        />
        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-white)' }}>Creators Hub</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {currentUser && (
          <button 
            onClick={onOpenNotifications}
            style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%'
              }} />
            )}
          </button>
        )}

        {currentUser && (
          <button 
            onClick={() => onNavigate('profile')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <img 
              src={currentUser.profilePhoto || currentUser.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
              alt={currentUser.fullName} 
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-cyan)' }}
            />
          </button>
        )}

        <button 
          onClick={onOpenDrawer}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-gray)' }}
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};

const MobileBottomNav = ({ currentPage, onNavigate, currentUser }) => {
  const navItems = [
    { id: 'landing', label: 'Home', icon: <Home size={20} /> },
    { id: 'explore', label: 'Explore', icon: <Search size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'dashboard', label: 'Dashboard', icon: <Briefcase size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--glass-border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {navItems.map(item => {
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'messages' || item.id === 'dashboard' || item.id === 'profile') {
                if (!currentUser) {
                  onNavigate('onboarding', { loginOnly: true });
                  return;
                }
              }
              onNavigate(item.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-gray-light)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              flex: 1,
              height: '100%'
            }}
          >
            <span style={{ color: isActive ? 'var(--accent-cyan)' : 'inherit', transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s ease' }}>
              {item.icon}
            </span>
            <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const MobileDrawer = ({ isOpen, onClose, currentUser, onNavigate, onLogout, activeDashboardTab, setActiveDashboardTab }) => {
  if (!isOpen) return null;

  const getSidebarTabs = (role) => {
    if (role === 'Business Holder') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'freelancers', label: 'Find Freelancers', icon: <Users size={18} /> },
        { id: 'influencers', label: 'Find Influencers', icon: <Users size={18} /> },
        { id: 'requirements', label: 'Post Project', icon: <FolderKanban size={18} /> },
        { id: 'applications', label: 'Applications', icon: <UserCheck size={18} /> },
        { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
        { id: 'connections', label: 'My Connections', icon: <Users size={18} /> },
        { id: 'profile', label: 'Profile Settings', icon: <Settings size={18} /> }
      ];
    }
    if (role === 'Freelancer') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'discover', label: 'Browse Jobs', icon: <Search size={18} /> },
        { id: 'projects', label: 'My Projects', icon: <CheckSquare size={18} /> },
        { id: 'portfolio', label: 'Portfolio', icon: <Upload size={18} /> },
        { id: 'analytics', label: 'Earnings', icon: <CreditCard size={18} /> },
        { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
        { id: 'connections', label: 'My Connections', icon: <Users size={18} /> },
        { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> }
      ];
    }
    if (role === 'Influencer') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'campaigns', label: 'Discover Campaigns', icon: <Search size={18} /> },
        { id: 'invitations', label: 'Invitations', icon: <FileText size={18} /> },
        { id: 'mediakit', label: 'Portfolio', icon: <Award size={18} /> },
        { id: 'analytics', label: 'Social Analytics', icon: <BarChart3 size={18} /> },
        { id: 'earnings', label: 'Earnings', icon: <CreditCard size={18} /> },
        { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
        { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
        { id: 'connections', label: 'My Connections', icon: <Users size={18} /> },
        { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> }
      ];
    }
    return [];
  };

  const tabs = currentUser ? getSidebarTabs(currentUser.role) : [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      display: 'flex'
    }}>
      <div 
        onClick={onClose}
        style={{
          flex: 1,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
      />

      <div style={{
        width: '280px',
        background: 'var(--bg-deep)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>Menu Navigation</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <img 
              src={currentUser.profilePhoto || currentUser.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
              alt={currentUser.fullName} 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <h5 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {currentUser.businessName || currentUser.fullName}
              </h5>
              <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase' }}>
                {currentUser.role}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <button 
              onClick={() => { onClose(); onNavigate('onboarding', { loginOnly: true }); }}
              className="btn-primary" 
              style={{ width: '100%', minHeight: '44px', borderRadius: '12px' }}
            >
              Sign In
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {currentUser && tabs.map(tab => {
            const isActive = activeDashboardTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onClose();
                  if (tab.id === 'profile') {
                    onNavigate('profile');
                  } else {
                    setActiveDashboardTab(tab.id);
                    onNavigate('dashboard');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'var(--accent-cyan-glow)' : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-gray-light)',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '13.5px',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {currentUser && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px', marginTop: 'auto' }}>
            <button 
              onClick={() => { onClose(); onLogout(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.04)',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13.5px',
                width: '100%'
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

const AppContent = () => {
  const { 
    currentUser, users, projects, loading, initialized, logoutUser, 
    activeDashboardTab, setActiveDashboardTab, notifications = [], 
    connectionRequests = [], acceptConnectionRequest, sendConnectionRequest, 
    startConversation, isConnected, isBlockedRelation, activeConversationId
  } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const handleLogout = async () => {
    const confirmed = await showConfirmation({
      title: 'Sign Out',
      message: 'Are you sure you want to log out of Creators Hub?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      type: 'warning',
      isDestructive: true
    });
    if (confirmed) {
      logoutUser();
      handleNavigate('landing');
    }
  };

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const timer = setTimeout(() => {
        setShowSkeletons(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSkeletons(false);
    }
  }, [initialized]);

  // Keyboard scroll-into-view helper on mobile screens
  useEffect(() => {
    const handleFocus = (e) => {
      if (window.innerWidth < 768 && e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };
    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  // Redirect logged in users away from guest pages
  useEffect(() => {
    if (initialized && currentUser) {
      const guestPaths = ['/', '/login', '/register'];
      if (guestPaths.includes(location.pathname)) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [initialized, currentUser, location.pathname, navigate]);

  // Determine the active page based on the path
  const { pathname } = location;
  let currentPage = 'landing';
  if (pathname === '/explore') {
    currentPage = 'explore';
  } else if (pathname === '/login') {
    currentPage = 'login';
  } else if (pathname === '/register') {
    currentPage = 'register';
  } else if (pathname === '/dashboard') {
    currentPage = 'dashboard';
  } else if (pathname === '/messages') {
    currentPage = 'messages';
  } else if (pathname === '/profile') {
    currentPage = 'profile';
  }

  // Routing States
  const [navigationParams, setNavigationParams] = useState({});

  // Overlay states (inside dashboard or explore)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(null);

  // Explore page states
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreActiveTab, setExploreActiveTab] = useState('feed');
  const [usersFilter, setUsersFilter] = useState('All');

  const handleNavigate = (page, params = {}) => {
    setActiveWorkspaceId(null);
    setActiveProfileId(null);
    setMobileDrawerOpen(false);
    setMobileNotificationsOpen(false);
    setMobileSearchOpen(false);
    window.scrollTo(0, 0);

    if (page === 'landing') {
      navigate('/');
    } else if (page === 'explore') {
      navigate('/explore');
    } else if (page === 'onboarding') {
      if (params.loginOnly) {
        navigate('/login');
      } else {
        navigate('/register');
      }
    } else if (page === 'dashboard') {
      navigate('/dashboard');
    } else if (page === 'messages') {
      navigate('/messages');
    } else if (page === 'profile') {
      navigate('/profile');
    } else {
      navigate('/');
    }
  };

  const getTabForSection = (section, role) => {
    if (section === 'dashboard') return 'dashboard';
    if (section === 'projects') {
      if (role === 'Business Holder') return 'requirements';
      if (role === 'Influencer') return 'deals';
      return 'projects';
    }
    if (section === 'applications') return 'applications';
    if (section === 'analytics') return 'analytics';
    if (section === 'payments') {
      if (role === 'Influencer') return 'earnings';
      return 'dashboard';
    }
    if (section === 'settings') return 'settings';
    return 'dashboard';
  };

  const handleOpenWorkspace = (projId) => {
    setActiveWorkspaceId(projId);
    setActiveProfileId(null);
  };

  const handleOpenProfile = (userId) => {
    if (isMobile) {
      navigate(`/profile?id=${userId}`);
    } else {
      setActiveProfileId(userId);
      setActiveWorkspaceId(null);
    }
  };

  // Route back to dashboard or active list
  const handleCloseOverlay = () => {
    setActiveWorkspaceId(null);
    setActiveProfileId(null);
  };



  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? '64px' : '0' }}>
      
      {/* Global Particle Background */}
      <Particles />

      {/* Global loading state spinner completely removed for instant layout rendering */}



      {isMobile ? (
        !(activeConversationId && (currentPage === 'messages' || activeDashboardTab === 'messages')) && (
          <MobileHeader 
            onOpenDrawer={() => setMobileDrawerOpen(true)} 
            onOpenNotifications={() => setMobileNotificationsOpen(true)} 
            notificationCount={notifications.filter(n => !n.read).length} 
            currentUser={currentUser} 
            onNavigate={handleNavigate}
          />
        )
      ) : (
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
      )}

      {/* Main Pages router */}
      <main style={{ 
        flex: 1, 
        padding: (isMobile && activeConversationId && (currentPage === 'messages' || activeDashboardTab === 'messages'))
          ? '0' 
          : 'var(--container-padding) var(--container-padding) 0 var(--container-padding)', 
        maxWidth: '1200px', 
        width: '100%', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Routes>
          <Route path="/" element={<Landing onNavigate={handleNavigate} />} />
          <Route path="/login" element={<Onboarding key="login" onNavigate={handleNavigate} initialParams={{ loginOnly: true }} />} />
          <Route path="/register" element={<Onboarding key="register" onNavigate={handleNavigate} initialParams={{ loginOnly: false }} />} />
          <Route path="/explore" element={
            (() => {
              // Get campaigns and users from context
              const openProjects = projects.filter(p => p.status === 'Open');
              
              // Filter creators/roles
              const displayUsers = users.filter(u => u.id !== currentUser?.id && (!isBlockedRelation || !isBlockedRelation(u.id)));
              const freelancers = displayUsers.filter(u => u.role === 'Freelancer');
              const influencers = displayUsers.filter(u => u.role === 'Influencer');
              const businessOwners = displayUsers.filter(u => u.role === 'Business Holder');

              // Helper function to get profession or role display
              const getRoleProfession = (u) => {
                if (u.role === 'Business Holder') return u.businessCategory || 'Business Holder';
                if (u.role === 'Freelancer') return u.experience || (u.services && u.services[0]) || 'Freelancer';
                if (u.role === 'Influencer') return (u.contentCategories && u.contentCategories[0]) || 'Influencer';
                return u.role;
              };

              // Filter recently joined (top 4 sorted by createdAt descending)
              const recentlyJoined = [...displayUsers]
                .sort((a, b) => {
                  const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return timeB - timeA;
                })
                .slice(0, 4);

              // Search query helper
              const q = exploreQuery.toLowerCase().trim();
              
              const matchesQuery = (u) => {
                if (!q) return true;
                return (
                  (u.fullName && u.fullName.toLowerCase().includes(q)) ||
                  (u.username && u.username.toLowerCase().includes(q)) ||
                  (u.businessName && u.businessName.toLowerCase().includes(q)) ||
                  (u.businessCategory && u.businessCategory.toLowerCase().includes(q)) ||
                  (u.location && u.location.toLowerCase().includes(q)) ||
                  (u.experience && u.experience.toLowerCase().includes(q)) ||
                  (u.role && u.role.toLowerCase().includes(q)) ||
                  (u.bio && u.bio.toLowerCase().includes(q)) ||
                  (u.description && u.description.toLowerCase().includes(q)) ||
                  (u.skills && u.skills.some(s => s.toLowerCase().includes(q))) ||
                  (u.services && u.services.some(s => s.toLowerCase().includes(q))) ||
                  (u.contentCategories && u.contentCategories.some(c => c.toLowerCase().includes(q)))
                );
              };

              // Projects matching query
              const filteredProjects = openProjects.filter(p => {
                if (!q) return true;
                return (
                  p.title.toLowerCase().includes(q) ||
                  p.description.toLowerCase().includes(q) ||
                  p.businessName.toLowerCase().includes(q) ||
                  (p.skills && p.skills.some(s => s.toLowerCase().includes(q)))
                );
              });

              // Filtered directories
              const filteredFreelancers = freelancers.filter(matchesQuery);
              const filteredBusinesses = businessOwners.filter(matchesQuery);
              const filteredInfluencers = influencers.filter(matchesQuery);

              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '28px', paddingBottom: '60px' }} className="explore-main-layout">
                  
                  {/* Left Side: Real-Time Feed & Directories */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Feed Header */}
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                      <span className="badge-premium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ecosystem Discovery</span>
                      <h2 style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px' }}>
                        {exploreActiveTab === 'feed' ? 'Ecosystem Feed' : 
                         exploreActiveTab === 'freelancer' ? 'Freelancers Directory' :
                         exploreActiveTab === 'business' ? 'Business Directory' : 'Influencers Directory'}
                      </h2>
                      <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '4px' }}>
                        {exploreActiveTab === 'feed' ? 'Discover active requirements, brand campaigns, and real-time community events.' :
                         exploreActiveTab === 'freelancer' ? 'Find and collaborate with premium vetted developers, designers, and creators.' :
                         exploreActiveTab === 'business' ? 'Explore companies and business entities seeking partnerships.' :
                         'Connect with high-reach influencers to amplify your product and brand.'}
                      </p>
                    </div>

                    {/* Search Input */}
                    <div style={{ display: 'flex', gap: '12px' }} className="feed-search-row">
                      <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                        <input 
                          type="text" 
                          value={exploreQuery}
                          onChange={(e) => setExploreQuery(e.target.value)}
                          onClick={() => {
                            if (isMobile) {
                              setMobileSearchOpen(true);
                            }
                          }}
                          readOnly={isMobile}
                          className="form-input" 
                          placeholder="Search requirements, skills or creators..." 
                          style={{ paddingLeft: '44px', height: '44px', minHeight: '44px' }}
                        />
                      </div>
                    </div>

                    {/* Tabs Selector */}
                    <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'feed', label: 'Ecosystem Feed' },
                        { id: 'users', label: 'View Users' },
                        { id: 'freelancer', label: 'Freelancers' },
                        { id: 'business', label: 'Businesses' },
                        { id: 'influencer', label: 'Influencers' }
                      ].map(tab => {
                        const active = exploreActiveTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setExploreActiveTab(tab.id)}
                            style={{
                              background: active ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                              border: '1px solid ' + (active ? 'var(--accent-cyan)' : 'transparent'),
                              color: active ? 'var(--accent-cyan)' : 'var(--text-gray)',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minHeight: '36px'
                            }}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Conditional content mapping */}
                    {exploreActiveTab === 'feed' && (
                      <>
                        {q ? (
                          /* Categorized Global Search Results */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            {/* Matching Projects */}
                            <div>
                              <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-white)' }}>
                                Requirements & Campaigns ({filteredProjects.length})
                              </h3>
                              {filteredProjects.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>No matching requirements.</div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {filteredProjects.map(proj => (
                                    <div key={proj.id} className="glass-panel" style={{ padding: '16px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-white)' }}>{proj.title}</h4>
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{proj.budget}</span>
                                      </div>
                                      <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '6px' }}>{proj.description}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Matching Freelancers */}
                            <div>
                              <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-white)' }}>
                                Freelancers ({filteredFreelancers.length})
                              </h3>
                              {filteredFreelancers.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>No freelancers found.</div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="explore-search-grid">
                                  {filteredFreelancers.slice(0, 4).map(fl => (
                                    <div key={fl.id} className="glass-panel" style={{ padding: '14px', display: 'flex', gap: '10px' }}>
                                      <img src={fl.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'} alt={fl.fullName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)' }}>{fl.fullName}</h4>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{getRoleProfession(fl)} • {fl.location || 'Global'}</span>
                                        <button onClick={() => handleOpenProfile(fl.id)} className="btn-outline-cyan" style={{ padding: '2px 8px', fontSize: '10px', minHeight: '22px', borderRadius: '4px', marginTop: '8px' }}>View Profile</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Matching Businesses */}
                            <div>
                              <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-white)' }}>
                                Businesses ({filteredBusinesses.length})
                              </h3>
                              {filteredBusinesses.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>No businesses found.</div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="explore-search-grid">
                                  {filteredBusinesses.slice(0, 4).map(biz => (
                                    <div key={biz.id} className="glass-panel" style={{ padding: '14px', display: 'flex', gap: '10px' }}>
                                      <img src={biz.logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&auto=format&fit=crop&q=80'} alt={biz.businessName} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)' }}>{biz.businessName || biz.fullName}</h4>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{getRoleProfession(biz)} • {biz.location || 'Global'}</span>
                                        <button onClick={() => handleOpenProfile(biz.id)} className="btn-outline-cyan" style={{ padding: '2px 8px', fontSize: '10px', minHeight: '22px', borderRadius: '4px', marginTop: '8px' }}>View Profile</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Matching Influencers */}
                            <div>
                              <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-white)' }}>
                                Influencers ({filteredInfluencers.length})
                              </h3>
                              {filteredInfluencers.length === 0 ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>No influencers found.</div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="explore-search-grid">
                                  {filteredInfluencers.slice(0, 4).map(inf => (
                                    <div key={inf.id} className="glass-panel" style={{ padding: '14px', display: 'flex', gap: '10px' }}>
                                      <img src={inf.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={inf.fullName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)' }}>{inf.fullName}</h4>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{getRoleProfession(inf)} • {inf.followersCount || '0'} followers</span>
                                        <button onClick={() => handleOpenProfile(inf.id)} className="btn-outline-cyan" style={{ padding: '2px 8px', fontSize: '10px', minHeight: '22px', borderRadius: '4px', marginTop: '8px' }}>View Profile</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Standard Feed */
                          <>
                            {/* Requirements Feed */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Briefcase size={16} style={{ color: 'var(--accent-cyan)' }} /> Latest Open Requirements
                                </h3>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{openProjects.length} briefs open</span>
                              </div>

                              {openProjects.length === 0 ? (
                                <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                  No open project briefs found.
                                </div>
                              ) : (
                                openProjects.map(proj => {
                                  const biz = users.find(u => u.id === proj.businessId);
                                  return (
                                    <div key={proj.id} className="glass-panel glass-panel-hover" style={{ padding: '20px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                          <img 
                                            src={biz?.logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&auto=format&fit=crop&q=80'} 
                                            alt={proj.businessName} 
                                            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                                          />
                                          <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>{proj.title}</h4>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Posted by: {proj.businessName} • {proj.remoteType || 'Remote'}</span>
                                          </div>
                                        </div>
                                        <span style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{proj.budget}</span>
                                      </div>

                                      <p style={{ fontSize: '12.5px', color: 'var(--text-gray-light)', margin: '12px 0 16px 0', lineHeight: '1.4' }}>
                                        {proj.description}
                                      </p>

                                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {proj.skills && proj.skills.length > 0 ? (
                                          <div style={{ display: 'flex', gap: '4px' }}>
                                            {proj.skills.slice(0, 3).map(s => (
                                              <span key={s} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.02)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-gray)' }}>{s}</span>
                                            ))}
                                          </div>
                                        ) : <span />}
                                        
                                        <button 
                                          onClick={() => {
                                            if (currentUser) {
                                              handleNavigate('dashboard');
                                            } else {
                                              handleNavigate('onboarding');
                                            }
                                          }}
                                          className="btn-primary" 
                                          style={{ padding: '4px 12px', minHeight: '28px', fontSize: '11px', borderRadius: '6px' }}
                                        >
                                          View Details
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Campaign Feed */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} /> Trending Campaigns
                              </h3>
                              
                              {openProjects.length === 0 ? (
                                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                  No campaigns available right now.
                                </div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: openProjects.length === 1 ? '1fr' : '1fr 1fr', gap: '16px' }} className="campaigns-grid-strip">
                                  {openProjects.slice(0, 2).map(proj => (
                                    <div key={proj.id} className="glass-panel animate-scale-up" style={{ padding: '20px', background: 'radial-gradient(ellipse at bottom right, rgba(0, 217, 255, 0.05), transparent 70%)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '10px', background: 'rgba(91, 174, 155, 0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>{proj.category || 'Campaign'}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{proj.businessName}</span>
                                      </div>
                                      <h4 style={{ fontSize: '14.5px', color: 'var(--text-white)', fontWeight: '800', marginTop: '12px' }}>{proj.title}</h4>
                                      <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '6px' }}>{proj.description ? (proj.description.length > 70 ? proj.description.slice(0, 70) + '...' : proj.description) : ''}</p>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{proj.budget}</span>
                                        <button onClick={() => handleNavigate(currentUser ? 'dashboard' : 'onboarding')} className="btn-outline-cyan" style={{ padding: '2px 8px', fontSize: '10.5px', minHeight: '24px', borderRadius: '4px' }}>Apply</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {exploreActiveTab === 'users' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Users Filter Pills Selector */}
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          {[
                            { id: 'All', label: 'All' },
                            { id: 'Freelancers', label: 'Freelancers' },
                            { id: 'Business Holders', label: 'Business Holders' },
                            { id: 'Influencers', label: 'Influencers' },
                            { id: 'Verified Users', label: 'Verified' },
                            { id: 'Recently Joined', label: 'Recently Joined' }
                          ].map(f => {
                            const active = usersFilter === f.id;
                            return (
                              <button
                                key={f.id}
                                onClick={() => setUsersFilter(f.id)}
                                style={{
                                  background: active ? 'rgba(0, 217, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                  border: '1px solid ' + (active ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'),
                                  color: active ? 'var(--accent-cyan)' : 'var(--text-gray-light)',
                                  padding: '6px 12px',
                                  borderRadius: '14px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  minHeight: '28px'
                                }}
                              >
                                {f.label}
                              </button>
                            );
                          })}
                        </div>

                        {(() => {
                          const displayUsers = users
                            .filter(u => u.id !== currentUser?.id)
                            .filter(u => !isBlockedRelation || !isBlockedRelation(u.id))
                            .filter(matchesQuery);

                          let filteredUsers = [...displayUsers];
                          if (usersFilter === 'Freelancers') {
                            filteredUsers = displayUsers.filter(u => u.role === 'Freelancer');
                          } else if (usersFilter === 'Business Holders') {
                            filteredUsers = displayUsers.filter(u => u.role === 'Business Holder');
                          } else if (usersFilter === 'Influencers') {
                            filteredUsers = displayUsers.filter(u => u.role === 'Influencer');
                          } else if (usersFilter === 'Verified Users') {
                            filteredUsers = displayUsers.filter(u => u.verificationStatus && u.verificationStatus !== 'Not Verified' && u.verificationStatus !== 'Unverified');
                          } else if (usersFilter === 'Recently Joined') {
                            filteredUsers = [...displayUsers].sort((a, b) => {
                              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                              return timeB - timeA;
                            });
                          }

                          if (filteredUsers.length === 0) {
                            return (
                              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-gray)' }}>
                                No users found matching the selected filter.
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="explore-directory-grid">
                              {filteredUsers.map(u => {
                                const isConn = isConnected ? isConnected(currentUser?.id, u.id) : false;
                                const pendingReq = (connectionRequests || []).find(r => 
                                  (r.sender_id === currentUser?.id && r.receiver_id === u.id) ||
                                  (r.sender_id === u.id && r.receiver_id === currentUser?.id)
                                );
                                const isSent = pendingReq && pendingReq.sender_id === currentUser?.id;
                                const isRecv = pendingReq && pendingReq.sender_id === u.id;

                                return (
                                  <div key={u.id} className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12.5px' }}>
                                      <img 
                                        src={u.profilePhoto || u.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                                        alt={u.fullName || u.businessName} 
                                        style={{ width: '44px', height: '44px', borderRadius: u.role === 'Business Holder' ? '8px' : '50%', objectFit: 'cover' }} 
                                      />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                          <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {u.fullName || u.businessName}
                                          </h4>
                                          {u.verificationStatus && u.verificationStatus !== 'Not Verified' && u.verificationStatus !== 'Unverified' && (
                                            <Award size={14} style={{ color: 'var(--accent-cyan)' }} />
                                          )}
                                        </div>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{u.location || 'Global'}</span>
                                      </div>
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                      {u.role === 'Business Holder' ? u.businessCategory || 'Business Holder' : 
                                       u.role === 'Freelancer' ? u.experience || 'Professional Freelancer' : 
                                       u.contentCategories && u.contentCategories.length > 0 ? u.contentCategories.join(', ') : 'Influencer'}
                                    </span>
                                    <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '16px', flex: 1 }}>
                                      {u.bio || 'Premium member eager to collaborate in the Creators Hub ecosystem.'}
                                    </p>
                                    
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                      <button 
                                        onClick={() => handleOpenProfile(u.id)} 
                                        className="btn-secondary" 
                                        style={{ padding: '4px 10px', minHeight: '28px', fontSize: '11px', borderRadius: '6px' }}
                                      >
                                        View Profile
                                      </button>
                                      
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        {/* Connect Button */}
                                        {!currentUser ? (
                                          <button 
                                            onClick={() => handleNavigate('onboarding')}
                                            className="btn-outline-cyan" 
                                            style={{ padding: '4px 10px', minHeight: '28px', fontSize: '11px', borderRadius: '6px' }}
                                          >
                                            Connect
                                          </button>
                                        ) : isConn ? (
                                          <button 
                                            disabled
                                            className="btn-secondary" 
                                            style={{ padding: '4px 10px', minHeight: '28px', fontSize: '11px', borderRadius: '6px', opacity: 0.6, cursor: 'default' }}
                                          >
                                            Connected
                                          </button>
                                        ) : isSent ? (
                                          <button 
                                            disabled
                                            className="btn-secondary" 
                                            style={{ padding: '4px 10px', minHeight: '28px', fontSize: '11px', borderRadius: '6px', opacity: 0.8, cursor: 'default' }}
                                          >
                                            Requested
                                          </button>
                                        ) : isRecv ? (
                                          <button 
                                            onClick={() => acceptConnectionRequest(pendingReq.id, u.id)}
                                            className="btn-primary" 
                                            style={{ padding: '4px 10px', minHeight: '28px', fontSize: '11px', borderRadius: '6px', background: '#22c55e', borderColor: '#22c55e' }}
                                          >
                                            Accept
                                          </button>
                                        ) : (
                                          <button 
                                            onClick={() => sendConnectionRequest(u.id)}
                                            className="btn-outline-cyan" 
                                            style={{ padding: '4px 10px', minHeight: '28px', fontSize: '11px', borderRadius: '6px' }}
                                          >
                                            Connect
                                          </button>
                                        )}

                                        {/* Message Button */}
                                        <button 
                                          onClick={() => {
                                            if (currentUser) {
                                              startConversation(u.id);
                                            } else {
                                              handleNavigate('onboarding');
                                            }
                                          }} 
                                          className="btn-primary" 
                                          style={{ padding: '4px 10px', minHeight: '28px', fontSize: '11px', borderRadius: '6px' }}
                                        >
                                          Message
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {exploreActiveTab === 'freelancer' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredFreelancers.length === 0 ? (
                          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-gray)' }}>
                            No freelancers found.
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="explore-directory-grid">
                            {filteredFreelancers.map(fl => (
                              <div key={fl.id} className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12.5px' }}>
                                  <img 
                                    src={fl.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'} 
                                    alt={fl.fullName} 
                                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} 
                                  />
                                  <div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>{fl.fullName}</h4>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{fl.location || 'Global'}</span>
                                  </div>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                  {fl.experience || 'Professional Freelancer'}
                                </span>
                                <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '16px', flex: 1 }}>
                                  {fl.bio || 'Premium developer/creator eager to collaborate on high-growth ecosystem briefs.'}
                                </p>
                                {fl.skills && fl.skills.length > 0 && (
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                    {fl.skills.slice(0, 3).map(s => (
                                      <span key={s} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-gray-light)', border: '1px solid rgba(255,255,255,0.05)' }}>{s}</span>
                                    ))}
                                  </div>
                                )}
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)' }}>{fl.collaborationPricing || 'Contact for pricing'}</span>
                                  <button onClick={() => handleOpenProfile(fl.id)} className="btn-primary" style={{ padding: '4px 12px', minHeight: '28px', fontSize: '11px', borderRadius: '6px' }}>Profile</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {exploreActiveTab === 'business' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredBusinesses.length === 0 ? (
                          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-gray)' }}>
                            No businesses found.
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="explore-directory-grid">
                            {filteredBusinesses.map(biz => (
                              <div key={biz.id} className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12.5px' }}>
                                  <img 
                                    src={biz.logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&auto=format&fit=crop&q=80'} 
                                    alt={biz.businessName} 
                                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} 
                                  />
                                  <div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>{biz.businessName || biz.fullName}</h4>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{biz.location || 'Global'}</span>
                                  </div>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                  {biz.businessCategory || 'Ecosystem Partner'}
                                </span>
                                <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '16px', flex: 1 }}>
                                  {biz.bio || biz.description || 'Verified Business entity hiring creators and developers for new product briefs.'}
                                </p>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Size: {biz.teamSize || '1-10'} employees</span>
                                  <button onClick={() => handleOpenProfile(biz.id)} className="btn-primary" style={{ padding: '4px 12px', minHeight: '28px', fontSize: '11px', borderRadius: '6px' }}>Profile</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {exploreActiveTab === 'influencer' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredInfluencers.length === 0 ? (
                          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-gray)' }}>
                            No influencers found.
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="explore-directory-grid">
                            {filteredInfluencers.map(inf => (
                              <div key={inf.id} className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12.5px' }}>
                                  <img 
                                    src={inf.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                                    alt={inf.fullName} 
                                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} 
                                  />
                                  <div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>{inf.fullName}</h4>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>{inf.location || 'Global'}</span>
                                  </div>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
                                  {inf.contentCategories && inf.contentCategories.length > 0 ? inf.contentCategories.join(', ') : 'Influencer'}
                                </span>
                                <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '16px', flex: 1 }}>
                                  {inf.bio || 'Ecosystem creator open for marketing collaboration briefs and sponsorships.'}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', background: 'rgba(255,255,255,0.01)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '16px' }}>
                                  <div>
                                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Followers</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-white)' }}>{inf.followersCount || '0'}</span>
                                  </div>
                                  <div>
                                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Engagement</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-white)' }}>{inf.engagementRate || '0%'}</span>
                                  </div>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-white)' }}>{inf.collaborationPricing || 'Contact for pricing'}</span>
                                  <button onClick={() => handleOpenProfile(inf.id)} className="btn-primary" style={{ padding: '4px 12px', minHeight: '28px', fontSize: '11px', borderRadius: '6px' }}>Profile</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Right Side: Recently Joined Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    <div className="glass-panel" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Recently Joined</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {recentlyJoined.length === 0 ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>No users joined yet.</span>
                        ) : (
                          recentlyJoined.map(u => (
                            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <img 
                                  src={u.profilePhoto || u.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                                  alt={u.fullName || u.businessName} 
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                                />
                                <div>
                                  <strong style={{ color: 'var(--text-white)', display: 'block', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {u.fullName || u.businessName}
                                  </strong>
                                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {getRoleProfession(u)}
                                  </span>
                                </div>
                              </div>
                              <button onClick={() => handleOpenProfile(u.id)} className="btn-outline-cyan" style={{ padding: '2px 8px', fontSize: '10px', minHeight: '24px', borderRadius: '6px' }}>Profile</button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                  <style>{`
                    @media (max-width: 900px) {
                      .explore-main-layout {
                        grid-template-columns: 1fr !important;
                        gap: 20px !important;
                      }
                      .explore-directory-grid, .explore-search-grid {
                        grid-template-columns: 1fr !important;
                      }
                    }
                  `}</style>
                </div>
              );
            })()
          } />
          <Route path="/messages" element={
            !initialized ? (
              showSkeletons ? <MessagesSkeleton /> : null
            ) : (
              !currentUser ? <RedirectToLogin /> : <MessagingCenter onOpenProfile={handleOpenProfile} />
            )
          } />
          <Route path="/profile" element={
            !initialized ? (
              showSkeletons ? <ProfileSkeleton /> : null
            ) : (
              !currentUser ? <RedirectToLogin /> : <ProfileView userId={currentUser.id} />
            )
          } />
          <Route path="/dashboard" element={
            !initialized ? (
              showSkeletons ? <DashboardSkeleton /> : null
            ) : (
              (() => {
                if (!currentUser) {
                  return <RedirectToLogin />;
                }

                // Render Role-specific Dashboard
                if (currentUser.role === 'Business Holder') {
                  return (
                    <BusinessDashboard 
                      onNavigate={handleNavigate} 
                      onOpenWorkspace={handleOpenWorkspace} 
                      onOpenProfile={handleOpenProfile} 
                    />
                  );
                }
                if (currentUser.role === 'Influencer') {
                  return (
                    <InfluencerDashboard 
                      onNavigate={handleNavigate} 
                      onOpenWorkspace={handleOpenWorkspace} 
                      onOpenProfile={handleOpenProfile}
                    />
                  );
                }
                if (currentUser.role === 'Freelancer') {
                  return (
                    <FreelancerDashboard 
                      onNavigate={handleNavigate} 
                      onOpenWorkspace={handleOpenWorkspace} 
                      onOpenProfile={handleOpenProfile}
                    />
                  );
                }
                return null;
              })()
            )
          } />
        </Routes>
      </main>

      {/* Global Modals / Overlays */}
      {activeProfileId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(10,11,18,0.85)', backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            <ProfileView userId={activeProfileId} onClose={handleCloseOverlay} onNavigate={handleNavigate} />
          </div>
        </div>
      )}
      {activeWorkspaceId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(10,11,18,0.85)', backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <Workspace projectId={activeWorkspaceId} onClose={handleCloseOverlay} />
          </div>
        </div>
      )}
      {/* Persistent Bottom Mobile Navigation Bar */}
      {isMobile && (
        <MobileBottomNav 
          currentPage={currentPage} 
          onNavigate={handleNavigate} 
          currentUser={currentUser} 
        />
      )}

      {/* Global Floating Action Button */}
      {currentUser && 
       currentPage !== 'messages' && 
       !(activeDashboardTab === 'messages' && activeConversationId && isMobile) &&
       !activeProfileId && 
       !activeWorkspaceId && 
       !mobileDrawerOpen && 
       !mobileNotificationsOpen && 
       !mobileSearchOpen && 
       currentPage !== 'login' && 
       currentPage !== 'register' && (
        <FloatingActions 
          role={currentUser.role}
          onAction={(action) => {
            const map = {
              // Business Holder
              'post-requirement':    'requirements',
              'create-campaign':     'requirements',
              'find-freelancers':    'freelancers',
              'find-influencers':    'influencers',
              'active-requirements': 'requirements',
              'draft-requirements':  'requirements',
              // Freelancer
              'upload-portfolio':    'portfolio',
              'add-project':         'portfolio',
              'my-applications':     'projects',
              'find-requirements':   'discover',
              'update-availability': 'profile',
              // Influencer
              'create-campaign-post': 'mediakit',
              'upload-media-kit':     'mediakit',
              'find-campaigns':       'campaigns',
              'my-collaborations':    'dashboard',
              'update-profile':       'profile',
            };
            if (action === 'community-post') {
              navigate('/explore');
              return;
            }
            const tab = map[action];
            if (tab) {
              setActiveDashboardTab(tab);
              navigate('/dashboard');
            }
          }}
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <MobileDrawer 
          isOpen={mobileDrawerOpen} 
          onClose={() => setMobileDrawerOpen(false)} 
          currentUser={currentUser} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
          activeDashboardTab={activeDashboardTab} 
          setActiveDashboardTab={setActiveDashboardTab} 
        />
      )}

      {/* Mobile notifications center */}
      {mobileNotificationsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileNotificationsOpen(false)} />
          <div style={{ position: 'absolute', top: '10%', left: '5%', right: '5%', bottom: '10%', maxWidth: '400px', margin: '0 auto', width: '90%' }}>
            <NotificationCenter open={mobileNotificationsOpen} onClose={() => setMobileNotificationsOpen(false)} />
          </div>
        </div>
      )}

      {/* Fullscreen Search Modal */}
      {mobileSearchOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--bg-deep)',
          zIndex: 3000,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                autoFocus
                value={exploreQuery}
                onChange={(e) => setExploreQuery(e.target.value)}
                className="form-input"
                placeholder="Search requirements, skills or creators..."
                style={{ paddingLeft: '44px', height: '48px', minHeight: '48px', fontSize: '15px' }}
              />
            </div>
            <button 
              onClick={() => setMobileSearchOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Active Filter Results</span>
            <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>
              Type your query above to dynamically filter requirements, campaigns, and featured members instantly on the feed.
            </p>
          </div>
        </div>
      )}
      {/* Global Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
};

export const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

import { useState, useContext, useEffect } from 'react';
import { AppContext, AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Particles } from './components/Particles';
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
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--grad-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          color: '#fff',
          fontSize: '14px'
        }}>
          CH
        </div>
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
        { id: 'profile', label: 'Profile Settings', icon: <Settings size={18} /> },
        { id: 'billing', label: 'Payments', icon: <CreditCard size={18} /> }
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
              onClick={() => { onClose(); onLogout(); onNavigate('landing'); }}
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
  const { currentUser, users, projects, loading, initialized, logoutUser, activeDashboardTab, setActiveDashboardTab, notifications = [] } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useResponsive();

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
      if (role === 'Business Holder') return 'billing';
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
        <MobileHeader 
          onOpenDrawer={() => setMobileDrawerOpen(true)} 
          onOpenNotifications={() => setMobileNotificationsOpen(true)} 
          notificationCount={notifications.filter(n => !n.read).length} 
          currentUser={currentUser} 
          onNavigate={handleNavigate}
        />
      ) : (
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
      )}

      {/* Main Pages router */}
      <main style={{ flex: 1, padding: isMobile ? '16px 12px 0 12px' : '24px 24px 0 24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Landing onNavigate={handleNavigate} />} />
          <Route path="/login" element={<Onboarding key="login" onNavigate={handleNavigate} initialParams={{ loginOnly: true }} />} />
          <Route path="/register" element={<Onboarding key="register" onNavigate={handleNavigate} initialParams={{ loginOnly: false }} />} />
          <Route path="/explore" element={
            (() => {
              // Get campaigns and users from context
              const openProjects = projects.filter(p => p.status === 'Open');
              
              // Filter creators
              const freelancers = users.filter(u => u.role === 'Freelancer');
              const influencers = users.filter(u => u.role === 'Influencer');
              const businessOwners = users.filter(u => u.role === 'Business Holder');
              const verifiedUsers = users.filter(u => u.verificationStatus && u.verificationStatus !== 'Basic Verified');

              // Popular categories
              const popularCategories = [
                { name: 'Website Development', count: 12 },
                { name: 'Video Editing', count: 9 },
                { name: 'Travel Campaign', count: 8 },
                { name: 'UI/UX Design', count: 14 },
                { name: 'Brand Strategy', count: 6 }
              ];

              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '28px', paddingBottom: '60px' }} className="explore-main-layout">
                  
                  {/* Left Side: Real-Time Feed */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Feed Header */}
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                      <span className="badge-premium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Stream</span>
                      <h2 style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px' }}>Ecosystem Feed</h2>
                      <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '4px' }}>Discover active requirements, brand campaigns, and real-time community events.</p>
                    </div>

                    {/* Search and Category Pills */}
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

                    {/* 1. LATEST REQUIREMENTS FEED */}
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

                    {/* 2. TRENDING BRAND CAMPAIGNS */}
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
                            <div key={proj.id} className="glass-panel" style={{ padding: '20px', background: 'radial-gradient(ellipse at bottom right, rgba(0, 217, 255, 0.05), transparent 70%)' }}>
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

                  </div>

                  {/* Right Side: Featured Profiles, Categories, Stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Featured Creators */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Featured Partners</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {influencers.length === 0 && freelancers.length === 0 ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>No partner profiles registered yet.</span>
                        ) : (
                          <>
                            {/* Influencer */}
                            {influencers.slice(0, 2).map(inf => (
                              <div key={inf.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                  <img src={inf.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt={inf.fullName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <div>
                                    <strong style={{ color: 'var(--text-white)' }}>{inf.fullName ? inf.fullName.split(' ')[0] : 'Partner'}</strong>
                                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px' }}>{inf.followersCount || '0 followers'}</span>
                                  </div>
                                </div>
                                <button onClick={() => handleOpenProfile(inf.id)} className="btn-outline-cyan" style={{ padding: '2px 8px', fontSize: '10px', minHeight: '24px', borderRadius: '6px' }}>Profile</button>
                              </div>
                            ))}

                            {/* Freelancer */}
                            {freelancers.slice(0, 2).map(fl => (
                              <div key={fl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                  <img src={fl.profilePhoto || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'} alt={fl.fullName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <div>
                                    <strong style={{ color: 'var(--text-white)' }}>{fl.fullName ? fl.fullName.split(' ')[0] : 'Partner'}</strong>
                                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px' }}>{fl.experience || 'Professional'}</span>
                                  </div>
                                </div>
                                <button onClick={() => handleOpenProfile(fl.id)} className="btn-outline-cyan" style={{ padding: '2px 8px', fontSize: '10px', minHeight: '24px', borderRadius: '6px' }}>Profile</button>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Recently Verified Users */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Recently Verified</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {verifiedUsers.length === 0 ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>No verified members yet.</span>
                        ) : (
                          verifiedUsers.slice(0, 3).map(vu => (
                            <div key={vu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                              <span style={{ color: 'var(--text-gray-light)' }}>{vu.fullName}</span>
                              <span className="badge-premium" style={{ fontSize: '9px', padding: '2px 6px' }}>{vu.verificationStatus}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Popular categories */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>Popular Categories</h3>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {popularCategories.map(cat => (
                          <span key={cat.name} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.02)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-gray)' }}>
                            {cat.name} ({cat.count})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Connections */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Suggested Connections</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {businessOwners.slice(0, 2).map(bo => (
                          <div key={bo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                            <div>
                              <span style={{ color: 'var(--text-white)', fontWeight: '700', display: 'block' }}>{bo.businessName}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{bo.businessCategory} • {bo.location}</span>
                            </div>
                            <button onClick={() => { if (currentUser) { showSuccessToast({ title: '✔ Request Sent', subtitle: 'Connection request has been sent!' }); } else { handleNavigate('onboarding'); } }} className="btn-primary" style={{ padding: '2px 8px', fontSize: '10px', minHeight: '24px', borderRadius: '6px' }}>Connect</button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <style>{`
                    @media (max-width: 900px) {
                      .explore-main-layout {
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
              !currentUser ? <RedirectToLogin /> : <MessagingCenter />
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

      {/* Mobile drawer */}
      {isMobile && (
        <MobileDrawer 
          isOpen={mobileDrawerOpen} 
          onClose={() => setMobileDrawerOpen(false)} 
          currentUser={currentUser} 
          onNavigate={handleNavigate} 
          onLogout={logoutUser} 
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

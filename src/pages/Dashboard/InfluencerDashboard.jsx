import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { MessagingCenter } from './Shared/MessagingCenter';
import { 
  LayoutDashboard, Search, Briefcase, FileText, CheckSquare, 
  Award, MessageSquare, BarChart3, User, Settings, LogOut,
  IndianRupee, Bookmark, X, Plus, Mail, MapPin, Clock, Calendar,
  Send, ArrowRight, ShieldCheck, CreditCard, Star, Users
} from 'lucide-react';
import { MyConnections } from './Shared/MyConnections';
import { useToast } from '../../components/SuccessToast';
import { ApplicationForm } from './Shared/ApplicationForm';
import { NotificationCenter, NotificationBell } from '../../components/NotificationCenter';
import { useResponsive } from '../../hooks/useResponsive';

const BrandIcon = ({ type, size = 16, style = {} }) => {
  const icons = {
    Instagram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
    Youtube: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
      </svg>
    ),
    Linkedin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    ),
    Twitter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
      </svg>
    ),
    Facebook: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    ),
    TikTok: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
      </svg>
    )
  };
  return icons[type] || null;
};

const generateTaskId = () => `t-${Date.now()}`;

export const InfluencerDashboard = ({ onNavigate, onOpenProfile }) => {
  const { isMobile, isTablet } = useResponsive();
  const { 
    currentUser, logoutUser, projects, applyToProject, updateProfile, 
    activityFeed, messages, sendMessage, loading,
    activeTabToRedirect, setActiveTabToRedirect, notifications,
    activeDashboardTab, setActiveDashboardTab, startConversation,
    applications
  } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  const [notifOpen, setNotifOpen] = useState(false);

  const activeTab = activeDashboardTab;
  const setActiveTab = setActiveDashboardTab;
  
  // Left Sidebar Collapsibility State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (activeTabToRedirect === 'messages') {
      setActiveTab('messages');
      setActiveTabToRedirect(null);
    }
  }, [activeTabToRedirect]);

  // Brand Deals state
  const [savedCampaigns, setSavedCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('ch_saved_campaigns');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Pitch Modal States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [daysToComplete, setDaysToComplete] = useState(5);

  // Media Kit Form States
  const [instaFollowers, setInstaFollowers] = useState(currentUser?.platforms?.Instagram?.followers || '');
  const [instaReach, setInstaReach] = useState(currentUser?.platforms?.Instagram?.reach || '');
  const [instaEngage, setInstaEngage] = useState(currentUser?.platforms?.Instagram?.engagement || '');
  const [youtubeSubscribers, setYoutubeSubscribers] = useState(currentUser?.platforms?.YouTube?.followers || '');
  const [youtubeReach, setYoutubeReach] = useState(currentUser?.platforms?.YouTube?.reach || '');
  const [youtubeEngage, setYoutubeEngage] = useState(currentUser?.platforms?.YouTube?.engagement || '');

  // Portfolio Modal States
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portType, setPortType] = useState('Campaign');
  const [portUrl, setPortUrl] = useState('');
  const [portDesc, setPortDesc] = useState('');

  // Active Workspace / Projects View State
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [workspaceChatInput, setWorkspaceChatInput] = useState('');
  const [workspaceTaskInput, setWorkspaceTaskInput] = useState('');

  // Sync Saved Campaigns
  useEffect(() => {
    localStorage.setItem('ch_saved_campaigns', JSON.stringify(savedCampaigns));
  }, [savedCampaigns]);

  const toggleSaveCampaign = (projId) => {
    setSavedCampaigns(prev => {
      const exists = prev.includes(projId);
      if (exists) {
        return prev.filter(id => id !== projId);
      } else {
        return [...prev, projId];
      }
    });
  };

  const handleApplyClick = (projId) => {
    setSelectedProjectId(projId);
    setShowApplyModal(true);
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!coverLetter || !bidPrice) {
      showSuccessToast({ title: '⚠ Missing Fields', subtitle: 'Please fill out proposal pricing and details.' });
      return;
    }

    applyToProject(selectedProjectId, {
      creatorId: currentUser.id,
      creatorName: currentUser.fullName,
      coverLetter,
      pricing: bidPrice,
      daysToComplete: Number(daysToComplete)
    });

    setCoverLetter('');
    setBidPrice('');
    setShowApplyModal(false);
    showSuccessToast({ title: '✔ Application Sent', subtitle: 'Your brand pitch proposal has been submitted!', redirectText: 'Redirecting to deals...' });
    setActiveTab('deals');
  };

  // Update Media Kit Metrics
  const handleSaveMediaKit = (e) => {
    e.preventDefault();
    const updatedPlatforms = {
      Instagram: { url: currentUser.platforms?.Instagram?.url || '', followers: instaFollowers, reach: instaReach, engagement: instaEngage },
      YouTube: { url: currentUser.platforms?.YouTube?.url || '', followers: youtubeSubscribers, reach: youtubeReach, engagement: youtubeEngage }
    };
    updateProfile(currentUser.id, { platforms: updatedPlatforms });
    showSuccessToast({ title: '✔ Media Kit Updated', subtitle: 'Audience metrics have been updated successfully!' });
  };

  // Handle Workspace Chat Send
  const handleSendWorkspaceChat = (projId, text) => {
    if (!text.trim()) return;
    sendMessage(projId, text, currentUser.id, currentUser.fullName);
    setWorkspaceChatInput('');
  };

  // Profile Strength Calculation
  const getProfileCompletion = () => {
    let score = 10;
    if (currentUser.profilePhoto) score += 30;
    if (currentUser.platforms && Object.keys(currentUser.platforms).length > 0) score += 30;
    if (currentUser.contentCategories && currentUser.contentCategories.length > 0) score += 30;
    return score;
  };
  const profileCompletion = getProfileCompletion();

  // Filter Campaigns
  const openCampaigns = projects.filter(p => p.status === 'Open');
  const activeWorkspaces = projects.filter(p => {
    if (p.status !== 'Active Workspace') return false;
    return p.team && p.team.members && Object.values(p.team.members).includes(currentUser.id);
  });

  // Submitted Pitches list
  const sentPitches = [];
  (applications || []).forEach(app => {
    if (app.applicant_id === currentUser.id) {
      const p = projects.find(proj => proj.id === app.project_id);
      if (p) {
        sentPitches.push({
          id: app.id,
          creatorId: app.applicant_id,
          creatorName: currentUser.fullName,
          pricing: app.rate,
          daysToComplete: 7,
          coverLetter: app.pitch,
          projectTitle: p.title,
          projectCategory: p.category,
          projectBudget: p.budget,
          projectDeadline: p.deadline,
          status: app.status || 'Pending'
        });
      }
    }
  });

  // Dynamic Earnings Calculations
  const completedProjects = projects.filter(p => {
    if (p.status !== 'Completed') return false;
    return p.team && p.team.members && Object.values(p.team.members).includes(currentUser?.id);
  });
  
  const totalEarningsAmount = completedProjects.reduce((sum, p) => {
    const numericBudget = parseFloat(p.budget?.replace(/[^0-9.]/g, '')) || 0;
    return sum + numericBudget;
  }, 0);

  const activeCampaignValue = activeWorkspaces.reduce((sum, p) => {
    const numericBudget = parseFloat(p.budget?.replace(/[^0-9.]/g, '')) || 0;
    return sum + numericBudget;
  }, 0);

  const pendingEscrowAmount = activeWorkspaces.reduce((sum, p) => {
    if (p.team && p.team.payments) {
      const pendingForProj = p.team.payments
        .filter(pm => pm.status !== 'Paid')
        .reduce((s, pm) => s + (parseFloat(pm.amount?.replace(/[^0-9.]/g, '')) || 0), 0);
      return sum + pendingForProj;
    }
    return sum;
  }, 0);

  // Dynamic Invitations Calculations
  const invitations = projects.filter(p => p.invitedCreators && p.invitedCreators.includes(currentUser?.id));

  // Add Portfolio Item
  const handlePortfolioSubmit = (e) => {
    e.preventDefault();
    if (!portTitle || !portDesc) {
      showSuccessToast({ title: '⚠ Missing Fields', subtitle: 'Please fill out the required fields.' });
      return;
    }

    const newItem = {
      title: portTitle,
      type: portType,
      url: portUrl,
      description: portDesc
    };

    const currentPortfolio = currentUser.portfolio || [];
    updateProfile(currentUser.id, { portfolio: [...currentPortfolio, newItem] });

    setPortTitle('');
    setPortUrl('');
    setPortDesc('');
    setShowPortfolioModal(false);
    showSuccessToast({ title: '✔ Portfolio Updated', subtitle: 'Your portfolio item has been published!' });
  };

  const getPlatformMetrics = () => {
    const platforms = currentUser?.platforms || {};
    let totalReach = 0;
    let totalEngagement = 0;
    let engagementCount = 0;

    // Instagram
    if (platforms.Instagram) {
      const reachStr = String(platforms.Instagram.reach || '');
      const reach = parseFloat(reachStr.replace(/[^0-9.]/g, '')) || 0;
      const reachMultiplier = reachStr.toLowerCase().includes('m') ? 1000000 : (reachStr.toLowerCase().includes('k') ? 1000 : 1);
      totalReach += reach * reachMultiplier;

      const eng = parseFloat(String(platforms.Instagram.engagement || '').replace(/[^0-9.]/g, '')) || 0;
      if (eng > 0) {
        totalEngagement += eng;
        engagementCount++;
      }
    }

    // YouTube
    if (platforms.YouTube) {
      const reachStr = String(platforms.YouTube.reach || '');
      const reach = parseFloat(reachStr.replace(/[^0-9.]/g, '')) || 0;
      const reachMultiplier = reachStr.toLowerCase().includes('m') ? 1000000 : (reachStr.toLowerCase().includes('k') ? 1000 : 1);
      totalReach += reach * reachMultiplier;

      const eng = parseFloat(String(platforms.YouTube.engagement || '').replace(/[^0-9.]/g, '')) || 0;
      if (eng > 0) {
        totalEngagement += eng;
        engagementCount++;
      }
    }

    const avgEngage = engagementCount > 0 ? (totalEngagement / engagementCount) : 0;
    return {
      avgEngagement: avgEngage,
      totalReach: totalReach
    };
  };

  const { avgEngagement, totalReach } = getPlatformMetrics();

  // Sidebar Links Configuration
  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'campaigns', label: 'Discover Campaigns', icon: <Search size={18} /> },
    { id: 'invitations', label: 'Invitations', icon: <FileText size={18} /> },
    { id: 'mediakit', label: 'Portfolio', icon: <Award size={18} /> },
    { id: 'analytics', label: 'Social Analytics', icon: <BarChart3 size={18} /> },
    { id: 'earnings', label: 'Earnings', icon: <CreditCard size={18} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
    { id: 'connections', label: 'My Connections', icon: <Users size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> }
  ];



  if (!currentUser) return null;

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside 
        className="glass-panel" 
        style={{
          width: sidebarCollapsed ? '78px' : '260px',
          position: 'sticky',
          top: '24px',
          height: 'calc(100vh - 48px)',
          margin: '24px 0 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(16px)'
        }}
        id="desktop-sidebar"
      >
        <div>
          {/* Sidebar Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 20px 8px', borderBottom: '1px solid var(--glass-border)' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                background: logoFailed ? 'var(--grad-primary)' : 'transparent',
                overflow: 'hidden'
              }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {!logoFailed ? (
                <img 
                  src="/creators-hub-logo.png" 
                  alt="CH" 
                  onError={() => setLogoFailed(true)}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain' 
                  }} 
                />
              ) : (
                <span style={{ fontWeight: '800', color: '#000' }}>CH</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>Creators Hub</h4>
                <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Creator studio</span>
              </div>
            )}
          </div>

          {/* Sidebar Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '20px', overflowY: 'auto', maxHeight: '55vh' }}>
            {sidebarTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className="sidebar-tab-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive ? 'var(--accent-cyan-glow)' : 'transparent',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-gray)',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '13.5px',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 0 15px rgba(91, 174, 155, 0.05)' : 'none',
                    borderLeft: isActive ? '2.5px solid var(--accent-cyan)' : '2.5px solid transparent'
                  }}
                >
                  <span style={{ color: isActive ? 'var(--accent-cyan)' : 'inherit' }}>{tab.icon}</span>
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Details */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <img 
              src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
              alt={currentUser.fullName} 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            {!sidebarCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-white)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser.fullName.split(' ')[0]}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Influencer</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => { logoutUser(); onNavigate('landing'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.04)',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* Sticky Dashboard Header */}
        <header 
          className="glass-panel" 
          style={{
            position: 'sticky',
            top: '24px',
            margin: '24px 24px 0 24px',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '20px',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            zIndex: 90
          }}
        >
          {/* Header Left (Title) */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', textTransform: 'capitalize' }}>
              {sidebarTabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>

          {/* Header Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '220px' }} className="header-search-bar">
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="form-input" 
                style={{ height: '36px', minHeight: '36px', paddingLeft: '36px', fontSize: '13px', borderRadius: '10px' }}
              />
            </div>

            {/* Profile Completion Indicator */}
            {profileCompletion < 100 && (
              <div 
                onClick={() => {
                  if (isMobile || isTablet) {
                    onNavigate('profile');
                  } else {
                    setActiveTab('profile');
                  }
                }}
                className="glass-panel"
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: '1px solid rgba(91, 174, 155, 0.25)',
                  background: 'rgba(91, 174, 155, 0.06)'
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '700' }}>Completion: {profileCompletion}%</span>
                <div style={{ width: '40px', height: '6px', background: 'rgba(91, 174, 155, 0.12)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${profileCompletion}%`, height: '100%', background: 'var(--accent-cyan)' }} />
                </div>
              </div>
            )}

            {/* Notification Bell */}
            <NotificationBell onClick={() => setNotifOpen(true)} />


          </div>
        </header>

        {/* Dashboard Main Scrollable Area */}
        <main style={{ padding: 'var(--container-padding)', flex: 1, overflowY: 'auto' }}>
          
          {/* ==================== 1. HOME DASHBOARD VIEW ==================== */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Profile Completion Card */}
              {profileCompletion < 100 && (
                <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(91, 174, 155, 0.25)', background: 'radial-gradient(ellipse at right, rgba(91, 174, 155, 0.08), transparent 70%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--text-white)' }}>Publish your Media Kit</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>Fill in Instagram, YouTube and TikTok metrics to unlock premium campaign matching pools.</p>
                  </div>
                  <button onClick={() => setActiveTab('mediakit')} className="btn-primary" style={{ padding: '8px 18px', minHeight: '36px', borderRadius: '10px', fontSize: '12.5px' }}>
                    Publish Metrics <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Stats overview */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="stats-cards-grid">
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Brand Deals</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{activeWorkspaces.length}</h3>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(126, 197, 180, 0.08)', color: 'var(--accent-cyan-light)', borderRadius: '12px' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Campaign Pitches</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{sentPitches.length}</h3>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Invitations</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{invitations.length}</h3>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Earnings</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>₹{totalEarningsAmount.toLocaleString()}</h3>
                  </div>
                </div>
              </section>

              {/* Main dashboard widgets split */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '24px' }} className="home-dashboard-two-col">
                
                {/* Left side list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Recommended jobs board */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '16.5px', fontWeight: '800' }}>Trending Brand Campaigns</h3>
                      <button onClick={() => setActiveTab('campaigns')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                        View All
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {openCampaigns.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No campaigns available right now.</p>
                      ) : (
                        openCampaigns.slice(0, 3).map(proj => (
                          <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div>
                              <strong style={{ color: 'var(--text-white)', fontSize: '13.5px' }}>{proj.title}</strong>
                              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <span>Budget: {proj.budget}</span>
                                <span>Category: {proj.category}</span>
                              </div>
                            </div>
                            <button onClick={() => handleApplyClick(proj.id)} className="btn-primary" style={{ padding: '6px 14px', minHeight: '32px', borderRadius: '8px', fontSize: '11.5px' }}>
                              Pitch
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Active workspaces brief */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', marginBottom: '20px' }}>Current Brand Workspace</h3>
                    {activeWorkspaces.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        <CheckSquare size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <p style={{ fontSize: '13px' }}>No active collaborations. Pitch proposals to get hired.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeWorkspaces.map(proj => (
                          <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div>
                              <strong style={{ color: 'var(--text-white)', fontSize: '13.5px' }}>{proj.title}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Client: {proj.businessName}</span>
                            </div>
                            <button onClick={() => { setSelectedWorkspaceId(proj.id); setActiveTab('deals'); }} className="btn-outline-cyan" style={{ padding: '6px 14px', minHeight: '32px', borderRadius: '8px', fontSize: '11px' }}>
                              Enter Cell
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right side activity stream / audience stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Media Kit overview */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', marginBottom: '16px' }}>Media Kit Overview</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}><BrandIcon type="Instagram" size={14} /> Instagram Followers</span>
                        <strong style={{ color: 'var(--text-white)' }}>{instaFollowers}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}><BrandIcon type="Youtube" size={14} /> YouTube Subscribers</span>
                        <strong style={{ color: 'var(--text-white)' }}>{youtubeSubscribers}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)' }}><BrandIcon type="Instagram" size={14} /> Avg. Reach</span>
                        <strong style={{ color: 'var(--text-white)' }}>{instaReach}</strong>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('mediakit')} className="btn-secondary" style={{ width: '100%', minHeight: '36px', borderRadius: '10px', marginTop: '16px', fontSize: '12px' }}>
                      Edit Media Kit
                    </button>
                  </div>

                  {/* Activity Feed */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', marginBottom: '20px' }}>Ecosystem Feed</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {activityFeed.length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No recent activities.</p>
                      ) : (
                        activityFeed.slice(0, 4).map(act => (
                          <div key={act.id} style={{ fontSize: '12.5px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', marginTop: '6px' }} />
                            <div>
                              <p style={{ color: 'var(--text-gray-light)', lineHeight: '1.4' }}>{act.text}</p>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{act.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ==================== 2. CAMPAIGNS FEED VIEW ==================== */}
          {activeTab === 'campaigns' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Explore Active Briefs</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Discover campaign packages and collaboration budgets funded in escrow.</p>
              </div>

              {openCampaigns.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Briefcase size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px' }}>No campaigns available.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {openCampaigns.map(proj => {
                    const isSaved = savedCampaigns.includes(proj.id);
                    const hasApplied = applications.some(app => app.project_id === proj.id && app.applicant_id === currentUser.id);

                    return (
                      <div key={proj.id} className="glass-panel glass-panel-hover" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <span className="badge-pro" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{proj.category}</span>
                            <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-white)', marginTop: '8px' }}>{proj.title}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Brand: {proj.businessName}</span>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{proj.budget}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Due: {proj.deadline}</span>
                          </div>
                        </div>

                        <p style={{ fontSize: '13.5px', color: 'var(--text-gray-light)', margin: '14px 0', lineHeight: '1.5' }}>
                          {proj.description}
                        </p>

                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Work Style: <strong>{proj.remoteType || 'Remote'}</strong></span>
                          
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => toggleSaveCampaign(proj.id)}
                              style={{
                                background: 'var(--bg-dark)',
                                border: '1px solid var(--glass-border)',
                                width: '36px', height: '36px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isSaved ? 'var(--accent-cyan)' : 'var(--text-gray)',
                                cursor: 'pointer', transition: 'all 0.2s ease'
                              }}
                            >
                              <Bookmark size={15} fill={isSaved ? 'var(--accent-cyan)' : 'none'} />
                            </button>
                            {hasApplied ? (
                              <button className="btn-secondary" style={{ padding: '6px 18px', minHeight: '36px', borderRadius: '10px', fontSize: '12px', color: '#22c55e', cursor: 'default' }}>
                                Pitch Submitted
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleApplyClick(proj.id)} 
                                className="btn-primary" 
                                style={{ padding: '6px 18px', minHeight: '36px', borderRadius: '10px', fontSize: '12px' }}
                              >
                                Pitch Brand
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== 3. BRAND DEALS WORKSPACES ==================== */}
          {activeTab === 'deals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Campaign Management Cells</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Secure environment for tracking script layouts, content approvals, and escrow releases.</p>
              </div>

              {activeWorkspaces.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <CheckSquare size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
                  <h4 style={{ color: 'var(--text-white)', fontSize: '18px', fontWeight: '800' }}>No active campaigns</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '6px' }}>Submit proposals to campaign briefs to spawn active contract workspaces.</p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13.5px', color: 'var(--text-gray)' }}>Select Active Cell:</span>
                    <select 
                      value={selectedWorkspaceId || ''} 
                      onChange={(e) => setSelectedWorkspaceId(e.target.value)} 
                      className="form-input"
                      style={{ width: '280px', background: 'var(--bg-dark)', height: '40px', minHeight: '40px', padding: '0 12px' }}
                    >
                      <option value="">-- Choose Campaign --</option>
                      {activeWorkspaces.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {selectedWorkspaceId && (
                    (() => {
                      const proj = activeWorkspaces.find(p => p.id === selectedWorkspaceId);
                      if (!proj || !proj.team) return null;
                      const projMessages = messages[proj.id] || [];

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }} className="workspace-main-grid">
                          
                          {/* Workspace Progress */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            
                            {/* Milestones list */}
                            <div className="glass-panel" style={{ padding: '24px' }}>
                              <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={16} style={{ color: 'var(--accent-cyan)' }} /> Campaign Milestones
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {proj.team.milestones?.map(m => (
                                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                                    <div>
                                      <h5 style={{ fontSize: '13.5px', color: 'var(--text-white)', fontWeight: '700' }}>{m.title}</h5>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Due: {m.deadline}</span>
                                    </div>
                                    <span style={{
                                      background: m.status === 'Completed' ? 'rgba(34, 197, 94, 0.08)' : (m.status === 'In Progress' ? 'var(--accent-cyan-glow)' : 'rgba(141, 164, 160, 0.1)'),
                                      color: m.status === 'Completed' ? '#22c55e' : (m.status === 'In Progress' ? 'var(--accent-cyan)' : 'var(--text-muted)'),
                                      padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600'
                                    }}>
                                      {m.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Task Checklist */}
                            <div className="glass-panel" style={{ padding: '24px' }}>
                              <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckSquare size={16} style={{ color: 'var(--accent-cyan)' }} /> Script & Video Tasks Checklist
                              </h4>
                              
                              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                <input 
                                  type="text" 
                                  value={workspaceTaskInput}
                                  onChange={(e) => setWorkspaceTaskInput(e.target.value)}
                                  className="form-input" 
                                  placeholder="Add script milestone item..."
                                  style={{ height: '38px', minHeight: '38px', fontSize: '13px' }}
                                />
                                <button onClick={() => {
                                  if (!workspaceTaskInput.trim()) return;
                                  if (!proj.team.tasks) proj.team.tasks = [];
                                  proj.team.tasks.push({ id: generateTaskId(), title: workspaceTaskInput, completed: false });
                                  sendMessage(proj.id, `📋 Creator added workflow item: "${workspaceTaskInput}"`, 'system', 'Creators Hub AI');
                                  setWorkspaceTaskInput('');
                                }} className="btn-primary" style={{ padding: '0 16px', minHeight: '38px', borderRadius: '12px' }}>
                                  <Plus size={16} />
                                </button>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(proj.team.tasks || []).map(t => (
                                  <div 
                                    key={t.id} 
                                    onClick={() => {
                                      t.completed = !t.completed;
                                      sendMessage(proj.id, `✅ Item ${t.completed ? 'Completed' : 'Reopened'} by Creator: "${t.title}"`, 'system', 'Creators Hub AI');
                                      setSelectedWorkspaceId(proj.id);
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-dark)', borderRadius: '10px', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                  >
                                    <input type="checkbox" checked={t.completed} readOnly style={{ accentColor: 'var(--accent-cyan)' }} />
                                    <span style={{ fontSize: '13px', color: t.completed ? 'var(--text-muted)' : 'var(--text-white)', textDecoration: t.completed ? 'line-through' : 'none' }}>
                                      {t.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Escrow Payments */}
                            <div className="glass-panel" style={{ padding: '24px' }}>
                              <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IndianRupee size={16} style={{ color: 'var(--accent-cyan)' }} /> Escrow Funding Milestones
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {proj.team.payments?.map(p => (
                                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                                    <div>
                                      <h5 style={{ fontSize: '13.5px', color: 'var(--text-white)', fontWeight: '700' }}>{p.title}</h5>
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Value: <strong>{p.amount}</strong></span>
                                    </div>
                                    <span style={{
                                      color: p.status === 'Paid' ? '#22c55e' : '#eab308',
                                      fontSize: '11.5px', fontWeight: '700'
                                    }}>
                                      {p.status === 'Paid' ? 'Paid Out' : 'Escrow Locked'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* Chat Stream */}
                          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '580px', justifyContent: 'space-between' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                              Brand Collaboration Chat
                            </h4>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {projMessages.map((msg, index) => {
                                const isSys = msg.senderId === 'system';
                                return (
                                  <div key={index} style={{
                                    alignSelf: isSys ? 'center' : (msg.senderId === currentUser.id ? 'flex-end' : 'flex-start'),
                                    background: isSys ? 'var(--accent-cyan-glow)' : (msg.senderId === currentUser.id ? 'var(--accent-cyan)' : 'var(--bg-dark)'),
                                    border: '1px solid var(--glass-border)',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    maxWidth: '85%',
                                    fontSize: '12.5px'
                                  }}>
                                    {!isSys && <strong style={{ color: msg.senderId === currentUser.id ? 'rgba(255,255,255,0.9)' : 'var(--accent-cyan)', fontSize: '10.5px', display: 'block', marginBottom: '2px' }}>{msg.senderName}</strong>}
                                    <p style={{ color: isSys ? 'var(--text-gray)' : (msg.senderId === currentUser.id ? '#ffffff' : 'var(--text-white)'), lineHeight: '1.4' }}>{msg.text}</p>
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                              <input 
                                type="text" 
                                value={workspaceChatInput}
                                onChange={(e) => setWorkspaceChatInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendWorkspaceChat(proj.id, workspaceChatInput); }}
                                className="form-input" 
                                placeholder="Message brand cell..." 
                                style={{ height: '38px', minHeight: '38px', fontSize: '13px' }}
                              />
                              <button onClick={() => handleSendWorkspaceChat(proj.id, workspaceChatInput)} className="btn-primary" style={{ padding: '0 14px', minHeight: '38px', borderRadius: '10px' }}>
                                <Send size={14} />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== 4. INVITATIONS VIEW ==================== */}
          {activeTab === 'invitations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Direct Brand Invitations</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Review collaboration requests sent directly to your channels.</p>
              </div>

              {invitations.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Mail size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>No active campaign invitations.</p>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {invitations.map(proj => (
                    <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'var(--text-white)', fontSize: '14px' }}>{proj.businessName}</strong>
                          <span className="badge-premium" style={{ fontSize: '9px' }}>Invitation</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Campaign: {proj.title}</p>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', marginTop: '8px' }}>You have been invited to collaborate on this campaign brief.</p>
                      </div>
                      <button onClick={() => setActiveTab('campaigns')} className="btn-primary" style={{ padding: '6px 14px', minHeight: '32px', borderRadius: '8px', fontSize: '11px' }}>
                        View campaign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 5. MEDIA KIT VIEW ==================== */}
          {activeTab === 'mediakit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Creator Media Kit & Portfolio</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Showcase verified audience metrics and public collaboration highlights.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => showSuccessToast({ title: '✔ Download Ready', subtitle: 'PDF Media Kit has been generated!' })} className="btn-secondary" style={{ minHeight: '40px', borderRadius: '10px', fontSize: '12.5px' }}>
                    Download PDF
                  </button>
                  <button onClick={() => setShowPortfolioModal(true)} className="btn-primary" style={{ minHeight: '40px', borderRadius: '10px' }}>
                    <Plus size={16} /> Add Project
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }} className="mediakit-main-grid">
                
                {/* Metrics Form */}
                <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Edit Audience Metrics</h4>
                  <form onSubmit={handleSaveMediaKit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h5 style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: '700' }}>Instagram Platform</h5>
                    <div>
                      <label className="form-label">Instagram Followers</label>
                      <input type="text" value={instaFollowers} onChange={(e) => setInstaFollowers(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Instagram Reach</label>
                      <input type="text" value={instaReach} onChange={(e) => setInstaReach(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Instagram Engagement</label>
                      <input type="text" value={instaEngage} onChange={(e) => setInstaEngage(e.target.value)} className="form-input" />
                    </div>

                    <h5 style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: '700', marginTop: '10px' }}>YouTube Platform</h5>
                    <div>
                      <label className="form-label">YouTube Subscribers</label>
                      <input type="text" value={youtubeSubscribers} onChange={(e) => setYoutubeSubscribers(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">YouTube Monthly Reach</label>
                      <input type="text" value={youtubeReach} onChange={(e) => setYoutubeReach(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">YouTube Engagement</label>
                      <input type="text" value={youtubeEngage} onChange={(e) => setYoutubeEngage(e.target.value)} className="form-input" />
                    </div>

                    <button type="submit" className="btn-primary" style={{ minHeight: '38px', borderRadius: '10px', fontSize: '12.5px', marginTop: '8px' }}>Save Metrics</button>
                  </form>
                </div>

                {/* Rich Public Card Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Public Media Kit Preview</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="mediakit-preview-grid">
                      <div className="glass-panel" style={{ padding: '16px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><BrandIcon type="Instagram" size={12} /> Instagram</span>
                        <h3 style={{ fontSize: '20px', color: 'var(--text-white)', marginTop: '6px' }}>{instaFollowers || '0'}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-gray)', marginTop: '8px' }}>
                          <span>Reach: {instaReach || '0'}</span>
                          <span>Engage: {instaEngage || '0%'}</span>
                        </div>
                      </div>

                      <div className="glass-panel" style={{ padding: '16px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><BrandIcon type="Youtube" size={12} /> YouTube</span>
                        <h3 style={{ fontSize: '20px', color: 'var(--text-white)', marginTop: '6px' }}>{youtubeSubscribers || '0'}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-gray)', marginTop: '8px' }}>
                          <span>Reach: {youtubeReach || '0'}</span>
                          <span>Engage: {youtubeEngage || '0%'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Fraud audit stats details */}
                    {currentUser.fraudAudit && (
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(34,197,94,0.02)', borderColor: 'rgba(34,197,94,0.2)', marginTop: '20px' }}>
                        <h5 style={{ fontSize: '12.5px', color: '#22c55e', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={14} /> Verified Audience Audit</h5>
                        <p style={{ fontSize: '11px', color: 'var(--text-gray)', marginTop: '6px', lineHeight: '1.4' }}>
                          Audience Authenticity: <strong>{currentUser.fraudAudit.engagementAuthenticity}</strong> | Fake Followers Rate: <strong>{currentUser.fraudAudit.fakeFollowers}</strong>.
                        </p>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* Portfolio Showcase Section */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '28px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-white)' }}>Portfolio</h4>
                  {currentUser.portfolio && currentUser.portfolio.length > 0 && (
                    <button onClick={() => setShowPortfolioModal(true)} className="btn-outline-cyan" style={{ padding: '6px 14px', minHeight: '32px', borderRadius: '8px', fontSize: '12px' }}>
                      <Plus size={14} /> Add Project
                    </button>
                  )}
                </div>

                {(!currentUser.portfolio || currentUser.portfolio.length === 0) ? (
                  <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <Award size={36} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px', color: 'var(--text-gray)', marginTop: '4px' }}>No portfolio uploaded yet.</p>
                    <button onClick={() => setShowPortfolioModal(true)} className="btn-primary" style={{ padding: '8px 18px', minHeight: '36px', borderRadius: '10px', fontSize: '12.5px', marginTop: '16px' }}>
                      Upload Portfolio
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }} className="portfolio-projects-grid">
                    {currentUser.portfolio.map((item, idx) => (
                      <div key={idx} className="glass-panel" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span className="badge-pro" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{item.type || 'Campaign'}</span>
                          <button 
                            onClick={() => {
                              const updated = currentUser.portfolio.filter((_, i) => i !== idx);
                              updateProfile(currentUser.id, { portfolio: updated });
                              showSuccessToast({ title: '✔ Project Removed', subtitle: 'Portfolio project has been removed.' });
                            }} 
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <h5 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-white)', marginTop: '8px' }}>{item.title}</h5>
                        <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '4px', lineHeight: '1.4' }}>{item.description}</p>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)', fontSize: '11.5px', marginTop: '10px', fontWeight: '600' }}>
                            Launch Project <ArrowRight size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==================== 6. CONTENT CALENDAR VIEW ==================== */}
          {activeTab === 'calendar' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Campaign Content Schedule</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }} className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <strong key={d} style={{ fontSize: '12px', color: 'var(--text-muted)', paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>{d}</strong>
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isContentDue = dayNum === 12 || dayNum === 22;
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        minHeight: '70px', 
                        background: 'var(--bg-dark)', 
                        border: '1px solid var(--glass-border)', 
                        borderRadius: '8px', 
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '11.5px', color: 'var(--text-gray)' }}>{dayNum}</span>
                      {isContentDue && (
                        <span style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)', fontSize: '8px', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                          Video Reel Due
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 7. MY CONNECTIONS ==================== */}
          {activeTab === 'connections' && (
            <MyConnections 
              onOpenProfile={onOpenProfile} 
              onStartChat={(userId) => {
                startConversation(userId);
              }}
            />
          )}

          {/* ==================== 7. MESSAGES VIEW ==================== */}
          {activeTab === 'messages' && (
            <MessagingCenter onOpenProfile={onOpenProfile} />
          )}

          {/* ==================== 8. INSIGHTS ANALYTICS VIEW ==================== */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Audience Performance Insights</h3>
              {avgEngagement === 0 && totalReach === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '14px' }}>Analytics will appear after your profile starts receiving visitors.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="analytics-grid">
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Average Engagement</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                      {avgEngagement.toFixed(1)}%
                    </h3>
                  </div>
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Monthly Reach</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-cyan-light)', marginTop: '4px' }}>
                      {totalReach >= 1000000 ? (totalReach / 1000000).toFixed(1) + 'M' : (totalReach >= 1000 ? (totalReach / 1000).toFixed(1) + 'K' : totalReach)}
                    </h3>
                  </div>
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Revenue Completed</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-white)', marginTop: '4px' }}>
                      ₹{totalEarningsAmount.toLocaleString()}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== EARNINGS VIEW ==================== */}
          {activeTab === 'earnings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Earnings Dashboard</h3>
              {totalEarningsAmount === 0 ? (
                <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
                  <IndianRupee size={40} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
                  <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-white)' }}>No Earnings Yet</h4>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-gray)', marginTop: '4px' }}>Complete your first campaign to start earning.</p>
                  <button onClick={() => setActiveTab('campaigns')} className="btn-primary" style={{ padding: '8px 20px', minHeight: '36px', borderRadius: '10px', fontSize: '13px', marginTop: '20px' }}>
                    Browse Opportunities
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="analytics-grid">
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Escrow Payments Pending</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                      ₹{pendingEscrowAmount.toLocaleString()}
                    </h3>
                  </div>
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Active Campaign Value</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-cyan-light)', marginTop: '4px' }}>
                      ₹{activeCampaignValue.toLocaleString()}
                    </h3>
                  </div>
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Total Net Earned</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-white)', marginTop: '4px' }}>
                      ₹{totalEarningsAmount.toLocaleString()}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== CLIENT REVIEWS VIEW ==================== */}
          {activeTab === 'reviews' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Brand Collaboration Reviews</h3>
              {(!currentUser.reviews || currentUser.reviews.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '14px' }}>No reviews yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {currentUser.reviews.map((rev, idx) => (
                    <div key={idx} style={{ padding: '16px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--text-white)', fontSize: '14px' }}>{rev.businessName}</strong>
                        <div style={{ display: 'flex', gap: '2px', color: '#eab308' }}>
                          {Array.from({ length: Math.round(Number(rev.rating || 5)) }).map((_, i) => <Star key={i} size={12} fill="#eab308" stroke="#eab308" />)}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '8px', lineHeight: '1.4' }}>"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 9. CREATOR PROFILE VIEW ==================== */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Cover Banner */}
              <div className="glass-panel" style={{ overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <div style={{ height: '180px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(0, 217, 255, 0.02))', position: 'relative' }}>
                  <img 
                    src={currentUser.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'} 
                    alt="cover" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="badge-premium" style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    {currentUser.verificationStatus}
                  </span>
                </div>

                <div style={{ padding: '24px', position: 'relative', marginTop: '-44px', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <img 
                    src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                    alt={currentUser.fullName}
                    style={{ width: '84px', height: '84px', borderRadius: '50%', border: '3px solid var(--bg-dark)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-white)' }}>{currentUser.fullName}</h3>
                    <div style={{ display: 'flex', gap: '14px', color: 'var(--text-gray)', fontSize: '13px', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {currentUser.location || 'Los Angeles, CA'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BrandIcon type="Instagram" size={13} /> {currentUser.followersCount || '450K followers'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Update Bio & Categories</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    updateProfile(currentUser.id, {
                      fullName: e.target.fullName.value,
                      location: e.target.location.value,
                      collaborationPricing: e.target.price.value,
                      bio: e.target.bio.value,
                      contentCategories: e.target.cats.value ? e.target.cats.value.split(',').map(s => s.trim()) : []
                    });
                    showSuccessToast({ title: '✔ Profile Updated Successfully', subtitle: 'Your latest changes have been saved.', redirectText: 'Redirecting to your dashboard...' });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label className="form-label">Full Name</label>
                      <input type="text" name="fullName" defaultValue={currentUser.fullName || ''} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Location</label>
                      <input type="text" name="location" defaultValue={currentUser.location || ''} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Pricing Rate</label>
                      <input type="text" name="price" defaultValue={currentUser.collaborationPricing || ''} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Focus Focus Categories (Comma separated)</label>
                      <input type="text" name="cats" defaultValue={currentUser.contentCategories ? currentUser.contentCategories.join(', ') : ''} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Creator Bio</label>
                      <textarea name="bio" rows={3} defaultValue={currentUser.bio || ''} className="form-input" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', minHeight: '38px', borderRadius: '10px' }}>Save Profile</button>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* ==================== 10. SETTINGS VIEW ==================== */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Creator Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span>Synchronize Social Media Feed Posts Automatically</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-cyan)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <span>Visible to Certified Businesses</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-cyan)' }} />
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Privacy Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: '600' }}>Platform Links Visibility</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Control who can see your platform and social media links (Instagram, YouTube, etc.) on your profile.</span>
                    </div>
                    <select 
                      value={currentUser.socialLinksVisibility || 'Private'} 
                      onChange={(e) => updateProfile(currentUser.id, { socialLinksVisibility: e.target.value })}
                      className="form-input"
                      style={{ width: '180px', height: '38px', minHeight: '38px', background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-white)', padding: '0 8px' }}
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ==================== APPLY PITCH MODAL ==================== */}
      {showApplyModal && selectedProjectId && (
        <ApplicationForm 
          project={projects.find(p => p.id === selectedProjectId)} 
          onClose={() => { setShowApplyModal(false); setSelectedProjectId(''); }}
        />
      )}

      {/* Slide-in Notifications Center */}
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* ==================== PORTFOLIO MODAL ==================== */}
      {showPortfolioModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel animate-scale-up" style={{ width: '92%', maxWidth: '500px', padding: '32px', background: '#070c17', border: '1px solid rgba(0,217,255,0.15)', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Add Portfolio Item</h3>
              <button onClick={() => setShowPortfolioModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePortfolioSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Project Title*</label>
                <input 
                  type="text" 
                  value={portTitle} 
                  onChange={(e) => setPortTitle(e.target.value)} 
                  className="form-input" 
                  placeholder="E.g. Summer Skincare Campaign Reel" 
                  required 
                />
              </div>

              <div>
                <label className="form-label">Project Type*</label>
                <select 
                  value={portType} 
                  onChange={(e) => setPortType(e.target.value)} 
                  className="form-input"
                  style={{ height: '40px', minHeight: '40px', padding: '0 12px' }}
                >
                  <option value="Campaign">Campaign</option>
                  <option value="YouTube Video">YouTube Video</option>
                  <option value="Instagram Reel">Instagram Reel</option>
                  <option value="TikTok Showcase">TikTok Showcase</option>
                  <option value="Brand Deal">Brand Deal</option>
                </select>
              </div>

              <div>
                <label className="form-label">Project URL (Optional)</label>
                <input 
                  type="url" 
                  value={portUrl} 
                  onChange={(e) => setPortUrl(e.target.value)} 
                  className="form-input" 
                  placeholder="https://instagram.com/p/..." 
                />
              </div>

              <div>
                <label className="form-label">Description / Results*</label>
                <textarea 
                  value={portDesc} 
                  onChange={(e) => setPortDesc(e.target.value)} 
                  className="form-input" 
                  rows={4} 
                  placeholder="Describe your role, organic reach, views generated, engagement rate, or brand satisfaction..." 
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Upload Portfolio</button>
            </form>
          </div>
        </div>
      )}

      {/* Persistent Bottom Mobile Navigation Bar */}
      <nav 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(255, 255, 255, 0.96)',
          borderTop: '1px solid var(--glass-border)',
          display: 'none',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1001,
          backdropFilter: 'blur(12px)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
        id="mobile-nav-bar"
      >
        {[
          { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={18} /> },
          { id: 'campaigns', label: 'Briefs', icon: <Search size={18} /> },
          { id: 'deals', label: 'Deals', icon: <CheckSquare size={18} /> },
          { id: 'messages', label: 'Chats', icon: <MessageSquare size={18} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-gray)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '10.5px',
              fontWeight: '700',
              cursor: 'pointer',
              flex: 1,
              height: '100%'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Styled Responsive Queries */}
      <style>{`
        @media (max-width: 992px) {
          #desktop-sidebar {
            display: none !important;
          }
          #mobile-drawer-toggle {
            display: block !important;
          }
          #mobile-nav-bar {
            display: flex !important;
          }
          .header-search-bar {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .stats-cards-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .home-dashboard-two-col {
            grid-template-columns: 1fr !important;
          }
          .mediakit-main-grid {
            grid-template-columns: 1fr !important;
          }
          .mediakit-preview-grid {
            grid-template-columns: 1fr !important;
          }
          .workspace-main-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-edit-two-col {
            grid-template-columns: 1fr !important;
          }
          .analytics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default InfluencerDashboard;

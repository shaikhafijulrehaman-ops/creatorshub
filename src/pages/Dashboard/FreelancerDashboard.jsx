import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { MessagingCenter } from './Shared/MessagingCenter';
import { 
  LayoutDashboard, Search, Briefcase, FileText, CheckSquare, 
  Award, MessageSquare, Star, BarChart3, User, Settings, LogOut,
  SlidersHorizontal, IndianRupee, Bookmark, Upload, X, Plus, 
  MapPin, Clock, ArrowRight, Send, ExternalLink, CreditCard, Users,
  ChevronDown
} from 'lucide-react';
import { MyConnections } from './Shared/MyConnections';
import { FreelancerProfile } from './Freelancer/FreelancerProfile';
import { useToast } from '../../components/SuccessToast';
import { ApplicationForm } from './Shared/ApplicationForm';
import { NotificationCenter, NotificationBell } from '../../components/NotificationCenter';
import { useResponsive } from '../../hooks/useResponsive';
import { BlockedProfilesList } from '../../components/BlockedProfilesList';

const generateTaskId = () => `t-${Date.now()}`;

export const FreelancerDashboard = ({ onNavigate, onOpenProfile }) => {
  const { isMobile, isTablet } = useResponsive();
  const { 
    currentUser, logoutUser, projects, applyToProject, updateProfile, 
    users, activityFeed, messages, sendMessage, loading,
    activeTabToRedirect, setActiveTabToRedirect, notifications,
    activeDashboardTab, setActiveDashboardTab, startConversation,
    applications, isBlockedRelation, showConfirmation
  } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  const [notifOpen, setNotifOpen] = useState(false);

  const activeTab = activeDashboardTab;
  const setActiveTab = setActiveDashboardTab;
  
  // Left Sidebar Collapsibility State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      onNavigate('landing');
    }
  };
  const [logoFailed, setLogoFailed] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(0);

  useEffect(() => {
    if (activeTabToRedirect) {
      setActiveTab(activeTabToRedirect);
      setActiveTabToRedirect(null);
    }
  }, [activeTabToRedirect]);

  // Saved Projects (Bookmarks) State
  const [savedProjects, setSavedProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('ch_saved_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Proposal Form State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [daysToComplete, setDaysToComplete] = useState(7);

  // Filters State for Discover Work
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All'); // All, <1k, 1k-3k, >3k
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('Newest');

  // Portfolio addition form state
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portType, setPortType] = useState('Link'); // Link, Image, Video
  const [portUrl, setPortUrl] = useState('');
  const [portDesc, setPortDesc] = useState('');

  // Certificates State
  const [certTitle, setCertTitle] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certYear, setCertYear] = useState('');

  // Active Workspace / Projects View State
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [workspaceChatInput, setWorkspaceChatInput] = useState('');
  const [workspaceTaskInput, setWorkspaceTaskInput] = useState('');

  // Sync Saved Projects
  useEffect(() => {
    localStorage.setItem('ch_saved_projects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  const toggleSaveProject = (projId) => {
    setSavedProjects(prev => {
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
      showSuccessToast({ title: '⚠ Missing Fields', subtitle: 'Please fill out cover letter and bid price.' });
      return;
    }

    applyToProject(selectedProjectId, {
      creatorId: currentUser.id,
      creatorName: currentUser.fullName,
      coverLetter,
      pricing: bidPrice,
      daysToComplete: Number(daysToComplete)
    });

    // Reset and close
    setCoverLetter('');
    setBidPrice('');
    setShowApplyModal(false);
    showSuccessToast({ title: '✔ Application Sent', subtitle: 'Your pitch has been submitted successfully!', redirectText: 'Redirecting to applications...' });
    setActiveTab('applications');
  };

  // Add Portfolio Item
  const handleAddPortfolioItem = (e) => {
    e.preventDefault();
    if (!portTitle || !portUrl) {
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

  // Add Certificate Item
  const handleAddCertificate = (e) => {
    e.preventDefault();
    if (!certTitle || !certOrg) {
      showSuccessToast({ title: '⚠ Missing Fields', subtitle: 'Please fill out the certificate fields.' });
      return;
    }

    const newItem = {
      title: certTitle,
      authority: certOrg,
      year: certYear || '2026'
    };

    const currentCerts = currentUser.certificates || [];
    updateProfile(currentUser.id, { certificates: [...currentCerts, newItem] });

    setCertTitle('');
    setCertOrg('');
    setCertYear('');
    showSuccessToast({ title: '✔ Certificate Added', subtitle: 'Your certificate has been added successfully!' });
  };

  // Handle Workspace Chat Send
  const handleSendWorkspaceChat = (projId, text) => {
    if (!text.trim()) return;
    sendMessage(projId, text, currentUser.id, currentUser.fullName);
    setWorkspaceChatInput('');
  };

  const getProfileCompletion = () => {
    let score = 10;
    if (currentUser.profilePhoto) score += 30;
    if (currentUser.skills && currentUser.skills.length > 0) score += 30;
    if (currentUser.portfolio && currentUser.portfolio.length > 0) score += 30;
    return score;
  };
  const profileCompletion = getProfileCompletion();

  // Filter Projects
  const openProjects = projects.filter(p => p.status === 'Open');
  const activeWorkspaces = projects.filter(p => {
    if (p.status !== 'Active Workspace') return false;
    return p.team && p.team.members && Object.values(p.team.members).includes(currentUser.id);
  });

  const filteredProjects = openProjects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.skills && p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    
    let matchesBudget = true;
    if (budgetFilter === '<1k') {
      matchesBudget = parseFloat(p.budget.replace(/[^0-9.]/g, '')) < 1000;
    } else if (budgetFilter === '1k-3k') {
      const amt = parseFloat(p.budget.replace(/[^0-9.]/g, ''));
      matchesBudget = amt >= 1000 && amt <= 3000;
    } else if (budgetFilter === '>3k') {
      matchesBudget = parseFloat(p.budget.replace(/[^0-9.]/g, '')) > 3000;
    }

    let matchesVerified = true;
    if (verifiedOnly) {
      const biz = users.find(u => u.id === p.businessId);
      matchesVerified = biz?.verificationStatus && biz.verificationStatus !== 'Basic Verified';
    }

    return matchesSearch && matchesCategory && matchesBudget && matchesVerified;
  }).sort((a, b) => {
    if (sortOrder === 'Newest') return new Date(b.createdAt || '') - new Date(a.createdAt || '');
    if (sortOrder === 'Budget: High-Low') {
      const amtA = parseFloat(a.budget.replace(/[^0-9.]/g, '')) || 0;
      const amtB = parseFloat(b.budget.replace(/[^0-9.]/g, '')) || 0;
      return amtB - amtA;
    }
    return 0;
  });

  // Recommended Jobs based on freelancer focus area services
  const recommendedJobs = openProjects.filter(p => 
    currentUser.services && currentUser.services.includes(p.category)
  );

  // Sent Applications list from applications table
  const sentApplications = [];
  (applications || []).forEach(app => {
    if (app.applicant_id === currentUser.id) {
      const p = projects.find(proj => proj.id === app.project_id);
      if (p) {
        sentApplications.push({
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

  // Sidebar Links Configuration
  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'discover', label: 'Browse Jobs', icon: <Search size={18} /> },
    { id: 'projects', label: 'My Projects', icon: <CheckSquare size={18} /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Upload size={18} /> },
    { id: 'analytics', label: 'Earnings', icon: <CreditCard size={18} /> },
    { id: 'connections', label: 'My Connections', icon: <Users size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> }
  ];

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
                width: '44px', 
                height: '44px', 
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
                <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Freelancer space</span>
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
                  {currentUser.fullName}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Freelancer</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
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
                placeholder="Search contracts..." 
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
          {((isMobile || isTablet) && (activeTab === 'dashboard' || activeTab === 'profile')) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span className="badge-premium" style={{ textTransform: 'uppercase' }}>Workspace controls</span>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>Freelancer Portal</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '13px', marginTop: '2px' }}>Manage all aspects of your freelancer profile, projects, and connections below.</p>
              </div>

              {activeTab === 'dashboard' && (
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '6px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '8px' }}>
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Contracts</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{activeWorkspaces.length}</h4>
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '6px', background: 'rgba(126, 197, 180, 0.08)', color: 'var(--accent-cyan-light)', borderRadius: '8px' }}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Submitted Bids</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{sentApplications.length}</h4>
                    </div>
                  </div>
                </section>
              )}

              {[
                { title: 'Freelancer Information', component: <FreelancerProfile section="info" /> },
                { title: 'Contact Information', component: <FreelancerProfile section="contact" /> },
                { title: 'My Connections', component: <MyConnections onOpenProfile={onOpenProfile} onStartChat={(userId) => { startConversation(userId); setActiveTab('messages'); }} /> },
                { title: 'Blocked Profiles', component: <BlockedProfilesList /> }
              ].map((acc, index) => {
                const isOpen = expandedAccordion === index;
                return (
                  <div key={index} className="glass-panel" style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid ' + (isOpen ? 'var(--accent-cyan)' : 'var(--glass-border)'), background: 'rgba(255,255,255,0.01)', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedAccordion(expandedAccordion === index ? null : index)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: isOpen ? 'rgba(255,255,255,0.02)' : 'none',
                        border: 'none',
                        color: 'var(--text-white)',
                        fontWeight: '700',
                        fontSize: '14px',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{index + 1}. {acc.title}</span>
                      <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-muted)' }} />
                    </button>
                    {isOpen && (
                      <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)' }}>
                        {acc.component}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Profile strength check card */}
              {profileCompletion < 100 && (
                <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(91, 174, 155, 0.25)', background: 'radial-gradient(ellipse at right, rgba(91, 174, 155, 0.08), transparent 70%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--text-white)' }}>Build your Portfolio Space</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>Add services, previous work links, and verify your ID to boost match compatibility scores by up to 4x.</p>
                  </div>
                  <button onClick={() => setActiveTab('portfolio')} className="btn-primary" style={{ padding: '8px 18px', minHeight: '36px', borderRadius: '10px', fontSize: '12.5px' }}>
                    Publish Projects <ArrowRight size={14} />
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
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Active Contracts</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{activeWorkspaces.length}</h3>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(126, 197, 180, 0.08)', color: 'var(--accent-cyan-light)', borderRadius: '12px' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Submitted Bids</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{sentApplications.length}</h3>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                    <Bookmark size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Saved Jobs</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{savedProjects.length}</h3>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Total Earnings</span>
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
                      <h3 style={{ fontSize: '16.5px', fontWeight: '800' }}>Recommended Contracts</h3>
                      <button onClick={() => setActiveTab('discover')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                        View All
                      </button>
                    </div>

                    {recommendedJobs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        <SlidersHorizontal size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <p style={{ fontSize: '13px' }}>No contracts match your focus areas.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recommendedJobs.slice(0, 3).map(proj => (
                          <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div>
                              <strong style={{ color: 'var(--text-white)', fontSize: '13.5px' }}>{proj.title}</strong>
                              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <span>Budget: {proj.budget}</span>
                                <span>Category: {proj.category}</span>
                              </div>
                            </div>
                            <button onClick={() => handleApplyClick(proj.id)} className="btn-primary" style={{ padding: '6px 14px', minHeight: '32px', borderRadius: '8px', fontSize: '11.5px' }}>
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active workspaces brief */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', marginBottom: '20px' }}>Current Workspaces</h3>
                    {activeWorkspaces.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        <CheckSquare size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <p style={{ fontSize: '13px' }}>No active collaboration workspaces.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeWorkspaces.map(proj => (
                          <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div>
                              <strong style={{ color: 'var(--text-white)', fontSize: '13.5px' }}>{proj.title}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Client: {proj.businessName}</span>
                            </div>
                            <button onClick={() => { setSelectedWorkspaceId(proj.id); setActiveTab('projects'); }} className="btn-outline-cyan" style={{ padding: '6px 14px', minHeight: '32px', borderRadius: '8px', fontSize: '11px' }}>
                              Enter Cell
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right side activity stream / calendar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Saved Jobs summary */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', marginBottom: '16px' }}>Saved Jobs</h3>
                    {savedProjects.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Bookmark briefs in the feed to save them here.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {savedProjects.map(id => {
                          const p = projects.find(item => item.id === id);
                          if (!p) return null;
                          return (
                            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                              <div>
                                <span style={{ color: 'var(--text-white)', fontWeight: '700' }}>{p.title}</span>
                                <span style={{ display: 'block', color: 'var(--accent-cyan)', fontSize: '11px', marginTop: '2px' }}>{p.budget}</span>
                              </div>
                              <button onClick={() => handleApplyClick(id)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '10.5px', minHeight: '26px', borderRadius: '6px' }}>Apply</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Activity Feed */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', marginBottom: '20px' }}>Ecosystem Feed</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {activityFeed.slice(0, 4).map(act => (
                        <div key={act.id} style={{ fontSize: '12.5px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', marginTop: '6px' }} />
                          <div>
                            <p style={{ color: 'var(--text-gray-light)', lineHeight: '1.4' }}>{act.text}</p>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{act.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ==================== 2. DISCOVER WORK FEED VIEW ==================== */}
          {activeTab === 'discover' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Browse Active Contracts</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Discover open requirements and secure payments in escrow.</p>
              </div>

              {/* Advanced filter interface */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px' }} className="discover-filters-main-row">
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-input" 
                      placeholder="Search jobs by title, description or skills..." 
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>

                  <select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)} 
                    className="form-input" 
                    style={{ width: '180px', background: 'var(--bg-dark)' }}
                  >
                    <option value="All">All Categories</option>
                    <option value="Website Development">Website Dev</option>
                    <option value="App Development">App Dev</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '11.5px', marginBottom: '4px' }}>Budget Range</label>
                      <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} className="form-input" style={{ width: '130px', height: '36px', minHeight: '36px', padding: '0 8px', background: 'var(--bg-dark)', fontSize: '12px' }}>
                        <option value="All">Any Budget</option>
                        <option value="<1k">&lt; ₹1,000</option>
                        <option value="1k-3k">₹1,000 - ₹3,000</option>
                        <option value=">3k">&gt; ₹3,000</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                      <input 
                        type="checkbox" 
                        id="verifiedCheck"
                        checked={verifiedOnly} 
                        onChange={(e) => setVerifiedOnly(e.target.checked)} 
                        style={{ accentColor: 'var(--accent-cyan)', marginRight: '8px' }} 
                      />
                      <label htmlFor="verifiedCheck" style={{ fontSize: '12.5px', cursor: 'pointer', userSelect: 'none' }}>Verified Businesses Only</label>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '11.5px', marginBottom: '4px' }}>Sort By</label>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="form-input" style={{ width: '150px', height: '36px', minHeight: '36px', padding: '0 8px', background: 'var(--bg-dark)', fontSize: '12px' }}>
                      <option value="Newest">Newest Listed</option>
                      <option value="Budget: High-Low">Highest Budget</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Feed Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredProjects.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
                    <Search size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-gray)' }}>No active briefs discovered matching your filters.</p>
                  </div>
                ) : (
                  filteredProjects.map(proj => {
                    const isSaved = savedProjects.includes(proj.id);
                    return (
                      <div key={proj.id} className="glass-panel glass-panel-hover" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <span className="badge-pro" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{proj.category}</span>
                            <h4 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-white)', marginTop: '8px' }}>{proj.title}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Client: {proj.businessName}</span>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{proj.budget}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Due: {proj.deadline}</span>
                          </div>
                        </div>

                        <p style={{ fontSize: '13.5px', color: 'var(--text-gray-light)', margin: '14px 0', lineHeight: '1.5' }}>
                          {proj.description}
                        </p>

                        {/* Skills needed tags */}
                        {proj.skills && proj.skills.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {proj.skills.map(s => (
                              <span key={s} style={{ fontSize: '11px', background: 'var(--bg-dark)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-gray)', border: '1px solid var(--glass-border)' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Work Type: <strong>{proj.remoteType || 'Remote'}</strong></span>
                          
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => toggleSaveProject(proj.id)}
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
                            <button 
                              onClick={() => handleApplyClick(proj.id)} 
                              className="btn-primary" 
                              style={{ padding: '6px 18px', minHeight: '36px', borderRadius: '10px', fontSize: '12px' }}
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ==================== 3. APPLICATIONS TRACKER VIEW ==================== */}
          {activeTab === 'applications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>My Submitted Proposals</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Check evaluation updates for pitches submitted to business leaders.</p>
              </div>

              {sentApplications.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <FileText size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
                  <h4 style={{ color: 'var(--text-white)', fontSize: '18px', fontWeight: '800' }}>No active proposals</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '6px', maxWidth: '380px', margin: '6px auto' }}>
                    Submit pitches to campaign briefs in the Discover feed to start pitching your professional developer/designer services.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sentApplications.map((app, index) => (
                    <div key={index} className="glass-panel" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <span className="badge-pro" style={{ fontSize: '9px' }}>{app.projectCategory}</span>
                          <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-white)', marginTop: '6px' }}>{app.projectTitle}</h4>
                        </div>
                        <span style={{
                          background: app.status === 'Hired' ? 'rgba(34,197,94,0.08)' : 'var(--bg-dark)',
                          color: app.status === 'Hired' ? '#22c55e' : 'var(--text-gray)',
                          padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700'
                        }}>
                          {app.status === 'Hired' ? 'Selected' : app.status}
                        </span>
                      </div>

                      <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', marginTop: '10px', fontStyle: 'italic' }}>
                        Your Cover Letter: "{app.coverLetter}"
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '12px', marginTop: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pitch Bid: <strong>{app.pricing}</strong></span>
                        {app.status === 'Hired' && (
                          <button onClick={() => setActiveTab('projects')} className="btn-primary" style={{ padding: '6px 14px', minHeight: '32px', borderRadius: '8px', fontSize: '11px' }}>
                            Enter Workspace
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 4. ACTIVE CONTRACTS WORKSPACES ==================== */}
          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Developer Workspaces</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Secure environment for tracking milestones, task sprints, escrow releases, and code briefings.</p>
              </div>

              {activeWorkspaces.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <CheckSquare size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
                  <h4 style={{ color: 'var(--text-white)', fontSize: '17px', fontWeight: '800' }}>No active projects.</h4>
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
                      <option value="">-- Choose Workspace --</option>
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
                                <CheckSquare size={16} style={{ color: 'var(--accent-cyan)' }} /> Sprint Tasks Checklist
                              </h4>
                              
                              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                <input 
                                  type="text" 
                                  value={workspaceTaskInput}
                                  onChange={(e) => setWorkspaceTaskInput(e.target.value)}
                                  className="form-input" 
                                  placeholder="Add team task item..."
                                  style={{ height: '38px', minHeight: '38px', fontSize: '13px' }}
                                />
                                <button onClick={() => {
                                  if (!workspaceTaskInput.trim()) return;
                                  if (!proj.team.tasks) proj.team.tasks = [];
                                  proj.team.tasks.push({ id: generateTaskId(), title: workspaceTaskInput, completed: false });
                                  sendMessage(proj.id, `📋 Freelancer added task: "${workspaceTaskInput}"`, 'system', 'Creators Hub AI');
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
                                      sendMessage(proj.id, `✅ Task ${t.completed ? 'Completed' : 'Reopened'} by Talent: "${t.title}"`, 'system', 'Creators Hub AI');
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
                              Workspace Chat Node
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
                                placeholder="Message client cell..." 
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

          {/* ==================== 5. PORTFOLIO PROJECTS VIEW ==================== */}
          {activeTab === 'portfolio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Portfolio Workspace</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Manage public design books, code links, and website showcases.</p>
                </div>
                <button onClick={() => setShowPortfolioModal(true)} className="btn-primary" style={{ minHeight: '40px', borderRadius: '10px' }}>
                  <Plus size={16} /> Add Project
                </button>
              </div>

              {/* Portfolio Grid */}
              {(!currentUser.portfolio || currentUser.portfolio.length === 0) ? (
                <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
                  <Upload size={40} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-white)' }}>No portfolio uploaded yet.</h3>
                  <button onClick={() => setShowPortfolioModal(true)} className="btn-primary" style={{ padding: '8px 20px', minHeight: '36px', borderRadius: '10px', fontSize: '13px', marginTop: '20px' }}>
                    Upload Portfolio
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }} className="portfolio-projects-grid">
                  {currentUser.portfolio.map((item, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className="badge-pro" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{item.type || 'Link'}</span>
                        <button 
                          onClick={() => {
                            const updated = currentUser.portfolio.filter((_, i) => i !== idx);
                            updateProfile(currentUser.id, { portfolio: updated });
                            showSuccessToast({ title: '✔ Project Removed', subtitle: 'Portfolio project has been removed.' });
                          }} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <X size={15} />
                        </button>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)', marginTop: '10px' }}>{item.title || item.service}</h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', marginTop: '6px', lineHeight: '1.4' }}>{item.description || 'Professional portfolio showcase project.'}</p>
                      
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', fontSize: '12px', marginTop: '12px', fontWeight: '600' }}>
                          Launch Project <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 6. CERTIFICATES VIEW ==================== */}
          {activeTab === 'certificates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Professional Certifications</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }} className="certificates-main-grid">
                
                {/* Form left */}
                <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Add Certification</h4>
                  <form onSubmit={handleAddCertificate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label className="form-label">Certificate Title</label>
                      <input type="text" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} className="form-input" placeholder="E.g. React Certified Developer" />
                    </div>
                    <div>
                      <label className="form-label">Issuing Organization</label>
                      <input type="text" value={certOrg} onChange={(e) => setCertOrg(e.target.value)} className="form-input" placeholder="E.g. Meta / Google" />
                    </div>
                    <div>
                      <label className="form-label">Year Issued</label>
                      <input type="text" value={certYear} onChange={(e) => setCertYear(e.target.value)} className="form-input" placeholder="E.g. 2026" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ minHeight: '38px', borderRadius: '10px', fontSize: '12.5px', marginTop: '8px' }}>Save Certificate</button>
                  </form>
                </div>

                {/* List right */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Credential Records</h4>
                  {(!currentUser.certificates || currentUser.certificates.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No certification credentials verified. Add details on the left.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {currentUser.certificates.map((cert, idx) => (
                        <div key={idx} style={{ padding: '14px', background: 'var(--bg-dark)', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: 'var(--text-white)', fontSize: '13.5px' }}>{cert.title}</strong>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Issued by: {cert.authority} • {cert.year}</span>
                          </div>
                          <button 
                            onClick={() => {
                              const updated = currentUser.certificates.filter((_, i) => i !== idx);
                              updateProfile(currentUser.id, { certificates: updated });
                            }} 
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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

          {/* ==================== 8. CLIENT REVIEWS VIEW ==================== */}
          {activeTab === 'reviews' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Client Collaboration Reviews</h3>
              {(!currentUser.reviews || currentUser.reviews.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                  <Star size={40} style={{ opacity: 0.3, marginBottom: '12px', color: '#eab308' }} />
                  <p>No reviews yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {currentUser.reviews.map((rev, idx) => (
                    <div key={idx} style={{ padding: '16px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: 'var(--text-white)', fontSize: '14px' }}>{rev.businessName}</strong>
                        <div style={{ display: 'flex', gap: '2px', color: '#eab308' }}>
                          {Array.from({ length: Math.round(Number(rev.rating || 5)) }).map((_, i) => <Star key={i} size={12} fill="#eab308" />)}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '8px', lineHeight: '1.4' }}>"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 9. EARNINGS VIEW ==================== */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Earnings Dashboard</h3>
              {totalEarningsAmount === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <CreditCard size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-white)' }}>No Earnings Yet</h3>
                  <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '6px' }}>Complete your first project to start earning.</p>
                  <button onClick={() => setActiveTab('discover')} className="btn-primary" style={{ padding: '8px 20px', minHeight: '36px', borderRadius: '10px', fontSize: '13px', marginTop: '20px' }}>
                    Browse Opportunities
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="analytics-grid">
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Total Net Earned</span>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-white)', marginTop: '4px' }}>₹{totalEarningsAmount.toLocaleString()}</h3>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== 10. PROFILE VIEW ==================== */}
          {activeTab === 'profile' && !(isMobile || isTablet) && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
              <FreelancerProfile />
              <div className="glass-panel" style={{ padding: '24px' }}>
                <BlockedProfilesList />
              </div>
            </div>
          )}

          {/* ==================== 11. SETTINGS VIEW ==================== */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Freelancer Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span>Visible in Business Search Directory</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-cyan)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <span>Escrow Deposit Notification Alert</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-cyan)' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ==================== APPLY PROPOSAL MODAL ==================== */}
      {showApplyModal && selectedProjectId && (
        <ApplicationForm 
          project={projects.find(p => p.id === selectedProjectId)} 
          onClose={() => { setShowApplyModal(false); setSelectedProjectId(''); }}
        />
      )}

      {/* Slide-in Notifications Center */}
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* ==================== PORTFOLIO UPLOAD MODAL ==================== */}
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
              <h3 style={{ fontSize: '17px', fontWeight: '800' }}>Publish Portfolio Project</h3>
              <button onClick={() => setShowPortfolioModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPortfolioItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Project Title*</label>
                <input type="text" value={portTitle} onChange={(e) => setPortTitle(e.target.value)} className="form-input" placeholder="E.g. E-Commerce Core API" required />
              </div>

              <div>
                <label className="form-label">Link Type*</label>
                <select value={portType} onChange={(e) => setPortType(e.target.value)} className="form-input" style={{ background: 'var(--bg-dark)' }}>
                  <option value="Link">Live Website URL</option>
                  <option value="GitHub">GitHub Repository</option>
                  <option value="Behance">Behance Showcase</option>
                  <option value="Dribbble">Dribbble Mockups</option>
                </select>
              </div>

              <div>
                <label className="form-label">Project URL*</label>
                <input type="text" value={portUrl} onChange={(e) => setPortUrl(e.target.value)} className="form-input" placeholder="https://github.com/..." required />
              </div>

              <div>
                <label className="form-label">Short Description</label>
                <textarea value={portDesc} onChange={(e) => setPortDesc(e.target.value)} className="form-input" rows={2} placeholder="Explain stack details..." />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Publish Project</button>
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
          { id: 'discover', label: 'Browse', icon: <Search size={18} /> },
          { id: 'projects', label: 'Contracts', icon: <CheckSquare size={18} /> },
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
          .discover-filters-main-row {
            grid-template-columns: 1fr !important;
            flex-direction: column !important;
          }
          .discover-filters-main-row select {
            width: 100% !important;
          }
          .portfolio-projects-grid {
            grid-template-columns: 1fr !important;
          }
          .certificates-main-grid {
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

export default FreelancerDashboard;

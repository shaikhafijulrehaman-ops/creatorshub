import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { MessagingCenter } from './Shared/MessagingCenter';
import { 
  LayoutDashboard, FolderKanban, Users, UserCheck, MessageSquare, 
  Calendar, Bell, BarChart3, Building, CreditCard, Settings, LogOut,
  Plus, Search, ArrowRight, X, Check, Briefcase, Send, ExternalLink,
  MapPin, Clock, IndianRupee, CheckSquare
} from 'lucide-react';
import { useToast } from '../../components/SuccessToast';
import { BusinessProfile } from './Business/BusinessProfile';
import { BusinessRequirements } from './Business/BusinessRequirements';
import { BusinessApplications } from './Business/BusinessApplications';
import { NotificationCenter, NotificationBell } from '../../components/NotificationCenter';
import { useResponsive } from '../../hooks/useResponsive';
import { BusinessPublicProfile } from './Business/BusinessPublicProfile';
import { MyConnections } from './Shared/MyConnections';
import { ChevronDown } from 'lucide-react';



const generateTaskId = () => `t-${Date.now()}`;

export const BusinessDashboard = ({ onNavigate, onOpenProfile }) => {
  const { 
    currentUser, logoutUser, projects, createProject, users, 
    activityFeed, messages, sendMessage, activateCreatorTeam, updateProfile, loading,
    activeTabToRedirect, setActiveTabToRedirect, setActiveConversationId, notifications, setProjects,
    activeDashboardTab, setActiveDashboardTab, startConversation,
    applications
  } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  const [notifOpen, setNotifOpen] = useState(false);

  const { isMobile, isTablet } = useResponsive();
  const [expandedAccordion, setExpandedAccordion] = useState(0);

  const activeTab = activeDashboardTab;
  const setActiveTab = setActiveDashboardTab;
  
  // Left Sidebar Collapsibility State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (activeTabToRedirect === 'messages') {
      setActiveTab('messages');
      setActiveTabToRedirect(null);
    }
  }, [activeTabToRedirect]);

  // Requirement Modal / Form States
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState('Website Development');
  const [reqBudget, setReqBudget] = useState('');
  const [reqDeadline, setReqDeadline] = useState('');
  const [reqLocation, setReqLocation] = useState('');
  const [reqType, setReqType] = useState('Remote');
  const [reqDesc, setReqDesc] = useState('');
  const [reqSkills, setReqSkills] = useState('');
  const [reqDeliverables, setReqDeliverables] = useState('');
  const [reqLinks, setReqLinks] = useState('');
  const [reqImages, setReqImages] = useState('');

  // Active Workspace / Projects View State
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [workspaceChatInput, setWorkspaceChatInput] = useState('');
  const [workspaceTaskInput, setWorkspaceTaskInput] = useState('');
  
  // Search Directory State
  const [talentSearchQuery, setTalentSearchQuery] = useState('');
  const [talentCategoryFilter, setTalentCategoryFilter] = useState('All');

  // Filter Data
  const businessProjects = projects.filter(p => p.businessId === currentUser.id);
  const openRequirements = businessProjects.filter(p => p.status === 'Open');
  const activeCollaborations = businessProjects.filter(p => p.status === 'Active Workspace');

  // Calculate dynamic escrow budget from active collaborations
  const totalEscrowedBudget = activeCollaborations.reduce((sum, p) => {
    const numericBudget = parseFloat(p.budget?.replace(/[^0-9.]/g, '')) || 0;
    return sum + numericBudget;
  }, 0);

  // Collect All Received applications across all requirements from the applications table
  const receivedApplications = [];
  (applications || []).forEach(app => {
    const p = businessProjects.find(proj => proj.id === app.project_id);
    if (p) {
      const creator = users.find(u => u.id === app.applicant_id);
      receivedApplications.push({
        id: app.id,
        creatorId: app.applicant_id,
        creatorName: creator?.fullName || 'Unknown Creator',
        pricing: app.rate,
        daysToComplete: 7,
        coverLetter: app.pitch,
        projectName: p.title,
        projectId: p.id
      });
    }
  });

  // Calculate Profile Completion
  const getProfileCompletion = () => {
    let score = 10;
    if (currentUser.logo) score += 30;
    if (currentUser.businessName && currentUser.description) score += 30;
    if (currentUser.website && currentUser.location) score += 30;
    return score;
  };
  const profileCompletion = getProfileCompletion();

  // Handle Publish Requirement
  const handlePublishRequirement = (e) => {
    e.preventDefault();
    if (!reqTitle || !reqBudget || !reqDeadline || !reqDesc) {
      showSuccessToast({ title: '⚠ Missing Fields', subtitle: 'Please fill out all required fields.' });
      return;
    }

    createProject({
      title: reqTitle,
      category: reqCategory,
      budget: reqBudget,
      deadline: reqDeadline,
      location: reqLocation || 'Global',
      remoteType: reqType,
      description: reqDesc,
      skills: reqSkills ? reqSkills.split(',').map(s => s.trim()) : [],
      deliverables: reqDeliverables ? reqDeliverables.split(',').map(d => d.trim()) : [],
      referenceLinks: reqLinks ? reqLinks.split(',').map(l => l.trim()) : [],
      referenceImages: reqImages ? reqImages.split(',').map(i => i.trim()) : [],
      businessName: currentUser.businessName || currentUser.fullName,
      status: 'Open'
    });

    // Reset Form
    setReqTitle('');
    setReqBudget('');
    setReqDeadline('');
    setReqLocation('');
    setReqDesc('');
    setReqSkills('');
    setReqDeliverables('');
    setReqLinks('');
    setReqImages('');
    setShowReqModal(false);
    setActiveTab('requirements');
  };

  // Handle Workspace Chat Send
  const handleSendWorkspaceChat = (projId, text) => {
    if (!text.trim()) return;
    sendMessage(projId, text, currentUser.id, currentUser.fullName);
    setWorkspaceChatInput('');
  };

  // Add Task to Workspace
  const handleAddWorkspaceTask = (projId) => {
    if (!workspaceTaskInput.trim()) return;
    const proj = projects.find(p => p.id === projId);
    if (proj && proj.team) {
      if (!proj.team.tasks) proj.team.tasks = [];
      proj.team.tasks.push({
        id: generateTaskId(),
        title: workspaceTaskInput,
        completed: false
      });
      sendMessage(projId, `📋 Task Added: "${workspaceTaskInput}"`, 'system', 'Creators Hub AI');
      setWorkspaceTaskInput('');
    }
  };

  // Toggle Task Completion
  const handleToggleWorkspaceTask = (projId, taskId) => {
    const proj = projects.find(p => p.id === projId);
    if (proj && proj.team && proj.team.tasks) {
      proj.team.tasks = proj.team.tasks.map(t => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          sendMessage(projId, `✅ Task ${nextState ? 'Completed' : 'Reopened'}: "${t.title}"`, 'system', 'Creators Hub AI');
          return { ...t, completed: nextState };
        }
        return t;
      });
    }
  };

  // Handle Hire Creator
  const handleHireCreator = (projectId, proposal) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    // Check creator role
    const creator = users.find(u => u.id === proposal.creatorId);
    const assignedRole = creator?.role === 'Influencer' ? 'Influencer' : 'Contractor';
    
    // Assemble creator team
    activateCreatorTeam(projectId, { [assignedRole]: proposal.creatorId });
    
    // Auto remove proposal from pending once active workspace starts
    proj.proposals = proj.proposals.filter(p => p.creatorId !== proposal.creatorId);
    
    showSuccessToast({ title: '✔ Creator Hired!', subtitle: `Successfully hired ${proposal.creatorName}!`, redirectText: 'Opening collaboration workspace...' });
    setSelectedWorkspaceId(projectId);
    setActiveTab('workspace');
  };

  // Handle Reject Proposal
  const handleRejectProposal = (projectId, creatorId) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      proj.proposals = proj.proposals.filter(p => p.creatorId !== creatorId);
      showSuccessToast({ title: '✔ Proposal Rejected', subtitle: 'Application proposal has been rejected.' });
      setActiveTab('applications');
    }
  };

  // Invite Talent to Project Modal/Action
  const handleInviteTalent = (creatorId, projectId) => {
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      if (!proj.invitedCreators) proj.invitedCreators = [];
      if (proj.invitedCreators.includes(creatorId)) {
        showSuccessToast({ title: '⚠ Already Invited', subtitle: 'This creator has already been invited to this campaign.' });
        return;
      }
      proj.invitedCreators.push(creatorId);
      showSuccessToast({ title: '✔ Invitation Sent', subtitle: 'Campaign invitation sent to talent!' });
    }
  };

  // Sidebar Tabs Config
  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'freelancers', label: 'Find Freelancers', icon: <Users size={18} /> },
    { id: 'influencers', label: 'Find Influencers', icon: <Users size={18} /> },
    { id: 'requirements', label: 'Post Project', icon: <FolderKanban size={18} /> },
    { id: 'applications', label: 'Applications', icon: <UserCheck size={18} /> },
    { id: 'connections', label: 'My Connections', icon: <Users size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { id: 'profile', label: 'Profile Settings', icon: <Settings size={18} /> }
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
              style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#000', cursor: 'pointer' }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              CH
            </div>
            {!sidebarCollapsed && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>Creators Hub</h4>
                <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Business Workspace</span>
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
              src={currentUser.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80'} 
              alt={currentUser.fullName} 
              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }}
            />
            {!sidebarCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-white)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser.businessName || currentUser.fullName}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Premium Partner</span>
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
          {/* Header Left (Title / Breadcrumbs) */}
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
          {(isMobile || isTablet) && (activeTab === 'dashboard' || activeTab === 'profile') ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ marginBottom: '16px' }}>
                <span className="badge-premium" style={{ textTransform: 'uppercase' }}>Workspace controls</span>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>Business Portal</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '13px', marginTop: '2px' }}>Manage all aspects of your company briefs, applications, and settings below.</p>
              </div>

              {activeTab === 'dashboard' && (
                <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '6px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '8px' }}>
                      <FolderKanban size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Briefs</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{openRequirements.length}</h4>
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '6px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '8px' }}>
                      <CheckSquare size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Collaborations</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{activeCollaborations.length}</h4>
                    </div>
                  </div>
                </section>
              )}

              {[
                { title: 'Business Information', component: <BusinessProfile section="info" /> },
                { title: 'Contact Information', component: <BusinessProfile section="contact" /> },
                { title: 'Public Profile', component: <BusinessPublicProfile businessId={currentUser.id} viewerId={currentUser.id} /> },
                { title: 'Campaign Briefs / Projects', component: <BusinessRequirements /> },
                { title: 'Applications Received', component: <BusinessApplications onOpenMessages={(convId) => { setActiveConversationId(convId); setActiveTab('messages'); }} /> }
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
          ) : (
            activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Profile strength check card */}
              {profileCompletion < 100 && (
                <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(91, 174, 155, 0.25)', background: 'radial-gradient(ellipse at right, rgba(91, 174, 155, 0.08), transparent 70%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--text-white)' }}>Complete your Business Profile</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>Fill in details like logo, cover image, and about section to gain a 3x increase in creator application rates.</p>
                  </div>
                  <button onClick={() => {
                    if (isMobile || isTablet) {
                      onNavigate('profile');
                    } else {
                      setActiveTab('profile');
                    }
                  }} className="btn-primary" style={{ padding: '8px 18px', minHeight: '36px', borderRadius: '10px', fontSize: '12.5px' }}>
                    Finish Setup <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Stats overview */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="stats-cards-grid">
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Open Requirements</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{openRequirements.length}</h3>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Active Collaborations</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{activeCollaborations.length}</h3>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(126, 197, 180, 0.08)', color: 'var(--accent-cyan-light)', borderRadius: '12px' }}>
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Pending Proposals</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{receivedApplications.length}</h3>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', background: 'rgba(91, 174, 155, 0.08)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>Escrowed Budget</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>₹{totalEscrowedBudget.toLocaleString()}</h3>
                  </div>
                </div>
              </section>

              {/* Home Main Sections */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '24px' }} className="home-dashboard-two-col">
                
                {/* Left side */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Recent Applications list */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '16.5px', fontWeight: '800' }}>Recent Applications</h3>
                      <button onClick={() => setActiveTab('applications')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>
                        View All
                      </button>
                    </div>

                    {receivedApplications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        <Users size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ fontSize: '13.5px' }}>No proposals received yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {receivedApplications.slice(0, 4).map((app, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '14px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ color: 'var(--text-white)', fontSize: '13.5px' }}>{app.creatorName}</strong>
                                <span className="badge-pro" style={{ fontSize: '9px', padding: '2px 6px' }}>Hired Bid: {app.pricing}</span>
                              </div>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Applied to: {app.projectName}</p>
                              <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '4px', fontStyle: 'italic' }}>"{app.coverLetter.substring(0, 80)}..."</p>
                            </div>
                            <button onClick={() => { setActiveTab('applications') }} className="btn-outline-cyan" style={{ padding: '6px 14px', fontSize: '11.5px', minHeight: '32px', borderRadius: '8px' }}>
                              Review
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Open Requirements Quick tracker */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '16.5px', fontWeight: '800' }}>Active Requirements</h3>
                      <button onClick={() => setShowReqModal(true)} className="btn-primary" style={{ padding: '6px 14px', minHeight: '34px', borderRadius: '10px', fontSize: '12px' }}>
                        <Plus size={14} /> Create
                      </button>
                    </div>

                    {openRequirements.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                        <FolderKanban size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                        <p style={{ fontSize: '13.5px' }}>No open requirements yet. Post one to begin.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {openRequirements.map(req => (
                          <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div>
                              <h5 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-white)' }}>{req.title}</h5>
                              <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <span>Budget: {req.budget}</span>
                                <span>Deadline: {req.deadline}</span>
                                <span>Proposals: {(applications || []).filter(app => app.project_id === req.id).length}</span>
                              </div>
                            </div>
                            <button onClick={() => setActiveTab('requirements')} className="btn-secondary" style={{ padding: '6px 14px', minHeight: '32px', borderRadius: '8px', fontSize: '11px' }}>
                              Manage
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side widgets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Today's Activity Stream */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', marginBottom: '20px' }}>Ecosystem Feed</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {activityFeed.slice(0, 5).map(act => (
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

                  {/* Quick actions panel */}
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '16.5px', fontWeight: '800', marginBottom: '8px' }}>Workspace Operations</h3>
                    <button onClick={() => setShowReqModal(true)} className="btn-primary" style={{ width: '100%', minHeight: '44px', borderRadius: '12px' }}>
                      <Plus size={16} /> Create Requirement
                    </button>
                    <button onClick={() => { setActiveTab('freelancers'); }} className="btn-secondary" style={{ width: '100%', minHeight: '44px', borderRadius: '12px' }}>
                      Browse Freelancers
                    </button>
                    <button onClick={() => { setActiveTab('influencers'); }} className="btn-secondary" style={{ width: '100%', minHeight: '44px', borderRadius: '12px' }}>
                      Browse Influencers
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )
          )}

          {/* ==================== 2. REQUIREMENTS VIEW ==================== */}
          {activeTab === 'requirements' && (
            <BusinessRequirements />
          )}

          {/* ==================== 3. APPLICATIONS VIEW ==================== */}
          {activeTab === 'applications' && (
            <BusinessApplications onOpenMessages={(convId) => {
              setActiveConversationId(convId);
              setActiveTab('messages');
            }} />
          )}

          {/* ==================== 4. TALENT DIRECTORIES (Freelancers / Influencers) ==================== */}
          {(activeTab === 'freelancers' || activeTab === 'influencers') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                  Discover Ecosystem {activeTab === 'freelancers' ? 'Freelancers' : 'Influencers'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Filter and invite certified partners to collaborate on campaign briefs.</p>
              </div>

              {/* Directory Filter controls */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }} className="directory-filters">
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={talentSearchQuery}
                    onChange={(e) => setTalentSearchQuery(e.target.value)}
                    className="form-input" 
                    placeholder="Search by name, skills, bio tags..." 
                    style={{ paddingLeft: '44px' }}
                  />
                </div>

              </div>

              {/* Directory Results */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="talent-cards-grid">
                {users.filter(u => {
                  const matchesRole = activeTab === 'freelancers' ? u.role === 'Freelancer' : u.role === 'Influencer';
                  const matchesSearch = u.fullName.toLowerCase().includes(talentSearchQuery.toLowerCase()) || 
                                        (u.bio && u.bio.toLowerCase().includes(talentSearchQuery.toLowerCase())) ||
                                        (u.skills && u.skills.some(s => s.toLowerCase().includes(talentSearchQuery.toLowerCase())));
                  
                  return matchesRole && matchesSearch;
                }).map(talent => (
                  <div key={talent.id} className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <img 
                        src={talent.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                        alt={talent.fullName}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-white)' }}>{talent.fullName}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{talent.location || 'Global'}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '16px', flex: 1 }}>
                      {talent.bio || 'Available for collaboration. Lets build something amazing.'}
                    </p>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '12px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                        {talent.collaborationPricing || 'Flexible pricing'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => onOpenProfile(talent.id)} 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '11px', minHeight: '32px', borderRadius: '8px' }}
                        >
                          Profile
                        </button>
                        {openRequirements.length > 0 && (
                          <button 
                            onClick={() => handleInviteTalent(talent.id, openRequirements[0].id)} 
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '11px', minHeight: '32px', borderRadius: '8px' }}
                          >
                            Invite
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 5. PROJECT WORKSPACE VIEW ==================== */}
          {activeTab === 'workspace' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Active Team Workspaces</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Securely track milestones, tasks, escrow funds, and message streams.</p>
              </div>

              {activeCollaborations.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <CheckSquare size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
                  <h4 style={{ color: 'var(--text-white)', fontSize: '17px', fontWeight: '800' }}>No active projects.</h4>
                  <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '6px', maxWidth: '400px', margin: '6px auto' }}>
                    Hire an applicant or build a team from the home screen to activate a secure collaboration workspace.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Select active workspace dropdown */}
                  <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13.5px', color: 'var(--text-gray)' }}>Select Active Cell:</span>
                    <select 
                      value={selectedWorkspaceId || ''} 
                      onChange={(e) => setSelectedWorkspaceId(e.target.value)} 
                      className="form-input"
                      style={{ width: '280px', background: 'var(--bg-dark)', height: '40px', minHeight: '40px', padding: '0 12px' }}
                    >
                      <option value="">-- Choose Workspace --</option>
                      {activeCollaborations.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  {selectedWorkspaceId && (
                    (() => {
                      const proj = activeCollaborations.find(p => p.id === selectedWorkspaceId);
                      if (!proj || !proj.team) return null;
                      const projMessages = messages[proj.id] || [];

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }} className="workspace-main-grid">
                          
                          {/* Left Panel: Tasks, Milestones, Payments */}
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

                            {/* Task Board */}
                            <div className="glass-panel" style={{ padding: '24px' }}>
                              <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckSquare size={16} style={{ color: 'var(--accent-cyan)' }} /> Sprint Tasks Checklist
                              </h4>
                              
                              {/* Add task input */}
                              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                <input 
                                  type="text" 
                                  value={workspaceTaskInput}
                                  onChange={(e) => setWorkspaceTaskInput(e.target.value)}
                                  className="form-input" 
                                  placeholder="Add team action item..."
                                  style={{ height: '38px', minHeight: '38px', fontSize: '13px' }}
                                />
                                <button onClick={() => handleAddWorkspaceTask(proj.id)} className="btn-primary" style={{ padding: '0 16px', minHeight: '38px', borderRadius: '12px' }}>
                                  <Plus size={16} />
                                </button>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(proj.team.tasks || [
                                  { id: 't1', title: 'Prepare content script drafts', completed: true },
                                  { id: 't2', title: 'Publish design components', completed: false }
                                ]).map(t => (
                                  <div 
                                    key={t.id} 
                                    onClick={() => handleToggleWorkspaceTask(proj.id, t.id)}
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

                            {/* Escrow payments releases */}
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
                                    {p.status === 'Paid' ? (
                                      <span style={{ color: '#22c55e', fontSize: '11.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Check size={14} /> Released
                                      </span>
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          p.status = 'Paid';
                                          sendMessage(proj.id, `💸 Escrow Released: "${p.title}" (${p.amount})`, 'system', 'Creators Hub AI');
                                          showSuccessToast({ title: '✔ Payment Released', subtitle: 'Escrow funds have been released successfully!' });
                                          setSelectedWorkspaceId(proj.id);
                                        }} 
                                        className="btn-primary" 
                                        style={{ padding: '4px 10px', fontSize: '11px', minHeight: '28px', borderRadius: '6px' }}
                                      >
                                        Release Funds
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* Right Panel: Workspace Real-Time Chat */}
                          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '580px', justifyContent: 'space-between' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                              Workspace Secure Feed
                            </h4>

                            {/* Message Stream */}
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

                            {/* Chat input */}
                            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                              <input 
                                type="text" 
                                value={workspaceChatInput}
                                onChange={(e) => setWorkspaceChatInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendWorkspaceChat(proj.id, workspaceChatInput); }}
                                className="form-input" 
                                placeholder="Message team cell..." 
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

          {/* ==================== 6. MESSAGES CENTER ==================== */}
          {activeTab === 'messages' && (
            <MessagingCenter onOpenProfile={onOpenProfile} />
          )}

          {/* ==================== 7. CALENDAR ==================== */}
          {activeTab === 'calendar' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Workspace Delivery Calendar</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }} className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <strong key={d} style={{ fontSize: '12px', color: 'var(--text-muted)', paddingBottom: '10px', borderBottom: '1px solid var(--glass-border)' }}>{d}</strong>
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isDeadline = dayNum === 15 || dayNum === 25;
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
                      {isDeadline && (
                        <span style={{ background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.2)', color: 'var(--accent-cyan)', fontSize: '8px', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                          Campaign Due
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 8. NOTIFICATIONS ==================== */}
          {activeTab === 'notifications' && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Ecosystem Alerts</h3>
              {activityFeed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                  <Bell size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>You're all caught up.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activityFeed.map(act => (
                    <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderBottom: '1px solid var(--glass-border)' }}>
                      <div>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-white)' }}>{act.text}</p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{act.time}</span>
                      </div>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== 9. ANALYTICS ==================== */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Marketing Analytics</h3>
              
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <BarChart3 size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '6px' }}>
                  Analytics will appear after your profile starts receiving visitors.
                </p>
              </div>
            </div>
          )}

          {/* ==================== 10. COMPANY PROFILE VIEW ==================== */}
          {activeTab === 'profile' && !(isMobile || isTablet) && (
            <BusinessProfile />
          )}

          {/* ==================== 11. MY CONNECTIONS ==================== */}
          {activeTab === 'connections' && (
            <MyConnections 
              onOpenProfile={onOpenProfile} 
              onStartChat={(userId) => {
                startConversation(userId);
              }}
            />
          )}

          {/* ==================== 12. SETTINGS PLACEHOLDER ==================== */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Workspace Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span>Escrow Auto-Release Milestones</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-cyan)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span>Ecosystem Directory Public Listing</span>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-cyan)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                    <span>Email Slack/Discord Channel Alerts</span>
                    <input type="checkbox" style={{ accentColor: 'var(--accent-cyan)' }} />
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px' }}>Privacy Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: '600' }}>Contact Visibility</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Control the visibility of your business email, phone, address, and website on your profile.</span>
                    </div>
                    <select 
                      value={currentUser.contactVisibility || 'Private'} 
                      onChange={(e) => updateProfile(currentUser.id, { contactVisibility: e.target.value })}
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

      {/* ==================== CREATE REQUIREMENT MODAL ==================== */}
      {showReqModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel animate-scale-up" style={{ width: '92%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', background: '#070c17', border: '1px solid rgba(0,217,255,0.15)', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Publish Campaign Requirement</h3>
              <button onClick={() => setShowReqModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublishRequirement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Requirement Title*</label>
                <input type="text" value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} className="form-input" placeholder="E.g. Full-Stack Dev for Premium SaaS Platform" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="modal-input-row">
                <div>
                  <label className="form-label">Category*</label>
                  <select value={reqCategory} onChange={(e) => setReqCategory(e.target.value)} className="form-input" style={{ background: 'var(--bg-dark)' }}>
                    <option value="Website Development">Website Development</option>
                    <option value="App Development">App Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Video Editing">Video Editing</option>
                    <option value="Travel">Travel Campaign</option>
                    <option value="Lifestyle">Lifestyle Campaign</option>
                    <option value="Fashion">Fashion Campaign</option>
                    <option value="Technology">Tech Campaign</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Budget Allocation*</label>
                  <input type="text" value={reqBudget} onChange={(e) => setReqBudget(e.target.value)} className="form-input" placeholder="E.g. ₹3,500" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="modal-input-row">
                <div>
                  <label className="form-label">Deadline*</label>
                  <input type="date" value={reqDeadline} onChange={(e) => setReqDeadline(e.target.value)} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Work Type / Location*</label>
                  <select value={reqType} onChange={(e) => setReqType(e.target.value)} className="form-input" style={{ background: 'var(--bg-dark)' }}>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Skills Required (Comma separated)</label>
                <input type="text" value={reqSkills} onChange={(e) => setReqSkills(e.target.value)} className="form-input" placeholder="E.g. React, Figma, Next.js" />
              </div>

              <div>
                <label className="form-label">Detailed Brief Description*</label>
                <textarea value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} className="form-input" rows={3} placeholder="Explain the project milestones, deliverables, requirements..." required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="modal-input-row">
                <div>
                  <label className="form-label">Reference Link URLs</label>
                  <input type="text" value={reqLinks} onChange={(e) => setReqLinks(e.target.value)} className="form-input" placeholder="https://example.com" />
                </div>
                <div>
                  <label className="form-label">Reference Image URLs</label>
                  <input type="text" value={reqImages} onChange={(e) => setReqImages(e.target.value)} className="form-input" placeholder="https://unsplash.com/..." />
                </div>
              </div>

              <div>
                <label className="form-label">Expected Deliverables (Comma separated)</label>
                <input type="text" value={reqDeliverables} onChange={(e) => setReqDeliverables(e.target.value)} className="form-input" placeholder="E.g. Figma Source, Production Deployment" />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Publish Requirement</button>
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
          { id: 'requirements', label: 'Briefs', icon: <FolderKanban size={18} /> },
          { id: 'workspace', label: 'Cell', icon: <CheckSquare size={18} /> },
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

      {/* Slide-in Notifications Center */}
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />

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
          .requirements-grid {
            grid-template-columns: 1fr !important;
          }
          .talent-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .workspace-main-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-edit-two-col {
            grid-template-columns: 1fr !important;
          }
          .modal-input-row {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .app-bid-actions {
            text-align: left !important;
            align-items: flex-start !important;
            border-top: 1px solid var(--glass-border) !important;
            padding-top: 16px !important;
            width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
};

export default BusinessDashboard;

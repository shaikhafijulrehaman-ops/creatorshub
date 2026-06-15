import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  Plus, Search, UserCheck, FolderKanban, TrendingUp, Sparkles, 
  MessageSquare, Star, Bookmark, ShieldCheck, AlertTriangle, Users2,
  Calendar, DollarSign, X, Check, FileText, ArrowRight, Home, Briefcase, User
} from 'lucide-react';
import { VerificationCenter } from './Shared/VerificationCenter';
import { OnboardingWidget } from '../../components/OnboardingWidget';

export const BusinessDashboard = ({ onNavigate, onOpenWorkspace, onOpenProfile }) => {
  const { 
    currentUser, projects, createProject, users, 
    toggleSaveUser, savedProfiles, calculateMatchPercentage, activateCreatorTeam 
  } = useContext(AppContext);

  // Tab State: 'home', 'projects', 'messages', 'profile'
  const [activeTab, setActiveTab] = useState('home');

  // Filter and Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRole, setSearchRole] = useState('Influencer');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Creator Team Selection state
  const [teamSelection, setTeamSelection] = useState({
    Influencer: '',
    Developer: '',
    Designer: '',
    'Video Editor': ''
  });

  // Post Project Form States
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('E-Commerce');
  const [projBudget, setProjBudget] = useState('');
  const [projDeadline, setProjDeadline] = useState('');
  const [projDesc, setProjDesc] = useState('');

  // Handle Project Creation
  const handlePostProject = (e) => {
    e.preventDefault();
    if (!projTitle || !projBudget || !projDeadline || !projDesc) {
      alert('Please fill out all fields.');
      return;
    }
    createProject({
      title: projTitle,
      category: projCategory,
      budget: projBudget,
      deadline: projDeadline,
      description: projDesc
    });
    setProjTitle('');
    setProjBudget('');
    setProjDeadline('');
    setProjDesc('');
    setShowPostModal(false);
  };

  // Handle Creator Team Creation
  const handleActivateTeam = () => {
    if (!selectedProjectId) {
      alert('Please select a project.');
      return;
    }
    const selectedMembers = {};
    let count = 0;
    Object.keys(teamSelection).forEach(roleKey => {
      if (teamSelection[roleKey]) {
        selectedMembers[roleKey] = teamSelection[roleKey];
        count++;
      }
    });

    if (count === 0) {
      alert('Please select at least one team member.');
      return;
    }

    activateCreatorTeam(selectedProjectId, selectedMembers);
    setShowTeamModal(false);
    setTeamSelection({ Influencer: '', Developer: '', Designer: '', 'Video Editor': '' });
  };

  // Filtered creators list
  const creators = users.filter(u => {
    if (u.role === 'Business Holder') return false;
    if (u.role !== searchRole) return false;
    
    const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (categoryFilter === 'All') return matchesSearch;
    
    if (u.role === 'Influencer') {
      return matchesSearch && u.contentCategories.includes(categoryFilter);
    } else {
      return matchesSearch && u.services.includes(categoryFilter);
    }
  });

  const businessProjects = projects.filter(p => p.businessId === currentUser.id);
  const activeWorkspaces = businessProjects.filter(p => p.status === 'Active Workspace');

  // Stats
  const totalCampaignReach = '2.4M';
  const averageEngagement = '6.4%';
  const totalSpent = '$12,450';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '90px' }} className="mobile-dashboard-container">
      
      {/* Mobile Top App Header */}
      <div className="dashboard-mobile-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginTop: '10px' }}>
        <div>
          <span className="badge-premium" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Business Hub</span>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{currentUser.businessName || 'My Business'}</h3>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <img src={currentUser.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
      </div>

      {/* Desktop Sub Header & Tabs Toggle */}
      <div className="dashboard-desktop-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Business Hub</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'home', label: 'Hub Home' },
            { id: 'projects', label: 'Campaigns' },
            { id: 'messages', label: 'Workspaces' },
            { id: 'profile', label: 'Verification Center' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 16px',
                background: activeTab === t.id ? 'rgba(255,255,255,0.04)' : 'none',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                color: activeTab === t.id ? 'var(--text-white)' : 'var(--text-gray)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* 1. HOME TAB */}
      {activeTab === 'home' && (
        <>
          <OnboardingWidget />

          {/* Premium Dashboard Metrics Section */}
          <section className="responsive-grid-3-2-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                <FolderKanban size={24} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Active Campaigns</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px' }}>{businessProjects.length}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.08)', color: 'var(--accent-cyan-light)', borderRadius: '12px' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Campaign Reach</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px' }}>{totalCampaignReach}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: '12px' }}>
                <Star size={24} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Avg. Authenticity</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px' }}>{averageEngagement}</h3>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)', borderRadius: '12px' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Escrowed Budget</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginTop: '2px' }}>{totalSpent}</h3>
              </div>
            </div>
          </section>

          {/* Active workspaces brief */}
          <section className="dashboard-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '12px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Active Workspaces</h3>
              {activeWorkspaces.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-gray)' }}>
                  No active workspaces. Build a team below to launch one!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeWorkspaces.map(proj => (
                    <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <h5 style={{ fontSize: '14.5px', fontWeight: '700', color: '#fff' }}>{proj.title}</h5>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Deadline: {proj.deadline}</p>
                      </div>
                      <button 
                        onClick={() => onOpenWorkspace(proj.id)}
                        className="btn-outline-cyan"
                        style={{ padding: '8px 16px', fontSize: '12px', minHeight: '36px', borderRadius: '8px' }}
                      >
                        Enter Workspace
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Quick Actions</h3>
              <button onClick={() => setShowPostModal(true)} className="btn-primary" style={{ width: '100%', minHeight: '48px' }}>
                <Plus size={16} /> Post New Campaign
              </button>
              <button onClick={() => setShowTeamModal(true)} className="btn-secondary" style={{ width: '100%', minHeight: '48px', color: 'var(--accent-cyan)' }}>
                <Users2 size={16} /> Assemble Creator Team
              </button>
            </div>
          </section>
        </>
      )}

      {/* 2. PROJECTS TAB (Campaigns & Proposals) */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Campaign Management</h3>
            <button onClick={() => setShowPostModal(true)} className="btn-primary" style={{ padding: '10px 20px', minHeight: '44px' }}>
              <Plus size={16} /> Post Campaign
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {businessProjects.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-gray)' }}>
                No campaigns listed. Post one to start finding matching creators.
              </div>
            ) : (
              businessProjects.map(proj => (
                <div key={proj.id} className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div>
                      <span className="badge-premium" style={{ fontSize: '10px' }}>{proj.category}</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{proj.title}</h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', marginTop: '4px', lineHeight: '1.4' }}>{proj.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent-cyan)', display: 'block' }}>{proj.budget}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Due: {proj.deadline}</span>
                    </div>
                  </div>

                  {/* Proposals lists */}
                  <div>
                    <h5 style={{ fontSize: '13px', color: 'var(--text-gray-light)', fontWeight: '700', marginBottom: '10px' }}>
                      Received Creator Proposals ({proj.proposals?.length || 0})
                    </h5>
                    {proj.proposals?.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No proposals received yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {proj.proposals.map((prop, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                            <div>
                              <strong style={{ fontSize: '13px', color: '#fff' }}>{prop.creatorName}</strong>
                              <p style={{ fontSize: '11px', color: 'var(--text-gray)', marginTop: '2px' }}>"{prop.coverLetter}"</p>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Bid: {prop.pricing} • Time: {prop.daysToComplete} days</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => {
                                  // Auto accept proposal: activate workspace
                                  activateCreatorTeam(proj.id, { 'Contractor': prop.creatorId });
                                }}
                                className="btn-primary" 
                                style={{ padding: '6px 12px', fontSize: '11px', minHeight: '32px', borderRadius: '6px' }}
                              >
                                Accept
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. MESSAGES TAB (WhatsApp-like team chats list) */}
      {activeTab === 'messages' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Team Workspace Chats</h3>
          {activeWorkspaces.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-gray)' }}>
              No active team workspaces. Accept proposals or assemble team cells to spawn chat channels.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeWorkspaces.map(proj => (
                <div 
                  key={proj.id} 
                  onClick={() => onOpenWorkspace(proj.id)}
                  className="glass-panel-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(15,23,42,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 217, 255, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{proj.title} Chat</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '2px' }}>Open active team milestones, logs & files</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>Open Chat →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. PROFILE / SETTINGS TAB */}
      {activeTab === 'profile' && (
        <VerificationCenter />
      )}

      {/* PERSISTENT BOTTOM NAVIGATION BAR (Mobile viewports only) */}
      <nav className="dashboard-mobile-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(5, 8, 22, 0.94)',
        borderTop: '1px solid rgba(0, 217, 255, 0.15)',
        display: 'none', // handled by media query below
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1001,
        backdropFilter: 'blur(12px)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {[
          { id: 'home', label: 'Home', icon: <Home size={18} /> },
          { id: 'projects', label: 'Campaigns', icon: <Briefcase size={18} /> },
          { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
          { id: 'profile', label: 'Profile', icon: <User size={18} /> }
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
              fontSize: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              minWidth: '60px',
              height: '100%'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* POST CAMPAIGN MODAL */}
      {showPostModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel animate-scale-up" style={{ width: '90%', maxWidth: '500px', padding: '32px', background: '#090f1d', border: '1px solid rgba(0,217,255,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Post Campaign Brief</h3>
              <button onClick={() => setShowPostModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePostProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Campaign Title</label>
                <input type="text" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} className="form-input" placeholder="E.g. Summer Coffee Shoot" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Category</label>
                  <select value={projCategory} onChange={(e) => setProjCategory(e.target.value)} className="form-input" style={{ background: 'var(--bg-dark)' }}>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Technology">Technology</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Budget Allocation</label>
                  <input type="text" value={projBudget} onChange={(e) => setProjBudget(e.target.value)} className="form-input" placeholder="E.g. $2,500" required />
                </div>
              </div>

              <div>
                <label className="form-label">Project Deadline</label>
                <input type="date" value={projDeadline} onChange={(e) => setProjDeadline(e.target.value)} className="form-input" required />
              </div>

              <div>
                <label className="form-label">Detailed Brief Description</label>
                <textarea value={projDesc} onChange={(e) => setProjDesc(e.target.value)} className="form-input" rows={3} placeholder="Brief your requirements for influencers/freelancers..." required />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Publish Campaign</button>
            </form>
          </div>
        </div>
      )}

      {/* ASSEMBLE CREATOR TEAM MODAL */}
      {showTeamModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel animate-scale-up" style={{ width: '90%', maxWidth: '500px', padding: '32px', background: '#090f1d', border: '1px solid rgba(0,217,255,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Assemble Creator Team</h3>
              <button onClick={() => setShowTeamModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Select Project Cell</label>
                <select 
                  value={selectedProjectId} 
                  onChange={(e) => setSelectedProjectId(e.target.value)} 
                  className="form-input"
                  style={{ background: 'var(--bg-dark)' }}
                >
                  <option value="">-- Choose Campaign --</option>
                  {businessProjects.filter(p => p.status === 'Open').map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {/* Creator role selections */}
              {['Influencer', 'Developer', 'Designer', 'Video Editor'].map(roleName => {
                const candidates = users.filter(u => u.role === (roleName === 'Influencer' ? 'Influencer' : 'Freelancer') && 
                  (roleName === 'Influencer' || u.services?.includes(roleName === 'Developer' ? 'Website Development' : (roleName === 'Designer' ? 'UI/UX Design' : 'Video Editing'))));
                
                return (
                  <div key={roleName}>
                    <label className="form-label">Assign {roleName}</label>
                    <select
                      value={teamSelection[roleName]}
                      onChange={(e) => setTeamSelection(prev => ({ ...prev, [roleName]: e.target.value }))}
                      className="form-input"
                      style={{ background: 'var(--bg-dark)' }}
                    >
                      <option value="">-- Choose Candidate --</option>
                      {candidates.map(cand => (
                        <option key={cand.id} value={cand.id}>{cand.fullName} ({cand.verificationStatus})</option>
                      ))}
                    </select>
                  </div>
                );
              })}

              <button 
                onClick={handleActivateTeam}
                className="btn-primary" 
                style={{ marginTop: '12px' }}
              >
                Launch Team Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Inline overrides */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-desktop-header {
            display: none !important;
          }
          .dashboard-mobile-header {
            display: flex !important;
          }
          .dashboard-mobile-nav {
            display: flex !important;
          }
          .mobile-dashboard-container {
            padding: 10px 12px 100px 12px !important;
          }
          .dashboard-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

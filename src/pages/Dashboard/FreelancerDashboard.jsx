import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  Code, Star, Briefcase, Award, ArrowRight, ShieldCheck, 
  Layers, Upload, X, Check, FileText, Globe, DollarSign, Eye, Heart, Home, MessageSquare, User
} from 'lucide-react';
import { VerificationCenter } from './Shared/VerificationCenter';
import { OnboardingWidget } from '../../components/OnboardingWidget';

export const FreelancerDashboard = ({ onNavigate, onOpenWorkspace }) => {
  const { currentUser, projects, applyToProject, updateProfile, users, followedProfiles } = useContext(AppContext);
  
  // Tab State: 'home', 'projects', 'messages', 'profile'
  const [activeTab, setActiveTab] = useState('home');

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [portfolioValidating, setPortfolioValidating] = useState(false);

  // Proposal Form
  const [coverLetter, setCoverLetter] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [days, setDays] = useState(10);
  
  // Custom Portfolio upload validator form
  const [missingService, setMissingService] = useState('');
  const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

  // Filters
  const openProjects = projects.filter(p => p.status === 'Open');
  const activeWorkspaces = projects.filter(p => {
    if (p.status !== 'Active Workspace') return false;
    if (!p.team || !p.team.members) return false;
    return Object.values(p.team.members).includes(currentUser.id);
  });

  const savedClients = users.filter(u => u.role === 'Business Holder' && followedProfiles.includes(u.id));

  const checkPortfolioValidation = (proj) => {
    setSelectedProjectId(proj.id);
    const hasPortfolio = currentUser.portfolio && currentUser.portfolio.length > 0;
    if (!hasPortfolio) {
      setMissingService(proj.category || 'Website Development');
      setPortfolioValidating(true);
    } else {
      setShowApplyModal(true);
    }
  };

  const handlePortfolioSubmit = (e) => {
    e.preventDefault();
    if (!newPortfolioUrl) {
      alert('Please enter a portfolio link.');
      return;
    }

    const newItem = {
      service: missingService,
      type: 'Link',
      url: newPortfolioUrl,
      description: `Quick validation upload for bid on Project`
    };

    const updatedPortfolio = [...(currentUser.portfolio || []), newItem];
    updateProfile(currentUser.id, { portfolio: updatedPortfolio });
    
    setNewPortfolioUrl('');
    setPortfolioValidating(false);
    setShowApplyModal(true);
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!coverLetter || !bidPrice) {
      alert('Please enter cover letter and pricing quote.');
      return;
    }

    applyToProject(selectedProjectId, {
      creatorId: currentUser.id,
      creatorName: currentUser.fullName,
      coverLetter,
      pricing: bidPrice,
      daysToComplete: Number(days),
      status: 'Pending'
    });

    setCoverLetter('');
    setBidPrice('');
    setShowApplyModal(false);
  };

  // Mock Earnings
  const escrowLocked = '$1,500';
  const paidOut = '$3,200';
  const pendingApproval = '$400';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '90px' }} className="mobile-dashboard-container">
      
      {/* Mobile Top App Header */}
      <div className="dashboard-mobile-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginTop: '10px' }}>
        <div>
          <span className="badge-premium" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Freelancer Space</span>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>Welcome back, {currentUser.fullName.split(' ')[0]}</h3>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'
          }}
        >
          <img src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
      </div>

      {/* Desktop Sub Header & Tabs Toggle */}
      <div className="dashboard-desktop-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
        <div>
          <span className="badge-pro">Professional Dev Suite</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>Welcome back, {currentUser.fullName.split(' ')[0]}</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'home', label: 'Home' },
            { id: 'projects', label: 'Explore Contracts' },
            { id: 'messages', label: 'Team Chats' },
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

          {/* Top Cards Grid */}
          <section className="responsive-grid-3-2-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Portfolio Performance</span>
                <Eye size={16} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>342 Clicks</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>45 Project Saves</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Escrow Locked</span>
                <DollarSign size={16} style={{ color: '#eab308' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{escrowLocked}</h3>
              <p style={{ fontSize: '11px', color: '#eab308' }}>Awaiting Milestone release</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Pending Approval</span>
                <Award size={16} style={{ color: 'var(--accent-cyan-light)' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{pendingApproval}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In review checklist</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Total Paid Out</span>
                <Check size={16} style={{ color: '#22c55e' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{paidOut}</h3>
              <p style={{ fontSize: '11px', color: '#22c55e' }}>Transferred to Bank Node</p>
            </div>
          </section>

          {/* Active Workspaces summary */}
          <section className="dashboard-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', marginTop: '12px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Active Developer Workspaces</h3>
              {activeWorkspaces.length === 0 ? (
                <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '30px' }}>
                  No active developer cells. Submit contract pitches in the Explorer tab!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeWorkspaces.map(proj => (
                    <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{proj.title}</h5>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Business Partner: {proj.businessName}</p>
                      </div>
                      <button 
                        onClick={() => onOpenWorkspace(proj.id)}
                        className="btn-outline-cyan"
                        style={{ padding: '8px 16px', fontSize: '12px', minHeight: '36px', borderRadius: '8px' }}
                      >
                        Enter Code Studio
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Quick Actions</h3>
              <button onClick={() => setActiveTab('projects')} className="btn-primary" style={{ width: '100%', minHeight: '48px' }}>
                <Briefcase size={16} /> Explore Contracts
              </button>
            </div>
          </section>
        </>
      )}

      {/* 2. PROJECTS TAB (Explore Brand Contracts) */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Available Developer Contracts</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {openProjects.map(proj => {
              const hasApplied = proj.proposals?.some(p => p.creatorId === currentUser.id);
              return (
                <div key={proj.id} className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span className="badge-pro" style={{ fontSize: '10px' }}>{proj.category}</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{proj.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Briefed by: {proj.businessName}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{proj.budget}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Due: {proj.deadline}</span>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '13px', color: 'var(--text-gray-light)', margin: '14px 0', lineHeight: '1.5' }}>
                    {proj.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px' }}>
                    {hasApplied ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#22c55e', fontWeight: '700' }}>
                        <Check size={16} /> Pitch Submitted
                      </span>
                    ) : (
                      <button 
                        onClick={() => checkPortfolioValidation(proj)}
                        className="btn-primary" 
                        style={{ padding: '10px 24px', fontSize: '13px', minHeight: '40px', borderRadius: '8px' }}
                      >
                        Submit Project Bid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Active Developer Chats</h3>
          {activeWorkspaces.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-gray)' }}>
              No active conversations. Submit contract bids to brands to begin chat channels.
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
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{proj.title} Chat</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '2px' }}>Client: {proj.businessName}</p>
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

      {/* PERSISTENT BOTTOM NAVIGATION BAR */}
      <nav className="dashboard-mobile-nav" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(5, 8, 22, 0.94)',
        borderTop: '1px solid rgba(0, 217, 255, 0.15)',
        display: 'none',
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

      {/* PORTFOLIO VALIDATION SUBMIT POPUP */}
      {portfolioValidating && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel animate-scale-up" style={{ width: '90%', maxWidth: '480px', padding: '32px', background: '#090f1d', border: '1px solid rgba(0,217,255,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Portfolio Verification</h3>
              <button onClick={() => setPortfolioValidating(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.5', marginBottom: '20px' }}>
              To bid on this contract, you must link at least one live URL or Drive link matching <strong>{missingService}</strong>.
            </p>

            <form onSubmit={handlePortfolioSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Portfolio URL / Live Link</label>
                <input 
                  type="url" 
                  value={newPortfolioUrl} 
                  onChange={(e) => setNewPortfolioUrl(e.target.value)} 
                  className="form-input" 
                  placeholder="https://behance.net/username or github link" 
                  required 
                />
              </div>
              <button type="submit" className="btn-primary">Verify & Continue Bid</button>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT BID MODAL */}
      {showApplyModal && (
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
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Submit Project Bid Quote</h3>
              <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Proposal Statement</label>
                <textarea 
                  value={coverLetter} 
                  onChange={(e) => setCoverLetter(e.target.value)} 
                  className="form-input" 
                  rows={4} 
                  placeholder="Briefly pitch your tech stack and client project deliverables..." 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Pricing Bid Quote</label>
                  <input 
                    type="text" 
                    value={bidPrice} 
                    onChange={(e) => setBidPrice(e.target.value)} 
                    className="form-input" 
                    placeholder="E.g. $1,200" 
                    required 
                  />
                </div>
                <div>
                  <label className="form-label">Days to Complete</label>
                  <input 
                    type="number" 
                    value={days} 
                    onChange={(e) => setDays(e.target.value)} 
                    className="form-input" 
                    min="1" 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Submit Proposal Bid</button>
            </form>
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
export default FreelancerDashboard;

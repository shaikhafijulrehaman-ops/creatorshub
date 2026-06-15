import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  Video, Users, TrendingUp, DollarSign, ArrowRight, ShieldCheck, 
  AlertTriangle, Eye, Globe, MessageSquare, ClipboardList, X, Check, Heart, Building, Home, Briefcase, User
} from 'lucide-react';
import { VerificationCenter } from './Shared/VerificationCenter';
import { OnboardingWidget } from '../../components/OnboardingWidget';

export const InfluencerDashboard = ({ onNavigate, onOpenWorkspace }) => {
  const { currentUser, projects, applyToProject, users, followedProfiles } = useContext(AppContext);
  
  // Tab State: 'home', 'projects', 'messages', 'profile'
  const [activeTab, setActiveTab] = useState('home');

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // Proposal Form
  const [coverLetter, setCoverLetter] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [days, setDays] = useState(7);

  // Filters
  const openProjects = projects.filter(p => p.status === 'Open');
  
  const activeWorkspaces = projects.filter(p => {
    if (p.status !== 'Active Workspace') return false;
    if (!p.team || !p.team.members) return false;
    return Object.values(p.team.members).includes(currentUser.id);
  });

  const savedBrands = users.filter(u => u.role === 'Business Holder' && followedProfiles.includes(u.id));

  const handleApply = (e) => {
    e.preventDefault();
    if (!coverLetter || !bidPrice) {
      alert('Please fill out cover letter and bid price.');
      return;
    }
    
    applyToProject(selectedProjectId, {
      creatorId: currentUser.id,
      creatorName: currentUser.fullName,
      coverLetter,
      pricing: bidPrice,
      daysToComplete: Number(days)
    });

    setCoverLetter('');
    setBidPrice('');
    setShowApplyModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '90px' }} className="mobile-dashboard-container">
      
      {/* Mobile Top App Header */}
      <div className="dashboard-mobile-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginTop: '10px' }}>
        <div>
          <span className="badge-premium" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Creator Space</span>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>Welcome back, {currentUser.fullName.split(' ')[0]}</h3>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <img src={currentUser.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </button>
      </div>

      {/* Desktop Sub Header & Tabs Toggle */}
      <div className="dashboard-desktop-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
        <div>
          <span className="badge-premium">Creator Studio</span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>Welcome back, {currentUser.fullName.split(' ')[0]}</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'home', label: 'Overview' },
            { id: 'projects', label: 'Find Campaigns' },
            { id: 'messages', label: 'My Teams' },
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

          {/* Metric cards */}
          <section className="responsive-grid-3-2-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Follower Metrics</span>
                <Users size={16} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{currentUser.followersCount || '450K'}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+2.4K Growth • 78% Active</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Profile Views</span>
                <Eye size={16} style={{ color: 'var(--accent-cyan-light)' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>1,450</h3>
              <p style={{ fontSize: '11px', color: '#22c55e' }}>+14% this week</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Monthly Reach</span>
                <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{currentUser.averageReach || '1.2M'}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across primary platform</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Base Rate</span>
                <DollarSign size={16} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{currentUser.collaborationPricing || '$500/Post'}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Escrow payment locked</p>
            </div>
          </section>

          {/* Fraud Audit indicators */}
          {currentUser.fraudAudit && (
            <section className="glass-panel" style={{ 
              padding: '16px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'rgba(34, 197, 94, 0.02)',
              borderColor: 'rgba(34, 197, 94, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={20} style={{ color: '#22c55e' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-gray-light)' }}>
                  Ecosystem Audit: Fake Followers: <strong>{currentUser.fraudAudit.fakeFollowers}</strong> | Authenticity: <strong>{currentUser.fraudAudit.engagementAuthenticity}</strong>
                </span>
              </div>
              <span className="badge-premium" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)', padding: '3px 8px', fontSize: '11px' }}>
                Verified Audience
              </span>
            </section>
          )}

          {/* Workspace summary */}
          <section className="dashboard-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', marginTop: '12px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>My Workspaces</h3>
              {activeWorkspaces.length === 0 ? (
                <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '30px' }}>
                  No active campaigns. Apply to brand listings in the Campaigns tab!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeWorkspaces.map(proj => (
                    <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{proj.title}</h5>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Client: {proj.businessName}</p>
                      </div>
                      <button 
                        onClick={() => onOpenWorkspace(proj.id)}
                        className="btn-outline-cyan"
                        style={{ padding: '8px 16px', fontSize: '12px', minHeight: '36px', borderRadius: '8px' }}
                      >
                        Enter Chat Room
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Quick Actions</h3>
              <button onClick={() => setActiveTab('projects')} className="btn-primary" style={{ width: '100%', minHeight: '48px' }}>
                <Briefcase size={16} /> Browse Campaigns
              </button>
            </div>
          </section>
        </>
      )}

      {/* 2. PROJECTS TAB (Explore Brand Briefs & Pitch) */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Brand Pitch Directories</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {openProjects.map(proj => {
              const hasApplied = proj.proposals?.some(p => p.creatorId === currentUser.id);
              return (
                <div key={proj.id} className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span className="badge-premium" style={{ fontSize: '10px' }}>{proj.category}</span>
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
                        onClick={() => { setSelectedProjectId(proj.id); setShowApplyModal(true); }}
                        className="btn-primary" 
                        style={{ padding: '10px 24px', fontSize: '13px', minHeight: '40px', borderRadius: '8px' }}
                      >
                        Submit Proposal Pitch
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
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Active Brand Chats</h3>
          {activeWorkspaces.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-gray)' }}>
              No active conversations. Submit pitches to brands to begin chat channels.
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

      {/* APPLY PITCH PROPOSAL MODAL */}
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
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Submit Collaboration Pitch</h3>
              <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Cover Pitch Letter</label>
                <textarea 
                  value={coverLetter} 
                  onChange={(e) => setCoverLetter(e.target.value)} 
                  className="form-input" 
                  rows={4} 
                  placeholder="Explain why you are the best fit for this campaign brief..." 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Pricing Quote</label>
                  <input 
                    type="text" 
                    value={bidPrice} 
                    onChange={(e) => setBidPrice(e.target.value)} 
                    className="form-input" 
                    placeholder="E.g. $600" 
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

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Submit Pitch</button>
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
export default InfluencerDashboard;

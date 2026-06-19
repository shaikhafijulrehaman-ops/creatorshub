import { useState, useContext } from 'react';
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
import { Search, Briefcase, Sparkles } from 'lucide-react';



const AppContent = () => {
  const { currentUser, users, projects, loading } = useContext(AppContext);
  


  // Routing States
  const [currentPage, setCurrentPage] = useState('landing');
  const [navigationParams, setNavigationParams] = useState({});

  // Overlay states (inside dashboard or explore)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(null);

  // Explore page states
  const [exploreQuery, setExploreQuery] = useState('');

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setNavigationParams(params);
    setActiveWorkspaceId(null);
    setActiveProfileId(null);
    window.scrollTo(0, 0);
  };

  const handleOpenWorkspace = (projId) => {
    setActiveWorkspaceId(projId);
    setActiveProfileId(null);
  };

  const handleOpenProfile = (userId) => {
    setActiveProfileId(userId);
    setActiveWorkspaceId(null);
  };

  // Route back to dashboard or active list
  const handleCloseOverlay = () => {
    setActiveWorkspaceId(null);
    setActiveProfileId(null);
  };



  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Global Particle Background */}
      <Particles />

      {/* Global loading state spinner */}
      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-deep)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div className="loader-spinner" style={{ width: '48px', height: '48px', border: '3px solid var(--accent-cyan-glow)', borderTopColor: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '13.5px', color: 'var(--text-gray)', fontWeight: '600', letterSpacing: '0.05em' }}>Loading Creators Hub...</span>
        </div>
      )}



      {/* Header bar */}
      <Header onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Main Pages router */}
      <main style={{ flex: 1, padding: '24px 24px 0 24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        
        {/* LANDING PAGE */}
        {currentPage === 'landing' && (
          <Landing onNavigate={handleNavigate} />
        )}

        {/* ONBOARDING FLOW */}
        {currentPage === 'onboarding' && (
          <Onboarding onNavigate={handleNavigate} initialParams={navigationParams} />
        )}

        {/* DASHBOARDS */}
        {currentPage === 'dashboard' && (
          (() => {
            if (!currentUser) {
              // Redirect to onboarding login if session lost
              setTimeout(() => handleNavigate('onboarding'), 0);
              return null;
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
          })()
        )}

        {/* EXPLORE DIRECTORY PAGE (REAL-TIME ECOSYSTEM FEED) */}
        {currentPage === 'explore' && (
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
                          <button onClick={() => { if (currentUser) { alert('Request sent!'); } else { handleNavigate('onboarding'); } }} className="btn-primary" style={{ padding: '2px 8px', fontSize: '10px', minHeight: '24px', borderRadius: '6px' }}>Connect</button>
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
        )}



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

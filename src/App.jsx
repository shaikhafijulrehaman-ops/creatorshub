import React, { useState, useContext, useEffect } from 'react';
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
import { Leaderboards } from './pages/Dashboard/Shared/Leaderboards';
import { Search, Eye, Bookmark, ShieldCheck, AlertTriangle } from 'lucide-react';
import { LoadingScreen } from './components/LoadingScreen';

const AppContent = () => {
  const { currentUser, users, savedProfiles, toggleSaveUser, calculateMatchPercentage } = useContext(AppContext);
  
  // Site Loader state
  const [siteLoaded, setSiteLoaded] = useState(false);

  // Routing States
  const [currentPage, setCurrentPage] = useState('landing');
  const [navigationParams, setNavigationParams] = useState({});
  const [pageTransitioning, setPageTransitioning] = useState(false);

  // Overlay states (inside dashboard or explore)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(null);

  // Explore page states
  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreCategory, setExploreCategory] = useState('All');

  const handleNavigate = (page, params = {}) => {
    setPageTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setNavigationParams(params);
      setActiveWorkspaceId(null);
      setActiveProfileId(null);
      setPageTransitioning(false);
      window.scrollTo(0, 0);
    }, 400); // match fade transition
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

  // Compute Allowed Profiles to Explore (Role Logic Verification)
  const getExploreProfiles = () => {
    if (!currentUser) {
      // Unauthenticated users can explore all creators (Influencers + Freelancers)
      return users.filter(u => u.role !== 'Business Holder');
    }

    // Role Logic Rules:
    // - Business Holders see: Influencers, Freelancers. No BHs.
    // - Influencers see: Business Holders, Freelancers. No Influencers.
    // - Freelancers see: Business Holders, Influencers. No Freelancers.
    return users.filter(u => {
      if (currentUser.role === 'Business Holder') {
        return u.role !== 'Business Holder';
      }
      if (currentUser.role === 'Influencer') {
        return u.role !== 'Influencer';
      }
      if (currentUser.role === 'Freelancer') {
        return u.role !== 'Freelancer';
      }
      return true;
    });
  };

  const filteredExploreProfiles = getExploreProfiles().filter(u => {
    const queryLower = exploreQuery.toLowerCase();
    
    // Name, bio or skills match
    const nameMatch = u.fullName.toLowerCase().includes(queryLower);
    const bizNameMatch = u.businessName ? u.businessName.toLowerCase().includes(queryLower) : false;
    const bioMatch = u.bio ? u.bio.toLowerCase().includes(queryLower) : false;
    
    let skillMatch = false;
    if (u.role === 'Freelancer' && u.skills) {
      skillMatch = u.skills.some(s => s.toLowerCase().includes(queryLower));
    }

    const matchesSearch = nameMatch || bizNameMatch || bioMatch || skillMatch;

    if (exploreCategory === 'All') return matchesSearch;

    // Category check
    if (u.role === 'Business Holder') {
      return matchesSearch && u.businessCategory === exploreCategory;
    }
    if (u.role === 'Influencer') {
      return matchesSearch && u.contentCategories.includes(exploreCategory);
    }
    if (u.role === 'Freelancer') {
      return matchesSearch && u.services.includes(exploreCategory);
    }

    return matchesSearch;
  });

  if (!siteLoaded) {
    return <LoadingScreen onComplete={() => setSiteLoaded(true)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Global Particle Background */}
      <Particles />

      {/* Global Transitions Page Overlay */}
      {pageTransitioning && (
        <div className="fullscreen-loader">
          <div className="loader-spinner" />
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

            // Overlay renders take precedence in the dashboard space
            if (activeProfileId) {
              return <ProfileView userId={activeProfileId} onClose={handleCloseOverlay} />;
            }
            if (activeWorkspaceId) {
              return <Workspace projectId={activeWorkspaceId} onClose={handleCloseOverlay} />;
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
                />
              );
            }
            if (currentUser.role === 'Freelancer') {
              return (
                <FreelancerDashboard 
                  onNavigate={handleNavigate} 
                  onOpenWorkspace={handleOpenWorkspace} 
                />
              );
            }
          })()
        )}

        {/* EXPLORE DIRECTORY PAGE */}
        {currentPage === 'explore' && (
          (() => {
            if (activeProfileId) {
              return <ProfileView userId={activeProfileId} onClose={handleCloseOverlay} />;
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '32px' }}>
                <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                  <h2 style={{ fontSize: '30px', fontWeight: '800' }}>Explore Ecosystem Partners</h2>
                  <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '6px' }}>
                    {currentUser 
                      ? `Browsing allowed profiles for your ${currentUser.role} account.`
                      : 'Create an account to filter matches by category, budget, and platform metrics.'}
                  </p>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      value={exploreQuery}
                      onChange={(e) => setExploreQuery(e.target.value)}
                      className="form-input" 
                      placeholder="Search by name, tags, capabilities..." 
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>

                  <select 
                    value={exploreCategory}
                    onChange={(e) => setExploreCategory(e.target.value)}
                    className="form-input"
                    style={{ width: '200px', background: 'var(--bg-dark)' }}
                  >
                    <option value="All">All Focus Areas</option>
                    {/* Render matching options dynamically */}
                    {['Travel', 'Food', 'Fashion', 'Technology', 'Website Development', 'App Development', 'UI/UX Design', 'Video Editing', 'E-Commerce', 'Hotel', 'Cafe'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Directory Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {filteredExploreProfiles.length === 0 ? (
                    <div style={{ gridColumn: '1 / span 3', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                      No matching profiles discovered.
                    </div>
                  ) : (
                    filteredExploreProfiles.map(p => {
                      const matchScore = currentUser ? calculateMatchPercentage(currentUser, p) : 75;
                      return (
                        <div key={p.id} className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <img 
                                src={p.profilePhoto || p.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                                alt={p.fullName}
                                style={{ width: '44px', height: '44px', borderRadius: p.role === 'Business Holder' ? '8px' : '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{p.fullName}</h4>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.location}</span>
                              </div>
                            </div>
                            <span style={{
                              background: 'rgba(6,182,212,0.1)',
                              border: '1px solid var(--accent-cyan)',
                              color: 'var(--accent-cyan)',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              {matchScore}% Match
                            </span>
                          </div>

                          <p style={{ fontSize: '12px', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '16px', flex: 1 }}>
                            {p.bio || p.description || 'Welcome to my profile! Interested in collaborating.'}
                          </p>

                          {/* Fraud indicators for influencer */}
                          {p.role === 'Influencer' && p.fraudAudit && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '11px', 
                              marginBottom: '16px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: p.fraudAudit.badge === 'Verified Audience' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              border: p.fraudAudit.badge === 'Verified Audience' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                              color: p.fraudAudit.badge === 'Verified Audience' ? '#22c55e' : '#ef4444'
                            }}>
                              {p.fraudAudit.badge === 'Verified Audience' ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
                              <span>{p.fraudAudit.badge}</span>
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', marginTop: 'auto' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-white)' }}>
                              {p.collaborationPricing || p.monthlyMarketingBudget || 'Flexible Pricing'}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {currentUser && (
                                <button 
                                  onClick={() => toggleSaveUser(p.id)}
                                  style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: savedProfiles.includes(p.id) ? 'var(--accent-cyan)' : 'var(--text-gray)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Bookmark size={14} fill={savedProfiles.includes(p.id) ? 'var(--accent-cyan)' : 'none'} />
                                </button>
                              )}
                              <button 
                                onClick={() => handleOpenProfile(p.id)}
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px' }}
                              >
                                View Profile
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <style>{`
                  @media (max-width: 900px) {
                    div[style*="gridTemplateColumns"] {
                      grid-template-columns: 1fr !important;
                    }
                  }
                `}</style>
              </div>
            );
          })()
        )}

        {/* LEADERBOARDS PAGE */}
        {currentPage === 'leaderboard' && (
          (() => {
            if (activeProfileId) {
              return <ProfileView userId={activeProfileId} onClose={handleCloseOverlay} />;
            }
            return <Leaderboards onOpenProfile={handleOpenProfile} />;
          })()
        )}

      </main>
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

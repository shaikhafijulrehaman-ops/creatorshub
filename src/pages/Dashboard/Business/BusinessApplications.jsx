import { useContext, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useToast } from '../../../components/SuccessToast';
import { UserCheck, Star, Check, X, MessageSquare, Bookmark, Users, ChevronRight, IndianRupee, Clock, Briefcase, Eye } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import './Business.css';

const TABS = ['New', 'Shortlisted', 'Accepted', 'Rejected', 'Interview'];

export const BusinessApplications = ({ onOpenMessages }) => {
  const { 
    currentUser, users, projects, applications, acceptApplication, rejectApplication, 
    addNotification, startConversation, setActiveTabToRedirect, addConnection 
  } = useContext(AppContext);
  const { showSuccessToast } = useToast();

  const [activeTab, setActiveTab] = useState('New');
  const [viewedApp, setViewedApp] = useState(null);

  // Gather all proposals from all business projects
  const allApplications = [];
  (applications || []).forEach(app => {
    const proj = projects.find(p => p.id === app.project_id);
    if (proj && proj.businessId === currentUser.id) {
      const creator = users.find(u => u.id === app.applicant_id);
      allApplications.push({
        id: app.id,
        creatorId: app.applicant_id,
        creatorName: creator?.fullName || 'Unknown Creator',
        pricing: app.rate,
        daysToComplete: 7,
        coverLetter: app.pitch,
        projectId: app.project_id,
        projectTitle: proj.title,
        applicationStatus: app.status === 'Pending' ? 'New' : app.status
      });
    }
  });

  const filtered = allApplications.filter(app => {
    const s = app.applicationStatus || 'New';
    return s === activeTab;
  });

  const updateProposalStatus = async (appId, newStatus) => {
    const dbStatus = newStatus === 'New' ? 'Pending' : newStatus;
    await supabase.from('applications').update({ status: dbStatus }).eq('id', appId);
  };

  const handleViewApp = (app) => {
    setViewedApp(app);
    // Notify business viewed
    addNotification && addNotification(app.creatorId, {
      type: 'viewed',
      title: `${currentUser.businessName || currentUser.fullName} viewed your application`,
      body: `For: ${app.projectTitle}`,
    });
  };

  const handleShortlist = async (app) => {
    await updateProposalStatus(app.id, 'Shortlisted');
    addNotification && addNotification(app.creatorId, {
      type: 'shortlisted',
      title: 'Your proposal has been shortlisted',
      body: `${currentUser.businessName || 'A business'} shortlisted your proposal for "${app.projectTitle}".`,
    });
    showSuccessToast({ title: 'Shortlisted', subtitle: `${app.creatorName}'s proposal has been shortlisted.` });
    setViewedApp(null);
  };

  const handleInterview = async (app) => {
    await updateProposalStatus(app.id, 'Interview');
    addNotification && addNotification(app.creatorId, {
      type: 'invitation',
      title: 'Interview invitation received',
      body: `${currentUser.businessName || 'A business'} wants to interview you for "${app.projectTitle}".`,
    });
    showSuccessToast({ title: 'Interview Scheduled', subtitle: `Interview invitation sent to ${app.creatorName}.` });
    setViewedApp(null);
  };

  const handleAccept = async (app) => {
    const convId = await acceptApplication(app.id);
    showSuccessToast({
      title: 'Application Accepted',
      subtitle: `${app.creatorName} is now accepted. Messaging and active workspace are activated!`,
      redirectText: 'Connection created...',
    });
    setViewedApp(null);
    if (onOpenMessages && convId) onOpenMessages(convId);
  };

  const handleReject = async (app) => {
    await rejectApplication(app.id);
    showSuccessToast({ title: 'Application Rejected', subtitle: 'The applicant has been notified.' });
    setViewedApp(null);
  };

  const handleMessage = async (app) => {
    const convId = await startConversation(app.creatorId);
    setActiveTabToRedirect('messages');
  };

  const getCreator = (creatorId) => users.find(u => u.id === creatorId);

  const tabCounts = {};
  TABS.forEach(t => {
    tabCounts[t] = allApplications.filter(a => (a.applicationStatus || 'New') === t).length;
  });

  return (
    <div className="biz-apps-root">

      {/* Tab bar */}
      <div className="biz-apps-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`biz-app-tab${activeTab === tab ? ' biz-app-tab--active' : ''}`}
            onClick={() => { setActiveTab(tab); setViewedApp(null); }}
          >
            {tab}
            {tabCounts[tab] > 0 && (
              <span className={`biz-app-tab-badge${activeTab === tab ? ' active' : ''}`}>{tabCounts[tab]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Application detail view */}
      {viewedApp ? (
        (() => {
          const creator = getCreator(viewedApp.creatorId);
          const status = viewedApp.applicationStatus || 'New';
          return (
            <div className="biz-app-detail animate-scale-up">
              <button className="biz-app-back" onClick={() => setViewedApp(null)}>
                Back to list
              </button>

              <div className="glass-panel biz-app-detail-card">
                {/* Creator header */}
                <div className="biz-app-detail-hero">
                  <img
                    src={creator?.profilePhoto || creator?.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={viewedApp.creatorName}
                    className="biz-app-avatar-lg"
                  />
                  <div className="biz-app-detail-identity">
                    <h3>{viewedApp.creatorName}</h3>
                    <p className="biz-app-role">{creator?.role || 'Creator'} — {creator?.location || 'Global'}</p>
                    <div className="biz-app-rating">
                      {[1,2,3,4,5].map(n => <Star key={n} size={13} style={{ fill: n <= Math.round(Number(creator?.rating || 5)) ? '#f59e0b' : 'none', color: '#f59e0b' }} />)}
                      <span>{Number(creator?.rating || 5.0).toFixed(1)}</span>
                    </div>
                    <span className="badge-pro" style={{ fontSize: '10px', alignSelf: 'flex-start' }}>{creator?.verificationStatus || 'Verified'}</span>
                  </div>
                  <div className="biz-app-detail-bid">
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Expected Budget</span>
                    <h3 className="biz-app-bid-amount">{viewedApp.pricing}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Delivery: {viewedApp.daysToComplete} days</span>
                    {viewedApp.availability && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Available: {viewedApp.availability}</span>}
                  </div>
                </div>

                {/* Applying to */}
                <div className="biz-app-project-tag">
                  <Briefcase size={13} /> Applying for: <strong>{viewedApp.projectTitle}</strong>
                </div>

                {/* Cover letter */}
                <div className="biz-app-section">
                  <h5>Cover Letter</h5>
                  <div className="biz-app-cover-letter">{viewedApp.coverLetter}</div>
                </div>

                {/* Portfolio */}
                {viewedApp.portfolioUrl && (
                  <div className="biz-app-section">
                    <h5>Portfolio</h5>
                    <a href={viewedApp.portfolioUrl} target="_blank" rel="noreferrer" className="biz-app-link">
                      View Portfolio
                    </a>
                  </div>
                )}

                {/* Resume */}
                {viewedApp.resumeUrl && (
                  <div className="biz-app-section">
                    <h5>Resume</h5>
                    <a href={viewedApp.resumeUrl} target="_blank" rel="noreferrer" className="biz-app-link">
                      View Resume
                    </a>
                  </div>
                )}

                {/* Skills */}
                {creator?.skills?.length > 0 && (
                  <div className="biz-app-section">
                    <h5>Skills</h5>
                    <div className="biz-skills-row">
                      {creator.skills.map(s => <span key={s} className="biz-skill-chip">{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="biz-app-actions">
                  {status !== 'Rejected' && status !== 'Accepted' && (
                    <button className="btn-secondary biz-action-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => handleReject(viewedApp)}>
                      <X size={14} /> Reject
                    </button>
                  )}
                  {status === 'New' && (
                    <button className="btn-secondary biz-action-btn" onClick={() => handleShortlist(viewedApp)}>
                      <Bookmark size={14} /> Shortlist
                    </button>
                  )}
                  {(status === 'New' || status === 'Shortlisted') && (
                    <button className="btn-secondary biz-action-btn" onClick={() => handleInterview(viewedApp)}>
                      <Users size={14} /> Interview
                    </button>
                  )}
                  {status === 'Accepted' && (
                    <button className="btn-secondary biz-action-btn" onClick={() => handleMessage(viewedApp)}>
                      <MessageSquare size={14} /> Message
                    </button>
                  )}
                  {status !== 'Accepted' && status !== 'Rejected' && (
                    <button className="btn-primary biz-action-btn" onClick={() => handleAccept(viewedApp)}>
                      <Check size={14} /> Accept
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* List view */
        <div className="biz-apps-list">
          {filtered.length === 0 ? (
            <div className="glass-panel biz-apps-empty">
              <UserCheck size={40} style={{ color: 'var(--text-muted)', opacity: 0.25, marginBottom: '12px' }} />
              <h4>No {activeTab.toLowerCase()} applications</h4>
              <p>{activeTab === 'New' ? 'Applications will appear here when creators apply to your requirements.' : `Move applications here by updating their status.`}</p>
            </div>
          ) : (
            filtered.map((app, i) => {
              const creator = getCreator(app.creatorId);
              return (
                <div
                  key={`${app.creatorId}-${app.projectId}-${i}`}
                  className="glass-panel biz-app-card glass-panel-hover"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <img
                    src={creator?.profilePhoto || creator?.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={app.creatorName}
                    className="biz-app-avatar"
                  />
                  <div className="biz-app-card-body">
                    <div className="biz-app-card-name-row">
                      <h4 className="biz-app-name">{app.creatorName}</h4>
                      <span className="badge-pro" style={{ fontSize: '10px' }}>{creator?.verificationStatus || 'Verified'}</span>
                    </div>
                    <p className="biz-app-project-sub">for: <strong>{app.projectTitle}</strong></p>
                    <p className="biz-app-card-letter">"{app.coverLetter?.substring(0, 100)}{app.coverLetter?.length > 100 ? '...' : ''}"</p>
                    {creator?.skills?.slice(0, 4).map(s => (
                      <span key={s} className="biz-skill-chip" style={{ marginRight: '4px', display: 'inline-block', marginTop: '6px' }}>{s}</span>
                    ))}
                  </div>
                  <div className="biz-app-card-right">
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bid</span>
                      <h4 className="biz-app-bid-sm">{app.pricing}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{app.daysToComplete}d delivery</span>
                    </div>
                    <button className="biz-app-view-btn" onClick={() => handleViewApp(app)}>
                      <Eye size={13} /> Review <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessApplications;

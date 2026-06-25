import { useContext, useState, Fragment } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useToast } from '../../../components/SuccessToast';
import { UserCheck, Check, X, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { useResponsive } from '../../../hooks/useResponsive';
import './Business.css';

export const BusinessApplications = ({ onOpenMessages }) => {
  const { 
    currentUser, users, projects, applications, acceptApplication, rejectApplication 
  } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  const [expandedAppId, setExpandedAppId] = useState(null);
  const { isMobile } = useResponsive();

  // Gather pending proposals for the current business's projects
  const pendingApplications = [];
  (applications || []).forEach(app => {
    if (app.status !== 'Pending') return;
    const proj = projects.find(p => p.id === app.project_id);
    if (proj && proj.businessId === currentUser.id) {
      const creator = users.find(u => u.id === app.applicant_id);
      
      // Parse availability/delivery days from application's pitch (JSON string fallback)
      let availability = 'Full-time';
      let deliveryDays = 7;
      let coverLetterText = app.pitch || '';
      
      if (app.pitch && app.pitch.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(app.pitch);
          coverLetterText = parsed.coverLetter || parsed.text || '';
          availability = parsed.availability || 'Full-time';
          deliveryDays = parsed.daysToComplete || parsed.deliveryDays || 7;
        } catch {
          // use defaults
        }
      }

      pendingApplications.push({
        id: app.id,
        creatorId: app.applicant_id,
        creatorName: creator?.fullName || 'Unknown Creator',
        creatorPhoto: creator?.profilePhoto || creator?.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        creatorRole: creator?.role || 'Freelancer',
        pricing: app.rate,
        daysToComplete: deliveryDays,
        availability: availability,
        coverLetter: coverLetterText,
        projectId: app.project_id,
        projectTitle: proj.title
      });
    }
  });

  const handleAccept = async (app) => {
    const convId = await acceptApplication(app.id);
    showSuccessToast({
      title: 'Application Accepted',
      subtitle: `${app.creatorName}'s application has been accepted. Messaging and collaboration are active!`,
    });
    if (onOpenMessages && convId) onOpenMessages(convId);
  };

  const handleReject = async (app) => {
    await rejectApplication(app.id);
    showSuccessToast({ title: 'Application Rejected', subtitle: `${app.creatorName}'s application has been rejected.` });
  };

  const toggleExpand = (appId) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  return (
    <div className="biz-apps-root animate-fade-in" style={{ padding: '8px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Pending Recruitment Applications</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Review applications from creators, check rates and availability, and accept or reject candidates.</p>
      </div>

      {pendingApplications.length === 0 ? (
        <div className={isMobile ? "mobile-spacious-section" : "glass-panel"} style={isMobile ? { padding: '40px 0', textAlign: 'center' } : { padding: '60px 40px', textAlign: 'center', borderRadius: '16px' }}>
          <UserCheck size={40} style={{ color: 'var(--text-muted)', opacity: 0.25, marginBottom: '12px' }} />
          <h4 style={{ color: 'var(--text-white)' }}>No pending applications</h4>
          <p style={{ color: 'var(--text-gray)', fontSize: '13.5px' }}>Applications will appear here when creators apply to your active briefs.</p>
        </div>
      ) : (
        <div className={isMobile ? "mobile-spacious-section" : "glass-panel"} style={isMobile ? { padding: 0 } : { borderRadius: '16px', overflow: 'hidden', padding: 0, border: '1px solid var(--glass-border)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '12.5px', color: 'var(--text-gray)', fontWeight: '700' }}>Creator</th>
                  <th style={{ padding: '16px 20px', fontSize: '12.5px', color: 'var(--text-gray)', fontWeight: '700' }}>Role</th>
                  <th style={{ padding: '16px 20px', fontSize: '12.5px', color: 'var(--text-gray)', fontWeight: '700' }}>Applied For</th>
                  <th style={{ padding: '16px 20px', fontSize: '12.5px', color: 'var(--text-gray)', fontWeight: '700' }}>Budget Bid</th>
                  <th style={{ padding: '16px 20px', fontSize: '12.5px', color: 'var(--text-gray)', fontWeight: '700' }}>Availability</th>
                  <th style={{ padding: '16px 20px', fontSize: '12.5px', color: 'var(--text-gray)', fontWeight: '700' }}>Delivery</th>
                  <th style={{ padding: '16px 20px', fontSize: '12.5px', color: 'var(--text-gray)', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApplications.map((app) => {
                  const isExpanded = expandedAppId === app.id;
                  return (
                    <Fragment key={app.id}>
                      <tr 
                        style={{ 
                          borderBottom: '1px solid var(--glass-border)', 
                          background: isExpanded ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={app.creatorPhoto} 
                              alt={app.creatorName} 
                              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--glass-border)' }} 
                            />
                            <div>
                              <span style={{ fontWeight: '700', color: 'var(--text-white)', fontSize: '14.5px', display: 'block' }}>{app.creatorName}</span>
                              <button 
                                onClick={() => toggleExpand(app.id)} 
                                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0, marginTop: '2px', fontWeight: '600' }}
                              >
                                {isExpanded ? 'Hide Cover Letter' : 'View Cover Letter'} 
                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ 
                            background: app.creatorRole === 'Influencer' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(91, 174, 155, 0.1)', 
                            color: app.creatorRole === 'Influencer' ? '#a78bfa' : 'var(--accent-cyan)',
                            padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' 
                          }}>
                            {app.creatorRole}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13.5px', color: 'var(--text-white)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Briefcase size={14} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                              {app.projectTitle}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: '800', color: 'var(--accent-cyan)', fontSize: '14px' }}>
                          {app.pricing}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-gray)' }}>
                          {app.availability}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-gray)' }}>
                          {app.daysToComplete} days
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleReject(app)} 
                              className="btn-secondary" 
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                minHeight: '32px', 
                                borderRadius: '8px', 
                                color: '#ef4444', 
                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <X size={14} /> Reject
                            </button>
                            <button 
                              onClick={() => handleAccept(app)} 
                              className="btn-primary" 
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '12px', 
                                minHeight: '32px', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Check size={14} /> Accept
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ color: 'var(--text-white)', fontSize: '13.5px', lineHeight: '1.6' }}>
                              <strong style={{ color: 'var(--text-gray)', fontSize: '12px', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Cover Letter / Pitch</strong>
                              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{app.coverLetter || "No cover letter provided."}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessApplications;

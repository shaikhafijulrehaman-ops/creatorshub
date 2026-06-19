import { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { MapPin, Building, Globe, Shield, Star, Users, Clock, CheckCircle, Calendar, Link } from 'lucide-react';
import './Business.css';

const Lock = () => (
  <div className="biz-lock-overlay">
    <Shield size={14} />
    <span>Visible only after connection is accepted</span>
  </div>
);

export const BusinessPublicProfile = ({ businessId, viewerId }) => {
  const { users, projects, isConnected } = useContext(AppContext);

  const business = users.find(u => u.id === businessId);
  if (!business) return null;

  const connected = viewerId && isConnected ? isConnected(viewerId, businessId) : false;
  const fv = business.fieldVisibility || {};

  const canSee = (key) => {
    const vis = fv[key] || 'Private';
    if (vis === 'Public') return true;
    if (vis === 'Connections Only' && connected) return true;
    return false;
  };

  const openReqs = projects.filter(p => p.businessId === businessId && p.status === 'Open');
  const closedReqs = projects.filter(p => p.businessId === businessId && p.status !== 'Open');
  const totalApplications = projects
    .filter(p => p.businessId === businessId)
    .reduce((acc, p) => acc + (p.proposals?.length || 0), 0);

  const socialLinks = business.socialLinks || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Hero — Cover + Profile */}
      <div className="glass-panel biz-pub-hero">
        <img
          src={business.coverBanner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'}
          alt="Cover"
          className="biz-pub-cover"
        />
        <div className="biz-pub-profile-row">
          <img
            src={business.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80'}
            alt={business.businessName}
            className="biz-pub-avatar"
          />
          <div className="biz-pub-identity">
            <h1 className="biz-pub-name">
              {business.businessName || business.fullName}
              {business.verificationStatus && business.verificationStatus !== 'Basic Verified' && (
                <span className="badge-pro" style={{ fontSize: '10px' }}>
                  {business.verificationStatus}
                </span>
              )}
            </h1>
            <div className="biz-pub-meta">
              {business.location && <span><MapPin size={13} /> {business.location}</span>}
              {business.businessCategory && <span><Building size={13} /> {business.businessCategory}</span>}
              {business.teamSize && <span><Users size={13} /> {business.teamSize} team</span>}
              {canSee('website') && business.website && (
                <a href={business.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
                  <Globe size={13} /> Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="biz-pub-stats-grid">
        {[
          { val: openReqs.length, label: 'Open Positions' },
          { val: totalApplications, label: 'Applications Received' },
          { val: closedReqs.length, label: 'Completed Projects' },
          { val: business.teamSize || '—', label: 'Team Size' },
        ].map(({ val, label }) => (
          <div key={label} className="glass-panel biz-pub-stat-card">
            <div className="biz-pub-stat-val">{val}</div>
            <div className="biz-pub-stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="biz-pub-main-grid">

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* About */}
          {business.description && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 className="biz-pub-section-title">About</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-gray)', lineHeight: '1.7' }}>{business.description}</p>
            </div>
          )}

          {/* Open Positions */}
          {openReqs.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 className="biz-pub-section-title">Open Positions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {openReqs.map(req => (
                  <div key={req.id} className="glass-panel biz-pub-req-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="biz-category-badge">{req.category}</span>
                      <span className="biz-req-work-type">{req.remoteType || 'Remote'}</span>
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-white)' }}>{req.title}</h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-gray)' }}>{req.description?.substring(0, 100)}...</p>
                    <div className="biz-req-meta">
                      <span>Budget: {req.budget}</span>
                      <span><Calendar size={12} /> {req.deadline}</span>
                    </div>
                    {req.skills?.length > 0 && (
                      <div className="biz-skills-row">
                        {req.skills.slice(0, 5).map(s => <span key={s} className="biz-skill-chip">{s}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {business.reviews?.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 className="biz-pub-section-title">Reviews</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {business.reviews.slice(0, 5).map((rev, i) => (
                  <div key={i} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      {[1,2,3,4,5].map(n => <Star key={n} size={13} style={{ fill: n <= rev.rating ? '#f59e0b' : 'none', color: '#f59e0b' }} />)}
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-gray)', lineHeight: '1.5' }}>"{rev.text}"</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>— {rev.authorName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Contact Info */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <h2 className="biz-pub-section-title">Contact</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Email */}
              {canSee('email') ? (
                <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Email: <strong>{business.email}</strong></div>
              ) : <Lock />}

              {/* Mobile */}
              {canSee('mobile') ? (
                <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Mobile: <strong>{business.mobileNumber}</strong></div>
              ) : (fv.mobile !== 'Public' && <Lock />)}

              {/* WhatsApp */}
              {canSee('whatsapp') ? (
                <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>WhatsApp: <strong>{business.whatsapp}</strong></div>
              ) : (fv.whatsapp !== 'Public' && <Lock />)}

              {/* Address */}
              {canSee('address') && business.address && (
                <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Address: <strong>{business.address}</strong></div>
              )}

              {/* Contact Person */}
              {canSee('contact') && business.contactPerson && (
                <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Contact: <strong>{business.contactPerson}</strong></div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {canSee('social') && Object.values(socialLinks).some(Boolean) && (
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h2 className="biz-pub-section-title">Social Links</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(socialLinks).filter(([, v]) => v).map(([platform, url]) => {
                  const label = platform === 'whatsappChannel' ? 'WhatsApp Channel' : 
                                platform === 'telegramChannel' ? 'Telegram Channel' : 
                                platform === 'youtube' ? 'YouTube' : 
                                platform.charAt(0).toUpperCase() + platform.slice(1);
                  return (
                    <a key={platform} href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-gray)' }}>
                      <Link size={13} /> {label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Business Info */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <h2 className="biz-pub-section-title">Info</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-gray)' }}>
              {business.businessCategory && <div><Building size={13} style={{ display: 'inline', marginRight: '6px' }} />{business.businessCategory}</div>}
              {business.teamSize && <div><Users size={13} style={{ display: 'inline', marginRight: '6px' }} />Team size: {business.teamSize}</div>}
              {business.monthlyMarketingBudget && <div><CheckCircle size={13} style={{ display: 'inline', marginRight: '6px' }} />Budget: {business.monthlyMarketingBudget}</div>}
              {business.verificationStatus && <div><Shield size={13} style={{ display: 'inline', marginRight: '6px' }} />{business.verificationStatus}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                <span>{business.rating?.toFixed(1) || '5.0'} rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .biz-pub-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default BusinessPublicProfile;

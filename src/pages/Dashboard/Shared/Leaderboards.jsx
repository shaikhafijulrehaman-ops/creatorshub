import React, { useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { Award, Star, TrendingUp, ShieldCheck, Heart } from 'lucide-react';

export const Leaderboards = ({ onOpenProfile }) => {
  const { users } = useContext(AppContext);

  // Group and rank users
  const influencers = users
    .filter(u => u.role === 'Influencer')
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  const freelancers = users
    .filter(u => u.role === 'Freelancer')
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  const businesses = users
    .filter(u => u.role === 'Business Holder')
    .slice(0, 5); // Businesses don't have rating sort baseline, just slice

  const getRankBadgeColor = (idx) => {
    if (idx === 0) return '#ffd700'; // Gold
    if (idx === 1) return '#c0c0c0'; // Silver
    if (idx === 2) return '#cd7f32'; // Bronze
    return 'var(--text-muted)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '20px 0' }}>
      
      {/* Intro Header */}
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '30px', background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.15)', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: '700', gap: '6px', alignItems: 'center', marginBottom: '16px' }}>
          <Award size={14} /> Creator Leaderboards
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: '800' }}>Monthly Leaderboards</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '8px' }}>
          Explore the top performing brands, influencers, and freelancers in our ecosystem this month. Rankings are updated dynamically.
        </p>
      </div>

      {/* Grid columns */}
      <div className="leaderboards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        {/* Top Influencers */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔥 Top Influencers
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {influencers.map((inf, idx) => (
              <div 
                key={inf.id}
                onClick={() => onOpenProfile(inf.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}
              >
                <span style={{ fontSize: '16px', fontWeight: '800', color: getRankBadgeColor(idx), minWidth: '24px' }}>
                  #{idx + 1}
                </span>

                <img 
                  src={inf.profilePhoto} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                />

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{inf.fullName}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>{inf.followersCount} Followers</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: '700' }}>
                  <Star size={12} fill="#eab308" stroke="none" /> {inf.rating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Freelancers */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚡ Top Freelancers
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {freelancers.map((fl, idx) => (
              <div 
                key={fl.id}
                onClick={() => onOpenProfile(fl.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-cyan-light)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'}
              >
                <span style={{ fontSize: '16px', fontWeight: '800', color: getRankBadgeColor(idx), minWidth: '24px' }}>
                  #{idx + 1}
                </span>

                <img 
                  src={fl.profilePhoto} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                />

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{fl.fullName}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fl.services[0]}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: '700' }}>
                  <Star size={12} fill="#eab308" stroke="none" /> {fl.rating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Businesses */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏢 Top Partners (Brands)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {businesses.map((biz, idx) => (
              <div 
                key={biz.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '800', color: getRankBadgeColor(idx), minWidth: '24px' }}>
                  #{idx + 1}
                </span>

                <img 
                  src={biz.logo} 
                  style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} 
                />

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{biz.businessName}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{biz.businessCategory} • {biz.location}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                  Active
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .leaderboards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

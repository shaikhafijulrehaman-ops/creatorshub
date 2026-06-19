import { useContext, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { Search, MessageSquare, User, UserX, MapPin } from 'lucide-react';

export const MyConnections = ({ onOpenProfile, onStartChat }) => {
  const { 
    currentUser, 
    users, 
    connections, 
    removeConnection, 
    presenceList 
  } = useContext(AppContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'active', 'business', 'freelancer', 'influencer'

  // Get the connection objects for sorting
  const userConns = connections.filter(c => c.user_id1 === currentUser.id || c.user_id2 === currentUser.id);

  // Map to connection user details
  let connectedPeople = userConns.map(conn => {
    const targetId = conn.user_id1 === currentUser.id ? conn.user_id2 : conn.user_id1;
    const targetUser = users.find(u => u.id === targetId);
    if (!targetUser) return null;
    return {
      ...targetUser,
      connId: conn.id, // keep connection details for sorting/filtering
    };
  }).filter(Boolean);

  // Apply search query
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    connectedPeople = connectedPeople.filter(u => 
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.businessName && u.businessName.toLowerCase().includes(q)) ||
      (u.location && u.location.toLowerCase().includes(q)) ||
      (u.experience && u.experience.toLowerCase().includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q))
    );
  }

  // Helper to get role display
  const getRoleProfession = (u) => {
    if (u.role === 'Business Holder') return u.businessCategory || 'Business Holder';
    if (u.role === 'Freelancer') return u.experience || (u.services && u.services[0]) || 'Freelancer';
    if (u.role === 'Influencer') return (u.contentCategories && u.contentCategories[0]) || 'Influencer';
    return u.role;
  };

  // Apply sorting
  if (sortBy === 'newest') {
    // Sort by connId string descending
    connectedPeople.sort((a, b) => b.connId.localeCompare(a.connId));
  } else if (sortBy === 'active') {
    // Sort by online status
    connectedPeople.sort((a, b) => {
      const aOnline = presenceList[a.id] ? 1 : 0;
      const bOnline = presenceList[b.id] ? 1 : 0;
      return bOnline - aOnline;
    });
  } else if (sortBy === 'business') {
    connectedPeople = connectedPeople.filter(u => u.role === 'Business Holder');
  } else if (sortBy === 'freelancer') {
    connectedPeople = connectedPeople.filter(u => u.role === 'Freelancer');
  } else if (sortBy === 'influencer') {
    connectedPeople = connectedPeople.filter(u => u.role === 'Influencer');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-white)' }}>My Connections</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Manage your professional network and start direct collaborations.</p>
        </div>
        
        {/* Sort selector */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13.5px', color: 'var(--text-gray)' }}>Sort By:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="form-input"
            style={{ width: '180px', background: 'var(--bg-dark)', height: '38px', minHeight: '38px', padding: '0 12px' }}
          >
            <option value="newest">Newest Connections</option>
            <option value="active">Recently Active</option>
            <option value="business">Businesses Only</option>
            <option value="freelancer">Freelancers Only</option>
            <option value="influencer">Influencers Only</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input" 
          placeholder="Search connections by name, location, or bio..." 
          style={{ paddingLeft: '40px', height: '40px', minHeight: '40px' }}
        />
      </div>

      {/* Connections Grid */}
      {connectedPeople.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <User size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
          <h4 style={{ color: 'var(--text-white)', fontSize: '17px', fontWeight: '800' }}>No connections found.</h4>
          <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '6px' }}>
            {searchQuery ? 'Try adjusting your search query.' : 'Browse the public directory to find and connect with other members.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }} className="connections-grid">
          {connectedPeople.map(person => {
            const isOnline = presenceList[person.id];
            return (
              <div key={person.id} className="glass-panel glass-panel-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                
                {/* Active/Presence indicator */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: isOnline ? '#22c55e' : '#64748b',
                    boxShadow: isOnline ? '0 0 8px #22c55e' : 'none'
                  }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{isOnline ? 'Online' : 'Offline'}</span>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <img 
                    src={person.profilePhoto || person.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                    alt={person.fullName || person.businessName} 
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.08)' }} 
                  />
                  <div style={{ flex: 1, paddingRight: '60px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>{person.fullName || person.businessName}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '600', display: 'block', marginTop: '2px' }}>{getRoleProfession(person)}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <MapPin size={11} /> {person.location || 'Global'}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.4', marginBottom: '20px', flex: 1 }}>
                  {person.bio || 'Connected member of the Creators Hub community.'}
                </p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => onOpenProfile(person.id)} 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '11.5px', minHeight: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <User size={13} /> Profile
                    </button>
                    <button 
                      onClick={() => onStartChat(person.id)} 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '11.5px', minHeight: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageSquare size={13} /> Message
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeConnection(person.id)} 
                    className="btn-outline-red" 
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '11.5px', 
                      minHeight: '32px', 
                      borderRadius: '8px', 
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <UserX size={13} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .connections-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { UserX, User } from 'lucide-react';

export const BlockedProfilesList = () => {
  const { blockedUsers, users, unblockUser } = useContext(AppContext);

  const list = (blockedUsers || []).map(b => {
    const targetUser = users.find(u => u.id === b.blocked_id);
    if (!targetUser) return null;
    return {
      ...targetUser,
      blockRowId: b.id
    };
  }).filter(Boolean);

  const handleUnblock = async (userId) => {
    await unblockUser(userId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-white)' }}>Blocked Profiles</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-gray)' }}>Manage blocked profiles. Blocked users cannot send you messages or view your dashboard.</p>
      </div>

      {list.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <User size={48} style={{ color: 'var(--accent-cyan)', opacity: 0.3, marginBottom: '16px' }} />
          <h4 style={{ color: 'var(--text-white)', fontSize: '15px', fontWeight: '800' }}>No blocked profiles</h4>
          <p style={{ color: 'var(--text-gray)', fontSize: '13px', marginTop: '6px' }}>You haven't blocked any users yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map(user => (
            <div 
              key={user.id} 
              className="glass-panel" 
              style={{ 
                padding: '16px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                <img 
                  src={user.profilePhoto || user.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                  alt={user.fullName} 
                  style={{ width: '40px', height: '40px', borderRadius: user.role === 'Business Holder' ? '8px' : '50%', objectFit: 'cover' }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-white)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user.fullName || user.businessName}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'block', marginTop: '2px' }}>
                    {user.businessCategory || user.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn-outline-cyan"
                style={{ 
                  height: '34px', 
                  minHeight: '34px', 
                  borderRadius: '8px', 
                  padding: '0 14px', 
                  fontSize: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px' 
                }}
                onClick={() => handleUnblock(user.id)}
              >
                <UserX size={13} /> Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockedProfilesList;

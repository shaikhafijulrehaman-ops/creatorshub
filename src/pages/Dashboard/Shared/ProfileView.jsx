import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../../context/AppContext';
import { 
  Star, Heart, Bookmark, ShieldCheck, AlertTriangle, Globe, Mail, 
  MapPin, Phone, Plus, X, Code, CheckCircle, FileText,
  Briefcase, ChevronDown, ChevronUp, MessageSquare, RefreshCw
} from 'lucide-react';
import { useToast } from '../../../components/SuccessToast';
import { useResponsive } from '../../../hooks/useResponsive';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BusinessPublicProfile } from '../Business/BusinessPublicProfile';

class ProfileErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ProfileView boundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel" style={{ padding: '32px', margin: '20px auto', maxWidth: '600px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.04)' }}>
          <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '16px', marginLeft: 'auto', marginRight: 'auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '8px' }}>Something went wrong</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-gray)', marginBottom: '20px' }}>
            We encountered an unexpected error while loading this profile.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })} 
            className="btn-primary" 
            style={{ padding: '8px 20px', borderRadius: '10px' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProfileSkeleton = () => {
  return (
    <div className="glass-panel profile-view-container" style={{ padding: '24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} className="skeleton-pulse" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ width: '150px', height: '20px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '100px', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ width: '80px', height: '32px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ width: '80px', height: '32px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ width: '80px', height: '32px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }} />
      </div>
      <div style={{ flex: 1, borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '120px', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ width: '100%', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ width: '90%', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ width: '95%', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }} />
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

const ProfileErrorCard = () => {
  return (
    <div className="glass-panel" style={{ padding: '40px 24px', margin: '40px auto', maxWidth: '500px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', background: 'rgba(10,11,18,0.3)', backdropFilter: 'blur(16px)' }}>
      <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderRadius: '50%', marginBottom: '20px' }}>
        <AlertTriangle size={36} />
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '10px' }}>Failed to Load Profile</h3>
      <p style={{ fontSize: '13.5px', color: 'var(--text-gray)', lineHeight: '1.6', marginBottom: '24px' }}>
        We encountered a network error or the profile doesn't exist. Please check your connection and try again.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="btn-primary" 
        style={{ width: '100%', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700' }}
      >
        <RefreshCw size={16} /> Retry Connection
      </button>
    </div>
  );
};

const CompleteYourProfile = ({ user, score, onNavigate, onBypass }) => {
  const missingItems = [];
  if (user.role === 'Business Holder') {
    if (!user.profilePhoto && !user.logo) missingItems.push({ label: 'Profile Photo / Logo', desc: 'Add a brand logo or avatar' });
    if (!user.fullName && !user.businessName) missingItems.push({ label: 'Business Name', desc: 'Specify your company or brand name' });
    if (!user.bio && !user.description) missingItems.push({ label: 'Bio / Description', desc: 'Tell creators what your business does' });
    if (!user.location) missingItems.push({ label: 'Location', desc: 'Set your corporate or regional location' });
    if (!user.email && !user.mobileNumber) missingItems.push({ label: 'Contact Details', desc: 'Add an email or phone number for connection requests' });
  } else if (user.role === 'Freelancer') {
    if (!user.profilePhoto) missingItems.push({ label: 'Profile Photo', desc: 'Upload a professional headshot' });
    if (!user.bio) missingItems.push({ label: 'Bio / Summary', desc: 'Write a quick summary of your expertise' });
    if (!user.location) missingItems.push({ label: 'Location', desc: 'Specify your region or timezone' });
    if (!user.skills || user.skills.length === 0) missingItems.push({ label: 'Skills & Tech Stack', desc: 'List at least one professional skill' });
    if (!user.portfolio || user.portfolio.length === 0) missingItems.push({ label: 'Portfolio Item', desc: 'Add a project link or file to show off your work' });
  } else if (user.role === 'Influencer') {
    if (!user.profilePhoto) missingItems.push({ label: 'Profile Photo', desc: 'Upload an avatar' });
    if (!user.platforms || Object.keys(user.platforms).length === 0) missingItems.push({ label: 'Social Platforms', desc: 'Connect at least one channel' });
    if (!user.contentCategories || user.contentCategories.length === 0) missingItems.push({ label: 'Content Categories', desc: 'Specify your niche' });
    if (!user.verificationStatus || user.verificationStatus === 'Basic Verified') missingItems.push({ label: 'Ecosystem Verification', desc: 'Complete identity checks' });
  }

  return (
    <div className="glass-panel" style={{ padding: '32px 24px', margin: '20px auto', maxWidth: '600px', border: '1px solid var(--glass-border)', borderRadius: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span className="badge-premium" style={{ textTransform: 'uppercase' }}>Incomplete Profile</span>
        <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '8px', color: 'var(--text-white)' }}>Complete Your Profile</h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-gray)', marginTop: '4px' }}>
          Your profile is currently at <strong style={{ color: 'var(--accent-cyan)' }}>{score}%</strong> completion. Fill out missing details to unlock full features.
        </p>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', margin: '16px auto 0 auto', maxWidth: '300px' }}>
          <div style={{ width: `${score}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-cyan-bright) 100%)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
        {missingItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '12px', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px dashed var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-white)', margin: 0 }}>{item.label}</h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-gray-light)', margin: 0, marginTop: '2px' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={() => {
            if (onNavigate) {
              onNavigate('dashboard');
            }
          }}
          className="btn-primary"
          style={{ width: '100%', height: '48px', borderRadius: '12px', fontWeight: '700' }}
        >
          Go to Settings Wizard
        </button>
        <button 
          onClick={onBypass}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          View Public Profile Anyway
        </button>
      </div>
    </div>
  );
};

const CollapsibleSection = ({ title, icon: Icon, isOpen, onToggle, children }) => {
  return (
    <div 
      className="glass-panel collapsible-section-card" 
      style={{ 
        marginBottom: '16px', 
        overflow: 'hidden', 
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div 
        onClick={onToggle}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 24px', 
          cursor: 'pointer',
          background: isOpen ? 'rgba(255,255,255,0.02)' : 'none',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {Icon && <Icon size={18} style={{ color: 'var(--accent-cyan)' }} />}
          <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-white)' }}>{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
      </div>

      <div style={{ 
        maxHeight: isOpen ? '2500px' : '0px', 
        overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderTop: isOpen ? '1px solid var(--glass-border)' : 'none'
      }}>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const ProfileViewInner = ({ userId, onClose, onNavigate }) => {
  const { 
    users, currentUser, toggleSaveUser, savedProfiles, 
    toggleFollowUser, followedProfiles, updateProfile, startConversation,
    conversations, projects, isConnected: isDbConnected, loading, initialized,
    connectionRequests, sendConnectionRequest, acceptConnectionRequest, declineConnectionRequest, removeConnection, getConnections, setActiveDashboardTab
  } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('id');
  const targetUserId = queryUserId || userId || currentUser?.id;
  const [bypassChecklist, setBypassChecklist] = useState(false);
  const { showSuccessToast } = useToast();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const navigate = useNavigate();
  const [activeProfileTab, setActiveProfileTab] = useState('overview');

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [openSections, setOpenSections] = useState(() => {
    const isMob = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    return {
      bio: true,
      businessInfo: !isMob,
      contactInfo: false,
      platforms: !isMob,
      portfolio: !isMob,
      audience: !isMob,
      reviews: false,
      services: !isMob,
      skills: !isMob,
      verification: !isMob
    };
  });

  useEffect(() => {
    let lastMob = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const checkMobile = () => {
      const mob = window.innerWidth < 768;
      if (mob !== lastMob) {
        lastMob = mob;
        setOpenSections({
          bio: true,
          businessInfo: !mob,
          contactInfo: false,
          platforms: !mob,
          portfolio: !mob,
          audience: !mob,
          reviews: false,
          services: !mob,
          skills: !mob,
          verification: !mob
        });
      }
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const getProfileCompletionScore = (u) => {
    if (!u) return 0;
    let score = 0;
    if (u.role === 'Business Holder') {
      if (u.profilePhoto || u.logo) score += 20;
      if (u.fullName || u.businessName) score += 20;
      if (u.bio || u.description) score += 20;
      if (u.location) score += 20;
      if (u.email || u.mobileNumber) score += 20;
    } else if (u.role === 'Freelancer') {
      if (u.profilePhoto) score += 20;
      if (u.bio) score += 20;
      if (u.location) score += 20;
      if (u.skills && u.skills.length > 0) score += 20;
      if (u.portfolio && u.portfolio.length > 0) score += 20;
    } else if (u.role === 'Influencer') {
      score = 15;
      if (u.profilePhoto) score += 20;
      if (u.platforms && Object.keys(u.platforms).length > 0) score += 25;
      if (u.contentCategories && u.contentCategories.length > 0) score += 20;
      if (u.verificationStatus && u.verificationStatus !== 'Basic Verified') score += 20;
    }
    return score;
  };

  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (loading || !initialized) {
      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [loading, initialized]);

  if ((loading || !initialized) && showSkeleton) {
    return <ProfileSkeleton />;
  } else if (loading || !initialized) {
    return null;
  }

  const user = users.find(u => u.id === targetUserId);
  if (!user) {
    return <ProfileErrorCard />;
  }

  const isOwner = currentUser && currentUser.id === user.id;
  const score = getProfileCompletionScore(user);



  const isSaved = savedProfiles.includes(user.id);
  const isFollowing = followedProfiles.includes(user.id);

  const isConnected = (() => {
    if (!currentUser || !user) return false;
    const myFollows = followedProfiles || [];
    const mutualFollow = myFollows.includes(user.id);
    const hasConversation = (conversations || []).some(c => c.members.includes(user.id));
    return mutualFollow || hasConversation;
  })();

  const showBusinessContact = isOwner || (user.role === 'Business Holder' && user.contactVisibility === 'Public');
  const showSocialLinks = isOwner || (user.role === 'Influencer' && user.socialLinksVisibility === 'Public');

  const handlePostReview = (e) => {
    e.preventDefault();
    if (!reviewComment) {
      showSuccessToast({ title: '⚠ Missing Comment', subtitle: 'Please write a comment before posting.' });
      return;
    }

    const newReview = {
      id: `r-${Date.now()}`,
      businessName: currentUser ? (currentUser.businessName || currentUser.fullName) : 'Anonymous client',
      rating: Number(reviewRating),
      comment: reviewComment
    };

    const updatedReviews = [...(user.reviews || []), newReview];
    
    // Recalculate average rating
    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / updatedReviews.length;

    updateProfile(user.id, {
      reviews: updatedReviews,
      rating: avgRating
    });

    setReviewComment('');
    setShowReviewModal(false);
  };

  return (
    <div className="glass-panel animate-scale-up profile-view-container">
      
      {/* Back button */}
      <button 
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-gray)',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.2s ease'
        }}
        className="close-button"
      >
        <X size={20} />
      </button>

      {user.role === 'Business Holder' ? (
        <div style={{ marginTop: '20px', width: '100%' }}>
          <BusinessPublicProfile businessId={user.id} viewerId={currentUser?.id} />
        </div>
      ) : (
        <>
          {/* Header Profile Meta */}
          <div className="profile-header-meta">
        <img 
          src={user.profilePhoto || user.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
          alt={user.fullName}
          className="profile-avatar"
          style={{ borderRadius: user.role === 'Business Holder' ? '16px' : '50%' }}
        />

        <div className="profile-info-main">
          <div className="profile-name-row">
            <h2>{user.fullName}</h2>
            <span className={user.verificationStatus === 'Premium Verified' ? 'badge-premium' : (user.verificationStatus === 'Professional Verified' ? 'badge-pro' : 'badge-basic')}>
              {user.verificationStatus}
            </span>
          </div>

          <p className="profile-role-text">
            {user.role} {user.businessCategory && `• ${user.businessCategory}`}
          </p>

          <div className="profile-meta-details">
            <span>
              <MapPin size={14} /> {user.location}
            </span>
            {showBusinessContact && user.email && (
              <span>
                <Mail size={14} /> {user.email}
              </span>
            )}
            {showBusinessContact && user.mobileNumber && (
              <span>
                <Phone size={14} /> {user.mobileNumber}
              </span>
            )}
            <span 
              onClick={() => {
                if (currentUser && currentUser.id === user.id) {
                  if (onNavigate) {
                    onNavigate('dashboard');
                    setActiveDashboardTab('connections');
                  }
                }
              }}
              style={{ cursor: currentUser && currentUser.id === user.id ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              👥 {getConnections(user.id).length} Connections
            </span>
          </div>
        </div>

        {/* Action triggers (Save/Follow/Connect/Message) */}
        {currentUser && currentUser.id !== user.id && (
          <div className="profile-actions-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
              
              {/* Message button: always active */}
              <button 
                onClick={async () => {
                  await startConversation(user.id);
                  if (onNavigate) {
                    onNavigate('messages');
                  } else {
                    navigate('/messages');
                  }
                  handleClose();
                }}
                className="btn-primary"
                style={{ 
                  height: '48px', 
                  padding: '0 20px', 
                  fontSize: '13px', 
                  borderRadius: '10px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px'
                }}
              >
                <MessageSquare size={14} /> Message
              </button>

              {/* Connect Button and workflow */}
              {(() => {
                const isConnected = isDbConnected(currentUser.id, user.id);
                const sentRequest = connectionRequests.find(r => r.sender_id === currentUser.id && r.receiver_id === user.id && r.status === 'Pending');
                const receivedRequest = connectionRequests.find(r => r.sender_id === user.id && r.receiver_id === currentUser.id && r.status === 'Pending');

                if (isConnected) {
                  return (
                    <button 
                      onClick={() => removeConnection(user.id)}
                      className="btn-secondary"
                      style={{ height: '48px', padding: '0 20px', fontSize: '13px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-white)' }}
                    >
                      Connected ✓
                    </button>
                  );
                }
                if (sentRequest) {
                  return (
                    <button 
                      disabled
                      className="btn-secondary"
                      style={{ height: '48px', padding: '0 20px', fontSize: '13px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7, cursor: 'not-allowed' }}
                    >
                      Request Sent
                    </button>
                  );
                }
                if (receivedRequest) {
                  return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => acceptConnectionRequest(receivedRequest.id, user.id)}
                        className="btn-primary"
                        style={{ height: '48px', padding: '0 16px', fontSize: '13px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#22c55e', borderColor: '#22c55e' }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => declineConnectionRequest(receivedRequest.id)}
                        className="btn-secondary"
                        style={{ height: '48px', padding: '0 16px', fontSize: '13px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                      >
                        Decline
                      </button>
                    </div>
                  );
                }
                return (
                  <button 
                    onClick={() => sendConnectionRequest(user.id)}
                    className="btn-outline-cyan"
                    style={{ height: '48px', padding: '0 20px', fontSize: '13px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Connect
                  </button>
                );
              })()}

              {/* Bookmark Button */}
              {user.role !== 'Freelancer' && !(user.role === 'Business Holder' && user.contactVisibility !== 'Public') && (
                <button 
                  onClick={() => toggleSaveUser(user.id)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSaved ? 'var(--accent-cyan)' : 'var(--text-gray)',
                    cursor: 'pointer'
                  }}
                >
                  <Bookmark size={16} fill={isSaved ? 'var(--accent-cyan)' : 'none'} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {!isDesktop ? (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="mobile-profile-sections">
          
          {/* Bio & Summary Card */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} style={{ color: 'var(--accent-cyan)' }} /> Bio & Summary
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.5', margin: 0 }}>
              {user.bio || user.description || 'No summary bio provided.'}
            </p>
          </div>

          {/* Stats / Reach / Stack Card */}
          {user.role === 'Influencer' && user.platforms && (
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={14} style={{ color: 'var(--accent-cyan)' }} /> Platform Channels & Reach
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(user.platforms).map(pName => {
                  const plat = user.platforms[pName];
                  return (
                    <div key={pName} style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--accent-cyan)' }}>{pName}</span>
                        {plat.url && (
                          <a href={plat.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            Channel <Globe size={9} />
                          </a>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Followers</span>
                          <p style={{ fontSize: '11.5px', fontWeight: '700', margin: 0 }}>{plat.followers || '0'}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Engagement</span>
                          <p style={{ fontSize: '11.5px', fontWeight: '700', margin: 0, color: 'var(--accent-cyan-bright)' }}>{plat.engagement || '0%'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Audience Audit (Influencer specific) */}
          {user.role === 'Influencer' && user.fraudAudit && (
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} style={{ color: 'var(--accent-cyan)' }} /> AI Audience Audit
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)' }}>Fake Followers</span>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: parseFloat(user.fraudAudit.fakeFollowers) > 10 ? '#ef4444' : '#22c55e' }}>
                    {user.fraudAudit.fakeFollowers}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-muted)' }}>Authenticity</span>
                  <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-white)' }}>{user.fraudAudit.engagementAuthenticity}</span>
                </div>
              </div>
            </div>
          )}

          {/* Skills (Freelancer specific) */}
          {user.role === 'Freelancer' && user.skills && user.skills.length > 0 && (
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings size={14} style={{ color: 'var(--accent-cyan)' }} /> Skills & Tech Stack
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {user.skills.map(s => (
                  <span key={s} className="badge-tag" style={{ fontSize: '10px', padding: '2px 8px' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio & Work Gallery (Freelancer specific) */}
          {user.role === 'Freelancer' && user.portfolio && user.portfolio.length > 0 && (
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={14} style={{ color: 'var(--accent-cyan)' }} /> Portfolio & Work
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {user.portfolio.map((port, idx) => (
                  <div key={idx} style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-white)', display: 'block' }}>{port.service}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{port.description}</span>
                    </div>
                    {port.url && (
                      <a href={port.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px', minHeight: '26px' }}>
                        Link <Globe size={9} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Details Card */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} style={{ color: 'var(--accent-cyan)' }} /> Contact Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Email:</span>
                <span style={{ color: 'var(--text-white)' }}>{showBusinessContact || showSocialLinks ? (user.email || 'N/A') : 'Protected'}</span>
              </div>
              {user.mobileNumber && (
                <div>
                  <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Phone:</span>
                  <span style={{ color: 'var(--text-white)' }}>{showBusinessContact || showSocialLinks ? user.mobileNumber : 'Protected'}</span>
                </div>
              )}
              {user.website && (
                <div>
                  <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Website:</span>
                  <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }}>{user.website}</a>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Card */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-white)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={14} style={{ color: 'var(--accent-cyan)' }} /> Reviews ({user.reviews ? user.reviews.length : 0})
              </h4>
              {currentUser && currentUser.id !== user.id && (
                <button 
                  onClick={() => setShowReviewModal(true)} 
                  className="btn-outline-cyan"
                  style={{ height: '28px', padding: '0 10px', borderRadius: '6px', fontSize: '10.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={10} /> Add
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!user.reviews || user.reviews.length === 0 ? (
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0', margin: 0 }}>
                  No reviews recorded yet for this profile.
                </p>
              ) : (
                user.reviews.map(rev => (
                  <div key={rev.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>{rev.businessName}</span>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < rev.rating ? '#eab308' : 'none'} stroke={i < rev.rating ? 'none' : 'var(--text-muted)'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-gray)', lineHeight: '1.4', margin: 0 }}>{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="profile-details-grid">
        
        {/* Left column: Bio, Details, Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Bio Card */}
          <CollapsibleSection 
            title="Bio & Summary" 
            icon={FileText} 
            isOpen={openSections.bio} 
            onToggle={() => toggleSection('bio')}
          >
            <p style={{ fontSize: '14px', color: 'var(--text-gray)', lineHeight: '1.6', margin: 0 }}>
              {user.bio || user.description || 'No summary bio provided.'}
            </p>
          </CollapsibleSection>

          {/* Business Info (Business Holder specific) */}
          {user.role === 'Business Holder' && (
            <CollapsibleSection 
              title="Business Information" 
              icon={Briefcase} 
              isOpen={openSections.businessInfo} 
              onToggle={() => toggleSection('businessInfo')}
            >
              <div className="info-grid-2-col">
                <div className="info-item">
                  <span className="info-label">Business Name</span>
                  <p className="info-val">{user.businessName || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <span className="info-label">Business Category</span>
                  <p className="info-val">{user.businessCategory || 'N/A'}</p>
                </div>
                {user.website && showBusinessContact && (
                  <div className="info-item">
                    <span className="info-label">Website</span>
                    <p className="info-val">
                      <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {user.website.replace('https://', '')} <Globe size={12} />
                      </a>
                    </p>
                  </div>
                )}
                {user.teamSize && (
                  <div className="info-item">
                    <span className="info-label">Team Size</span>
                    <p className="info-val">{user.teamSize}</p>
                  </div>
                )}
                {user.monthlyMarketingBudget && (
                  <div className="info-item" style={{ gridColumn: 'span 2' }}>
                    <span className="info-label">Monthly Marketing Budget</span>
                    <p className="info-val" style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{user.monthlyMarketingBudget}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Platform Channels (Influencer specific) */}
          {user.role === 'Influencer' && user.platforms && showSocialLinks && (
            <CollapsibleSection 
              title="Platform Channels & Reach" 
              icon={Globe} 
              isOpen={openSections.platforms} 
              onToggle={() => toggleSection('platforms')}
            >
              <div className="platform-channels-grid">
                {Object.keys(user.platforms).map(pName => {
                  const plat = user.platforms[pName];
                  return (
                    <div key={pName} className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-cyan)' }}>{pName}</span>
                        <a href={plat.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          Channel <Globe size={10} />
                        </a>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Followers</span>
                          <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{plat.followers}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Avg. Reach</span>
                          <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{plat.reach}</p>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Engagement Rate</span>
                          <p style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: 'var(--accent-cyan-bright)' }}>{plat.engagement || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {/* Portfolio (Freelancer specific) */}
          {user.role === 'Freelancer' && user.portfolio && (
            <CollapsibleSection 
              title="Portfolio & Work Gallery" 
              icon={FileText} 
              isOpen={openSections.portfolio} 
              onToggle={() => toggleSection('portfolio')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {user.portfolio.map((port, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: '1', minWidth: '200px' }}>
                      <div style={{ padding: '8px', background: 'rgba(0, 217, 255, 0.08)', color: 'var(--accent-cyan)', borderRadius: '8px' }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>{port.service}</h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>{port.description}</p>
                      </div>
                    </div>
                    <a 
                      href={port.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-secondary" 
                      style={{ padding: '0 16px', height: '36px', borderRadius: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      View Project <Globe size={11} />
                    </a>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Reviews Card */}
          <CollapsibleSection 
            title={`Collaboration Reviews (${user.reviews ? user.reviews.length : 0})`} 
            icon={Star} 
            isOpen={openSections.reviews} 
            onToggle={() => toggleSection('reviews')}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
              {currentUser && currentUser.id !== user.id && (
                <button 
                  onClick={() => setShowReviewModal(true)} 
                  className="btn-outline-cyan"
                  style={{ height: '36px', padding: '0 16px', borderRadius: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={12} /> Post Review
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!user.reviews || user.reviews.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', margin: 0 }}>
                  No reviews recorded yet for this profile.
                </p>
              ) : (
                user.reviews.map(rev => (
                  <div key={rev.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>{rev.businessName}</span>
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} fill={i < rev.rating ? '#eab308' : 'none'} stroke={i < rev.rating ? 'none' : 'var(--text-muted)'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-gray)', lineHeight: '1.4', margin: 0 }}>{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </CollapsibleSection>

        </div>

        {/* Right column: Summary Stats, Ratings, Fraud Audits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Trust Score & Verification Card */}
          <CollapsibleSection 
            title="Identity Verification & Trust Score" 
            icon={ShieldCheck} 
            isOpen={openSections.verification} 
            onToggle={() => toggleSection('verification')}
          >
            <div className="profile-strength-layout">
              <div className="rating-card-speedometer">
                <h4 style={{ fontSize: '13px', color: 'var(--text-gray)', marginBottom: '8px', marginTop: 0 }}>Ecosystem Collaboration Rating</h4>
                <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                  {Number(user.rating || 5.0).toFixed(1)}
                </span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '4px 0 10px 0' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(user.rating || 5) ? '#eab308' : 'none'} stroke={i < Math.round(user.rating || 5) ? 'none' : 'var(--text-muted)'} />
                  ))}
                </div>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>Based on verified collaboration escrow logs</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-gray)', marginBottom: '4px', marginTop: 0 }}>Profile Strength Indicator</h4>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${user.profileStrength || 85}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-cyan-bright) 100%)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Completion Strength:</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{user.profileStrength || 85}%</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: 'var(--text-white)', fontSize: '12px' }}>
                  <CheckCircle size={14} className="text-accent-cyan" style={{ color: 'var(--accent-cyan)' }} />
                  <span>Stripe Escrow Verified</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: 'var(--text-white)', fontSize: '12px' }}>
                  <CheckCircle size={14} className="text-accent-cyan" style={{ color: 'var(--accent-cyan)' }} />
                  <span>Background Check Cleared</span>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* AI Audience Audit Card (Influencer specific) */}
          {user.role === 'Influencer' && user.fraudAudit && (
            <CollapsibleSection 
              title="🛡️ AI Audience Audit" 
              icon={ShieldCheck} 
              isOpen={openSections.audience} 
              onToggle={() => toggleSection('audience')}
            >
              <div className="info-grid-2-col" style={{ gap: '12px' }}>
                <div className="info-item">
                  <span className="info-label">Fake Followers:</span>
                  <span className="info-val" style={{ fontWeight: '700', color: parseFloat(user.fraudAudit.fakeFollowers) > 10 ? '#ef4444' : '#22c55e' }}>
                    {user.fraudAudit.fakeFollowers}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Authenticity:</span>
                  <span className="info-val">{user.fraudAudit.engagementAuthenticity}</span>
                </div>
                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                  <span className="info-label">Growth Pattern:</span>
                  <span className="info-val">{user.fraudAudit.suspiciousGrowth}</span>
                </div>

                <div style={{ 
                  gridColumn: 'span 2',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginTop: '8px',
                  padding: '8px 12px', 
                  borderRadius: '8px',
                  background: user.fraudAudit.badge === 'Verified Audience' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: user.fraudAudit.badge === 'Verified Audience' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                  color: user.fraudAudit.badge === 'Verified Audience' ? '#22c55e' : '#ef4444',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {user.fraudAudit.badge === 'Verified Audience' ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                  <span>{user.fraudAudit.badge}</span>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Skills & Stack Card (Freelancer specific) */}
          {user.role === 'Freelancer' && (
            <CollapsibleSection 
              title="Skills & Tech Stack" 
              icon={Code} 
              isOpen={openSections.skills} 
              onToggle={() => toggleSection('skills')}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {user.skills ? user.skills.map(s => (
                  <span key={s} className="badge-tag" style={{ fontSize: '11px' }}>{s}</span>
                )) : null}
              </div>
            </CollapsibleSection>
          )}

          {/* Contact Details Card */}
          {(() => {
            const hasSocialLinks = user.socialLinks && Object.values(user.socialLinks).some(val => val && val.trim() !== '');
            const showContactSection = showBusinessContact || (user.role === 'Influencer' && showSocialLinks && hasSocialLinks);
            if (!showContactSection) return null;
            return (
              <CollapsibleSection 
                title="Contact & Connections" 
                icon={Mail} 
                isOpen={openSections.contactInfo} 
                onToggle={() => toggleSection('contactInfo')}
              >
                <div className="info-grid-2-col">
                  {showBusinessContact && (
                    <>
                      <div className="info-item" style={{ gridColumn: 'span 2' }}>
                        <span className="info-label">Email Address</span>
                        <p className="info-val">{user.email || 'N/A'}</p>
                      </div>
                      {user.mobileNumber && (
                        <div className="info-item" style={{ gridColumn: 'span 2' }}>
                          <span className="info-label">Mobile Number</span>
                          <p className="info-val">{user.mobileNumber}</p>
                        </div>
                      )}
                      {user.address && (
                        <div className="info-item" style={{ gridColumn: 'span 2' }}>
                          <span className="info-label">Business Address</span>
                          <p className="info-val" style={{ fontSize: '13px' }}>{user.address}</p>
                        </div>
                      )}
                      {user.role === 'Business Holder' && user.mobileNumber && (
                        <div className="info-item" style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                          <span className="info-label">WhatsApp Contact</span>
                          <p className="info-val">
                            <a 
                              href={`https://wa.me/${user.mobileNumber.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ color: '#25D366', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                            >
                              Chat on WhatsApp
                            </a>
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {user.role === 'Influencer' && showSocialLinks && hasSocialLinks && (
                    <div className="info-item" style={{ gridColumn: 'span 2', marginTop: '6px' }}>
                      <span className="info-label">Social Connections</span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {Object.entries(user.socialLinks).map(([platform, url]) => {
                          if (!url || url.trim() === '') return null;
                          return (
                            <a 
                              key={platform} 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn-secondary" 
                              style={{ height: '36px', padding: '0 12px', borderRadius: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', textTransform: 'capitalize' }}
                            >
                              {platform}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            );
          })()}

        </div>

      </div>
      )}

      {/* POST REVIEW MODAL */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9000
        }}>
          <div className="glass-panel animate-scale-up" style={{ padding: '24px', width: '90%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Post Collaboration Review</h3>
              <button 
                onClick={() => setShowReviewModal(false)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-gray)', 
                  cursor: 'pointer',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePostReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Rating Score</label>
                <select 
                  className="form-input" 
                  value={reviewRating} 
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  style={{ background: 'var(--bg-dark)', width: '100%' }}
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Subpar)</option>
                  <option value={1}>1 Star (Poor)</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '12px' }}>Collaboration Comment</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  placeholder="Detail the experience, reach deliverables, promptness..." 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ resize: 'none', width: '100%', padding: '12px' }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', height: '48px', marginTop: '10px' }}>
                Submit Review Rating
              </button>
            </form>
          </div>
        </div>
      )}
        </>
      )}

      <style>{`
        .profile-view-container {
          padding: 32px;
          position: relative;
        }
        .profile-header-meta {
          display: flex;
          gap: 28px;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 28px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border: 2px solid var(--accent-cyan-bright);
          box-shadow: var(--glow-cyan) 0px 0px 15px -5px;
        }
        .profile-info-main {
          flex: 1;
          min-width: 260px;
        }
        .profile-name-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .profile-name-row h2 {
          font-size: 24px;
          font-weight: 800;
          margin: 0;
        }
        .profile-role-text {
          font-size: 13px;
          color: var(--accent-cyan);
          margin-top: 4px;
          font-weight: 600;
        }
        .profile-meta-details {
          display: flex;
          gap: 16px;
          color: var(--text-gray);
          font-size: 12.5px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .profile-meta-details span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .profile-actions-wrapper {
          display: flex;
          gap: 10px;
        }
        .profile-details-grid {
          display: grid;
          grid-template-columns: 1.8fr 1.2fr;
          gap: 24px;
        }
        .info-grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .info-val {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-white);
          margin: 0;
          word-break: break-all;
        }
        .badge-tag {
          font-size: 11px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 4px 10px;
          border-radius: 6px;
          color: var(--text-white);
        }
        .platform-channels-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .profile-strength-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rating-card-speedometer {
          text-align: center;
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
        }
        
        /* Interactive touch-friendly states */
        .collapsible-section-card:hover {
          border-color: rgba(0, 217, 255, 0.2) !important;
          box-shadow: rgba(0, 217, 255, 0.02) 0px 4px 20px;
        }
        .collapsible-header:hover {
          background: rgba(255, 255, 255, 0.03) !important;
        }
        .close-button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: var(--text-white) !important;
        }

        @media (max-width: 900px) {
          .profile-details-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .profile-view-container {
            padding: 16px;
          }
        }

        @media (max-width: 600px) {
          .profile-header-meta {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .profile-info-main {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: unset;
            width: 100%;
          }
          .profile-name-row {
            flex-direction: column;
            gap: 8px;
          }
          .profile-meta-details {
            justify-content: center;
            flex-direction: column;
            gap: 8px;
            margin-top: 8px;
          }
          .profile-actions-wrapper {
            width: 100%;
            justify-content: center;
            margin-top: 8px;
          }
          .profile-actions-wrapper button {
            flex: 1;
          }
          .info-grid-2-col {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .platform-channels-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

    </div>
  );
};

export const ProfileView = (props) => {
  return (
    <ProfileErrorBoundary>
      <ProfileViewInner {...props} />
    </ProfileErrorBoundary>
  );
};

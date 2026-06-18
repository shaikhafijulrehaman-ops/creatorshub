import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Check, Edit3, X, Award, ShieldCheck, Sparkles
} from 'lucide-react';

export const OnboardingWidget = () => {
  const { currentUser, updateProfile } = useContext(AppContext);
  const [activeModal, setActiveModal] = useState(null); // 'business_profile', 'contact_details', etc.
  const [verifying, setVerifying] = useState(false);

  // Form States - Business Holder
  const [businessName, setBusinessName] = useState(currentUser?.businessName || '');
  const [businessCategory, setBusinessCategory] = useState(currentUser?.businessCategory || 'E-Commerce');
  const [description, setDescription] = useState(currentUser?.description || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.mobileNumber || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [teamSize, setTeamSize] = useState(currentUser?.teamSize || '1-10');
  const [monthlyMarketingBudget, setMonthlyMarketingBudget] = useState(currentUser?.monthlyMarketingBudget || '<₹1,000');
  const [website, setWebsite] = useState(currentUser?.website || '');

  // Form States - Influencer
  const [contentCategories, setContentCategories] = useState(currentUser?.contentCategories?.join(', ') || '');
  const [primaryPlatform, setPrimaryPlatform] = useState('');
  const [profileUrl, setProfileUrl] = useState(currentUser?.profileUrl || '');
  const [followers, setFollowers] = useState('');
  const [reach, setReach] = useState('');
  const [pricing, setPricing] = useState('');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Form States - Freelancer
  const [services, setServices] = useState(currentUser?.services?.join(', ') || '');
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser?.portfolio?.[0]?.url || '');
  const [skills, setSkills] = useState(currentUser?.skills?.join(', ') || '');
  const [experience, setExperience] = useState(currentUser?.experience || '1 Year');

  if (!currentUser || currentUser.profileStrength >= 100) return null;

  const strength = currentUser.profileStrength || 15;

  const handleUpdate = (fields) => {
    updateProfile(currentUser.id, fields);
    setActiveModal(null);
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      updateProfile(currentUser.id, { 
        verificationRequested: true,
        verificationStatus: 'Professional Verified'
      });
      setVerifying(false);
      setActiveModal(null);
    }, 1500);
  };

  // Check Card Statuses
  const getCardStatus = (cardName) => {
    const user = currentUser;
    if (user.role === 'Business Holder') {
      if (cardName === 'Business Profile') return user.businessName && user.businessCategory && user.description;
      if (cardName === 'Contact Details') return user.mobileNumber && user.address;
      if (cardName === 'Verification') return user.verificationRequested || user.verificationStatus !== 'Basic Verified';
      if (cardName === 'Preferences') return user.teamSize && user.monthlyMarketingBudget && user.website;
    }
    if (user.role === 'Influencer') {
      if (cardName === 'Content Category') return user.contentCategories && user.contentCategories.length > 0;
      if (cardName === 'Platform') return user.platforms && Object.keys(user.platforms).length > 0;
      if (cardName === 'Profile URL') return user.profileUrl || (user.platforms && Object.values(user.platforms).some(p => p.url));
      if (cardName === 'Audience Details') return user.followersCount && user.averageReach && user.collaborationPricing && user.bio;
      if (cardName === 'Verification') return user.verificationRequested || user.verificationStatus !== 'Basic Verified';
    }
    if (user.role === 'Freelancer') {
      if (cardName === 'Services') return user.services && user.services.length > 0;
      if (cardName === 'Portfolio') return user.portfolio && user.portfolio.length > 0;
      if (cardName === 'Previous Work') return user.experience && user.bio;
      if (cardName === 'Skills') return user.skills && user.skills.length > 0;
      if (cardName === 'Verification') return user.verificationRequested || user.verificationStatus !== 'Basic Verified';
    }
    return false;
  };

  // Render Role Cards
  const renderCards = () => {
    let cards;
    if (currentUser.role === 'Business Holder') {
      cards = [
        { id: 'business_profile', name: 'Business Profile', desc: 'Add brand category and overview details.' },
        { id: 'contact_details', name: 'Contact Details', desc: 'Add phone number and office coordinates.' },
        { id: 'verification', name: 'Verification', desc: 'Submit profile for matching audit check.' },
        { id: 'preferences', name: 'Preferences', desc: 'Specify workspace capacity and monthly budget.' }
      ];
    } else if (currentUser.role === 'Influencer') {
      cards = [
        { id: 'content_category', name: 'Content Category', desc: 'Detail your media topic niches.' },
        { id: 'platform', name: 'Platform', desc: 'List active network channels.' },
        { id: 'profile_url', name: 'Profile URL', desc: 'Validate your primary link address.' },
        { id: 'audience_details', name: 'Audience Details', desc: 'Specify count metrics, rates and bio summary.' },
        { id: 'verification', name: 'Verification', desc: 'Authenticate engagement rates and followers.' }
      ];
    } else {
      // Freelancer
      cards = [
        { id: 'services', name: 'Services', desc: 'Define your client project capabilities.' },
        { id: 'portfolio', name: 'Portfolio', desc: 'Link professional showcases or drive directories.' },
        { id: 'previous_work', name: 'Previous Work', desc: 'List years in service and history statements.' },
        { id: 'skills', name: 'Skills', desc: 'Input technology and tools proficiency.' },
        { id: 'verification', name: 'Verification', desc: 'Verify developer identity validation nodes.' }
      ];
    }

    return cards.map(c => {
      const isComplete = getCardStatus(c.name);
      return (
        <div 
          key={c.id} 
          onClick={() => !isComplete && setActiveModal(c.id)}
          className={isComplete ? "glass-panel" : "glass-panel glass-panel-hover"}
          style={{
            padding: '20px',
            borderRadius: '16px',
            background: isComplete ? 'rgba(34, 197, 94, 0.04)' : 'var(--bg-dark)',
            border: isComplete ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid var(--glass-border)',
            cursor: isComplete ? 'default' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease',
            height: '140px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: isComplete ? '#22c55e' : 'var(--text-white)' }}>
              {c.name}
            </h4>
            {isComplete ? (
              <span style={{ 
                background: 'rgba(34, 197, 94, 0.15)', 
                color: '#22c55e', 
                borderRadius: '50%', 
                width: '20px', 
                height: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '11px' 
              }}>
                <Check size={12} strokeWidth={3} />
              </span>
            ) : (
              <Edit3 size={14} style={{ color: 'var(--accent-cyan)', opacity: 0.8 }} />
            )}
          </div>
          
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', margin: '8px 0 auto 0' }}>
            {c.desc}
          </p>

          <span style={{ 
            fontSize: '10px', 
            fontWeight: '700', 
            color: isComplete ? '#22c55e' : 'var(--accent-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '8px'
          }}>
            {isComplete ? 'Completed' : 'Complete card →'}
          </span>
        </div>
      );
    });
  };

  // Get active reward description based on current strength
  const getRewardStatusMessage = () => {
    if (strength < 20) return "Setup Basic Profile to unlock Better Matching";
    if (strength < 60) return "Unlock More Opportunities at 60% completion";
    if (strength < 80) return "Unlock 1.5x Visibility Boost at 80% completion";
    return "Request Verification to unlock your Premium Verified Badge!";
  };

  return (
    <div className="glass-panel" style={{
      padding: '28px',
      borderRadius: '20px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-glass)',
      marginBottom: '24px'
    }}>
      
      {/* Progress Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '16px' 
      }}>
        <div>
          <span className="badge-premium" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={12} /> Onboarding Status
          </span>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-white)', margin: 0 }}>
            Profile Completion: <span style={{ color: 'var(--accent-cyan)' }}>{strength}%</span>
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-dark)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <Award size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-gray-light)', fontWeight: '600' }}>
            {getRewardStatusMessage()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '8px',
        width: '100%',
        background: 'var(--bg-dark)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '28px'
      }}>
        <div style={{
          height: '100%',
          width: `${strength}%`,
          background: 'linear-gradient(90deg, #00C2FF 0%, #06B6D4 100%)',
          boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
          borderRadius: '4px',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
        {renderCards()}
      </div>

      {/* MODALS FOR EACH CARD INPUT */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div 
            className="glass-panel animate-scale-up" 
            style={{ 
              width: '100%', 
              maxWidth: '480px', 
              padding: '32px',
              borderRadius: '24px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--shadow-premium)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-white)', textTransform: 'capitalize' }}>
                Update {activeModal.replace('_', ' ')}
              </h4>
              <button 
                onClick={() => setActiveModal(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Business Holder Modals */}
            {activeModal === 'business_profile' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdate({ businessName, businessCategory, description });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Business Name</label>
                  <input 
                    type="text" 
                    value={businessName} 
                    onChange={(e) => setBusinessName(e.target.value)} 
                    className="form-input" 
                    placeholder="E.g. Acme Corp" 
                    required 
                  />
                </div>
                <div>
                  <label className="form-label">Business Category</label>
                  <select 
                    value={businessCategory} 
                    onChange={(e) => setBusinessCategory(e.target.value)} 
                    className="form-input"
                    style={{ background: 'var(--bg-dark)' }}
                  >
                    {['Cafe', 'Restaurant', 'Hotel', 'E-Commerce', 'SaaS', 'Electronics', 'Agency', 'Other'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="form-input" 
                    rows={3} 
                    placeholder="Brand elevator pitch..." 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Save Details</button>
              </form>
            )}

            {activeModal === 'contact_details' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdate({ mobileNumber, address });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Mobile Number</label>
                  <input 
                    type="tel" 
                    value={mobileNumber} 
                    onChange={(e) => setMobileNumber(e.target.value)} 
                    className="form-input" 
                    placeholder="+1 (555) 000-0000" 
                    required 
                  />
                </div>
                <div>
                  <label className="form-label">Office Address</label>
                  <input 
                    type="text" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    className="form-input" 
                    placeholder="123 Corporate Blvd, San Francisco, CA" 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Save Details</button>
              </form>
            )}

            {activeModal === 'preferences' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdate({ teamSize, monthlyMarketingBudget, website });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Website</label>
                  <input 
                    type="url" 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)} 
                    className="form-input" 
                    placeholder="https://acme.com" 
                    required 
                  />
                </div>
                <div>
                  <label className="form-label">Team Size</label>
                  <select 
                    value={teamSize} 
                    onChange={(e) => setTeamSize(e.target.value)} 
                    className="form-input"
                    style={{ background: 'var(--bg-dark)' }}
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="15-50">15-50 Employees</option>
                    <option value="50-100">50-100 Employees</option>
                    <option value="100+">100+ Employees</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Monthly Marketing Budget</label>
                  <select 
                    value={monthlyMarketingBudget} 
                    onChange={(e) => setMonthlyMarketingBudget(e.target.value)} 
                    className="form-input"
                    style={{ background: 'var(--bg-dark)' }}
                  >
                    <option value="<₹1,000">&lt;₹1,000</option>
                    <option value="₹1,000 - ₹5,000">₹1,000 - ₹5,000</option>
                    <option value="₹5,000 - ₹10,000">₹5,000 - ₹10,000</option>
                    <option value="₹10,000 - ₹20,000">₹10,000 - ₹20,000</option>
                    <option value="₹20,000+">₹20,000+</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>Save Preferences</button>
              </form>
            )}

            {/* Influencer Modals */}
            {activeModal === 'content_category' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const arr = contentCategories.split(',').map(s => s.trim()).filter(Boolean);
                handleUpdate({ contentCategories: arr });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Content Categories (Comma separated)</label>
                  <input 
                    type="text" 
                    value={contentCategories} 
                    onChange={(e) => setContentCategories(e.target.value)} 
                    className="form-input" 
                    placeholder="E.g. Travel, Tech, Lifestyle" 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary">Save Category</button>
              </form>
            )}

            {activeModal === 'platform' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!primaryPlatform) return;
                const newPlatObj = {
                  ...currentUser.platforms,
                  [primaryPlatform]: { url: profileUrl || '', followers: followers || '10K', reach: reach || '50K' }
                };
                handleUpdate({ platforms: newPlatObj });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Select Platform</label>
                  <select 
                    value={primaryPlatform} 
                    onChange={(e) => setPrimaryPlatform(e.target.value)} 
                    className="form-input"
                    style={{ background: 'var(--bg-dark)' }}
                    required
                  >
                    <option value="">-- Choose Platform --</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Channel/Profile URL</label>
                  <input 
                    type="url" 
                    value={profileUrl} 
                    onChange={(e) => setProfileUrl(e.target.value)} 
                    className="form-input" 
                    placeholder="https://instagram.com/myusername" 
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">Followers Count</label>
                    <input 
                      type="text" 
                      value={followers} 
                      onChange={(e) => setFollowers(e.target.value)} 
                      className="form-input" 
                      placeholder="E.g. 50K" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Monthly Reach</label>
                    <input 
                      type="text" 
                      value={reach} 
                      onChange={(e) => setReach(e.target.value)} 
                      className="form-input" 
                      placeholder="E.g. 200K" 
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Link Platform</button>
              </form>
            )}

            {activeModal === 'profile_url' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdate({ profileUrl });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Primary Profile URL</label>
                  <input 
                    type="url" 
                    value={profileUrl} 
                    onChange={(e) => setProfileUrl(e.target.value)} 
                    className="form-input" 
                    placeholder="https://instagram.com/username" 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary">Save URL</button>
              </form>
            )}

            {activeModal === 'audience_details' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdate({ 
                  followersCount: followers || currentUser.followersCount || '50K', 
                  averageReach: reach || currentUser.averageReach || '200K', 
                  collaborationPricing: pricing || currentUser.collaborationPricing || '₹300/Post', 
                  bio 
                });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label className="form-label">Total Followers</label>
                    <input type="text" value={followers} onChange={(e) => setFollowers(e.target.value)} className="form-input" placeholder="50K" />
                  </div>
                  <div>
                    <label className="form-label">Monthly Reach</label>
                    <input type="text" value={reach} onChange={(e) => setReach(e.target.value)} className="form-input" placeholder="200K" />
                  </div>
                  <div>
                    <label className="form-label">Base Rate</label>
                    <input type="text" value={pricing} onChange={(e) => setPricing(e.target.value)} className="form-input" placeholder="₹300/Post" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Creator Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="form-input" rows={3} placeholder="Tell brands about your aesthetic style..." required />
                </div>
                <button type="submit" className="btn-primary">Save Audience Details</button>
              </form>
            )}

            {/* Freelancer Modals */}
            {activeModal === 'services' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const arr = services.split(',').map(s => s.trim()).filter(Boolean);
                handleUpdate({ services: arr });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Offered Services (Comma separated)</label>
                  <input 
                    type="text" 
                    value={services} 
                    onChange={(e) => setServices(e.target.value)} 
                    className="form-input" 
                    placeholder="Website Development, UI/UX Design, App Development" 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary">Save Services</button>
              </form>
            )}

            {activeModal === 'portfolio' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const newPort = [
                  { service: currentUser.services?.[0] || 'Professional Work', type: 'Link', url: portfolioUrl, description: 'Client project catalog' }
                ];
                handleUpdate({ portfolio: newPort });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Portfolio Directory Link</label>
                  <input 
                    type="url" 
                    value={portfolioUrl} 
                    onChange={(e) => setPortfolioUrl(e.target.value)} 
                    className="form-input" 
                    placeholder="https://behance.net/username or github link" 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary">Save Portfolio</button>
              </form>
            )}

            {activeModal === 'previous_work' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdate({ experience, bio });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Years of Experience</label>
                  <select 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)} 
                    className="form-input"
                    style={{ background: 'var(--bg-dark)' }}
                  >
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Professional Summary Statement</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    className="form-input" 
                    rows={3} 
                    placeholder="UX engineer making pixel perfect layouts..." 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary">Save History</button>
              </form>
            )}

            {activeModal === 'skills' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const arr = skills.split(',').map(s => s.trim()).filter(Boolean);
                handleUpdate({ skills: arr });
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Tech Stack & Tools (Comma separated)</label>
                  <input 
                    type="text" 
                    value={skills} 
                    onChange={(e) => setSkills(e.target.value)} 
                    className="form-input" 
                    placeholder="Figma, React, Next.js, Node.js" 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary">Save Skills</button>
              </form>
            )}

            {/* Verification Modal for All Roles */}
            {activeModal === 'verification' && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ color: 'var(--accent-cyan)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                  <ShieldCheck size={48} />
                </div>
                <h5 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '8px' }}>
                  Authenticate Profile Status
                </h5>
                <p style={{ fontSize: '12px', color: 'var(--text-gray)', lineHeight: '1.5', marginBottom: '24px' }}>
                  Submit details to confirm followers authenticity, contract history or company registration. Unlocks the Premium Verified Badge.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => setActiveModal(null)} 
                    className="btn-secondary" 
                    style={{ flex: 1 }}
                    disabled={verifying}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleVerify} 
                    className="btn-primary" 
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <div className="loader-spinner" style={{ width: '14px', height: '14px', borderWidth: '1.5px', margin: 0 }} />
                        Analyzing...
                      </>
                    ) : (
                      'Verify Now'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingWidget;

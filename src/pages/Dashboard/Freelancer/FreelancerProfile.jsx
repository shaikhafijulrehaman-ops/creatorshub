import { useContext, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useToast } from '../../../components/SuccessToast';
import { PhotoUploader } from '../../../components/PhotoUploader';
import { VisibilityToggle } from '../../../components/VisibilityToggle';
import { Save, User, Globe, MapPin, Phone, Mail, MessageSquare, Briefcase, Link, ChevronRight, ChevronLeft } from 'lucide-react';
import { useResponsive } from '../../../hooks/useResponsive';
import '../Business/Business.css';

const Instagram = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Youtube = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
  </svg>
);



export const FreelancerProfile = ({ section }) => {
  const { currentUser, updateProfile } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  const { isMobile, isTablet } = useResponsive();

  const u = currentUser;

  const [form, setForm] = useState({
    fullName:        u.fullName       || '',
    category:        u.freelancerCategory || '',
    description:     u.description    || '',
    website:         u.website        || '',
    location:        u.location       || '',
    portfolioLink:   u.portfolioLink  || '',
    mobileNumber:    u.mobileNumber   || '',
    whatsapp:        u.whatsapp       || '',
    contactPerson:   u.contactPerson  || '',
    experience:      u.experience     || '',
    availability:    u.availability   || '',
    hourlyRate:      u.hourlyRate     || '',
    instagram:       u.socialLinks?.instagram || '',
    youtube:         u.socialLinks?.youtube   || '',
  });

  const [visibility, setVisibility] = useState({
    email:     u.fieldVisibility?.email     || 'Private',
    mobile:    u.fieldVisibility?.mobile    || 'Private',
    whatsapp:  u.fieldVisibility?.whatsapp  || 'Private',
    website:   u.fieldVisibility?.website   || 'Public',
    portfolio: u.fieldVisibility?.portfolio || 'Public',
    contact:   u.fieldVisibility?.contact   || 'Private',
    social:    u.fieldVisibility?.social    || 'Public',
  });

  const [logo, setLogo]     = useState(u.logo || u.profilePhoto || null);
  const [cover, setCover]   = useState(u.coverBanner || null);
  const [saving, setSaving] = useState(false);
  
  // Wizard state for mobile/tablet when section is not provided
  const [currentStep, setCurrentStep] = useState(1);
  const isWizard = !section && (isMobile || isTablet);

  const setVis = (key, val) => {
    setVisibility(prev => {
      const nextVis = { ...prev, [key]: val };
      updateProfile(u.id, { fieldVisibility: nextVis });
      return nextVis;
    });
  };
  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    console.log('handleSave triggered! Form state:', form);
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      console.log('Calling updateProfile...');
      updateProfile(u.id, {
        fullName:           form.fullName,
        freelancerCategory: form.category,
        description:        form.description,
        website:            form.website,
        location:           form.location,
        portfolioLink:      form.portfolioLink,
        mobileNumber:       form.mobileNumber,
        whatsapp:           form.whatsapp,
        contactPerson:      form.contactPerson,
        experience:         form.experience,
        availability:       form.availability,
        hourlyRate:         form.hourlyRate,
        profilePhoto:       logo,
        coverBanner:        cover,
        socialLinks: {
          instagram: form.instagram,
          youtube:   form.youtube,
          website:   form.website,
        },
        fieldVisibility: visibility,
      });
      console.log('updateProfile finished successfully.');
      showSuccessToast({ title: 'Profile Saved', subtitle: 'Your freelancer profile has been updated.' });
    } catch (err) {
      console.error('Error inside handleSave:', err);
      showSuccessToast({ title: '⚠ Save Failed', subtitle: err.message });
    } finally {
      setSaving(false);
    }
  };

  const renderPhotos = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Profile Photos</h4>
      <div className="biz-cover-wrap">
        <label className="form-label">Cover Banner <span className="biz-recommended">Recommended: 1600 x 500</span></label>
        <PhotoUploader
          value={cover}
          onChange={setCover}
          aspectRatio={16 / 5}
          label="Cover Banner"
          recommendedSize="1600x500"
        />
      </div>
      <div className="biz-logo-wrap" style={{ marginTop: '16px' }}>
        <label className="form-label">Profile Photo <span className="biz-recommended">Recommended: 500 x 500</span></label>
        <div style={{ maxWidth: '180px' }}>
          <PhotoUploader
            value={logo}
            onChange={setLogo}
            aspectRatio={1}
            label="Profile Photo"
            recommendedSize="500x500"
          />
        </div>
      </div>
    </div>
  );

  const renderIdentity = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Freelancer Identity</h4>
      <div className="biz-field-row">
        <div className="biz-field">
          <label className="form-label"><User size={13} /> Full Name</label>
          <input className="form-input" value={form.fullName} onChange={e => setField('fullName', e.target.value)} placeholder="Your full name" />
        </div>
        <div className="biz-field">
          <label className="form-label">Category / Skill</label>
          <select className="form-input" value={form.category} onChange={e => setField('category', e.target.value)}>
            {['Content Writer', 'Graphic Designer', 'Web Developer', 'App Developer', 'Photographer', 'Videographer', 'Social Media Manager', 'SEO Expert', 'Copywriter', 'UI/UX Designer', 'Other'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="biz-field" style={{ marginTop: '12px' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={13} /> Experience</label>
        <select className="form-input" value={form.experience} onChange={e => setField('experience', e.target.value)}>
          {['0-1 Year', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'].map(exp => (
            <option key={exp} value={exp}>{exp}</option>
          ))}
        </select>
      </div>
      <div className="biz-field" style={{ marginTop: '12px' }}>
        <label className="form-label">About / Bio</label>
        <textarea
          className="form-input"
          rows={4}
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          placeholder="Describe your skills, expertise, and what makes you stand out as a freelancer..."
        />
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Contact Details</h4>
      <p className="biz-section-sub">Control who can see each field using the visibility toggle.</p>

      {[
        { key: 'email',     label: 'Email Address',    icon: Mail,          val: u.email,              visKey: 'email',     disabled: true },
        { key: 'mobile',    label: 'Mobile Number',    icon: Phone,         val: form.mobileNumber,    visKey: 'mobile',    field: 'mobileNumber' },
        { key: 'whatsapp',  label: 'WhatsApp',         icon: MessageSquare, val: form.whatsapp,        visKey: 'whatsapp',  field: 'whatsapp' },
        { key: 'website',   label: 'Website',          icon: Globe,         val: form.website,         visKey: 'website',   field: 'website' },
        { key: 'portfolio', label: 'Portfolio Link',   icon: Link,          val: form.portfolioLink,   visKey: 'portfolio', field: 'portfolioLink' },
        { key: 'location',  label: 'Location',         icon: MapPin,        val: form.location,        visKey: 'contact',   field: 'location' },
        { key: 'contact',   label: 'Contact Person',   icon: User,          val: form.contactPerson,   visKey: 'contact',   field: 'contactPerson' },
      ].map(({ key, label, icon: Icon, val, visKey, field, disabled }) => (
        <div key={key} className="biz-contact-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
          <label className="form-label biz-contact-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <Icon size={13} /> {label}
          </label>
          <input
            className="form-input"
            value={val || ''}
            onChange={field ? (e => setField(field, e.target.value)) : undefined}
            disabled={disabled}
            placeholder={disabled ? 'Not editable here' : `Enter ${label.toLowerCase()}`}
            style={{ width: '100%' }}
          />
          <VisibilityToggle
            value={visibility[visKey]}
            onChange={(v) => setVis(visKey, v)}
          />
        </div>
      ))}
    </div>
  );

  const renderSocial = () => (
    <div className="biz-section glass-panel">
      <div className="biz-section-header-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <h4 className="biz-section-title" style={{ margin: 0 }}>Social Links</h4>
        <VisibilityToggle value={visibility.social} onChange={(v) => setVis('social', v)} />
      </div>

      <div className="biz-field-row" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { key: 'instagram', label: 'Instagram', Icon: Instagram, placeholder: 'https://instagram.com/...' },
          { key: 'youtube',   label: 'YouTube',    Icon: Youtube,  placeholder: 'https://youtube.com/...' },
          { key: 'website',   label: 'Website',    Icon: Globe,    placeholder: 'https://...' },
        ].map(({ key, label, Icon, placeholder }) => (
          <div key={key} className="biz-field">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icon size={13} /> {label}</label>
            <input className="form-input" value={form[key]} onChange={e => setField(key, e.target.value)} placeholder={placeholder} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkillsAndRates = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Availability & Rates</h4>
      <div className="biz-field-row" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="biz-field">
          <label className="form-label"><MapPin size={13} /> City / Location</label>
          <input className="form-input" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Mumbai, India" />
        </div>
        <div className="biz-field">
          <label className="form-label">Availability</label>
          <select className="form-input" value={form.availability} onChange={e => setField('availability', e.target.value)}>
            {['Full-time', 'Part-time', 'Weekends Only', 'Project Based', 'Not Available'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="biz-field">
          <label className="form-label">Hourly Rate</label>
          <p className="biz-section-sub" style={{ fontSize: '11px', margin: '2px 0 6px 0', color: 'var(--text-muted)' }}>
            This helps brands understand your pricing expectations. It is optional and can be changed later.
          </p>
          <select className="form-input" value={form.hourlyRate} onChange={e => setField('hourlyRate', e.target.value)}>
            {[
              'Not Specified',
              'Under ₹500/hr',
              '₹500 - ₹1,000/hr',
              '₹1,000 - ₹2,500/hr',
              '₹2,500 - ₹5,000/hr',
              '₹5,000 - ₹10,000/hr',
              '₹10,000+/hr',
              'Flexible / Discuss'
            ].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );



  const renderReviewStep = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Review Details</h4>
      <p className="biz-section-sub" style={{ marginBottom: '16px' }}>Verify your freelancer profile summary before saving changes.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Freelancer Info</span>
          <h5 style={{ fontSize: '14px', fontWeight: '700', margin: '4px 0 0 0', color: 'var(--text-white)' }}>{form.fullName || 'Name Not Provided'} ({form.category || 'No Category'})</h5>
          <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '4px', margin: 0 }}>{form.description ? form.description.substring(0, 100) + '...' : 'No bio added yet.'}</p>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location, Availability & Rate</span>
          <p style={{ fontSize: '13px', color: 'var(--text-white)', fontWeight: '600', margin: '4px 0 0 0' }}>📍 {form.location || 'Global'} • {form.experience || 'Not Specified'} Experience</p>
          <p style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: '700', margin: '2px 0 0 0' }}>💰 Rate: {form.hourlyRate || 'Not Specified'} • {form.availability || 'Not Specified'}</p>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact Person</span>
          <p style={{ fontSize: '13px', color: 'var(--text-white)', fontWeight: '600', margin: '4px 0 0 0' }}>👤 {form.contactPerson || 'N/A'} • 📞 {form.mobileNumber || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  // Accordion mode
  if (section) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {section === 'info' && (
          <>
            {renderPhotos()}
            {renderIdentity()}
          </>
        )}
        {section === 'contact' && renderContact()}
        <button 
          onClick={handleSave} 
          type="button" 
          className="btn-primary" 
          disabled={saving}
          style={{ width: '100%', minHeight: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {saving ? <span className="biz-saving-spinner" /> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    );
  }

  // Wizard mode
  if (isWizard) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="biz-profile-wizard-root">
        {/* Stepper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
          {[1, 2, 3, 4, 5].map(stepNum => {
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <div key={stepNum} style={{ display: 'flex', alignItems: 'center', flex: stepNum < 5 ? 1 : 'none' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isActive ? 'var(--accent-cyan)' : (isCompleted ? 'var(--accent-cyan-glow)' : 'rgba(255,255,255,0.03)'),
                  color: isActive ? '#000' : (isCompleted ? 'var(--accent-cyan)' : 'var(--text-muted)'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '11px',
                  border: '1px solid ' + (isActive || isCompleted ? 'var(--accent-cyan)' : 'var(--glass-border)')
                }}>
                  {stepNum}
                </div>
                {stepNum < 5 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: isCompleted ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                    margin: '0 6px'
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Contents */}
        <div style={{ flex: 1 }}>
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {renderPhotos()}
              {renderIdentity()}
            </div>
          )}
          {currentStep === 2 && renderContact()}
          {currentStep === 3 && renderSocial()}
          {currentStep === 4 && renderSkillsAndRates()}
          {currentStep === 5 && renderReviewStep()}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="btn-secondary"
              style={{ flex: 1, minHeight: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="btn-primary"
              style={{ flex: 1, minHeight: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
              disabled={saving}
              style={{ flex: 1, minHeight: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {saving ? <span className="biz-saving-spinner" /> : <><Save size={16} /> Save Settings</>}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Desktop mode: Full form
  return (
    <form onSubmit={handleSave} className="biz-profile-form">
      {renderPhotos()}
      {renderIdentity()}
      {renderContact()}
      {renderSocial()}
      {renderSkillsAndRates()}

      <div className="biz-save-row">
        <button type="submit" className="btn-primary biz-save-btn" disabled={saving}>
          {saving ? (
            <span className="biz-saving-spinner" />
          ) : (
            <><Save size={15} /> Save Profile</>
          )}
        </button>
      </div>
    </form>
  );
};

export default FreelancerProfile;

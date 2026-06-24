import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useToast } from '../../../components/SuccessToast';
import { PhotoUploader } from '../../../components/PhotoUploader';
import { VisibilityToggle } from '../../../components/VisibilityToggle';
import { Save, Building, Globe, MapPin, Phone, Mail, MessageSquare, User, Hash, Link, ChevronRight, ChevronLeft } from 'lucide-react';
import { useResponsive } from '../../../hooks/useResponsive';
import './Business.css';

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



export const BusinessProfile = ({ section }) => {
  const { currentUser, updateProfile, loading } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  const { isMobile, isTablet } = useResponsive();

  const u = currentUser;

  const [form, setForm] = useState({
    businessName:    u.businessName  || '',
    businessCategory:u.businessCategory || '',
    description:     u.description   || '',
    website:         u.website       || '',
    location:        u.location      || '',
    address:         u.address       || '',
    gst:             u.gst           || '',
    contactPerson:   u.contactPerson || '',
    mobileNumber:    u.mobileNumber  || '',
    whatsapp:        u.whatsapp      || '',
    teamSize:        u.teamSize      || '',
    monthlyMarketingBudget: u.monthlyMarketingBudget || '',
    instagram:       u.socialLinks?.instagram || '',
    facebook:        u.socialLinks?.facebook || '',
    youtube:         u.socialLinks?.youtube  || '',
    whatsappChannel: u.socialLinks?.whatsappChannel || '',
    telegramChannel: u.socialLinks?.telegramChannel || '',
  });

  const [visibility, setVisibility] = useState({
    email:   u.fieldVisibility?.email   || 'Private',
    mobile:  u.fieldVisibility?.mobile  || 'Private',
    whatsapp:u.fieldVisibility?.whatsapp|| 'Private',
    website: u.fieldVisibility?.website || 'Public',
    address: u.fieldVisibility?.address || 'Private',
    gst:     u.fieldVisibility?.gst     || 'Private',
    contact: u.fieldVisibility?.contact || 'Private',
    social:  u.fieldVisibility?.social  || 'Public',
  });

  const [logo, setLogo]     = useState(u.logo || null);
  const [cover, setCover]   = useState(u.coverBanner || null);
  const [saving, setSaving] = useState(false);
  
  // Wizard state for mobile/tablet when section is not provided
  const [currentStep, setCurrentStep] = useState(1);
  const isWizard = !section && (isMobile || isTablet);

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!loading && u && !hasLoadedRef.current) {
      setForm({
        businessName:    u.businessName  || '',
        businessCategory:u.businessCategory || '',
        description:     u.description   || '',
        website:         u.website       || '',
        location:        u.location      || '',
        address:         u.address       || '',
        gst:             u.gst           || '',
        contactPerson:   u.contactPerson || '',
        mobileNumber:    u.mobileNumber  || '',
        whatsapp:        u.whatsapp      || '',
        teamSize:        u.teamSize      || '',
        monthlyMarketingBudget: u.monthlyMarketingBudget || '',
        instagram:       u.socialLinks?.instagram || '',
        facebook:        u.socialLinks?.facebook || '',
        youtube:         u.socialLinks?.youtube  || '',
        whatsappChannel: u.socialLinks?.whatsappChannel || '',
        telegramChannel: u.socialLinks?.telegramChannel || '',
      });
      setVisibility({
        email:   u.fieldVisibility?.email   || 'Private',
        mobile:  u.fieldVisibility?.mobile  || 'Private',
        whatsapp:u.fieldVisibility?.whatsapp|| 'Private',
        website: u.fieldVisibility?.website || 'Public',
        address: u.fieldVisibility?.address || 'Private',
        gst:     u.fieldVisibility?.gst     || 'Private',
        contact: u.fieldVisibility?.contact || 'Private',
        social:  u.fieldVisibility?.social  || 'Public',
      });
      setLogo(u.logo || null);
      setCover(u.coverBanner || null);
      hasLoadedRef.current = true;
    }
  }, [loading, u]);

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
      console.log('Calling updateProfile...');
      await updateProfile(u.id, {
        businessName:   form.businessName,
        businessCategory: form.businessCategory,
        description:    form.description,
        website:        form.website,
        location:       form.location,
        address:        form.address,
        gst:            form.gst,
        contactPerson:  form.contactPerson,
        mobileNumber:   form.mobileNumber,
        whatsapp:       form.whatsapp,
        teamSize:       form.teamSize,
        monthlyMarketingBudget: form.monthlyMarketingBudget,
        logo:           logo,
        coverBanner:    cover,
        socialLinks: {
          instagram: form.instagram,
          facebook:  form.facebook,
          youtube:   form.youtube,
          whatsappChannel: form.whatsappChannel,
          telegramChannel: form.telegramChannel,
          website:   form.website,
        },
        fieldVisibility: visibility,
      });
      console.log('updateProfile finished successfully.');
      showSuccessToast({ title: 'Profile Saved', subtitle: 'Your business profile has been updated.' });
    } catch (err) {
      console.error('Error inside handleSave:', err);
      showSuccessToast({ title: '⚠ Save Failed', subtitle: err.message || 'Please check your connection.' });
    } finally {
      setSaving(false);
    }
  };

  const renderPhotos = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Brand Photos</h4>
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
        <label className="form-label">Business Logo <span className="biz-recommended">Recommended: 500 x 500</span></label>
        <div style={{ maxWidth: '180px' }}>
          <PhotoUploader
            value={logo}
            onChange={setLogo}
            aspectRatio={1}
            label="Logo"
            recommendedSize="500x500"
          />
        </div>
      </div>
    </div>
  );

  const renderIdentity = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Business Identity</h4>
      <div className="biz-field-row">
        <div className="biz-field">
          <label className="form-label"><Building size={13} /> Business Name</label>
          <input className="form-input" value={form.businessName} onChange={e => setField('businessName', e.target.value)} placeholder="Your company name" />
        </div>
        <div className="biz-field">
          <label className="form-label">Category</label>
          <select className="form-input" value={form.businessCategory} onChange={e => setField('businessCategory', e.target.value)}>
            {['E-Commerce', 'Startup', 'Agency', 'Fashion', 'Food & Beverage', 'Technology', 'Real Estate', 'Healthcare', 'Education', 'Entertainment', 'Retail', 'Other'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="biz-field" style={{ marginTop: '12px' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Hash size={13} /> GST Number (Optional)</label>
        <input className="form-input" value={form.gst} onChange={e => setField('gst', e.target.value)} placeholder="GSTIN (e.g. 27AAAAA1111A1Z1)" />
      </div>
      <div className="biz-field" style={{ marginTop: '12px' }}>
        <label className="form-label">About / Description</label>
        <textarea
          className="form-input"
          rows={4}
          value={form.description}
          onChange={e => setField('description', e.target.value)}
          placeholder="Describe your business, brand story, and what makes you stand out..."
        />
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Contact Details</h4>
      <p className="biz-section-sub">Control who can see each field using the visibility toggle.</p>

      {[
        { key: 'email',   label: 'Business Email',   icon: Mail,          val: u.email,          visKey: 'email',   disabled: true },
        { key: 'mobile',  label: 'Mobile Number',     icon: Phone,         val: form.mobileNumber, visKey: 'mobile',  field: 'mobileNumber' },
        { key: 'whatsapp',label: 'WhatsApp',          icon: MessageSquare, val: form.whatsapp,    visKey: 'whatsapp', field: 'whatsapp' },
        { key: 'website', label: 'Website',           icon: Globe,         val: form.website,     visKey: 'website',  field: 'website' },
        { key: 'address', label: 'Business Address',  icon: MapPin,        val: form.address,     visKey: 'address',  field: 'address' },
        { key: 'contact', label: 'Contact Person',    icon: User,          val: form.contactPerson, visKey: 'contact', field: 'contactPerson' },
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

  const renderDetailsAndBudget = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Collaboration Details & Budget</h4>
      <div className="biz-field-row" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="biz-field">
          <label className="form-label"><MapPin size={13} /> City / Location</label>
          <input className="form-input" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Mumbai, India" />
        </div>
        <div className="biz-field">
          <label className="form-label">Team Size</label>
          <select className="form-input" value={form.teamSize} onChange={e => setField('teamSize', e.target.value)}>
            {['1-5', '6-15', '16-50', '51-200', '200+', 'Other'].map(s => <option key={s} value={s}>{s === 'Other' ? 'Other' : `${s} people`}</option>)}
          </select>
        </div>
        <div className="biz-field">
          <label className="form-label">Estimated Collaboration Budget</label>
          <p className="biz-section-sub" style={{ fontSize: '11px', margin: '2px 0 6px 0', color: 'var(--text-muted)' }}>
            This budget helps creators understand the expected collaboration value. It is optional and can be changed later.
          </p>
          <select className="form-input" value={form.monthlyMarketingBudget} onChange={e => setField('monthlyMarketingBudget', e.target.value)}>
            {[
              'Not Specified',
              'Under ₹5,000',
              '₹5,000 – ₹10,000',
              '₹10,000 – ₹25,000',
              '₹25,000 – ₹50,000',
              '₹50,000 – ₹1,00,000',
              '₹1,00,000 – ₹2,50,000',
              '₹2,50,000 – ₹5,00,000',
              '₹5,00,000 – ₹10,0,000',
              '₹10,00,000 – ₹25,00,000',
              '₹25,00,000 – ₹50,00,000',
              '₹50,00,000 – ₹1 Crore',
              '₹1 Crore+',
              'Flexible / Discuss Later'
            ].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );



  const renderReviewStep = () => (
    <div className="biz-section glass-panel">
      <h4 className="biz-section-title">Review Details</h4>
      <p className="biz-section-sub" style={{ marginBottom: '16px' }}>Verify your business settings summary before saving changes.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Company Info</span>
          <h5 style={{ fontSize: '14px', fontWeight: '700', margin: '4px 0 0 0', color: 'var(--text-white)' }}>{form.businessName || 'Name Not Provided'} ({form.businessCategory})</h5>
          <p style={{ fontSize: '12px', color: 'var(--text-gray)', marginTop: '4px', margin: 0 }}>{form.description ? form.description.substring(0, 100) + '...' : 'No description added yet.'}</p>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location & Collaboration Budget</span>
          <p style={{ fontSize: '13px', color: 'var(--text-white)', fontWeight: '600', margin: '4px 0 0 0' }}>📍 {form.location || 'Global'} • {form.teamSize || '1-5'} Team Size</p>
          <p style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: '700', margin: '2px 0 0 0' }}>💰 Budget: {form.monthlyMarketingBudget || 'Not Specified'}</p>
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
          {currentStep === 4 && renderDetailsAndBudget()}
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
      {renderDetailsAndBudget()}

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

export default BusinessProfile;

import { useContext, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { Shield, ShieldCheck, Award, CheckCircle, Upload, Info } from 'lucide-react';
import { useToast } from '../../../components/SuccessToast';

export const VerificationCenter = () => {
  const { currentUser, updateProfile } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  const [levelStatus, setLevelStatus] = useState({
    level1: currentUser.verificationStatus === 'Basic Verified' || currentUser.verificationStatus === 'Professional Verified' || currentUser.verificationStatus === 'Premium Verified',
    level2: currentUser.verificationStatus === 'Professional Verified' || currentUser.verificationStatus === 'Premium Verified',
    level3: currentUser.verificationStatus === 'Premium Verified'
  });

  // Level 2 Forms
  const [proInput, setProInput] = useState('');
  const [proVerifying, setProVerifying] = useState(false);

  // Level 3 Forms
  const [idFile, setIdFile] = useState(null);
  const [premVerifying, setPremVerifying] = useState(false);

  const handleLevel2Verify = (e) => {
    e.preventDefault();
    if (!proInput) {
      showSuccessToast({ title: '⚠ Missing Details', subtitle: 'Please fill out verification details.' });
      return;
    }
    setProVerifying(true);
    setTimeout(() => {
      updateProfile(currentUser.id, { verificationStatus: 'Professional Verified' });
      setLevelStatus(prev => ({ ...prev, level2: true }));
      setProVerifying(false);
      showSuccessToast({ title: '✔ Credentials Verified', subtitle: 'Professional status badge upgraded!' });
    }, 500);
  };

  const handleLevel3Verify = (e) => {
    e.preventDefault();
    if (!idFile) {
      showSuccessToast({ title: '⚠ Document Required', subtitle: 'Please supply an ID document scan.' });
      return;
    }
    setPremVerifying(true);
    setTimeout(() => {
      updateProfile(currentUser.id, { verificationStatus: 'Premium Verified' });
      setLevelStatus(prev => ({ ...prev, level2: true, level3: true }));
      setPremVerifying(false);
      showSuccessToast({ title: '✔ Premium Verified', subtitle: 'Government ID approved! Badge upgraded to Premium.' });
    }, 600);
  };

  const getBadgeStyle = () => {
    const status = currentUser.verificationStatus;
    if (status === 'Premium Verified') return 'badge-premium';
    if (status === 'Professional Verified') return 'badge-pro';
    return 'badge-basic';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '10px 0' }}>
      
      {/* Intro */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
        <div>
          <span className="badge-premium">Safety & Compliance</span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', marginTop: '6px' }}>Verification Center</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '4px' }}>
            Elevate your credentials to unlock visibility boosts, escrow priorities, and trust scores.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active Status:</span>
          <div style={{ marginTop: '4px' }}>
            <span className={getBadgeStyle()}>{currentUser.verificationStatus}</span>
          </div>
        </div>
      </div>

      {/* Levels list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* LEVEL 1: BASIC VERIFIED */}
        <div className="glass-panel" style={{ 
          padding: '24px', 
          borderColor: levelStatus.level1 ? 'rgba(34, 197, 94, 0.2)' : 'var(--glass-border)',
          background: levelStatus.level1 ? 'rgba(34, 197, 94, 0.02)' : 'var(--glass-bg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <Shield size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Level 1 – Basic Verified 
                  {levelStatus.level1 && <CheckCircle size={15} style={{ color: '#22c55e' }} />}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>
                  Unlock basic search directory placement and messaging workrooms.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', color: 'var(--text-muted)', fontSize: '11px' }}>
                  <span>✓ Email verified ({currentUser.email})</span>
                  <span>✓ Phone verified ({currentUser.mobileNumber})</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '12px' }}>
              <strong style={{ color: 'var(--text-white)' }}>Benefits:</strong>
              <ul style={{ paddingLeft: '16px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px', color: 'var(--text-gray)' }}>
                <li>Profile visibility in browse pages</li>
                <li>Messaging access in workspaces</li>
              </ul>
            </div>
          </div>
        </div>

        {/* LEVEL 2: PROFESSIONAL VERIFIED */}
        <div className="glass-panel" style={{ 
          padding: '24px',
          borderColor: levelStatus.level2 ? 'rgba(34, 197, 94, 0.2)' : 'var(--glass-border)',
          background: levelStatus.level2 ? 'rgba(34, 197, 94, 0.02)' : 'var(--glass-bg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 217, 255, 0.08)', border: '1px solid rgba(0, 217, 255, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <ShieldCheck size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Level 2 – Professional Verified
                  {levelStatus.level2 && <CheckCircle size={15} style={{ color: '#22c55e' }} />}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>
                  Double your matching priority and earn the professional verified status.
                </p>

                {/* Conditional Verify Form */}
                {!levelStatus.level2 && (
                  <form onSubmit={handleLevel2Verify} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                    {currentUser.role === 'Influencer' && (
                      <div>
                        <label className="form-label" style={{ fontSize: '12px' }}>Account Ownership Verification (Handle/Profile Name)</label>
                        <input 
                          type="text" 
                          placeholder="Confirm platform @handle" 
                          value={proInput} 
                          onChange={(e) => setProInput(e.target.value)}
                          className="form-input" 
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          required
                        />
                      </div>
                    )}
                    {currentUser.role === 'Freelancer' && (
                      <div>
                        <label className="form-label" style={{ fontSize: '12px' }}>Case Study / Audit Link Reference</label>
                        <input 
                          type="url" 
                          placeholder="https://behance.net/username" 
                          value={proInput} 
                          onChange={(e) => setProInput(e.target.value)}
                          className="form-input" 
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          required
                        />
                      </div>
                    )}
                    {currentUser.role === 'Business Holder' && (
                      <div>
                        <label className="form-label" style={{ fontSize: '12px' }}>Business Registry / VAT Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. US-123456789" 
                          value={proInput} 
                          onChange={(e) => setProInput(e.target.value)}
                          className="form-input" 
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          required
                        />
                      </div>
                    )}
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '12px', alignSelf: 'flex-start', borderRadius: '8px' }}
                      disabled={proVerifying}
                    >
                      {proVerifying ? 'Checking...' : 'Verify Credentials'}
                    </button>
                  </form>
                )}

                {levelStatus.level2 && (
                  <div style={{ marginTop: '12px', color: '#22c55e', fontSize: '11px' }}>
                    ✓ Credentials Verified: {currentUser.role === 'Business Holder' ? 'VAT Registry OK' : 'Ownership Checked'}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', width: '220px' }}>
              <strong style={{ color: 'var(--text-white)' }}>Benefits:</strong>
              <ul style={{ paddingLeft: '16px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px', color: 'var(--text-gray)' }}>
                <li>20% boost in match score</li>
                <li>Higher trust ranking in listings</li>
                <li>Professional Status tag</li>
              </ul>
            </div>
          </div>
        </div>

        {/* LEVEL 3: PREMIUM VERIFIED */}
        <div className="glass-panel" style={{ 
          padding: '24px',
          borderColor: levelStatus.level3 ? 'rgba(34, 197, 94, 0.2)' : 'var(--glass-border)',
          background: levelStatus.level3 ? 'rgba(34, 197, 94, 0.02)' : 'var(--glass-bg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6,182,212,0.1)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', boxShadow: 'var(--glow-cyan)' }}>
                <Award size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Level 3 – Premium Verified
                  {levelStatus.level3 && <CheckCircle size={15} style={{ color: '#22c55e' }} />}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginTop: '4px' }}>
                  Obtain full admin audit seal and the signature glowing cyan badge.
                </p>

                {/* Conditional Verify Form */}
                {!levelStatus.level3 && levelStatus.level2 && (
                  <form onSubmit={handleLevel3Verify} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '12px' }}>Upload Government Issued ID / Registry File</label>
                      <div style={{
                        border: '1px dashed rgba(255,255,255,0.1)',
                        padding: '20px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.1)',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                        onClick={() => setIdFile('passport_scan.pdf')}
                      >
                        {idFile ? (
                          <span style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>📁 {idFile} Selected</span>
                        ) : (
                          <>
                            <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to upload Passport / Driver's License scan</p>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '12px', alignSelf: 'flex-start', borderRadius: '8px' }}
                      disabled={premVerifying}
                    >
                      {premVerifying ? 'Reviewing...' : 'Request Admin Review'}
                    </button>
                  </form>
                )}

                {!levelStatus.level2 && (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '20px' }}>
                    <Info size={14} /> Complete Level 2 Professional Verification first.
                  </div>
                )}

                {levelStatus.level3 && (
                  <div style={{ marginTop: '12px', color: '#22c55e', fontSize: '11px' }}>
                    ✓ Passport ID checked by manual admin audit
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', width: '220px' }}>
              <strong style={{ color: 'var(--text-white)' }}>Benefits:</strong>
              <ul style={{ paddingLeft: '16px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px', color: 'var(--text-gray)' }}>
                <li>Glowing Cyan verification badge</li>
                <li>Top priority placement in exploration searches</li>
                <li>Direct escrow dispute resolutions</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default VerificationCenter;

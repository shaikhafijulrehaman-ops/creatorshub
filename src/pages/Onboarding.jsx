import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Briefcase, Video, Code, Mail, Lock, 
  User, Phone, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { useToast } from '../components/SuccessToast';

export const Onboarding = ({ onNavigate, initialParams = {} }) => {
  const { registerUser, loginUser, loginWithGoogle, checkEmailExists } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Flow State
  const [isLogin, setIsLogin] = useState(initialParams.loginOnly || false);
  
  // Sign Up Sub-Steps: 1 (Choose Role), 2 (Details Form), 3 (OTP Verification), 4 (Success Screen)
  const [signUpStep, setSignUpStep] = useState(1);

  // Common Registration State
  const [role, setRole] = useState('Business Holder'); // Business Holder, Freelancer, Influencer
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP Verification State
  const [otpCode, setOtpCode] = useState('');
  const [mockOtp] = useState('123456');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Step 4 Welcome Animation Stage
  const [successAnimationActive, setSuccessAnimationActive] = useState(false);

  // Auto-redirect for post-registration success page (Step 4)
  useEffect(() => {
    if (signUpStep === 4) {
      const timer = setTimeout(() => {
        if (window.innerWidth < 768) {
          onNavigate('landing'); // Redirect to website Home on mobile
        } else {
          onNavigate('dashboard');
        }
      }, 1200); // Quick success → dashboard
      return () => clearTimeout(timer);
    }
  }, [signUpStep, onNavigate]);

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const res = await loginUser(loginEmail, loginPassword);
    if (res.success) {
      if (window.innerWidth < 768) {
        const fromPath = location.state?.from;
        if (fromPath) {
          navigate(fromPath);
        } else {
          onNavigate('landing'); // Redirect to website Home on mobile
        }
      } else {
        onNavigate('dashboard');
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg('');
      await loginWithGoogle();
    } catch (err) {
      console.error('Google login failed:', err);
      setErrorMsg('Google login failed: ' + (err.message || 'Please try again.'));
    }
  };

  // Submit Registration Account Details (Step 2)
  const handleSignUpDetailsSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setDuplicateEmailError(false);
    console.log('handleSignUpDetailsSubmit triggered', { fullName, email, password, confirmPassword, mobileNumber });

    try {
      if (!fullName || !email || !password || !confirmPassword || !mobileNumber) {
        setErrorMsg('Please fill out all fields.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      setIsCheckingEmail(true);
      const exists = await checkEmailExists(email);
      setIsCheckingEmail(false);

      if (exists) {
        setDuplicateEmailError(true);
        return;
      }

      // Go to OTP
      setSignUpStep(3);
    } catch (err) {
      console.error('Registration step 2 submit failed:', err);
      setErrorMsg('Error: ' + err.message);
      setIsCheckingEmail(false);
    }
  };

  // Verify OTP (Step 3)
  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setDuplicateEmailError(false);
    console.log('handleVerifyOtp triggered', { otpCode, mockOtp });

    try {
      if (otpCode !== mockOtp) {
        setErrorMsg('Invalid verification code. Please try using 123456.');
        return;
      }

      // Successfully verified!
      await registerUser(role, { 
        fullName, 
        email, 
        password, 
        mobileNumber 
      });
      
      setSignUpStep(4);
      setTimeout(() => {
        setSuccessAnimationActive(true);
      }, 100);
    } catch (err) {
      console.error('OTP verification failed:', err);
      if (err.message && err.message.includes('already registered')) {
        setDuplicateEmailError(true);
        setSignUpStep(2);
      } else {
        setErrorMsg('Error: ' + err.message);
      }
    }
  };

  // Helper values for Success screen (Step 4)
  const getSuccessContent = () => {
    switch (role) {
      case 'Business Holder':
        return {
          headline: 'Welcome Aboard.',
          subheadline: 'Build your team. Launch your next project.',
          color: '#00C2FF'
        };
      case 'Freelancer':
        return {
          headline: 'Welcome Freelancer.',
          subheadline: "Thousands of opportunities await you. Let's build something amazing.",
          color: '#67E8F9'
        };
      case 'Influencer':
        return {
          headline: 'Welcome Creator.',
          subheadline: 'Your next brand collaboration starts here.',
          color: '#06B6D4'
        };
      default:
        return {
          headline: 'Welcome.',
          subheadline: 'Entering your workspace.',
          color: '#00C2FF'
        };
    }
  };

  const successContent = getSuccessContent();

  return (
    <div style={{ 
      minHeight: '82vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      padding: '20px 0',
      width: '100%'
    }}>
      
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '500px',
        height: '500px',
        background: `radial-gradient(circle, ${isLogin ? 'rgba(0, 217, 255, 0.06)' : 'rgba(6, 182, 212, 0.08)'} 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(80px)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: -1
      }} />

      {/* Main Container */}
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%',
          maxWidth: (!isLogin && signUpStep === 1) ? '960px' : '500px', 
          padding: '40px 32px',
          boxShadow: 'var(--shadow-premium)',
          borderRadius: '24px',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {errorMsg && (
          <div className="animate-scale-up" style={{
            padding: '14px 20px',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.06)',
            color: '#ef4444',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            textAlign: 'left'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ==================== LOGIN VIEW ==================== */}
        {isLogin && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-white)' }}>
                Sign In to Creators Hub
              </h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '6px' }}>
                Enter your credentials to unlock your workspace.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="form-input" 
                    style={{ paddingLeft: '48px' }}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <button 
                    type="button" 
                    onClick={() => showSuccessToast({ title: '✔ Reset Email Sent', subtitle: 'Demo reset instructions sent to guest email!' })}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="form-input" 
                    style={{ paddingLeft: '48px', paddingRight: '48px' }}
                    placeholder="Enter your password"
                    required
                  />
                  <button 
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                onClick={(e) => {
                  const form = e.currentTarget.form;
                  if (form && !form.checkValidity()) {
                    return;
                  }
                  e.preventDefault();
                  handleLoginSubmit(e);
                }}
                className="btn-primary" 
                style={{ 
                  marginTop: '8px', 
                  width: '100%',
                  background: 'var(--grad-primary)', 
                  border: 'none', 
                  borderRadius: '12px' 
                }}
              >
                Continue
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)' }}></div>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '500' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)' }}></div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin}
              style={{ 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: '#FFFFFF', 
                border: '1px solid var(--glass-border)', 
                borderRadius: '12px',
                padding: '12px',
                color: '#152826',
                fontWeight: '600',
                fontSize: '14.5px',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                marginBottom: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(91, 174, 155, 0.05)';
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => { onNavigate('onboarding'); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer' }}
              >
                Don't have an account? Sign Up
              </button>
            </div>
          </div>
        )}

        {/* ==================== SIGN UP VIEW ==================== */}
        {!isLogin && (
          <div>
            {/* STEP 1: PARTICIPATION SELECTION */}
            {signUpStep === 1 && (
              <div className="animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-white)', letterSpacing: '-0.03em' }}>
                    Welcome to Creators Hub
                  </h2>
                  <p style={{ color: 'var(--text-gray)', fontSize: '15px', marginTop: '6px' }}>
                    Choose how you want to participate in our premium ecosystem.
                  </p>
                </div>

                {/* Role cards container */}
                <div className="role-cards-grid">
                  {[
                    {
                      id: 'Business Holder',
                      name: 'Business Holder',
                      desc: 'I want to hire freelancers and influencers.',
                      icon: <Briefcase size={28} />,
                      color: '#00C2FF',
                      glow: 'rgba(0, 194, 255, 0.15)'
                    },
                    {
                      id: 'Freelancer',
                      name: 'Freelancer',
                      desc: 'I want to find projects and earn.',
                      icon: <Code size={28} />,
                      color: '#67E8F9',
                      glow: 'rgba(103, 232, 249, 0.15)'
                    },
                    {
                      id: 'Influencer',
                      name: 'Influencer',
                      desc: 'I want brand collaborations.',
                      icon: <Video size={28} />,
                      color: '#06B6D4',
                      glow: 'rgba(6, 182, 212, 0.15)'
                    }
                  ].map((card) => {
                    const isSelected = role === card.id;
                    return (
                      <div
                        key={card.id}
                        onClick={() => setRole(card.id)}
                        className={`role-selection-card ${isSelected ? 'selected' : ''}`}
                        style={{
                          padding: '36px 20px',
                          borderRadius: '20px',
                          background: isSelected ? 'var(--accent-cyan-glow)' : 'var(--bg-dark)',
                          border: isSelected ? `1.5px solid var(--accent-cyan)` : '1.5px solid var(--glass-border)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          minHeight: '230px',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? 'var(--shadow-premium)' : 'none',
                          transform: isSelected ? 'translateY(-4px)' : 'none',
                          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: isSelected ? 'rgba(91, 174, 155, 0.15)' : 'rgba(91, 174, 155, 0.05)',
                          color: isSelected ? 'var(--accent-cyan)' : 'var(--text-gray)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '16px',
                          border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                          transition: 'all 0.3s ease'
                        }}>
                          {card.icon}
                        </div>

                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '8px' }}>
                            {card.name}
                          </h4>
                          <p style={{ fontSize: '13px', color: 'var(--text-gray)', lineHeight: '1.4', margin: 0 }}>
                            {card.desc}
                          </p>
                        </div>

                        <div style={{ 
                          marginTop: '16px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                          transition: 'all 0.3s ease'
                        }}>
                          {isSelected ? 'Selected' : 'Select'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
                  <button 
                    onClick={() => setSignUpStep(2)}
                    className="btn-primary" 
                    style={{ width: '100%', maxWidth: '280px', borderRadius: '12px' }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button 
                    onClick={() => { onNavigate('onboarding', { loginOnly: true }); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Already registered? Sign In
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CREATE ACCOUNT FORM */}
            {signUpStep === 2 && (
              duplicateEmailError ? (
                <div className="animate-scale-up" style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    padding: '24px',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.06)',
                    color: '#ef4444',
                    fontSize: '15.5px',
                    fontWeight: '600',
                    borderRadius: '16px',
                    marginBottom: '28px',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    textAlign: 'center',
                    lineHeight: '1.6'
                  }}>
                    This email is already registered. Please sign in to continue.
                  </div>
                  <button
                    onClick={() => {
                      setDuplicateEmailError(false);
                      setIsLogin(true);
                      setSignUpStep(1);
                      setLoginEmail(email);
                    }}
                    className="btn-primary"
                    style={{ width: '100%', borderRadius: '12px' }}
                  >
                    → Go to Login
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                  <button 
                    onClick={() => setSignUpStep(1)} 
                    style={{ 
                      background: 'none', border: 'none', color: 'var(--text-gray)', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '13px', fontWeight: '600', minHeight: '36px'
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <span className="badge-premium" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Step 2 of 4
                  </span>
                  <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-white)', marginTop: '6px' }}>
                    Create Account
                  </h2>
                  <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '4px' }}>
                    Signing up as a <span style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{role}</span>.
                  </p>
                </div>

                <form onSubmit={handleSignUpDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="form-label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="form-input" 
                        style={{ paddingLeft: '48px' }}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input" 
                        style={{ paddingLeft: '48px' }}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                      <input 
                        type="tel" 
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="form-input" 
                        style={{ paddingLeft: '48px' }}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="signup-grid-row">
                    <div>
                      <label className="form-label">Password</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input" 
                        placeholder="Create a password"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Confirm Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input" 
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    onClick={(e) => {
                      const form = e.currentTarget.form;
                      if (form && !form.checkValidity()) {
                        return; // Let the browser handle standard HTML5 tooltips
                      }
                      e.preventDefault();
                      handleSignUpDetailsSubmit(e);
                    }}
                    className="btn-primary" 
                    style={{ 
                      marginTop: '12px',
                      width: '100%',
                      borderRadius: '12px'
                    }}
                  >
                    Create Account
                  </button>
                </form>
              </div>
            ))}

            {/* STEP 3: OTP EMAIL VERIFICATION */}
            {signUpStep === 3 && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                  <button 
                    onClick={() => setSignUpStep(2)} 
                    style={{ 
                      background: 'none', border: 'none', color: 'var(--text-gray)', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '13px', fontWeight: '600', minHeight: '36px'
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <span className="badge-premium" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Step 3 of 4
                  </span>
                  <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-white)', marginTop: '6px' }}>
                    Email Verification
                  </h2>
                  <p style={{ color: 'var(--text-gray)', fontSize: '13.5px', marginTop: '6px', lineHeight: '1.4' }}>
                    We have sent a verification code to <strong style={{ color: 'var(--text-white)' }}>{email}</strong>.
                  </p>
                </div>

                {/* Helpful OTP Banner */}
                <div style={{
                  background: 'rgba(91, 174, 155, 0.06)',
                  border: '1px solid rgba(91, 174, 155, 0.25)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '12.5px',
                  color: 'var(--accent-cyan)',
                  textAlign: 'center'
                }}>
                  🔒 Demo Verification OTP: <strong style={{ color: 'var(--text-white)' }}>{mockOtp}</strong>
                </div>

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="form-label">Enter 6-Digit OTP</label>
                    <input 
                      type="text" 
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g,''))}
                      className="form-input" 
                      style={{ 
                        letterSpacing: '12px', 
                        textAlign: 'center', 
                        fontSize: '22px', 
                        fontWeight: '700',
                        paddingLeft: '22px'
                      }}
                      placeholder="------"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    onClick={(e) => {
                      const form = e.currentTarget.form;
                      if (form && !form.checkValidity()) {
                        return;
                      }
                      e.preventDefault();
                      handleVerifyOtp(e);
                    }}
                    className="btn-primary" 
                    style={{ 
                      marginTop: '8px',
                      width: '100%',
                      borderRadius: '12px'
                    }}
                  >
                    Verify
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button 
                    onClick={() => { showSuccessToast({ title: '✔ OTP Resent', subtitle: 'A new OTP has been sent (Mock: 123456).' }); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PREMIUM SUCCESS TRANSITION SCREEN */}
            {signUpStep === 4 && (
              <div className="success-overlay">
                <div className="success-card">
                  {/* Circular verification animation (0.2s) */}
                  <div className="verification-circle-container">
                    {/* Radial burst particles (0.6s) */}
                    <div className="particle p1"></div>
                    <div className="particle p2"></div>
                    <div className="particle p3"></div>
                    <div className="particle p4"></div>
                    <div className="particle p5"></div>
                    <div className="particle p6"></div>
                    <div className="particle p7"></div>
                    <div className="particle p8"></div>
                    
                    {/* Glowing outer & inner circle */}
                    <div className="verification-circle">
                      {/* Animated checkmark (0.4s) */}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5BAE9B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="checkmark-svg">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>

                  {/* Category-specific Welcome Text (0.8s) */}
                  <div className="success-content">
                    <h2 style={{
                      fontSize: '30px',
                      fontWeight: '800',
                      color: 'var(--text-white)',
                      marginBottom: '16px',
                      letterSpacing: '-0.02em',
                      lineHeight: '1.2'
                    }}>
                      {role === 'Business Holder' ? 'Welcome, Business Owner.' : 
                       role === 'Freelancer' ? 'Welcome, Freelancer.' : 
                       'Welcome, Creator.'}
                    </h2>
                    
                    <p style={{
                      color: 'var(--text-gray)',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      maxWidth: '420px',
                      margin: '0 auto 28px auto',
                      fontWeight: '500'
                    }}>
                      {role === 'Business Holder' ? 'Your workspace is ready to hire exceptional talent.' :
                       role === 'Freelancer' ? "Thousands of opportunities await. Let's build something amazing." :
                       'Your next brand collaboration starts here.'}
                    </p>

                    {/* Premium Green Verification Badge */}
                    <div className="badge-verified-green">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Account Successfully Created
                    </div>
                  </div>

                  {/* Thin Progress line at bottom (1.5s) */}
                  <div className="progress-line-container">
                    <div className="progress-line"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .role-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .role-selection-card:hover {
          background: var(--bg-dark);
          border-color: var(--accent-cyan) !important;
          transform: translateY(-2px);
        }

        /* Success screen transition styling */
        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(245, 251, 249, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: overlayFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards, overlayFadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) 2.0s forwards;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        }

        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .success-card {
          width: 520px;
          max-width: 92%;
          background: #FFFFFF;
          border: 1px solid rgba(91, 174, 155, 0.15);
          border-radius: 28px;
          padding: 48px 36px;
          box-shadow: var(--shadow-premium), 0 20px 50px rgba(21, 40, 38, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
          transform: scale(0.96);
          filter: blur(5px);
          opacity: 0;
          animation: cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cardEnter {
          to {
            transform: scale(1);
            filter: blur(0);
            opacity: 1;
          }
        }

        .verification-circle-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          opacity: 0;
          transform: scale(0.5);
          animation: circleEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
        }

        @keyframes circleEnter {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .verification-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(91, 174, 155, 0.06);
          border: 2px solid #5BAE9B;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(91, 174, 155, 0.15);
          position: relative;
          z-index: 2;
        }

        .checkmark-svg polyline {
          stroke-dasharray: 22;
          stroke-dashoffset: 22;
          animation: drawCheckmark 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
        }

        @keyframes drawCheckmark {
          to {
            stroke-dashoffset: 0;
          }
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7EC5B4;
          opacity: 0;
          z-index: 1;
        }

        .p1 { animation: burst1 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }
        .p2 { animation: burst2 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }
        .p3 { animation: burst3 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }
        .p4 { animation: burst4 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }
        .p5 { animation: burst5 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }
        .p6 { animation: burst6 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }
        .p7 { animation: burst7 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }
        .p8 { animation: burst8 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; }

        @keyframes burst1 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(0px, -45px) scale(0.3); opacity: 0; } }
        @keyframes burst2 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(32px, -32px) scale(0.3); opacity: 0; } }
        @keyframes burst3 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(45px, 0px) scale(0.3); opacity: 0; } }
        @keyframes burst4 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(32px, 32px) scale(0.3); opacity: 0; } }
        @keyframes burst5 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(0px, 45px) scale(0.3); opacity: 0; } }
        @keyframes burst6 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-32px, 32px) scale(0.3); opacity: 0; } }
        @keyframes burst7 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-45px, 0px) scale(0.3); opacity: 0; } }
        @keyframes burst8 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-32px, -32px) scale(0.3); opacity: 0; } }

        .success-content {
          opacity: 0;
          transform: translateY(15px);
          animation: contentFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;
          text-align: center;
          width: 100%;
        }

        @keyframes contentFadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .badge-verified-green {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(91, 174, 155, 0.08);
          color: #4b8f80;
          border: 1px solid rgba(91, 174, 155, 0.2);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin: 0 auto;
        }

        .progress-line-container {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(91, 174, 155, 0.05);
        }

        .progress-line {
          height: 100%;
          width: 0;
          background: linear-gradient(90deg, #5BAE9B 0%, #7EC5B4 100%);
          animation: fillProgress 2.0s linear forwards;
        }

        @keyframes fillProgress {
          to {
            width: 100%;
          }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .role-cards-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .signup-grid-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;

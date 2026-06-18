import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  ArrowLeft, ArrowRight, Briefcase, Video, Code, Mail, Lock, 
  User, Phone, Eye, EyeOff, Sparkles
} from 'lucide-react';

export const Onboarding = ({ onNavigate, initialParams = {} }) => {
  const { registerUser, loginUser } = useContext(AppContext);

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

  // Step 4 Welcome Animation Stage
  const [successAnimationActive, setSuccessAnimationActive] = useState(false);

  // Submit Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const res = loginUser(loginEmail, loginPassword);
    if (res.success) {
      onNavigate('dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  // Submit Registration Account Details (Step 2)
  const handleSignUpDetailsSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

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

    // Go to OTP
    setSignUpStep(3);
  };

  // Verify OTP (Step 3)
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode !== mockOtp) {
      setErrorMsg('Invalid verification code. Please try using 123456.');
      return;
    }

    // Successfully verified!
    registerUser(role, { 
      fullName, 
      email, 
      password, 
      mobileNumber 
    });
    
    setSignUpStep(4);
    setTimeout(() => {
      setSuccessAnimationActive(true);
    }, 100);
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
                    placeholder="name@business.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <button 
                    type="button" 
                    onClick={() => alert('Demo reset instructions sent to guest email!')}
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
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
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

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => { setIsLogin(false); setSignUpStep(1); setErrorMsg(''); }}
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
                    onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Already registered? Sign In
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CREATE ACCOUNT FORM */}
            {signUpStep === 2 && (
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
                        placeholder="E.g. Hafij Rehman"
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
                        placeholder="you@domain.com"
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
                        placeholder="+91 98765 43210"
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
                        placeholder="••••••••"
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
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
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
            )}

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
                    onClick={() => { alert('A new OTP has been sent (Mock: 123456).'); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS BOARD & ENTER WORKSPACE */}
            {signUpStep === 4 && (
              <div style={{ textAlign: 'center', padding: '10px 0' }} className="animate-scale-up">
                
                {/* Glowing Nodes Network Visualizer */}
                <div style={{ 
                  height: '140px', 
                  width: '100%', 
                  position: 'relative', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <svg width="240" height="130" viewBox="0 0 240 130" style={{ overflow: 'visible' }}>
                    <defs>
                      <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00C2FF" />
                        <stop offset="100%" stopColor="#67E8F9" />
                      </linearGradient>
                    </defs>

                    {successAnimationActive && (
                      <>
                        <line x1="30" y1="65" x2="120" y2="65" stroke="url(#cyanGrad)" strokeWidth="2" strokeDasharray="100" strokeDashoffset="0" style={{ transition: 'stroke-dashoffset 1.5s ease', opacity: 0.8 }} />
                        <line x1="210" y1="65" x2="120" y2="65" stroke="url(#cyanGrad)" strokeWidth="2" strokeDasharray="100" strokeDashoffset="0" style={{ transition: 'stroke-dashoffset 1.5s ease 0.2s', opacity: 0.8 }} />
                        <line x1="120" y1="15" x2="120" y2="65" stroke="url(#cyanGrad)" strokeWidth="2" strokeDasharray="100" strokeDashoffset="0" style={{ transition: 'stroke-dashoffset 1.5s ease 0.4s', opacity: 0.8 }} />
                      </>
                    )}

                    <g>
                      <circle cx="30" cy="65" r="7" fill="#111827" stroke="#00C2FF" strokeWidth="2" />
                      <circle cx="210" cy="65" r="7" fill="#111827" stroke="#67E8F9" strokeWidth="2" />
                      <circle cx="120" cy="15" r="7" fill="#111827" stroke="#06B6D4" strokeWidth="2" />

                      <circle cx="120" cy="65" r="14" fill="url(#cyanGrad)" filter="url(#glow-cyan)" />
                      <path d="M115 65h10M120 60v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>

                <div style={{ minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
                    <Sparkles size={14} /> ACCOUNT VERIFIED <Sparkles size={14} />
                  </div>

                  {/* Kinetic Typography */}
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: 'var(--text-white)',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                    transform: successAnimationActive ? 'scale(1)' : 'scale(0.9)',
                    opacity: successAnimationActive ? 1 : 0,
                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}>
                    {successContent.headline}
                  </h2>

                  <p style={{
                    color: 'var(--text-gray)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    maxWidth: '380px',
                    margin: '0 auto',
                    opacity: successAnimationActive ? 0.9 : 0,
                    transform: successAnimationActive ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.6s ease 0.2s'
                  }}>
                    {successContent.subheadline}
                  </p>
                </div>

                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '15px',
                    letterSpacing: '0.02em',
                    boxShadow: '0 8px 25px rgba(0, 217, 255, 0.25)',
                    marginTop: '28px'
                  }}
                >
                  Enter Workspace
                </button>
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

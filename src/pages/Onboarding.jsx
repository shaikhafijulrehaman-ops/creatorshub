import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  ArrowLeft, ArrowRight, Briefcase, Video, Code, Mail, Lock, 
  User, Eye, EyeOff, ShieldCheck 
} from 'lucide-react';

export const Onboarding = ({ onNavigate, initialParams = {} }) => {
  const { registerUser, loginUser } = useContext(AppContext);

  // Steps: 1 (Goal Selection), 2 (Identity Selection), 3 (Account Creation / Login), 4 (Created Welcome Animation)
  const [step, setStep] = useState(initialParams.loginOnly ? 3 : 1);
  const [isLogin, setIsLogin] = useState(initialParams.loginOnly || false);
  
  // Registration state
  const [goal, setGoal] = useState('');
  const [role, setRole] = useState('Business Holder');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Step 4 timing states
  const [animationStage, setAnimationStage] = useState(0); // 0: established, 1: welcome, 2: role-based, 3: redirect

  // Hover states for Step 2
  const [hoveredRole, setHoveredRole] = useState(null);

  // Handle Goal selection (instant advance to Step 2)
  const handleGoalSelect = (selectedGoal) => {
    setGoal(selectedGoal);
    if (selectedGoal === 'Grow My Business') {
      setRole('Business Holder');
    } else if (selectedGoal === 'Get Brand Collaborations') {
      setRole('Influencer');
    } else if (selectedGoal === 'Offer Professional Services') {
      setRole('Freelancer');
    }
    setStep(2);
  };

  // Handle Identity selection (instant advance to Step 3)
  const handleIdentitySelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(3);
  };

  // Handle Signup / Login Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      if (!loginEmail || !loginPassword) {
        setErrorMsg('Please fill in all credentials.');
        return;
      }
      const res = loginUser(loginEmail, loginPassword);
      if (res.success) {
        onNavigate('dashboard');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      if (!fullName || !email || !password || !confirmPassword) {
        setErrorMsg('Please fill in all fields.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password should be at least 6 characters.');
        return;
      }

      // Perform register
      registerUser(role, { fullName, email, password });
      setStep(4);
    }
  };

  // Step 4 Welcome Animation timing sequence
  useEffect(() => {
    if (step !== 4) return;

    const t1 = setTimeout(() => setAnimationStage(1), 1800);
    const t2 = setTimeout(() => setAnimationStage(2), 3600);
    const t3 = setTimeout(() => {
      setAnimationStage(3);
      onNavigate('dashboard');
    }, 7200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  // Google Sign In Mock
  const handleGoogleSignIn = () => {
    setErrorMsg('');
    const mockName = 'Alex Mercer';
    const mockEmail = `alex.mercer@gmail.com`;
    const mockPassword = 'google_authenticated';
    
    registerUser(role, { fullName: mockName, email: mockEmail, password: mockPassword });
    setStep(4);
  };

  // Background gradient based on selected role
  const getMorphBackgroundStyle = () => {
    const active = hoveredRole || role;
    if (active === 'Business Holder') {
      return 'radial-gradient(circle at 50% 50%, rgba(0, 217, 255, 0.1) 0%, rgba(0, 0, 0, 0) 80%)';
    }
    if (active === 'Influencer') {
      return 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, rgba(0, 0, 0, 0) 80%)';
    }
    if (active === 'Freelancer') {
      return 'radial-gradient(circle at 50% 50%, rgba(103, 232, 249, 0.08) 0%, rgba(0, 0, 0, 0) 80%)';
    }
    return 'none';
  };

  // Role Welcome Texts
  const getRoleWelcomeText = () => {
    switch (role) {
      case 'Business Holder':
        return {
          title: 'Welcome, Business Leader.',
          line1: 'Find the right creators.',
          line2: 'Build the right team.',
          line3: 'Launch the right campaign.',
          footer: 'Your next growth opportunity starts here.'
        };
      case 'Influencer':
        return {
          title: 'Welcome, Creator.',
          line1: 'New partnerships.',
          line2: 'New audiences.',
          line3: 'New possibilities.',
          footer: 'Your next brand collaboration could be one connection away.'
        };
      case 'Freelancer':
        return {
          title: 'Welcome, Freelancer.',
          line1: 'Show your skills.',
          line2: 'Win meaningful projects.',
          line3: 'Build your reputation.',
          footer: 'Your next opportunity is already in motion.'
        };
      default:
        return {};
    }
  };

  const welcomeText = getRoleWelcomeText();

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      padding: '20px 0',
      width: '100%'
    }}>
      
      {/* Morphing Background Glow */}
      {step < 4 && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: getMorphBackgroundStyle(),
          zIndex: -1,
          transition: 'background 0.8s ease',
          pointerEvents: 'none'
        }} />
      )}

      {/* Main glass wrapper */}
      <div 
        className="glass-panel onboarding-wrapper" 
        style={{ 
          width: '100%',
          maxWidth: step === 1 ? '950px' : (step === 2 ? '850px' : '520px'), 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(5, 8, 22, 0.45)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {errorMsg && step < 4 && (
          <div className="animate-scale-up" style={{
            padding: '14px 20px',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#ef4444',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* STEP 1: WHAT BRINGS YOU TO CREATORS HUB */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.03em', color: '#fff', marginBottom: '8px' }} className="onboarding-title">
                What brings you to Creators Hub?
              </h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '15px' }}>
                Choose the path that matches your goal.
              </p>
            </div>

            <div className="onboarding-grid-step1">
              {[
                { 
                  title: 'Grow My Business', 
                  desc: 'Find influencers, freelancers, and growth opportunities.', 
                  icon: <Briefcase size={26} />,
                  color: '#00C2FF'
                },
                { 
                  title: 'Get Brand Collaborations', 
                  desc: 'Connect with businesses and unlock partnership opportunities.', 
                  icon: <Video size={26} />,
                  color: '#06B6D4'
                },
                { 
                  title: 'Offer Professional Services', 
                  desc: 'Showcase your skills and get discovered by clients.', 
                  icon: <Code size={26} />,
                  color: '#67E8F9'
                }
              ].map(opt => (
                <div
                  key={opt.title}
                  onClick={() => handleGoalSelect(opt.title)}
                  className="glass-panel-hover"
                  style={{
                    padding: '32px 20px',
                    borderRadius: '20px',
                    background: 'rgba(15, 23, 42, 0.25)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    minHeight: '220px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = opt.color;
                    e.currentTarget.style.boxShadow = `0 10px 30px -10px ${opt.color}22`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    color: opt.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    {opt.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                      {opt.title}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.5', margin: 0 }}>
                      {opt.desc}
                    </p>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '12px', fontWeight: '600', color: opt.color }}>
                    Select Path →
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE YOUR IDENTITY */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '24px' }}>
              <button 
                onClick={() => setStep(1)} 
                style={{ 
                  background: 'none', border: 'none', color: 'var(--text-gray)', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '13px', fontWeight: '600', minHeight: '44px'
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.03em', color: '#fff', marginBottom: '8px' }} className="onboarding-title">
                Choose Your Identity
              </h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '15px' }}>
                Select the role that defines you in our network.
              </p>
            </div>

            <div className="onboarding-grid-step2">
              {[
                {
                  name: 'Business Holder',
                  tagline: 'Brand & Creator Seeker',
                  desc: 'Build your brand and discover talent.',
                  icon: <Briefcase size={24} />,
                  color: '#00C2FF'
                },
                {
                  name: 'Influencer',
                  tagline: 'Social Media Creator',
                  desc: 'Collaborate with businesses and grow your audience.',
                  icon: <Video size={24} />,
                  color: '#06B6D4'
                },
                {
                  name: 'Freelancer',
                  tagline: 'Service Professional',
                  desc: 'Showcase your expertise and win projects.',
                  icon: <Code size={24} />,
                  color: '#67E8F9'
                }
              ].map(item => (
                <div
                  key={item.name}
                  onClick={() => handleIdentitySelect(item.name)}
                  onMouseEnter={() => setHoveredRole(item.name)}
                  onMouseLeave={() => setHoveredRole(null)}
                  style={{
                    padding: '32px 20px',
                    borderRadius: '20px',
                    background: 'rgba(15, 23, 42, 0.25)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: '220px',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.boxShadow = `0 0 25px ${item.color}33`;
                    e.currentTarget.style.transform = 'scale(1.03)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.02)',
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
                      {item.name}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      {item.tagline}
                    </span>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-gray)', lineHeight: '1.4', margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: item.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '12px' }}>
                    Choose →
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: CREATE ACCOUNT OR LOGIN */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '24px' }}>
              <button 
                onClick={() => { setStep(2); setErrorMsg(''); }} 
                style={{ 
                  background: 'none', border: 'none', color: 'var(--text-gray)', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '13px', fontWeight: '600', minHeight: '44px'
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span className="badge-premium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                {role} Setup
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.02em', color: '#fff', marginTop: '4px' }}>
                {isLogin ? 'Sign In to Creators Hub' : 'Create Your Account'}
              </h2>
              <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '4px' }}>
                {isLogin ? 'Welcome back! Unlock your campaign control workspace.' : 'Only 30 seconds to setup. Get started today.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {isLogin ? (
                <>
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
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Password</label>
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
                </>
              ) : (
                <>
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
                        placeholder="Jane Doe"
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
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="onboarding-credentials-row">
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
                </>
              )}

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ 
                  marginTop: '10px',
                  padding: '15px',
                  fontSize: '14px',
                  fontWeight: '700',
                  letterSpacing: '0.02em',
                  background: 'linear-gradient(135deg, #00C2FF 0%, #06B6D4 50%, #67E8F9 100%)',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
                  transition: 'all 0.3s ease',
                  minHeight: '48px'
                }}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {!isLogin && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', opacity: 0.5 }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
                  <span style={{ fontSize: '11px', margin: '0 12px', color: '#fff', textTransform: 'uppercase' }}>or continue with</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    minHeight: '48px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.6 5.6 0 0 1 8.35 13a5.6 5.6 0 0 1 5.64-5.6c1.55 0 2.96.63 4 1.638l3.056-3.05a9.7 9.7 0 0 0-7.056-2.988A9.8 9.8 0 0 0 4.2 13a9.8 9.8 0 0 0 9.8 10 9.5 9.5 0 0 0 9.79-8.4c0-.6-.056-1.185-.168-1.72H12.24z"/>
                  </svg>
                  Sign In with Google
                </button>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', minHeight: '44px' }}
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ACCESS GRANTED / WELCOME SCREEN */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ 
              height: '150px', 
              width: '100%', 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '28px'
            }}>
              <svg width="260" height="150" viewBox="0 0 260 150" style={{ overflow: 'visible' }}>
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

                {animationStage >= 0 && (
                  <>
                    <line x1="40" y1="75" x2="130" y2="75" stroke="url(#cyanGrad)" strokeWidth="2" strokeDasharray="100" strokeDashoffset={animationStage === 0 ? "100" : "0"} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', opacity: 0.7 }} />
                    <line x1="220" y1="75" x2="130" y2="75" stroke="url(#cyanGrad)" strokeWidth="2" strokeDasharray="100" strokeDashoffset={animationStage === 0 ? "100" : "0"} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s', opacity: 0.7 }} />
                    <line x1="130" y1="20" x2="130" y2="75" stroke="url(#cyanGrad)" strokeWidth="2" strokeDasharray="100" strokeDashoffset={animationStage === 0 ? "100" : "0"} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.6s', opacity: 0.7 }} />
                  </>
                )}

                <g>
                  <circle cx="40" cy="75" r="8" fill="#111827" stroke="#00C2FF" strokeWidth="2" />
                  <circle cx="40" cy="75" r="3" fill="#00C2FF" />
                  
                  <circle cx="220" cy="75" r="8" fill="#111827" stroke="#67E8F9" strokeWidth="2" />
                  <circle cx="220" cy="75" r="3" fill="#67E8F9" />

                  <circle cx="130" cy="20" r="8" fill="#111827" stroke="#06B6D4" strokeWidth="2" />
                  <circle cx="130" cy="20" r="3" fill="#06B6D4" />

                  <circle cx="130" cy="75" r="15" fill="url(#cyanGrad)" filter="url(#glow-cyan)" style={{ transformOrigin: '130px 75px', animation: 'pulse-nodes 2s infinite alternate' }} />
                  <path d="M125 75h10M130 70v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </g>
              </svg>

              <style>{`
                @keyframes pulse-nodes {
                  0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(6,182,212,0.4)); }
                  100% { transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(6,182,212,0.8)); }
                }
              `}</style>
            </div>

            <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ opacity: animationStage >= 0 ? 1 : 0, transition: 'all 0.6s ease', marginBottom: '12px' }}>
                <span style={{ 
                  color: 'var(--accent-cyan)', 
                  fontWeight: '800', 
                  fontSize: '15px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.2em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  Connection Established
                </span>
              </div>

              <h2 style={{
                fontSize: '28px',
                fontWeight: '900',
                color: '#fff',
                marginBottom: '20px',
                letterSpacing: '-0.02em',
                opacity: animationStage >= 1 ? 1 : 0,
                transition: 'all 0.6s ease'
              }} className="onboarding-welcome-title">
                Welcome to Creators Hub
              </h2>

              {animationStage >= 2 && (
                <div 
                  className="animate-scale-up"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '20px',
                    borderRadius: '16px',
                    maxWidth: '450px',
                    margin: '0 auto',
                    textAlign: 'center'
                  }}
                >
                  <h4 style={{ color: 'var(--accent-cyan-light)', fontWeight: '800', fontSize: '17px', marginBottom: '10px' }}>
                    {welcomeText.title}
                  </h4>
                  <div style={{ color: '#fff', fontSize: '13.5px', lineHeight: '1.6', opacity: 0.85 }}>
                    <p style={{ margin: '2px 0' }}>{welcomeText.line1}</p>
                    <p style={{ margin: '2px 0' }}>{welcomeText.line2}</p>
                    <p style={{ margin: '2px 0' }}>{welcomeText.line3}</p>
                  </div>
                  <div style={{ marginTop: '14px', fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {welcomeText.footer}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '28px' }}>
              <div className="loader-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Entering workspace...</span>
            </div>
          </div>
        )}
      </div>

      {/* Responsive Styles */}
      <style>{`
        .onboarding-wrapper {
          padding: 48px 40px;
        }

        .onboarding-grid-step1 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .onboarding-grid-step2 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .onboarding-credentials-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .onboarding-wrapper {
            padding: 24px 16px !important;
            margin: 10px !important;
          }
          .onboarding-title {
            font-size: 24px !important;
            line-height: 1.25 !important;
          }
          .onboarding-welcome-title {
            font-size: 22px !important;
          }
          .onboarding-grid-step1 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .onboarding-grid-step2 {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .onboarding-credentials-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;

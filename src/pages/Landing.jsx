import { useState, useEffect } from 'react';
import { 
  ArrowRight, Play, Sparkles, Shield, Cpu, Users, Layers, 
  CreditCard, BarChart2, ExternalLink, X,
  Briefcase, Video, Code, ShieldCheck, Eye, MessageSquare
} from 'lucide-react';
import { AnimatedLogo } from '../components/AnimatedLogo';

export const Landing = ({ onNavigate }) => {
  const [clicked, setClicked] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const isLight = true;

  // Check if logo should animate once per session (disabled)
  const shouldAnimateLogo = false;

  const handleCloseDemoModal = () => {
    setShowDemoModal(false);
    setIsVideoPlaying(false);
  };

  const handleJoinHub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + rect.left;
    const y = e.clientY - rect.top + rect.top;

    setCoords({ x, y });
    setClicked(true);

    setTimeout(() => {
      onNavigate('onboarding');
    }, 700);
  };

  // Scroll Reveal Observer for premium entrance animations
  useEffect(() => {
    let observer;
    let elements = [];

    const timer = setTimeout(() => {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.05 });

      elements = document.querySelectorAll('.scroll-reveal');
      elements.forEach(el => observer.observe(el));
    }, 150);

    return () => {
      clearTimeout(timer);
      if (observer) {
        elements.forEach(el => observer.unobserve(el));
      }
    };
  }, []);

  // Compute staggered delays based on whether animation plays
  const tagDelay = shouldAnimateLogo ? '2.0s' : '0.1s';
  const titleDelay = shouldAnimateLogo ? '2.2s' : '0.2s';
  const subtitleDelay = shouldAnimateLogo ? '2.4s' : '0.3s';
  const ctaDelay = shouldAnimateLogo ? '2.6s' : '0.4s';

  const uniqueId = 'ecosystem-viz';

  return (
    <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '0px' }}>
      
      {/* Morphing Zoom Transition Overlay */}
      {clicked && (
        <div style={{
          position: 'fixed',
          top: coords.y,
          left: coords.x,
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--grad-primary)',
          boxShadow: 'var(--glow-cyan)',
          zIndex: 9999,
          animation: 'burst-zoom-landing 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }} />
      )}

      {/* HERO SECTION */}
      <section style={{ 
        minHeight: '82vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center',
        padding: '60px 16px 50px 16px',
        position: 'relative',
        background: isLight ? 'radial-gradient(ellipse at top, rgba(2, 132, 199, 0.08), transparent 75%)' : 'transparent',
        zIndex: 1
      }}>
        {/* Subtle Moving Grid Background Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundSize: '40px 40px',
          backgroundImage: `
            linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
          `,
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'grid-move-anim 24s linear infinite'
        }} />

        {/* Background Ambient Glows */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '450px',
          height: '450px',
          background: isLight 
            ? 'radial-gradient(circle, rgba(2, 132, 199, 0.08) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(0, 217, 255, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0
        }} className="animate-float-slow" />
        
        {/* Floating Accent Tag */}
        <div className="hero-reveal-element" style={{ animationDelay: tagDelay, zIndex: 2 }}>
          <div className="animate-float-slow" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'rgba(0, 217, 255, 0.06)',
            border: '1px solid rgba(0, 217, 255, 0.18)',
            borderRadius: '30px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--accent-cyan-bright)',
            boxShadow: 'var(--glow-cyan) 0px 0px 15px -8px',
            marginBottom: '24px'
          }}>
            <Sparkles size={14} /> The Premium Creator Technology Platform
          </div>
        </div>

        {/* centerpiece Logo */}
        <div style={{ marginBottom: '20px', zIndex: 2 }} className="hero-logo-container">
          <AnimatedLogo fontSize="95px" animate={false} loop={false} />
        </div>

        {/* Headline Redesign */}
        <h1 className="hero-reveal-element hero-title" style={{ animationDelay: titleDelay, zIndex: 2 }}>
          <span className="text-gradient">Where Brands Meet Creators.</span>
          <span className="text-gradient-cyan-white">Where Ideas Become Businesses.</span>
        </h1>

        {/* Subheadline */}
        <p className="hero-reveal-element hero-subtitle" style={{ 
          color: 'var(--text-gray)', 
          maxWidth: '680px', 
          margin: '0 auto 40px auto', 
          lineHeight: '1.6',
          zIndex: 2,
          animationDelay: subtitleDelay
        }}>
          Creators Hub connects businesses, influencers, and freelancers into one powerful collaborative ecosystem.
        </p>

        {/* CTA Buttons */}
        <div className="hero-reveal-element hero-buttons" style={{ animationDelay: ctaDelay, zIndex: 2 }}>
          <button 
            onClick={handleJoinHub}
            className="btn-primary" 
            style={{ width: '100%', borderRadius: '12px' }}
          >
            Join The Hub <ArrowRight size={18} />
          </button>
          
          <button 
            onClick={() => onNavigate('explore')}
            className="btn-secondary" 
            style={{ width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Explore Platform
          </button>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section style={{ 
        maxWidth: '1100px', 
        margin: '-45px auto 10px auto', 
        width: '100%', 
        padding: '0 24px', 
        position: 'relative',
        zIndex: 2
      }}>
        <div className="landing-feature-grid">
          {[
            { name: 'Trusted Profiles', desc: 'Audited credentials & security metrics' },
            { name: 'AI Matching', desc: 'Direct compatibility algorithms' },
            { name: 'Creator Teams', desc: 'Shared milestone project cells' },
            { name: 'Secure Collaboration', desc: 'Escrow payment safety milestones' },
            { name: 'Analytics', desc: 'Reach validation & authentic growth' }
          ].map((feat, i) => (
            <div 
              key={feat.name} 
              className="scroll-reveal feature-strip-item"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.02)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: `${i * 80}ms`
              }}
            >
              <span style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-white)' }}>{feat.name}</span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-gray)', lineHeight: '1.4' }}>{feat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ECOSYSTEM VISUALIZATION */}
      <section 
        className="scroll-reveal"
        style={{ 
          maxWidth: '1100px', 
          margin: '10px auto 20px auto', 
          width: '100%', 
          padding: '0 24px',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            letterSpacing: '0.18em', 
            color: 'var(--accent-cyan-bright)',
            textTransform: 'uppercase'
          }}>
            Interactive Network
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '6px' }}>Ecosystem Architecture</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '4px', maxWidth: '500px', margin: '4px auto 0 auto', lineHeight: '1.5' }}>
            Unified flow architecture routing contracts, campaigns, and payments from brands to creators.
          </p>
        </div>

        <div className="glass-panel network-svg-container" style={{
          padding: '40px 24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-glass)',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <svg 
            className="network-svg"
            viewBox="0 0 600 240" 
            style={{ width: '100%', maxWidth: '600px', height: 'auto', overflow: 'visible' }}
          >
            <defs>
              <filter id={`nodeGlow-${uniqueId}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connection Lines */}
            <path id={`path-bh-hub-${uniqueId}`} d="M 100 120 L 300 120" stroke="var(--glass-border)" strokeWidth="1.8" fill="none" />
            <path id={`path-hub-inf-${uniqueId}`} d="M 300 120 L 500 60" stroke="var(--glass-border)" strokeWidth="1.8" fill="none" />
            <path id={`path-hub-fl-${uniqueId}`} d="M 300 120 L 500 180" stroke="var(--glass-border)" strokeWidth="1.8" fill="none" />

            {/* Flowing Glowing Nodes */}
            <circle r="4" fill="var(--accent-cyan-bright)" style={{ filter: `url(#nodeGlow-${uniqueId})` }}>
              <animateMotion dur="3s" repeatCount="indefinite" path="M 100 120 L 300 120" />
            </circle>
            <circle r="3.5" fill="var(--accent-cyan-light)" style={{ filter: `url(#nodeGlow-${uniqueId})` }}>
              <animateMotion dur="2.5s" begin="0.8s" repeatCount="indefinite" path="M 300 120 L 500 60" />
            </circle>
            <circle r="3.5" fill="var(--accent-cyan-light)" style={{ filter: `url(#nodeGlow-${uniqueId})` }}>
              <animateMotion dur="2.8s" begin="0.3s" repeatCount="indefinite" path="M 300 120 L 500 180" />
            </circle>

            {/* Nodes */}
            <g transform="translate(100, 120)" className="network-node">
              <circle r="22" fill="var(--bg-dark)" stroke="var(--accent-cyan-bright)" strokeWidth="1.5" style={{ filter: `url(#nodeGlow-${uniqueId})` }} />
              <Briefcase size={14} x="-7" y="-7" style={{ color: 'var(--accent-cyan-bright)' }} />
              <text y="38" fontFamily="Outfit" fontSize="10" fontWeight="700" fill="var(--text-white)" textAnchor="middle" letterSpacing="0.5px">BUSINESSES</text>
            </g>

            <g transform="translate(300, 120)" className="network-node active">
              <circle r="32" fill="var(--bg-deep)" stroke="var(--accent-cyan-bright)" strokeWidth="2" style={{ filter: `url(#nodeGlow-${uniqueId})` }} />
              <Cpu size={20} x="-10" y="-10" style={{ color: 'var(--accent-cyan-bright)' }} />
              <text y="48" fontFamily="Outfit" fontSize="11" fontWeight="800" fill="var(--text-white)" textAnchor="middle" letterSpacing="0.8px">THE HUB</text>
            </g>

            <g transform="translate(500, 60)" className="network-node">
              <circle r="20" fill="var(--bg-dark)" stroke="var(--accent-cyan-light)" strokeWidth="1.5" style={{ filter: `url(#nodeGlow-${uniqueId})` }} />
              <Video size={12} x="-6" y="-6" style={{ color: 'var(--accent-cyan-light)' }} />
              <text y="36" fontFamily="Outfit" fontSize="10" fontWeight="700" fill="var(--text-white)" textAnchor="middle" letterSpacing="0.5px">INFLUENCERS</text>
            </g>

            <g transform="translate(500, 180)" className="network-node">
              <circle r="20" fill="var(--bg-dark)" stroke="var(--accent-cyan-light)" strokeWidth="1.5" style={{ filter: `url(#nodeGlow-${uniqueId})` }} />
              <Code size={12} x="-6" y="-6" style={{ color: 'var(--accent-cyan-light)' }} />
              <text y="36" fontFamily="Outfit" fontSize="10" fontWeight="700" fill="var(--text-white)" textAnchor="middle" letterSpacing="0.5px">FREELANCERS</text>
            </g>
          </svg>
        </div>
      </section>

      {/* ECOSYSTEM VALUE PROPOSITIONS */}
      <section 
        className="scroll-reveal"
        style={{ 
          maxWidth: '1100px', 
          margin: '0 auto 20px auto', 
          width: '100%', 
          padding: '0 24px',
          zIndex: 2
        }}
      >
        <div className="landing-value-grid">
          {[
            { 
              title: 'Profile Verification', 
              desc: 'Verified profiles increase trust, visibility, and collaboration confidence across the ecosystem.',
              icon: <ShieldCheck size={22} />
            },
            { 
              title: 'Smart Matching', 
              desc: 'AI-powered discovery helps businesses, influencers, and freelancers find the right opportunities faster.',
              icon: <Cpu size={22} />
            },
            { 
              title: 'Project Workspaces', 
              desc: 'Manage discussions, files, deliverables, milestones, and project progress in one place.',
              icon: <Layers size={22} />
            },
            { 
              title: 'Real-Time Collaboration', 
              desc: 'Instant messaging, notifications, and collaboration tools built directly into the platform.',
              icon: <MessageSquare size={22} />
            }
          ].map((valProp, i) => (
            <div 
              key={i} 
              className="glass-panel glass-panel-hover" 
              style={{ 
                padding: '32px 24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                height: '100%',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(0, 217, 255, 0.08)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                color: 'var(--accent-cyan-bright)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0, 217, 255, 0.1)'
              }}>
                {valProp.icon}
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-white)', margin: 0 }}>
                {valProp.title}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-gray)', lineHeight: '1.5', margin: 0 }}>
                {valProp.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CREATORS HUB SECTION */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '20px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800' }}>One Platform.</h2>
          <h2 className="text-gradient-cyan-white" style={{ fontSize: '36px', fontWeight: '800' }}>Three Powerful Communities.</h2>
        </div>

        <div className="responsive-grid-3-2-1">
          {[
            { 
              title: 'Business Holders', 
              desc: 'Find talent, creators, and growth opportunities under verified workspace channels.', 
              color: 'var(--accent-cyan)',
              icon: <Briefcase size={26} />
            },
            { 
              title: 'Influencers', 
              desc: 'Collaborate with brands, monetize audiences, and secure audited campaigns.', 
              color: 'var(--accent-cyan-light)',
              icon: <Video size={26} />
            },
            { 
              title: 'Freelancers', 
              desc: 'Showcase skills, build portfolio grids, get hired, and process secure settlements.', 
              color: 'var(--accent-cyan-bright)',
              icon: <Code size={26} />
            }
          ].map((box, idx) => (
            <div 
              key={box.title} 
              className="scroll-reveal glass-panel glass-panel-hover" 
              style={{ 
                padding: '36px 28px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px', 
                height: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border)',
                transitionDelay: `${idx * 100}ms`
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                color: box.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {box.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{box.title}</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-gray)', lineHeight: '1.5' }}>{box.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800' }}>How It Works</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '6px' }}>A seamless pipeline designed to build instant collaboration workspaces.</p>
        </div>

        <div className="landing-how-grid">
          {[
            { step: 'Step 1', title: 'Choose Your Goal', desc: 'Select Hire Talent, Get Brand Deals, or Offer Services during initial onboarding.' },
            { step: 'Step 2', title: 'Create Your Profile', desc: 'Build a trusted profile complete with portfolios, platforms links, and metrics.' },
            { step: 'Step 3', title: 'Get Matched', desc: 'Our AI Matching Engine matches you with businesses or creators instantly.' },
            { step: 'Step 4', title: 'Collaborate', desc: 'Manage sprint milestones, escrow settlements, chats, and deliverables in one workspace.' }
          ].map((item, idx) => (
            <div 
              key={item.step} 
              className="scroll-reveal glass-panel" 
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                zIndex: 2,
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border)',
                transitionDelay: `${idx * 100}ms`
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '700', letterSpacing: '0.05em' }}>{item.step}</span>
              <h3 style={{ fontSize: '17px', fontWeight: '700' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-gray)', lineHeight: '1.4' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800' }}>Ecosystem Features</h2>
          <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '6px' }}>Advanced tools built for enterprise campaigns and creator careers.</p>
        </div>

        <div className="responsive-grid-3-2-1">
          {[
            { title: 'Trusted Profiles', desc: 'Verified identity and audited portfolio credentials secure safety metrics.', icon: <Shield size={20} /> },
            { title: 'AI Matching', desc: 'AI Match Engine calculates compatibility scores based on category alignment.', icon: <Cpu size={20} /> },
            { title: 'Creator Teams', desc: 'Assembles composite teams (influencers + devs + editors) into one active workspace.', icon: <Users size={20} /> },
            { title: 'Project Workspace', desc: 'Features milestones checks, chats, voice notes, and reference files vault.', icon: <Layers size={20} /> },
            { title: 'Portfolio System', desc: 'Audited visual layout showcase representing authentic campaign deliverables.', icon: <Eye size={20} /> },
            { title: 'Verification Center', desc: 'Identity validation and audience growth metrics authentic reviews.', icon: <ShieldCheck size={20} /> },
            { title: 'Secure Collaboration', desc: 'Escrows protect transactional settlements until deliverables check out.', icon: <CreditCard size={20} /> },
            { title: 'Analytics Dashboard', desc: 'Demographics statistics, reach growth metrics, and audit authenticity audits.', icon: <BarChart2 size={20} /> }
          ].map((f, idx) => (
            <div 
              key={f.title} 
              className="scroll-reveal glass-panel glass-panel-hover" 
              style={{ 
                padding: '28px', 
                display: 'flex', 
                gap: '16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--glass-border)',
                transitionDelay: `${idx * 80}ms`
              }}
            >
              <div style={{ color: 'var(--accent-cyan)', marginTop: '2px' }}>{f.icon}</div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{f.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-gray)', lineHeight: '1.4' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER & POWERED BY UXITECH */}
      <footer className="scroll-reveal" style={{ 
        borderTop: '1px solid rgba(255,255,255,0.06)', 
        padding: '60px 24px 32px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        <div className="footer-top">
          <div>
            <span style={{ fontFamily: 'var(--font-logo)', fontSize: '30px', color: 'var(--text-white)', fontWeight: '800', letterSpacing: '1px' }}>CREATORS HUB</span>
            <p style={{ color: 'var(--text-gray)', fontSize: '13px', maxWidth: '300px', marginTop: '10px', lineHeight: '1.5' }}>
              Connecting Businesses, Influencers and Freelancers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }} className="footer-links-col">
            <strong style={{ color: 'var(--text-white)' }}>Navigation</strong>
            <a href="#explore" onClick={(e) => { e.preventDefault(); onNavigate('explore'); }} style={{ color: 'var(--text-gray)' }}>Explore</a>
            <a href="#features" onClick={(e) => { 
              e.preventDefault();
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }} style={{ color: 'var(--text-gray)' }}>Features</a>
            <a href="#join" onClick={(e) => { e.preventDefault(); onNavigate('onboarding'); }} style={{ color: 'var(--text-gray)' }}>Join Hub</a>
          </div>
        </div>

        {/* Brand footer and UXITECH glass badge */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px',
          borderTop: '1px solid rgba(255,255,255,0.03)', 
          paddingTop: '32px',
          width: '100%' 
        }}>
          <a 
            href="https://uxitech.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="uxitech-glass-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '30px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(0, 217, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'var(--shadow-glass)',
              color: 'var(--text-white)',
              fontSize: '13px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer'
            }}
          >
            Powered by <span style={{ color: 'var(--accent-cyan-bright)', fontWeight: '800', textShadow: '0 0 10px rgba(0, 217, 255, 0.3)' }}>UXITECH</span>
            <ExternalLink size={13} style={{ color: 'var(--accent-cyan-bright)' }} />
          </a>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', margin: 0, textAlign: 'center' }}>
            Building the future of digital ecosystems.
          </p>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px', margin: 0, textAlign: 'center' }}>
            Copyright © 2026 Creators Hub. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* WATCH DEMO MODAL */}
      {showDemoModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="glass-panel animate-scale-up" style={{ padding: '24px', width: '90%', maxWidth: '700px', position: 'relative' }}>
            <button 
              onClick={handleCloseDemoModal}
              style={{
                position: 'absolute',
                top: '-32px', right: '0',
                background: 'none', border: 'none', color: '#fff', cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
            <div style={{
              width: '100%',
              aspectRatio: '16/9',
              background: '#070b13',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.06)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {isVideoPlaying ? (
                <video 
                  src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" 
                  controls 
                  autoPlay 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                />
              ) : (
                <>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8))', zIndex: 1 }} />
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80" 
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
                  />
                  <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div 
                      onClick={() => setIsVideoPlaying(true)}
                      style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', boxShadow: 'var(--glow-cyan)'
                      }}
                    >
                      <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: '700' }}>Creators Hub Walkthrough</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-gray)' }}>A 2-minute overview of the Creator Teams USP workspace</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        .hero-title {
          font-size: 64px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
        }

        .hero-subtitle {
          font-size: 18px;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          width: 100%;
          max-width: 440px;
        }

        .landing-feature-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          backdrop-filter: var(--glass-filter);
          border-radius: 24px;
          padding: 24px 20px;
          box-shadow: var(--shadow-glass);
        }

        .landing-value-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          text-align: left;
        }

        .landing-how-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          position: relative;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 32px;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .landing-feature-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .landing-how-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 34px !important;
            line-height: 1.25 !important;
          }
          .hero-logo-container {
            transform: scale(0.65);
            margin-bottom: 0px !important;
          }
          .hero-subtitle {
            font-size: 15px !important;
          }
          .hero-buttons {
            flex-direction: column !important;
            gap: 12px !important;
            max-width: 100% !important;
            padding: 0 16px;
          }
          .hero-buttons button {
            width: 100% !important;
            min-height: 48px !important;
          }
          .landing-value-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }

        @media (max-width: 600px) {
          .landing-feature-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-value-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-how-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-top {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .footer-links-col {
            align-items: center !important;
          }
        }

        /* Premium UXITECH Glass Badge Hover scale & glow */
        .uxitech-glass-badge:hover {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(0, 217, 255, 0.4) !important;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.25), var(--shadow-glass) !important;
        }

        /* Feature Strip Hover styles */
        .feature-strip-item:hover {
          background: rgba(0, 217, 255, 0.03) !important;
          border-color: rgba(0, 217, 255, 0.15) !important;
          transform: translateY(-2px);
        }

        /* Hero Staggered Reveal Animations */
        .hero-reveal-element {
          opacity: 0;
          transform: translateY(24px);
          animation: fadeUpReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeUpReveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scroll-triggered Reveal Classes */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px) scale(0.98);
          filter: blur(8px);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), 
                      transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), 
                      filter 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .scroll-reveal.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        /* Moving Grid Animation keyframe */
        @keyframes grid-move-anim {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }

        /* SVG Network Node Glow pulses */
        .network-node {
          transition: transform 0.3s ease;
        }
        .network-node:hover {
          transform: scale(1.08) !important;
          cursor: pointer;
        }

        @keyframes burst-zoom-landing {
          0% {
            width: 10px;
            height: 10px;
            opacity: 1;
          }
          100% {
            width: 300vw;
            height: 300vw;
            opacity: 1;
          }
        }

        @media (max-width: 600px) {
          .network-svg-container {
            justify-content: flex-start !important;
            overflow-x: auto !important;
            padding: 30px 16px !important;
          }
          .network-svg {
            min-width: 550px !important;
          }
        }
      `}</style>

    </div>
  );
};

export default Landing;

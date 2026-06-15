import React, { useEffect, useState } from 'react';
import { AnimatedLogo } from './AnimatedLogo';

export const LoadingScreen = ({ onComplete }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // The kinetic typography animation plays for 2.0 seconds
    // Start fade-out at 2.0 seconds (2000ms)
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2000);

    // Call onComplete at 2.5 seconds (2500ms) to trigger site mount
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      opacity: fade ? 0 : 1,
      transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none'
    }}>
      {/* SVG kinetic text reveal logo wrapper */}
      <div style={{ transform: 'scale(1.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedLogo fontSize="90px" loop={false} isLoader={true} />
      </div>
    </div>
  );
};

export default LoadingScreen;

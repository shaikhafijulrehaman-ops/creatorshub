import React, { useState, useEffect, useId, useContext } from 'react';
import { AppContext } from '../context/AppContext';

// Custom SVG path coordinates for the futuristic geometric font:
const LETTER_PATHS = {
  C: 'M 22 2 L 6 2 A 4 4 0 0 0 2 6 L 2 22 A 4 4 0 0 0 6 26 L 22 26',
  R: 'M 2 26 L 2 2 M 2 2 L 16 2 A 5 5 0 0 1 21 7 L 21 9 A 5 5 0 0 1 16 14 L 2 14 M 10 14 L 22 26',
  E: 'M 22 2 L 2 2 L 2 26 L 22 26 M 2 14 L 18 14',
  A: 'M 2 26 L 12 2 L 22 26', // Caret/Lambda shape (no crossbar)
  T: 'M 2 2 L 22 2 M 12 2 L 12 26',
  O: 'M 6 2 L 18 2 A 4 4 0 0 1 22 6 L 22 22 A 4 4 0 0 1 18 26 L 6 26 A 4 4 0 0 1 2 22 L 2 6 A 4 4 0 0 1 6 2',
  S: 'M 22 6 A 4 4 0 0 0 18 2 L 6 2 A 4 4 0 0 0 2 6 L 2 10 A 4 4 0 0 0 6 14 L 18 14 A 4 4 0 0 1 22 18 L 22 22 A 4 4 0 0 1 18 26 L 6 26 A 4 4 0 0 1 2 22',
  H: 'M 2 2 L 2 26 M 22 2 L 22 26 M 2 14 L 22 14',
  U: 'M 2 2 L 2 20 A 4 4 0 0 0 6 26 L 18 26 A 4 4 0 0 0 22 20 L 22 2',
  B: 'M 2 2 L 2 26 M 2 2 L 16 2 A 5 5 0 0 1 21 7 L 21 9 A 5 5 0 0 1 16 14 L 2 14 M 2 14 L 16 14 A 6 6 0 0 1 22 20 L 22 20 A 6 6 0 0 1 16 26 L 2 26'
};

const WORD_CREATORS = ['C', 'R', 'E', 'A', 'T', 'O', 'R', 'S'];
const WORD_HUB = ['H', 'U', 'B'];

export const AnimatedLogo = ({ fontSize = '34px', animate = true, loop = true, isLoader = false }) => {
  const uniqueId = useId().replace(/:/g, '');
  const maskCreatorsId = `mask-creators-${uniqueId}`;
  const maskHubId = `mask-hub-${uniqueId}`;

  // Get active theme from context or document element
  const context = useContext(AppContext);
  const theme = context?.theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'dark') || 'dark';

  const isLight = theme === 'light';
  const textColor = isLight ? '#0F172A' : '#ffffff';
  const guideLineColor = isLight ? 'rgba(15, 23, 42, 0.35)' : '#ffffff';
  const glowFilter = isLight 
    ? 'drop-shadow(0 0 4px rgba(2, 132, 199, 0.25))' 
    : 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6)) drop-shadow(0 0 16px rgba(0, 217, 255, 0.2))';

  // Check localStorage for animation preference (run once per session if not looping)
  const [shouldAnimate, setShouldAnimate] = useState(() => {
    if (!animate) return false;
    try {
      const hasAnimated = localStorage.getItem('creatorsHubLogoAnimated');
      return !hasAnimated;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    if (animate && shouldAnimate && !loop) {
      // Completed in 2.0 seconds
      const timer = setTimeout(() => {
        try {
          localStorage.setItem('creatorsHubLogoAnimated', 'true');
        } catch (e) {}
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [animate, shouldAnimate, loop]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg 
        viewBox="0 0 380 120" 
        style={{ 
          height: fontSize, 
          width: 'auto', 
          overflow: 'visible',
          background: 'transparent'
        }}
      >
        <defs>
          {/* Vertical white gradient glow for dark mode */}
          <linearGradient id={`whiteGlowVert-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>

          {/* Vertical blue gradient glow for light mode */}
          <linearGradient id={`blueGlowVert-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#0284C7" stopOpacity="1" />
            <stop offset="75%" stopColor="#0284C7" stopOpacity="1" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.1" />
          </linearGradient>

          {/* Mask for word 1: CREATORS */}
          <mask id={maskCreatorsId} maskUnits="userSpaceOnUse" x="0" y="0" width="380" height="120">
            {shouldAnimate ? (
              <>
                {/* Left reveal rect (x=52 to x=190) */}
                <rect 
                  x="52" 
                  y="0" 
                  width="0" 
                  height="60" 
                  fill="#ffffff" 
                  className={loop ? `mask-c1-loop-${uniqueId}` : `mask-c1-once-${uniqueId}`}
                />
                {/* Right reveal rect (x=190 to x=328) */}
                <rect 
                  x="190" 
                  y="0" 
                  width="0" 
                  height="60" 
                  fill="#ffffff" 
                  className={loop ? `mask-c2-loop-${uniqueId}` : `mask-c2-once-${uniqueId}`}
                />
              </>
            ) : (
              <rect x="0" y="0" width="380" height="60" fill="#ffffff" />
            )}
          </mask>

          {/* Mask for word 2: HUB */}
          <mask id={maskHubId} maskUnits="userSpaceOnUse" x="0" y="0" width="380" height="120">
            {shouldAnimate ? (
              <rect 
                x="154" 
                y="60" 
                width="0" 
                height="60" 
                fill="#ffffff" 
                className={loop ? `mask-h-loop-${uniqueId}` : `mask-h-once-${uniqueId}`}
              />
            ) : (
              <rect x="0" y="60" width="380" height="60" fill="#ffffff" />
            )}
          </mask>
        </defs>

        {/* --- 1. Storyboard Guide Lines & Slicing Bars (Only active when animating) --- */}
        {shouldAnimate && (
          <>
            {/* PANEL 01 & 02: Dead center vertical line that splits and slides */}
            <line 
              x1="190" 
              y1="10" 
              x2="190" 
              y2="50" 
              stroke={guideLineColor} 
              strokeWidth="0.8" 
              className={loop ? `guide-v1-loop-${uniqueId}` : `guide-v1-once-${uniqueId}`}
            />
            <line 
              x1="190" 
              y1="10" 
              x2="190" 
              y2="50" 
              stroke={guideLineColor} 
              strokeWidth="0.8" 
              className={loop ? `guide-v2-loop-${uniqueId}` : `guide-v2-once-${uniqueId}`}
            />

            {/* PANEL 02: Vertical bars that slide to start revealing letters */}
            <rect 
              x="185" 
              y="12" 
              width="10" 
              height="32" 
              fill={isLight ? `url(#blueGlowVert-${uniqueId})` : `url(#whiteGlowVert-${uniqueId})`}
              className={loop ? `bar-v1-loop-${uniqueId}` : `bar-v1-once-${uniqueId}`}
            />
            <rect 
              x="185" 
              y="12" 
              width="10" 
              height="32" 
              fill={isLight ? `url(#blueGlowVert-${uniqueId})` : `url(#whiteGlowVert-${uniqueId})`}
              className={loop ? `bar-v2-loop-${uniqueId}` : `bar-v2-once-${uniqueId}`}
            />

            {/* PANEL 06: Horizontal slicing line just below Row 1 */}
            <line 
              x1="328" 
              y1="56" 
              x2="328" 
              y2="56" 
              stroke={guideLineColor} 
              strokeWidth="0.8" 
              className={loop ? `guide-h-loop-${uniqueId}` : `guide-h-once-${uniqueId}`}
            />

            {/* PANEL 07: Horizontal slicing bar that sweeps left to reveal HUB */}
            <rect 
              x="328" 
              y="66" 
              width="10" 
              height="32" 
              fill={isLight ? `url(#blueGlowVert-${uniqueId})` : `url(#whiteGlowVert-${uniqueId})`}
              className={loop ? `bar-h-loop-${uniqueId}` : `bar-h-once-${uniqueId}`}
            />
          </>
        )}

        {/* --- 2. Custom Traced Text Groups --- */}
        {/* Row 1: CREATORS (Bold, Geometric) */}
        <g mask={`url(#${maskCreatorsId})`} style={{ filter: glowFilter, transition: 'filter 0.5s ease' }}>
          {WORD_CREATORS.map((char, index) => {
            const x = 52 + index * 36;
            return (
              <g key={`c-${index}`} transform={`translate(${x}, 14)`}>
                <path 
                  d={LETTER_PATHS[char]} 
                  fill="none" 
                  stroke={textColor} 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ transition: 'stroke 0.5s ease' }}
                />
              </g>
            );
          })}
        </g>

        {/* Row 2: HUB (Smaller, Perfectly Centered at scale 0.75) */}
        <g mask={`url(#${maskHubId})`} style={{ filter: glowFilter, transition: 'filter 0.5s ease' }}>
          {WORD_HUB.map((char, index) => {
            const x = 154 + index * 27;
            return (
              <g key={`h-${index}`} transform={`translate(${x}, 66) scale(0.75)`}>
                <path 
                  d={LETTER_PATHS[char]} 
                  fill="none" 
                  stroke={textColor} 
                  strokeWidth="4.66" // compensate scale for uniform 3.5px visual weight
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ transition: 'stroke 0.5s ease' }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      <style>{`
        /* --- Timing mapping for 2.0s duration --- */

        /* 0.00s - 0.10s (0% - 5%): center line scales/fades in */
        /* 0.10s - 0.35s (5% - 17.5%): splits, left sweeps from 190 to 52 */
        @keyframes guideV1Loop {
          0% { transform: scaleY(0.1); opacity: 0; }
          5% { transform: scaleY(1); opacity: 1; transform: translateX(0); }
          10% { transform: scaleY(1); opacity: 1; transform: translateX(0); }
          17.5% { transform: translateX(-138px); opacity: 1; }
          30% { transform: translateX(-138px); opacity: 1; }
          40%, 100% { transform: translateX(-138px); opacity: 0; }
        }
        @keyframes guideV1Once {
          0% { transform: scaleY(0.1); opacity: 0; }
          5% { transform: scaleY(1); opacity: 1; transform: translateX(0); }
          10% { transform: scaleY(1); opacity: 1; transform: translateX(0); }
          17.5% { transform: translateX(-138px); opacity: 1; }
          30% { transform: translateX(-138px); opacity: 1; }
          40%, 100% { transform: translateX(-138px); opacity: 0; }
        }

        /* 0.10s - 0.60s (5% - 30%): right sweep from 190 to 328 */
        @keyframes guideV2Loop {
          0% { transform: scaleY(0.1); opacity: 0; }
          5% { transform: scaleY(1); opacity: 1; transform: translateX(0); }
          10% { transform: scaleY(1); opacity: 1; transform: translateX(0); }
          17.5% { transform: translateX(0); opacity: 1; }
          30% { transform: translateX(138px); opacity: 1; }
          40%, 100% { transform: translateX(138px); opacity: 0; }
        }
        @keyframes guideV2Once {
          0% { transform: scaleY(0.1); opacity: 0; }
          5% { transform: scaleY(1); opacity: 1; transform: translateX(0); }
          10% { transform: scaleY(1); opacity: 1; transform: translateX(0); }
          17.5% { transform: translateX(0); opacity: 1; }
          30% { transform: translateX(138px); opacity: 1; }
          40%, 100% { transform: translateX(138px); opacity: 0; }
        }

        .guide-v1-loop-${uniqueId} { animation: guideV1Loop 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .guide-v2-loop-${uniqueId} { animation: guideV2Loop 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }

        .guide-v1-once-${uniqueId} { animation: guideV1Once 2s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards; }
        .guide-v2-once-${uniqueId} { animation: guideV2Once 2s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards; }


        /* Slicing Vertical Bars */
        @keyframes barV1Loop {
          0% { transform: translateX(0); opacity: 0; }
          5% { opacity: 0; }
          10% { opacity: 1; transform: translateX(0); }
          17.5% { transform: translateX(-138px); opacity: 1; }
          30% { transform: translateX(-138px); opacity: 1; }
          35%, 100% { transform: translateX(-138px); opacity: 0; }
        }
        @keyframes barV1Once {
          0% { transform: translateX(0); opacity: 0; }
          5% { opacity: 0; }
          10% { opacity: 1; transform: translateX(0); }
          17.5% { transform: translateX(-138px); opacity: 1; }
          30% { transform: translateX(-138px); opacity: 1; }
          35%, 100% { transform: translateX(-138px); opacity: 0; }
        }

        @keyframes barV2Loop {
          0% { transform: translateX(0); opacity: 0; }
          5% { opacity: 0; }
          10% { opacity: 1; transform: translateX(0); }
          17.5% { transform: translateX(0); opacity: 1; }
          30% { transform: translateX(138px); opacity: 1; }
          35%, 100% { transform: translateX(138px); opacity: 0; }
        }
        @keyframes barV2Once {
          0% { transform: translateX(0); opacity: 0; }
          5% { opacity: 0; }
          10% { opacity: 1; transform: translateX(0); }
          17.5% { transform: translateX(0); opacity: 1; }
          30% { transform: translateX(138px); opacity: 1; }
          35%, 100% { transform: translateX(138px); opacity: 0; }
        }

        .bar-v1-loop-${uniqueId} { animation: barV1Loop 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .bar-v2-loop-${uniqueId} { animation: barV2Loop 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }

        .bar-v1-once-${uniqueId} { animation: barV1Once 2s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards; }
        .bar-v2-once-${uniqueId} { animation: barV2Once 2s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards; }


        /* CREATORS Masks */
        @keyframes maskC1Loop {
          0%, 10% { x: 190; width: 0; }
          17.5%, 80% { x: 52; width: 138; }
          90%, 100% { x: 190; width: 0; }
        }
        @keyframes maskC1Once {
          0%, 10% { x: 190; width: 0; }
          17.5%, 100% { x: 52; width: 138; }
        }

        @keyframes maskC2Loop {
          0%, 17.5% { x: 190; width: 0; }
          30%, 80% { x: 190; width: 138; }
          90%, 100% { x: 190; width: 0; }
        }
        @keyframes maskC2Once {
          0%, 17.5% { x: 190; width: 0; }
          30%, 100% { x: 190; width: 138; }
        }

        .mask-c1-loop-${uniqueId} { animation: maskC1Loop 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .mask-c2-loop-${uniqueId} { animation: maskC2Loop 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }

        .mask-c1-once-${uniqueId} { animation: maskC1Once 2s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards; }
        .mask-c2-once-${uniqueId} { animation: maskC2Once 2s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards; }


        /* PANEL 06: Horizontal Slicing Line slides from right to left (0.60s - 0.85s = 30% - 42.5%) */
        @keyframes guideHLoop {
          0%, 30% { x1: 328; x2: 328; opacity: 0; }
          35% { opacity: 1; }
          42.5% { x1: 52; x2: 328; opacity: 1; }
          67.5% { x1: 52; x2: 328; opacity: 1; }
          75%, 100% { x1: 52; x2: 328; opacity: 0; }
        }
        @keyframes guideHOnce {
          0%, 30% { x1: 328; x2: 328; opacity: 0; }
          35% { opacity: 1; }
          42.5% { x1: 52; x2: 328; opacity: 1; }
          67.5% { x1: 52; x2: 328; opacity: 1; }
          75%, 100% { x1: 52; x2: 328; opacity: 0; }
        }

        .guide-h-loop-${uniqueId} { animation: guideHLoop 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .guide-h-once-${uniqueId} { animation: guideHOnce 2s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards; }


        /* PANEL 07: Slicing Horizontal bar sweeps left (0.85s - 1.10s = 42.5% - 55%) */
        @keyframes barHLoop {
          0%, 42.5% { transform: translateX(0); opacity: 0; }
          45% { opacity: 1; }
          55% { transform: translateX(-174px); opacity: 1; }
          62.5%, 100% { transform: translateX(-174px); opacity: 0; }
        }
        @keyframes barHOnce {
          0%, 42.5% { transform: translateX(0); opacity: 0; }
          45% { opacity: 1; }
          55% { transform: translateX(-174px); opacity: 1; }
          62.5%, 100% { transform: translateX(-174px); opacity: 0; }
        }

        .bar-h-loop-${uniqueId} { animation: barHLoop 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .bar-h-once-${uniqueId} { animation: barHOnce 2s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards; }


        /* HUB Mask reveal (reveals from x=154 to x=238) */
        @keyframes maskHLoop {
          0%, 42.5% { width: 0; }
          55%, 80% { width: 84; }
          90%, 100% { width: 0; }
        }
        @keyframes maskHOnce {
          0%, 42.5% { width: 0; }
          55%, 100% { width: 84; }
        }

        .mask-h-loop-${uniqueId} { animation: maskHLoop 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .mask-h-once-${uniqueId} { animation: maskHOnce 2s cubic-bezier(0.16, 1, 0.3, 1) 1 forwards; }
      `}</style>
    </div>
  );
};

export default AnimatedLogo;

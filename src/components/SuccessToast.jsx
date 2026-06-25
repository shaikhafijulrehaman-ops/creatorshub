/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import './SuccessToast.css';

/* ─── Context ─── */
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// Pure deterministic pseudo-random generator to satisfy react-hooks/purity
const pseudoRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

/* ─── Confetti particle component ─── */
const ConfettiParticle = ({ index }) => {
  const angle = (index / 12) * 360;
  const distance = 28 + pseudoRandom(index * 17 + 1) * 18;
  const size = 4 + pseudoRandom(index * 17 + 2) * 4;
  const colors = ['#22C55E', '#4ADE80', '#86EFAC', '#FDE047', '#38BDF8', '#A78BFA', '#FB923C', '#F472B6'];
  const color = colors[index % colors.length];
  const shapes = ['circle', 'square', 'triangle'];
  const shape = shapes[index % shapes.length];
  const delay = index * 25;
  const rotation = pseudoRandom(index * 17 + 3) * 360;

  return (
    <div
      className={`confetti-particle confetti-${shape}`}
      style={{
        '--angle': `${angle}deg`,
        '--distance': `${distance}px`,
        '--size': `${size}px`,
        '--color': color,
        '--delay': `${delay}ms`,
        '--rotation': `${rotation}deg`,
      }}
    />
  );
};

/* ─── Toast card ─── */
const ToastCard = ({ toast, onDone }) => {
  const [phase, setPhase] = useState('enter'); // enter → visible → exit
  const timerRef = useRef(null);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setPhase('visible'));

    // Auto-close after 1.5s
    timerRef.current = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => onDone(toast.id), 280);
    }, 1500);

    return () => clearTimeout(timerRef.current);
  }, [toast.id, onDone]);

  return (
    <div className={`success-toast-overlay ${phase === 'exit' ? 'toast-exit' : ''}`}>
      <div className={`success-toast-card ${phase === 'visible' ? 'toast-enter-active' : ''} ${phase === 'exit' ? 'toast-exit-active' : ''}`}>
        
        {/* Animated success icon with confetti */}
        <div className="toast-icon-container">
          <div className="toast-icon-ring">
            <svg className="toast-checkmark" viewBox="0 0 52 52" width="52" height="52">
              <circle className="toast-checkmark-circle" cx="26" cy="26" r="23" fill="none" />
              <path className="toast-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          {/* Confetti burst */}
          <div className="confetti-container">
            {Array.from({ length: 12 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>
        </div>

        {/* Title */}
        <h3 className="toast-title">{toast.title}</h3>

        {/* Subtitle */}
        <p className="toast-subtitle">{toast.subtitle}</p>

        {/* Redirect indicator */}
        {toast.redirectText && (
          <p className="toast-redirect">{toast.redirectText}</p>
        )}

        {/* Progress bar */}
        <div className="toast-progress-track">
          <div className="toast-progress-fill" />
        </div>
      </div>
    </div>
  );
};

/* ─── Provider ─── */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const callbacksRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    // Fire the onClose callback if any
    if (callbacksRef.current[id]) {
      callbacksRef.current[id]();
      delete callbacksRef.current[id];
    }
  }, []);

  const showSuccessToast = useCallback(({
    title = '✔ Success',
    subtitle = 'Your changes have been saved.',
    redirectText = '',
    onClose = null,
  } = {}) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    if (onClose) callbacksRef.current[id] = onClose;
    setToasts(prev => [...prev, { id, title, subtitle, redirectText }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccessToast }}>
      {children}
      {toasts.map(toast => (
        <ToastCard key={toast.id} toast={toast} onDone={removeToast} />
      ))}
    </ToastContext.Provider>
  );
};

export default ToastProvider;

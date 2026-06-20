import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe, Users, Lock } from 'lucide-react';
import './VisibilityToggle.css';

const OPTIONS = [
  { value: 'Public', Icon: Globe },
  { value: 'Connections Only', Icon: Users },
  { value: 'Private', Icon: Lock }
];

export const VisibilityToggle = ({ value = 'Private', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(true);
  const popoverRef = useRef(null);
  
  const currentOpt = OPTIONS.find(o => o.value === value) || OPTIONS[2];
  const CurrentIcon = currentOpt.Icon;

  // Close when clicking outside (works on desktop/mobile)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      
      // Bounding check to stay fully visible inside screen
      if (popoverRef.current) {
        const rect = popoverRef.current.getBoundingClientRect();
        if (rect.right < 230) {
          // If right boundary of element is less than dropdown width, align left
          setAlignRight(false);
        } else {
          setAlignRight(true);
        }
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="vis-selector-wrapper" ref={popoverRef}>
      {/* Visibility Trigger Row */}
      <div 
        className={`vis-trigger-row ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--glass-border)',
          padding: '10px 14px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Visibility
          </span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CurrentIcon size={14} style={{ color: 'var(--accent-cyan)' }} /> {currentOpt.value}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            color: 'var(--text-muted)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
            transition: 'transform 0.2s ease, color 0.2s ease' 
          }} 
        />
      </div>

      {/* Floating Dropdown attached to clicked button */}
      {isOpen && (
        <div 
          className={alignRight ? 'vis-dropdown-menu vis-dropdown-enter' : 'vis-dropdown-menu vis-dropdown-enter-left'}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [alignRight ? 'right' : 'left']: 0,
            width: '220px',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            fontFamily: 'Rubik, sans-serif'
          }}
          role="listbox"
        >
          {OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            const OptIcon = opt.Icon;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`vis-dropdown-item ${isSelected ? 'selected' : ''}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: isSelected ? 'var(--accent-cyan)' : '#374151',
                  fontWeight: isSelected ? '600' : '400',
                  fontSize: '13px',
                  fontFamily: 'Rubik, sans-serif',
                  transition: 'background 0.15s, color 0.15s',
                  borderRadius: '10px',
                  outline: 'none',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                  if (!isSelected) e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  if (!isSelected) e.currentTarget.style.color = '#374151';
                }}
              >
                <OptIcon size={15} style={{ color: isSelected ? 'var(--accent-cyan)' : '#9CA3AF', flexShrink: 0 }} />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.value}</span>
                {isSelected && <Check size={14} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisibilityToggle;

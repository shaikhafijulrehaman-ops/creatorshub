import { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { Trash2, Ban, AlertTriangle, CheckCircle, HelpCircle, X, Loader2 } from 'lucide-react';

export const ConfirmationModal = () => {
  const { confirmationModal, setConfirmationModal } = useContext(AppContext);
  const [isPending, setIsPending] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const {
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'confirmation', // delete | block | warning | success | confirmation
    isDestructive = false,
    onConfirm,
    resolve
  } = confirmationModal || {};

  const handleCancel = useCallback(() => {
    if (isPending) return;
    if (resolve) resolve(false);
    setConfirmationModal(null);
  }, [isPending, resolve, setConfirmationModal]);

  const handleConfirm = useCallback(async () => {
    if (isPending) return;
    if (onConfirm) {
      try {
        setIsPending(true);
        await onConfirm();
      } catch (err) {
        console.error('Error in confirmation action:', err);
      } finally {
        setIsPending(false);
      }
    }
    if (resolve) resolve(true);
    setConfirmationModal(null);
  }, [isPending, onConfirm, resolve, setConfirmationModal]);

  // Sync visible state with slide-up scale animation
  useEffect(() => {
    if (confirmationModal) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [confirmationModal]);

  // ESC keypress handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && confirmationModal && !isPending) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmationModal, isPending, handleCancel]);

  if (!confirmationModal) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isDestructive && !isPending) {
      handleCancel();
    }
  };

  // Icon mapping
  const renderIcon = () => {
    const iconSize = 36;
    const style = { animation: 'bounceSlow 2s infinite' };
    
    switch (type) {
      case 'delete':
        return <Trash2 size={iconSize} style={style} className="text-red" />;
      case 'block':
        return <Ban size={iconSize} style={style} className="text-red" />;
      case 'warning':
        return <AlertTriangle size={iconSize} style={style} className="text-warning" />;
      case 'success':
        return <CheckCircle size={iconSize} style={style} className="text-success" />;
      default:
        return <HelpCircle size={iconSize} style={style} className="text-gray" />;
    }
  };

  return (
    <div 
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 11, 18, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out'
      }}
    >
      <div 
        className="animate-scale-up"
        style={{
          width: '90%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid #E5E7EB',
          borderRadius: '18px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          fontFamily: 'Rubik, sans-serif',
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.2s ease-in-out',
          position: 'relative'
        }}
      >
        {/* Close button (only if not pending) */}
        {!isPending && (
          <button 
            onClick={handleCancel}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={16} />
          </button>
        )}

        {/* Animated Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: type === 'delete' || type === 'block' ? '#FEF2F2' 
                     : type === 'warning' ? '#FFFBEB' 
                     : type === 'success' ? '#F0FDF4' 
                     : '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          {renderIcon()}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 8px 0',
          lineHeight: '1.2'
        }}>
          {title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: '#4B5563',
          margin: '0 0 24px 0',
          lineHeight: '1.5',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </p>

        {/* Divider line */}
        <div style={{ width: '100%', height: '1px', background: '#F3F4F6', margin: '0 0 16px 0' }} />

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          width: '100%',
          gap: '12px'
        }}>
          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            style={{
              flex: 1,
              height: '40px',
              borderRadius: '8px',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isPending ? 0.6 : 1
            }}
            onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.background = '#F9FAFB'; }}
            onMouseLeave={(e) => { if (!isPending) e.currentTarget.style.background = '#FFFFFF'; }}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            style={{
              flex: 1,
              height: '40px',
              borderRadius: '8px',
              background: '#111827',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isPending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              opacity: isPending ? 0.9 : 1
            }}
            onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { if (!isPending) e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .text-red { color: #EF4444; }
        .text-warning { color: #F59E0B; }
        .text-success { color: #10B981; }
        .text-gray { color: #6B7280; }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;

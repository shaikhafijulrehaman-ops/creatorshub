import { useContext, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useToast } from '../../../components/SuccessToast';
import { X, Send, IndianRupee, Clock, Calendar } from 'lucide-react';
import { useResponsive } from '../../../hooks/useResponsive';
import './ApplicationForm.css';

export const ApplicationForm = ({ project, onClose, onSuccess }) => {
  const { isMobile } = useResponsive();
  const { currentUser, applyToProject } = useContext(AppContext);
  const { showSuccessToast } = useToast();

  const [form, setForm] = useState({
    pricing: '',
    daysToComplete: '',
    availability: 'Available Now',
  });
  const [submitting, setSubmitting] = useState(false);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pricing || !form.daysToComplete) {
      showSuccessToast({ title: 'Missing Information', subtitle: 'Please fill in all required fields.' });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));

    // Serialize availability and delivery days inside pitch
    const pitchJson = JSON.stringify({
      daysToComplete: parseInt(form.daysToComplete, 10) || 7,
      availability: form.availability,
      coverLetter: `${currentUser.fullName} is available for this project.`
    });

    applyToProject(project.id, {
      coverLetter: pitchJson,
      pricing: form.pricing
    });

    showSuccessToast({
      title: 'Application Submitted',
      subtitle: `Your proposal for "${project.title}" has been sent successfully.`,
    });

    setSubmitting(false);
    onSuccess && onSuccess();
    onClose && onClose();
  };

  return (
    <div className="appform-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="appform-modal animate-scale-up" style={{ maxWidth: '420px', padding: isMobile ? '16px' : '24px', background: '#070c17', border: '1px solid rgba(0,217,255,0.15)', borderRadius: isMobile ? '24px 24px 0 0' : '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-white)' }}>Submit Pitch Proposal</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Brief: <strong>{project.title}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Budget */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-gray)' }}>
              <IndianRupee size={13} style={{ color: 'var(--accent-cyan)' }} /> Expected Budget Allocation*
            </label>
            <input
              type="text"
              className="form-input"
              value={form.pricing}
              onChange={e => setField('pricing', e.target.value)}
              placeholder="E.g. ₹15,000"
              style={{ marginTop: '6px' }}
              required
            />
            {project.budget && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>Campaign target budget: {project.budget}</span>
            )}
          </div>

          {/* Delivery */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-gray)' }}>
              <Clock size={13} style={{ color: 'var(--accent-cyan)' }} /> Delivery Timeframe (Days)*
            </label>
            <input
              type="number"
              min="1"
              max="365"
              className="form-input"
              value={form.daysToComplete}
              onChange={e => setField('daysToComplete', e.target.value)}
              placeholder="E.g. 7"
              style={{ marginTop: '6px' }}
              required
            />
          </div>

          {/* Availability */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-gray)' }}>
              <Calendar size={13} style={{ color: 'var(--accent-cyan)' }} /> Workspace Availability*
            </label>
            <select
              className="form-input"
              value={form.availability}
              onChange={e => setField('availability', e.target.value)}
              style={{ background: 'var(--bg-dark)', marginTop: '6px' }}
              required
            >
              {['Available Now', 'Available in 1 Week', 'Available in 2 Weeks', 'Available Next Month', 'Other / Flexible'].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, minHeight: '38px', borderRadius: '10px' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, minHeight: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {submitting ? (
                <span className="biz-saving-spinner" />
              ) : (
                <><Send size={13} /> Send Pitch</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;

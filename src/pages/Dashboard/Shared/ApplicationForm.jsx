import { useContext, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useToast } from '../../../components/SuccessToast';
import { X, Send, Link, FileText, Briefcase, Calendar, IndianRupee, Clock } from 'lucide-react';
import './ApplicationForm.css';

export const ApplicationForm = ({ project, onClose, onSuccess }) => {
  const { currentUser, applyToProject } = useContext(AppContext);
  const { showSuccessToast } = useToast();

  const [form, setForm] = useState({
    coverLetter:   '',
    portfolioUrl:  currentUser?.portfolio?.[0]?.url || '',
    resumeUrl:     '',
    proposal:      '',
    pricing:       '',
    daysToComplete:'',
    availability:  'Available Now',
  });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 2-step form

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coverLetter.trim() || !form.pricing || !form.daysToComplete) {
      showSuccessToast({ title: 'Missing Information', subtitle: 'Please fill in all required fields.' });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));

    applyToProject(project.id, {
      creatorId:     currentUser.id,
      creatorName:   currentUser.fullName,
      coverLetter:   form.coverLetter,
      portfolioUrl:  form.portfolioUrl,
      resumeUrl:     form.resumeUrl,
      proposal:      form.proposal,
      pricing:       form.pricing,
      daysToComplete:parseInt(form.daysToComplete, 10) || 7,
      availability:  form.availability,
      applicationStatus: 'New',
    });

    showSuccessToast({
      title: 'Application Submitted',
      subtitle: `Your proposal for "${project.title}" has been sent. The business will review it shortly.`,
      redirectText: 'Good luck!',
    });

    setSubmitting(false);
    onSuccess && onSuccess();
    onClose && onClose();
  };

  return (
    <div className="appform-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="appform-modal animate-scale-up">

        {/* Header */}
        <div className="appform-header">
          <div>
            <h3 className="appform-title">Submit Application</h3>
            <p className="appform-sub">Applying for: <strong>{project.title}</strong></p>
          </div>
          <button className="appform-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="appform-steps">
          {[1, 2].map(n => (
            <div key={n} className="appform-step-item">
              <div className={`appform-step-dot${step >= n ? ' active' : ''}`}>{n}</div>
              <span className={`appform-step-label${step >= n ? ' active' : ''}`}>
                {n === 1 ? 'Your Pitch' : 'Proposal & Budget'}
              </span>
              {n < 2 && <div className={`appform-step-line${step > n ? ' done' : ''}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="appform-body">

          {step === 1 && (
            <div className="appform-step-content animate-fade-in">
              {/* Cover Letter */}
              <div className="appform-field">
                <label className="form-label appform-label">
                  <Briefcase size={13} /> Cover Letter *
                </label>
                <textarea
                  className="form-input appform-textarea"
                  rows={5}
                  value={form.coverLetter}
                  onChange={e => setField('coverLetter', e.target.value)}
                  placeholder="Introduce yourself. Why are you the perfect fit for this project? Describe your relevant experience and what excites you about this opportunity..."
                  required
                />
                <span className="appform-char">{form.coverLetter.length} / 1000</span>
              </div>

              {/* Proposal */}
              <div className="appform-field">
                <label className="form-label appform-label">
                  <FileText size={13} /> Project Proposal
                </label>
                <textarea
                  className="form-input appform-textarea"
                  rows={3}
                  value={form.proposal}
                  onChange={e => setField('proposal', e.target.value)}
                  placeholder="Describe your approach, methodology, and how you plan to execute this project..."
                />
              </div>

              {/* Portfolio URL */}
              <div className="appform-field">
                <label className="form-label appform-label">
                  <Link size={13} /> Portfolio URL
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={form.portfolioUrl}
                  onChange={e => setField('portfolioUrl', e.target.value)}
                  placeholder="https://your-portfolio.com"
                />
              </div>

              {/* Resume */}
              <div className="appform-field">
                <label className="form-label appform-label">
                  <FileText size={13} /> Resume / CV Link
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={form.resumeUrl}
                  onChange={e => setField('resumeUrl', e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <button
                type="button"
                className="btn-primary appform-next-btn"
                onClick={() => {
                  if (!form.coverLetter.trim()) {
                    showSuccessToast({ title: 'Cover Letter Required', subtitle: 'Please write your pitch before continuing.' });
                    return;
                  }
                  setStep(2);
                }}
              >
                Continue to Proposal
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="appform-step-content animate-fade-in">
              {/* Budget */}
              <div className="appform-field">
                <label className="form-label appform-label">
                  <IndianRupee size={13} /> Expected Budget *
                </label>
                <input
                  className="form-input"
                  value={form.pricing}
                  onChange={e => setField('pricing', e.target.value)}
                  placeholder="e.g. ₹15,000"
                  required
                />
                {project.budget && (
                  <span className="appform-hint">Project budget: {project.budget}</span>
                )}
              </div>

              {/* Delivery */}
              <div className="appform-field">
                <label className="form-label appform-label">
                  <Clock size={13} /> Estimated Delivery (days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  className="form-input"
                  value={form.daysToComplete}
                  onChange={e => setField('daysToComplete', e.target.value)}
                  placeholder="e.g. 14"
                  required
                />
              </div>

              {/* Availability */}
              <div className="appform-field">
                <label className="form-label appform-label">
                  <Calendar size={13} /> Availability
                </label>
                <select
                  className="form-input"
                  value={form.availability}
                  onChange={e => setField('availability', e.target.value)}
                >
                  {['Available Now', 'Available in 1 Week', 'Available in 2 Weeks', 'Available Next Month', 'Other'].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Project summary */}
              <div className="appform-summary">
                <h5>Application Summary</h5>
                <div className="appform-summary-row">
                  <span>Budget</span><strong>{form.pricing || '—'}</strong>
                </div>
                <div className="appform-summary-row">
                  <span>Delivery</span><strong>{form.daysToComplete ? `${form.daysToComplete} days` : '—'}</strong>
                </div>
                <div className="appform-summary-row">
                  <span>Availability</span><strong>{form.availability}</strong>
                </div>
              </div>

              <div className="appform-footer-btns">
                <button type="button" className="btn-secondary appform-back-btn" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn-primary appform-submit-btn" disabled={submitting}>
                  {submitting ? (
                    <span className="biz-saving-spinner" />
                  ) : (
                    <><Send size={14} /> Submit Application</>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;

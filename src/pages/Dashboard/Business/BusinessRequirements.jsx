import { useContext, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useToast } from '../../../components/SuccessToast';
import { Plus, X, MapPin, Clock, IndianRupee, Briefcase, Tag, Users, Calendar, ChevronDown } from 'lucide-react';
import './Business.css';

const STATUS_MAP = {
  Open:   { bg: 'rgba(34,197,94,0.08)', color: '#16a34a', border: 'rgba(34,197,94,0.2)' },
  Closed: { bg: 'rgba(100,116,139,0.08)', color: '#64748b', border: 'rgba(100,116,139,0.2)' },
  Urgent: { bg: 'rgba(239,68,68,0.07)', color: '#dc2626', border: 'rgba(239,68,68,0.2)' },
};

const NEXT_STATUS = { Open: 'Urgent', Urgent: 'Closed', Closed: 'Open' };

const CATEGORIES = [
  'Video Editor', 'Social Media Manager', 'UI Designer', 'Influencer',
  'Photographer', 'Motion Designer', 'Website Development', 'App Development',
  'Copywriter', 'Brand Strategist', 'Content Creator', 'Other',
];

export const BusinessRequirements = () => {
  const { currentUser, projects, createProject, setProjects, applications } = useContext(AppContext);
  const { showSuccessToast } = useToast();

  const businessProjects = projects.filter(p => p.businessId === currentUser.id);

  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const blankForm = { title: '', category: 'Video Editor', description: '', budget: '', deadline: '', location: '', remoteType: 'Remote', skills: '', urgency: 'Open' };
  const [form, setForm] = useState(blankForm);
  const [submitting, setSubmitting] = useState(false);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.budget || !form.deadline || !form.description) {
      showSuccessToast({ title: 'Missing Fields', subtitle: 'Please complete all required fields.' });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 350));
    createProject({
      title: form.title,
      category: form.category,
      description: form.description,
      budget: form.budget,
      deadline: form.deadline,
      location: form.location || 'Global',
      remoteType: form.remoteType,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      status: form.urgency,
      businessName: currentUser.businessName || currentUser.fullName,
    });
    showSuccessToast({ title: 'Requirement Published', subtitle: 'Your requirement is now live on the platform.' });
    setForm(blankForm);
    setShowForm(false);
    setSubmitting(false);
  };

  const cycleStatus = (projId, current) => {
    const next = NEXT_STATUS[current] || 'Open';
    setProjects(prev => prev.map(p => p.id === projId ? { ...p, status: next } : p));
    showSuccessToast({ title: `Status Changed`, subtitle: `Requirement is now marked as ${next}.` });
  };

  return (
    <div className="biz-req-root">

      {/* Header */}
      <div className="biz-req-header">
        <div>
          <h3 className="biz-req-title">Current Hiring Requirements</h3>
          <p className="biz-req-sub">Manage and publish active positions visible on your public profile.</p>
        </div>
        <button
          className="btn-primary"
          style={{ minHeight: '40px', borderRadius: '12px', padding: '0 18px', fontSize: '13px' }}
          onClick={() => setShowForm(v => !v)}
        >
          <Plus size={15} /> {showForm ? 'Cancel' : 'New Requirement'}
        </button>
      </div>

      {/* Inline creation form */}
      {showForm && (
        <div className="glass-panel biz-req-form-wrap animate-scale-up">
          <div className="biz-req-form-header">
            <h4>Publish a Requirement</h4>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="biz-req-form-body">
            <div className="biz-field-row">
              <div className="biz-field">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Video Editor for Product Launch" required />
              </div>
              <div className="biz-field">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setField('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="biz-field">
              <label className="form-label">Description *</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Describe the role, deliverables, and expectations..." required />
            </div>

            <div className="biz-field-row">
              <div className="biz-field">
                <label className="form-label">Budget *</label>
                <input className="form-input" value={form.budget} onChange={e => setField('budget', e.target.value)} placeholder="e.g. ₹25,000" required />
              </div>
              <div className="biz-field">
                <label className="form-label">Deadline *</label>
                <input type="date" className="form-input" value={form.deadline} onChange={e => setField('deadline', e.target.value)} required />
              </div>
              <div className="biz-field">
                <label className="form-label">Work Type</label>
                <select className="form-input" value={form.remoteType} onChange={e => setField('remoteType', e.target.value)}>
                  {['Remote', 'Hybrid', 'Onsite', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="biz-field-row">
              <div className="biz-field">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Mumbai, India" />
              </div>
              <div className="biz-field">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.urgency} onChange={e => setField('urgency', e.target.value)}>
                  {['Open', 'Urgent', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="biz-field">
              <label className="form-label">Required Skills (comma-separated)</label>
              <input className="form-input" value={form.skills} onChange={e => setField('skills', e.target.value)} placeholder="e.g. Premiere Pro, After Effects, DaVinci Resolve" />
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', minHeight: '40px', borderRadius: '10px', padding: '0 20px', fontSize: '13px' }} disabled={submitting}>
              {submitting ? <span className="biz-saving-spinner" /> : 'Publish'}
            </button>
          </form>
        </div>
      )}

      {/* Empty state */}
      {businessProjects.length === 0 && (
        <div className="glass-panel biz-req-empty">
          <Briefcase size={40} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '12px' }} />
          <h4>No requirements posted yet</h4>
          <p>Create your first requirement to start receiving applications from creators.</p>
        </div>
      )}

      {/* Cards grid */}
      {businessProjects.length > 0 && (
        <div className="biz-req-grid">
          {businessProjects.map(proj => {
            const s = STATUS_MAP[proj.status] || STATUS_MAP.Open;
            const isExpanded = expandedId === proj.id;
            const appCount = (applications || []).filter(app => app.project_id === proj.id).length;
            return (
              <div key={proj.id} className="glass-panel biz-req-card">
                {/* Card header */}
                <div className="biz-req-card-top">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="biz-category-badge">{proj.category}</span>
                    <span className="biz-req-work-type">{proj.remoteType || 'Remote'}</span>
                  </div>
                  <button
                    type="button"
                    className="biz-status-badge"
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                    onClick={() => cycleStatus(proj.id, proj.status)}
                    title="Click to cycle status"
                  >
                    {proj.status}
                  </button>
                </div>

                <h4 className="biz-req-card-title">{proj.title}</h4>
                <p className="biz-req-card-desc">{proj.description?.substring(0, 120)}{proj.description?.length > 120 ? '...' : ''}</p>

                {/* Meta */}
                <div className="biz-req-meta">
                  <span><IndianRupee size={12} /> {proj.budget}</span>
                  <span><Calendar size={12} /> {proj.deadline}</span>
                  {proj.location && <span><MapPin size={12} /> {proj.location}</span>}
                  <span><Users size={12} /> {appCount} application{appCount !== 1 ? 's' : ''}</span>
                </div>

                {/* Skills */}
                {proj.skills?.length > 0 && (
                  <div className="biz-skills-row">
                    {proj.skills.slice(0, 5).map(s => (
                      <span key={s} className="biz-skill-chip">{s}</span>
                    ))}
                    {proj.skills.length > 5 && <span className="biz-skill-chip biz-skill-chip--more">+{proj.skills.length - 5}</span>}
                  </div>
                )}

                {/* Expand toggle */}
                <button
                  type="button"
                  className="biz-req-expand-btn"
                  onClick={() => setExpandedId(isExpanded ? null : proj.id)}
                >
                  <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                  {isExpanded ? 'Less' : 'Full details'}
                </button>

                {isExpanded && (
                  <div className="biz-req-expanded animate-fade-in">
                    <p style={{ fontSize: '13px', color: 'var(--text-gray)', lineHeight: '1.6' }}>{proj.description}</p>
                    <div className="biz-field-row" style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Posted: {proj.createdAt || 'Today'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusinessRequirements;

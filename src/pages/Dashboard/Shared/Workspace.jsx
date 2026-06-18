import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import { 
  MessageSquare, Mic, Paperclip, Send, CheckCircle2, 
  Layers, FileDown, UploadCloud, Play, Pause, X, Check
} from 'lucide-react';

const generateAssetId = () => `d-${Date.now()}`;

export const Workspace = ({ projectId, onClose }) => {
  const { projects, currentUser, messages, sendMessage, users } = useContext(AppContext);
  const chatEndRef = useRef(null);

  const [activeTab, setActiveTab] = useState('chat');
  const [chatInput, setChatInput] = useState('');
  
  // Voice recording states
  const [voiceNoteRecording, setVoiceNoteRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // File Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');

  const projectMessages = useMemo(() => messages[projectId] || [], [messages, projectId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectMessages, activeTab]);

  // Voice recording duration timer
  useEffect(() => {
    if (!voiceNoteRecording) return;
    const interval = setInterval(() => {
      setRecordSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [voiceNoteRecording]);

  // Find project and team details
  const project = projects.find(p => p.id === projectId);
  if (!project) return <div>Workspace project not found.</div>;

  const team = project.team;

  const handleSendChat = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(projectId, chatInput, currentUser.id, currentUser.fullName);
    setChatInput('');
  };

  const handleMockVoiceNote = () => {
    if (voiceNoteRecording) {
      setVoiceNoteRecording(false);
      sendMessage(projectId, `🎤 Voice Note (${formatTime(recordSeconds)})`, currentUser.id, currentUser.fullName);
    } else {
      setRecordSeconds(0);
      setVoiceNoteRecording(true);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleUploadDeliverable = (e) => {
    e.preventDefault();
    if (!uploadTitle || !uploadUrl) {
      alert('Please fill out all fields.');
      return;
    }
    
    project.team.deliverables.push({
      id: generateAssetId(),
      title: uploadTitle,
      type: 'Reference Link',
      status: 'Uploaded',
      url: uploadUrl
    });

    sendMessage(projectId, `📁 Uploaded deliverable: "${uploadTitle}"`, 'system', 'Creators Hub AI');
    
    setUploadTitle('');
    setUploadUrl('');
    setShowUploadModal(false);
  };

  const releasePayment = (payId) => {
    const payment = project.team.payments.find(p => p.id === payId);
    if (payment) {
      payment.status = 'Paid';
      sendMessage(projectId, `💸 Escrow Payment Released: "${payment.title}" (${payment.amount})`, 'system', 'Creators Hub AI');
    }
  };

  const toggleMilestone = (mileId) => {
    const milestone = project.team.milestones.find(m => m.id === mileId);
    if (milestone) {
      milestone.status = milestone.status === 'Completed' ? 'In Progress' : 'Completed';
    }
  };

  const getMemberProfile = (roleKey) => {
    if (!team || !team.members) return null;
    const userId = team.members[roleKey];
    return users.find(u => u.id === userId);
  };

  return (
    <div className="glass-panel workspace-container animate-scale-up" style={{ 
      padding: '28px', 
      minHeight: '85vh', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)'
    }}>
      
      {/* Workspace Header (WhatsApp Style) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }} className="workspace-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'var(--accent-cyan-glow)', 
              border: 'none', 
              color: 'var(--accent-cyan)', 
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '18px' 
            }}
          >
            ←
          </button>
          <div>
            <span className="badge-premium" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Workspace Cell</span>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-white)', marginTop: '2px', lineHeight: '1.2' }}>{project.title}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-gray)', marginTop: '2px' }}>Client: {project.businessName}</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }} className="workspace-header-budget">
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{project.budget}</span>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>Active Escrow</p>
        </div>
      </div>

      {/* Active Team Row */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 0', borderBottom: '1px solid var(--glass-border)', scrollbarWidth: 'none' }} className="team-avatars-scroll">
        {(() => {
          const owner = users.find(u => u.id === project.businessId);
          if (!owner) return null;
          return (
            <div key="owner" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', background: 'rgba(6,182,212,0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(6,182,212,0.25)', whiteSpace: 'nowrap' }}>
              <img src={owner.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
              <span>{owner.fullName.split(' ')[0]} (Client)</span>
            </div>
          );
        })()}

        {team && team.members && Object.keys(team.members).map(roleKey => {
          const member = getMemberProfile(roleKey);
          if (!member) return null;
          return (
            <div key={roleKey} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', background: 'rgba(0, 217, 255, 0.05)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(0, 217, 255, 0.15)', whiteSpace: 'nowrap' }}>
              <img src={member.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80'} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
              <span>{member.fullName.split(' ')[0]} ({roleKey})</span>
            </div>
          );
        })}
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', gap: '4px' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: activeTab === t.id ? 'var(--bg-dark)' : 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--text-white)' : 'var(--text-gray)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minHeight: '44px'
            }}
          >
            {t.icon} <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: CHAT (WhatsApp style) */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '450px' }} className="whatsapp-chat-layout">
          
          {/* Scrollable messages history container */}
          <div className="messages-history-scroll" style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '6px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {projectMessages.map((msg, idx) => {
              const isSystem = msg.senderId === 'system';
              const isMe = msg.senderId === currentUser.id;

              if (isSystem) {
                return (
                  <div key={idx} style={{ textAlign: 'center', margin: '8px 0' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(6,182,212,0.08)', color: 'var(--accent-cyan)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(6,182,212,0.12)' }}>
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isVoice = msg.text.includes('Voice Note');

              return (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', paddingLeft: isMe ? '0' : '4px' }}>
                    {msg.senderName}
                  </span>
                  
                  <div 
                    className={isMe ? 'message-bubble-me' : 'message-bubble-other'}
                    style={{
                      padding: '12px 16px',
                      borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: isMe ? 'var(--grad-primary)' : 'var(--bg-dark)',
                      border: isMe ? 'none' : '1px solid var(--glass-border)',
                      color: isMe ? '#FFFFFF' : 'var(--text-white)',
                      fontSize: '13.5px',
                      lineHeight: '1.4',
                      boxShadow: isMe ? '0 4px 12px rgba(91, 174, 155, 0.2)' : 'none'
                    }}
                  >
                    {isVoice ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                          onClick={() => setPlayingAudioId(playingAudioId === idx ? null : idx)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: isMe ? 'rgba(255, 255, 255, 0.25)' : 'var(--accent-cyan-bright)',
                            border: 'none',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          {playingAudioId === idx ? <Pause size={12} fill="#fff" /> : <Play size={12} fill="#fff" style={{ marginLeft: '2px' }} />}
                        </button>
                        <div>
                          <span style={{ fontWeight: '600', display: 'block', fontSize: '13px' }}>Voice Memo</span>
                          <span style={{ fontSize: '11px', opacity: 0.8 }}>{msg.text.split(' ')[2] || '0:04'}</span>
                        </div>
                        {playingAudioId === idx && (
                          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '16px', marginLeft: '6px' }}>
                            {[2, 4, 1, 3, 2, 4, 1].map((h, i) => (
                              <div key={i} style={{ width: '2px', height: `${h * 4}px`, background: isMe ? '#FFFFFF' : 'var(--accent-cyan)', animation: 'voice-pulse 1s infinite alternate' }} />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom input bar (WhatsApp Style) */}
          <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }} className="whatsapp-input-bar">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              style={{
                background: 'var(--bg-dark)',
                border: '1px solid var(--glass-border)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                cursor: 'pointer'
              }}
            >
              <Paperclip size={18} />
            </button>

            {/* Pulsing Recording Visualizer */}
            {voiceNoteRecording ? (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 18px',
                minHeight: '46px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '24px',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: '600'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'voice-pulse 0.8s infinite alternate' }} />
                  <span>Recording Voice Note...</span>
                </div>
                <span>{formatTime(recordSeconds)}</span>
              </div>
            ) : (
              <input
                type="text"
                className="form-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message..."
                style={{ flex: 1, borderRadius: '24px', minHeight: '46px' }}
              />
            )}

            {/* Voice Notes Recorder / Stop Button */}
            <button
              type="button"
              onClick={handleMockVoiceNote}
              style={{
                background: voiceNoteRecording ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-dark)',
                border: voiceNoteRecording ? '1px solid #ef4444' : '1px solid var(--glass-border)',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: voiceNoteRecording ? '#ef4444' : 'var(--text-gray)',
                cursor: 'pointer'
              }}
            >
              <Mic size={18} />
            </button>

            {/* Send Button */}
            {!voiceNoteRecording && (
              <button
                type="submit"
                className="btn-primary"
                style={{ 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  padding: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #00C2FF 0%, #06B6D4 100%)',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
                  minHeight: '46px'
                }}
              >
                <Send size={16} style={{ marginLeft: '2px' }} />
              </button>
            )}
          </form>
        </div>
      )}

      {/* TAB CONTENT: DELIVERABLES */}
      {activeTab === 'deliverables' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Assets Repository</h3>
            {currentUser.role !== 'Business Holder' && (
              <button 
                onClick={() => setShowUploadModal(true)} 
                className="btn-outline-cyan"
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '11px', minHeight: '36px' }}
              >
                <UploadCloud size={14} /> Reference Asset
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!team.deliverables || team.deliverables.length === 0) ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                No assets uploaded yet.
              </div>
            ) : (
              team.deliverables.map(del => (
                <div key={del.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ padding: '8px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)', borderRadius: '8px' }}>
                      <FileDown size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{del.title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status: {del.status}</p>
                    </div>
                  </div>
                  <a href={del.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '11px', minHeight: '36px' }}>
                    View Asset Link
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MILESTONES & ESCROW */}
      {activeTab === 'milestones' && (
        <div className="workspace-milestones-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Milestones */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Roadmap & Sprints</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {team.milestones.map((mil, idx) => (
                <div key={mil.id} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                  {idx < team.milestones.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '11px', top: '24px', width: '2px', height: 'calc(100% + 8px)',
                      background: mil.status === 'Completed' ? 'var(--accent-cyan-bright)' : 'var(--glass-border)'
                    }} />
                  )}

                  <div 
                    onClick={() => currentUser.role === 'Business Holder' && toggleMilestone(mil.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: mil.status === 'Completed' ? 'var(--grad-primary)' : 'var(--bg-dark)',
                      border: '1.5px solid var(--glass-border)',
                      borderColor: mil.status === 'Completed' ? 'var(--accent-cyan-bright)' : 'var(--glass-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: currentUser.role === 'Business Holder' ? 'pointer' : 'default',
                      zIndex: 2
                    }}
                  >
                    {mil.status === 'Completed' && <Check size={12} strokeWidth={3} />}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: mil.status === 'Completed' ? 'var(--text-white)' : 'var(--text-gray-light)' }}>
                      {mil.title}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Due: {mil.deadline} • {mil.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payments */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Escrow Settlements</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {team.payments.map(pay => (
                <div key={pay.id} className="glass-panel" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{pay.title}</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)' }}>{pay.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: pay.status === 'Paid' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.08)',
                      border: pay.status === 'Paid' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(234, 179, 8, 0.2)',
                      color: pay.status === 'Paid' ? '#22c55e' : '#eab308'
                    }}>
                      {pay.status === 'Paid' ? 'Escrow Released' : 'Held in Escrow'}
                    </span>

                    {currentUser.role === 'Business Holder' && pay.status === 'Pending' && (
                      <button 
                        onClick={() => releasePayment(pay.id)}
                        className="btn-primary" 
                        style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', minHeight: '32px' }}
                      >
                        Release
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DELIVERABLE UPLOAD MODAL */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9000
        }}>
          <div className="glass-panel animate-scale-up" style={{ padding: '32px', width: '90%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px' }}>Deliver Asset Ref</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadDeliverable} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Asset Title</label>
                <input type="text" className="form-input" placeholder="e.g. Sourdough Video Mock draft" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Asset Link (Figma/Drive/Vimeo)</label>
                <input type="url" className="form-input" placeholder="https://vimeo.com/..." value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Register Asset Link
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes voice-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 1; }
        }

        @media (max-width: 768px) {
          .workspace-container {
            padding: 16px 12px !important;
            margin: 0px !important;
            min-height: 98vh !important;
            border-radius: 0 !important;
          }
          .workspace-header-budget {
            display: none !important;
          }
          .workspace-milestones-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </div>
  );
};
export default Workspace;

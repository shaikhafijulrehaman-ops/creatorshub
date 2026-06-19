import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../../context/AppContext';
import { 
  Send, Paperclip, Smile, Image as ImageIcon, FileText, Mic, 
  Volume2, Square, User, X, ChevronLeft, Check, CheckCheck, 
  Search, ShieldAlert, Award, Star, MapPin, Globe, ExternalLink,
  MoreVertical, Ban, Eye
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';

export const MessagingCenter = () => {
  const { 
    currentUser, users, conversations, activeConversationId, 
    setActiveConversationId, p2pMessages, sendP2PMessage, 
    markMessagesAsSeen, presenceList
  } = useContext(AppContext);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  
  // Input and Chat States
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTypingUsers, setActiveTypingUsers] = useState({});

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Profile Drawer State
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get active conversation and messages
  const activeConv = conversations.find(c => c.id === activeConversationId);
  const otherUser = activeConv ? users.find(u => u.id === activeConv.otherUserId) : null;
  const messagesList = activeConversationId ? (p2pMessages[activeConversationId] || []) : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesList]);

  // Mark messages as seen when chat opens or new messages arrive
  useEffect(() => {
    if (activeConversationId) {
      markMessagesAsSeen(activeConversationId);
    }
  }, [activeConversationId, messagesList.length]);

  // Handle Typing Indicator broadcasts via Supabase Broadcast
  useEffect(() => {
    if (!activeConversationId || !currentUser) return;

    const channel = supabase.channel(`typing:${activeConversationId}`);
    
    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setActiveTypingUsers(prev => ({
          ...prev,
          [payload.userId]: payload.isTyping
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, currentUser]);

  // Broadcast typing status when typing
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (!isTyping && activeConversationId) {
      setIsTyping(true);
      const channel = supabase.channel(`typing:${activeConversationId}`);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: currentUser.id, isTyping: true }
          });
        }
      });

      // Reset typing status after 2 seconds of inactivity
      setTimeout(() => {
        setIsTyping(false);
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: currentUser.id, isTyping: false }
        });
      }, 2000);
    }
  };

  // Send message
  const handleSend = () => {
    if (!inputText.trim() || !activeConversationId) return;
    sendP2PMessage(activeConversationId, inputText, null, 'text');
    setInputText('');
    setShowEmojiPicker(false);
  };

  // Keyboard controls
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Add Emojis
  const addEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
  };

  // Attachment uploads
  const triggerAttachment = (type) => {
    setShowAttachmentMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('accept', type === 'image' ? 'image/*' : (type === 'video' ? 'video/*' : '*/*'));
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;

    let messageType = 'document';
    if (file.type.startsWith('image/')) messageType = 'image';
    else if (file.type.startsWith('video/')) messageType = 'video';

    // Optimistic / Local url preview
    const localUrl = URL.createObjectURL(file);
    sendP2PMessage(activeConversationId, `Sent attachment: ${file.name}`, localUrl, messageType);

    // Supabase storage upload (Optional fallback if configured)
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `attachments/${fileName}`;

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);
        
        // We can optionally resync or update DB record with publicUrl
        console.log('Public upload url generated:', publicUrl);
      }
    } catch (err) {
      console.warn('Storage bucket not configured, falling back to local file link:', err.message);
    }
  };

  // Microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        sendP2PMessage(activeConversationId, 'Voice Note', audioUrl, 'voice');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or unavailable. Simulating dynamic voice note...');
      // Simulated/Mock voice note fallback
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      setTimeout(() => {
        stopRecording(true);
      }, 3000);
    }
  };

  const stopRecording = (isMock = false) => {
    clearInterval(recordingTimer.current);
    setIsRecording(false);
    
    if (isMock) {
      sendP2PMessage(activeConversationId, 'Voice Note (Simulated)', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'voice');
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const member = users.find(u => u.id === c.otherUserId);
    if (!member) return false;
    const nameMatch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const bizMatch = member.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return nameMatch || roleMatch || bizMatch;
  });

  // Sort conversations by latest message timestamp
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aMsgs = p2pMessages[a.id] || [];
    const bMsgs = p2pMessages[b.id] || [];
    const aTime = aMsgs.length > 0 ? new Date(aMsgs[aMsgs.length - 1].timestamp) : new Date(0);
    const bTime = bMsgs.length > 0 ? new Date(bMsgs[bMsgs.length - 1].timestamp) : new Date(0);
    return bTime - aTime;
  });

  // Format timestamp helper
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Group messages by date to render date separators
  const renderMessageStream = () => {
    let lastDateStr = '';
    return messagesList.map((msg, index) => {
      const messageDateStr = new Date(msg.timestamp).toDateString();
      const showSeparator = messageDateStr !== lastDateStr;
      lastDateStr = messageDateStr;

      const isOwn = msg.senderId === currentUser.id;
      const isSeen = msg.seen;

      return (
        <div key={msg.id || index} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {showSeparator && (
            <div style={{ alignSelf: 'center', margin: '20px 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {formatDateSeparator(msg.timestamp)}
            </div>
          )}

          <div style={{ 
            alignSelf: isOwn ? 'flex-end' : 'flex-start',
            maxWidth: '70%',
            margin: '4px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwn ? 'flex-end' : 'flex-start'
          }}>
            {/* Render distinct attachment or text bubble */}
            <div style={{
              background: isOwn ? 'var(--chat-outgoing-bg)' : 'var(--chat-incoming-bg)',
              color: isOwn ? 'var(--chat-outgoing-text)' : 'var(--chat-incoming-text)',
              padding: msg.messageType === 'text' ? '12px 16px' : '6px',
              borderRadius: '20px',
              borderTopRightRadius: isOwn ? '4px' : '20px',
              borderTopLeftRadius: isOwn ? '20px' : '4px',
              border: isOwn ? 'none' : '1px solid var(--glass-border)',
              fontSize: '13.5px',
              lineHeight: '1.5',
              wordBreak: 'break-word',
              boxShadow: 'none'
            }}>
              {msg.messageType === 'text' && <p style={{ margin: 0 }}>{msg.text}</p>}
              
              {msg.messageType === 'image' && (
                <img 
                  src={msg.attachmentUrl} 
                  alt="Attachment" 
                  style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '14px', cursor: 'pointer', objectFit: 'cover' }} 
                  onClick={() => window.open(msg.attachmentUrl)}
                />
              )}

              {msg.messageType === 'video' && (
                <video 
                  src={msg.attachmentUrl} 
                  controls 
                  style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '14px' }} 
                />
              )}

              {msg.messageType === 'document' && (
                <a 
                  href={msg.attachmentUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', color: isOwn ? 'var(--chat-outgoing-text)' : 'var(--accent-cyan)', textDecoration: 'none', fontWeight: '700' }}
                >
                  <FileText size={18} />
                  <span>Download Attachment</span>
                </a>
              )}

              {msg.messageType === 'voice' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', minWidth: '220px' }}>
                  <Volume2 size={16} style={{ color: isOwn ? 'var(--chat-outgoing-text)' : 'var(--accent-cyan)' }} />
                  <audio src={msg.attachmentUrl} controls style={{ height: '32px', width: '100%' }} />
                </div>
              )}
            </div>

            {/* Time + Seen receipts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>{formatTime(msg.timestamp)}</span>
              {isOwn && (
                isSeen ? (
                  <CheckCheck size={12} style={{ color: 'var(--accent-cyan)' }} />
                ) : (
                  <Check size={12} />
                )
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 120px)', 
      background: 'rgba(255,255,255,0.01)', 
      border: '1px solid var(--glass-border)',
      borderRadius: '24px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />

      {/* ==================== LEFT PANEL: CONVERSATION LIST ==================== */}
      <aside style={{
        width: '320px',
        borderRight: '1px solid var(--glass-border)',
        display: (activeConversationId && window.innerWidth < 992) ? 'none' : 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.02)',
        flexShrink: 0
      }} id="chat-sidebar">
        
        {/* Search Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search chat..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input" 
              style={{ height: '38px', minHeight: '38px', paddingLeft: '38px', fontSize: '13px', borderRadius: '12px' }}
            />
          </div>
        </div>

        {/* List scroll panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {sortedConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <User size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '13.5px', margin: 0 }}>Start a conversation with a Business, Freelancer or Influencer.</p>
            </div>
          ) : (
            sortedConversations.map(c => {
              const member = users.find(u => u.id === c.otherUserId);
              if (!member) return null;
              
              const isSelected = c.id === activeConversationId;
              const isOnline = presenceList[member.id]?.isOnline;
              const msgs = p2pMessages[c.id] || [];
              const lastMsg = msgs[msgs.length - 1];
              
              // Unread messages count
              const unreadCount = msgs.filter(m => m.senderId !== currentUser.id && !m.seen).length;

              return (
                <div 
                  key={c.id} 
                  onClick={() => {
                    setActiveConversationId(c.id);
                    setProfileDrawerOpen(false);
                  }}
                  className="glass-panel-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--accent-cyan-glow)' : 'transparent',
                    border: isSelected ? '1px solid rgba(6,182,212,0.15)' : '1px solid transparent',
                    marginBottom: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Photo container with online indicator */}
                  <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                    <img 
                      src={member.profilePhoto || member.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                      alt={member.fullName} 
                      style={{ width: '40px', height: '40px', borderRadius: member.role === 'Business Holder' ? '8px' : '50%', objectFit: 'cover' }}
                    />
                    {isOnline && (
                      <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', border: '2px solid var(--bg-deep)' }} />
                    )}
                  </div>

                  {/* Text details */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-white)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{member.fullName}</strong>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
                    </div>
                    
                    <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'block', marginTop: '1px' }}>{member.businessName || member.role}</span>
                    
                    <p style={{ 
                      fontSize: '12px', 
                      color: unreadCount > 0 ? 'var(--text-white)' : 'var(--text-muted)', 
                      margin: '4px 0 0 0', 
                      whiteSpace: 'nowrap', 
                      textOverflow: 'ellipsis', 
                      overflow: 'hidden',
                      fontWeight: unreadCount > 0 ? '700' : '400'
                    }}>
                      {lastMsg ? lastMsg.text : 'No messages yet.'}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {unreadCount > 0 && (
                    <span style={{ background: 'var(--accent-cyan)', color: '#000', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ==================== RIGHT PANEL: ACTIVE CHAT ==================== */}
      <section style={{
        flex: 1,
        display: (!activeConversationId && window.innerWidth < 992) ? 'none' : 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {activeConversationId && otherUser ? (
          <>
            {/* Header metadata */}
            <header style={{
              height: '68px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              background: 'rgba(255,255,255,0.01)',
              backdropFilter: 'blur(10px)',
              zIndex: 10
            }}>
              
              {/* Left Profile segment */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                {/* Mobile Back Button */}
                <button 
                  onClick={() => setActiveConversationId(null)}
                  style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', paddingRight: '8px' }}
                  id="chat-back-btn"
                >
                  <ChevronLeft size={20} />
                </button>

                <div 
                  style={{ position: 'relative', width: '38px', height: '38px', cursor: 'pointer' }}
                  onClick={() => setProfileDrawerOpen(!profileDrawerOpen)}
                >
                  <img 
                    src={otherUser.profilePhoto || otherUser.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                    alt={otherUser.fullName} 
                    style={{ width: '38px', height: '38px', borderRadius: otherUser.role === 'Business Holder' ? '8px' : '50%', objectFit: 'cover' }}
                  />
                  {presenceList[otherUser.id]?.isOnline && (
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: '9px', height: '9px', background: '#22c55e', borderRadius: '50%', border: '2.5px solid var(--bg-deep)' }} />
                  )}
                </div>

                <div style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '14.5px', color: 'var(--text-white)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{otherUser.fullName}</strong>
                    {otherUser.verificationStatus && otherUser.verificationStatus !== 'Basic Verified' && (
                      <Award size={13} style={{ color: 'var(--accent-cyan)' }} />
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                    {presenceList[otherUser.id]?.isOnline ? 'Online' : 'Offline'} • {otherUser.businessName || otherUser.role}
                  </span>
                </div>
              </div>

              {/* Header actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={() => setProfileDrawerOpen(!profileDrawerOpen)}
                  className="btn-outline-cyan"
                  style={{ height: '36px', minHeight: '36px', borderRadius: '10px', padding: '0 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={14} /> View Profile
                </button>
              </div>
            </header>

            {/* Message Stream */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messagesList.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.6 }}>
                  <Smile size={36} style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>Start your conversation.</p>
                </div>
              ) : (
                renderMessageStream()
              )}

              {/* Typing indicators */}
              {activeTypingUsers[otherUser.id] && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 10px', width: 'fit-content', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{otherUser.fullName} is typing</span>
                  <div className="typing-dots" style={{ display: 'flex', gap: '3px' }}>
                    <span className="dot" style={{ width: '4px', height: '4px', background: 'var(--accent-cyan)', borderRadius: '50%', animation: 'bounce 1.4s infinite' }} />
                    <span className="dot" style={{ width: '4px', height: '4px', background: 'var(--accent-cyan)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s' }} style={{ width: '4px', height: '4px', background: 'var(--accent-cyan)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s' }} />
                    <span className="dot" style={{ width: '4px', height: '4px', background: 'var(--accent-cyan)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s' }} style={{ width: '4px', height: '4px', background: 'var(--accent-cyan)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom input area */}
            <div style={{
              borderTop: '1px solid var(--glass-border)',
              padding: '16px 20px',
              background: 'var(--bg-dark)',
              position: 'relative'
            }}>
              
              {/* Recording panel overlay */}
              {isRecording ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 16px', borderRadius: '14px', color: '#ef4444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="rec-pulse" style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                    <span style={{ fontSize: '13.5px', fontWeight: '700' }}>Recording Voice Note: {recordingDuration}s</span>
                  </div>
                  <button onClick={() => stopRecording()} className="btn-primary" style={{ padding: '0 14px', minHeight: '32px', borderRadius: '8px', background: '#ef4444', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Square size={12} /> Stop & Send
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                  
                  {/* Left accessories */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                    <button 
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-gray)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <Paperclip size={16} />
                    </button>
                    {showAttachmentMenu && (
                      <div className="glass-panel" style={{ position: 'absolute', bottom: '46px', left: 0, width: '180px', display: 'flex', flexDirection: 'column', padding: '6px', gap: '2px', borderRadius: '12px', zIndex: 100 }}>
                        {[
                          { id: 'image', label: 'Image Upload', icon: <ImageIcon size={14} /> },
                          { id: 'document', label: 'Document File', icon: <FileText size={14} /> }
                        ].map(act => (
                          <button 
                            key={act.id} 
                            onClick={() => triggerAttachment(act.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: 'var(--text-white)', padding: '8px 10px', fontSize: '12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                            className="glass-panel-hover"
                          >
                            {act.icon} <span>{act.label}</span>
                          </button>
                        ))}
                        <button 
                          onClick={startRecording}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: 'var(--accent-cyan)', padding: '8px 10px', fontSize: '12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                          className="glass-panel-hover"
                        >
                          <Mic size={14} /> <span>Voice Recording</span>
                        </button>
                      </div>
                    )}

                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-gray)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <Smile size={16} />
                    </button>
                    {showEmojiPicker && (
                      <div className="glass-panel" style={{ position: 'absolute', bottom: '46px', left: '42px', width: '220px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', padding: '12px', borderRadius: '16px', zIndex: 100 }}>
                        {['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬'].map(em => (
                          <span key={em} onClick={() => addEmoji(em)} style={{ fontSize: '18px', cursor: 'pointer', textAlign: 'center', display: 'block', transition: 'transform 0.1s' }} className="emoji-hover">{em}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TextInput */}
                  <textarea 
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="form-input" 
                    placeholder="Message..." 
                    rows={1}
                    style={{ flex: 1, height: '40px', minHeight: '40px', resize: 'none', padding: '10px 16px', fontSize: '13.5px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)' }}
                  />

                  {/* Send Button */}
                  <button 
                    onClick={handleSend}
                    className="btn-primary" 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    <Send size={15} style={{ marginLeft: '2px' }} />
                  </button>

                </div>
              )}

            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '40px' }}>
            <User size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-white)' }}>No Conversation Selected</h4>
            <p style={{ fontSize: '13.5px', marginTop: '6px', textAlign: 'center', maxWidth: '300px' }}>Select an active thread or open a partner profile to begin chatting.</p>
          </div>
        )}

        {/* ==================== RIGHT SIDE SLIDE-OUT DRAWER ==================== */}
        {profileDrawerOpen && otherUser && (
          <aside className="glass-panel animate-scale-up" style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '320px',
            height: '100%',
            borderLeft: '1px solid var(--glass-border)',
            background: 'var(--bg-dark)',
            backdropFilter: 'blur(16px)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '24px 20px'
          }}>
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>Creator Details</h4>
              <button onClick={() => setProfileDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Profile Avatar + Identity */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
              <img 
                src={otherUser.profilePhoto || otherUser.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'} 
                alt={otherUser.fullName} 
                style={{ width: '80px', height: '80px', borderRadius: otherUser.role === 'Business Holder' ? '12px' : '50%', objectFit: 'cover', border: '2.5px solid var(--accent-cyan)' }}
              />
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-white)', marginTop: '12px' }}>{otherUser.fullName}</h4>
              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>{otherUser.role}</span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginTop: '6px' }}>
                <MapPin size={11} /> {otherUser.location || 'HQ Location'}
              </p>
            </div>

            {/* About bio */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginBottom: '16px' }}>
              <h5 style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '6px' }}>Bio</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-gray)', lineHeight: '1.5', margin: 0 }}>
                {otherUser.bio || otherUser.description || 'No summary bio provided.'}
              </p>
            </div>

            {/* Stats ratings */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rating</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                  <Star size={12} fill="#eab308" stroke="#eab308" />
                  <strong style={{ fontSize: '13px', color: 'var(--text-white)' }}>{otherUser.rating?.toFixed(1) || '5.0'}</strong>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Portfolio projects</span>
                <strong style={{ fontSize: '13px', color: 'var(--text-white)', display: 'block', marginTop: '3px' }}>{otherUser.portfolio?.length || '0'}</strong>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
              <button onClick={() => alert(`Hiring request sent to ${otherUser.fullName}!`)} className="btn-primary" style={{ width: '100%', minHeight: '38px', borderRadius: '10px', fontSize: '12px' }}>
                Hire Creator
              </button>
              
              <button 
                onClick={() => {
                  alert(`User ${otherUser.fullName} has been blocked.`);
                  setProfileDrawerOpen(false);
                  setActiveConversationId(null);
                }} 
                className="btn-outline-cyan" 
                style={{ width: '100%', minHeight: '38px', borderRadius: '10px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.02)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
              >
                < Ban size={14} /> Block User
              </button>

              <button 
                onClick={() => alert(`User ${otherUser.fullName} has been reported to support.`)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer', textAlign: 'center' }}
              >
                Report Profile
              </button>
            </div>

          </aside>
        )}

      </section>

      {/* Styled Animations CSS */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .emoji-hover:hover {
          transform: scale(1.25);
        }
        @media (max-width: 992px) {
          #chat-back-btn {
            display: block !important;
          }
        }
      `}</style>

    </div>
  );
};

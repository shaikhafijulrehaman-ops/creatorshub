import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../../../context/AppContext';
import { 
  Send, Paperclip, Smile, Image as ImageIcon, FileText, Mic, 
  Volume2, Square, User, X, ChevronLeft, Check, CheckCheck, 
  Search, ShieldAlert, Award, Star, MapPin, Globe, ExternalLink,
  MoreVertical, Ban, Eye, Phone, Video, Plus, Trash2
} from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { useToast } from '../../../components/SuccessToast';
import { useResponsive } from '../../../hooks/useResponsive';

export const MessagingCenter = ({ onOpenProfile }) => {
  const { 
    currentUser, users, conversations, activeConversationId, 
    setActiveConversationId, p2pMessages, sendP2PMessage, 
    markMessagesAsSeen, presenceList, getConnections, startConversation,
    markMessageNotificationsAsRead, blockUser, deleteConversation, isBlockedRelation,
    showConfirmation
  } = useContext(AppContext);
  const { showSuccessToast } = useToast();
  const { isMobile, isDesktop } = useResponsive();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  
  // Input and Chat States
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTypingUsers, setActiveTypingUsers] = useState({});

  // Refs for click outside closures
  const emojiContainerRef = useRef(null);
  const attachmentContainerRef = useRef(null);

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
  const actionsDropdownRef = useRef(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  // Get active conversation and messages
  const activeConv = conversations.find(c => c.id === activeConversationId);
  const otherUser = activeConv ? users.find(u => u.id === activeConv.otherUserId) : null;
  const messagesList = activeConversationId ? (p2pMessages[activeConversationId] || []) : [];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesList]);

  // Close emoji picker or attachments menu when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (showEmojiPicker && emojiContainerRef.current && !emojiContainerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (showAttachmentMenu && attachmentContainerRef.current && !attachmentContainerRef.current.contains(e.target)) {
        setShowAttachmentMenu(false);
      }
      if (showActionsDropdown && actionsDropdownRef.current && !actionsDropdownRef.current.contains(e.target)) {
        setShowActionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showEmojiPicker, showAttachmentMenu, showActionsDropdown]);

  // Mark messages as seen when chat opens or new messages arrive
  useEffect(() => {
    if (activeConversationId) {
      markMessagesAsSeen(activeConversationId);
      if (markMessageNotificationsAsRead) {
        markMessageNotificationsAsRead(activeConversationId);
      }
    }
  }, [activeConversationId, messagesList.length, markMessageNotificationsAsRead]);

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
      showSuccessToast({ title: '⚠ Microphone Unavailable', subtitle: 'Simulating dynamic voice note...' });
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

  // Filter all users globally for the New Chat modal
  const filteredConnections = users.filter(u => {
    if (u.id === currentUser.id) return false;
    if (isBlockedRelation && isBlockedRelation(u.id)) return false;
    const term = newChatSearch.toLowerCase();
    const nameMatch = u.fullName.toLowerCase().includes(term);
    const userMatch = u.username?.toLowerCase().includes(term) || false;
    const bizMatch  = u.businessName?.toLowerCase().includes(term) || false;
    const roleMatch = u.role?.toLowerCase().includes(term) || false;
    const locMatch  = u.location?.toLowerCase().includes(term) || false;
    return nameMatch || userMatch || bizMatch || roleMatch || locMatch;
  });

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const member = users.find(u => u.id === c.otherUserId);
    if (!member) return false;
    if (isBlockedRelation && isBlockedRelation(member.id)) return false;
    
    const msgs = p2pMessages[c.id] || [];
    const hasMessages = msgs.length > 0 || c.id === activeConversationId;
    if (!hasMessages) return false;

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

  const renderMessageStream = () => {
    let lastDateStr = '';
    return messagesList.map((msg, index) => {
      const messageDateStr = new Date(msg.timestamp).toDateString();
      const showSeparator = messageDateStr !== lastDateStr;
      lastDateStr = messageDateStr;

      const isOwn = msg.senderId === currentUser.id;
      const isSeen = msg.seen;

      if (!isDesktop) {
        // Redesigned Mobile Chat Bubble
        return (
          <div 
            key={msg.id || index} 
            className={index === messagesList.length - 1 ? 'msg-animate' : undefined}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              width: '100%' 
            }}
          >
            {showSeparator && (
              <div style={{ 
                alignSelf: 'center', 
                margin: '16px 0 8px 0', 
                fontSize: '11px', 
                fontWeight: '700', 
                color: 'var(--text-muted)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                fontFamily: 'Rubik, sans-serif'
              }}>
                {formatDateSeparator(msg.timestamp)}
              </div>
            )}

            <div style={{ 
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              margin: '6px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isOwn ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                background: isOwn ? 'var(--chat-outgoing-bg)' : 'var(--chat-incoming-bg)',
                color: isOwn ? 'var(--chat-outgoing-text)' : 'var(--chat-incoming-text)',
                padding: msg.messageType === 'text' ? '12px 16px 28px 16px' : '6px 6px 28px 6px',
                borderRadius: '20px',
                border: isOwn ? 'none' : '1px solid var(--glass-border)',
                fontSize: '14px',
                lineHeight: '1.45',
                wordBreak: 'break-word',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                fontFamily: 'Rubik, sans-serif',
                position: 'relative',
                width: 'fit-content'
              }}>
                {msg.messageType === 'text' && (
                  <p style={{ margin: 0, color: isOwn ? 'var(--chat-outgoing-text)' : 'var(--chat-incoming-text)' }}>{msg.text}</p>
                )}
                
                {msg.messageType === 'image' && (
                  <img 
                    src={msg.attachmentUrl} 
                    alt="Attachment" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '14px', cursor: 'pointer', objectFit: 'cover' }} 
                    onClick={() => window.open(msg.attachmentUrl)}
                  />
                )}

                {msg.messageType === 'video' && (
                  <video 
                    src={msg.attachmentUrl} 
                    controls 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '14px' }} 
                  />
                )}

                {msg.messageType === 'document' && (
                  <a 
                    href={msg.attachmentUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', color: isOwn ? '#38BDF8' : '#0284C7', textDecoration: 'none', fontWeight: '600' }}
                  >
                    <FileText size={18} />
                    <span style={{ fontSize: '12px' }}>Download Attachment</span>
                  </a>
                )}

                {msg.messageType === 'voice' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                    <Volume2 size={16} style={{ color: isOwn ? '#38BDF8' : '#0284C7' }} />
                    <audio src={msg.attachmentUrl} controls style={{ height: '28px', width: '100%' }} />
                  </div>
                )}

                {/* Right aligned inside-bubble timestamp */}
                <div style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '9.5px',
                  color: isOwn ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)'
                }}>
                  <span>{formatTime(msg.timestamp)}</span>
                  {isOwn && (
                    isSeen ? (
                      <CheckCheck size={11} style={{ color: 'var(--accent-cyan)' }} />
                    ) : (
                      <Check size={11} />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

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
      height: isMobile ? 'calc(100vh - 60px - env(safe-area-inset-bottom))' : 'calc(100vh - 120px)', 
      background: isDesktop ? 'var(--bg-dark)' : 'transparent', 
      border: isDesktop ? '1px solid var(--glass-border)' : 'none',
      borderRadius: isDesktop ? '24px' : '0',
      overflow: 'hidden',
      position: 'relative',
      width: '100%'
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
        width: isDesktop ? '320px' : '100%',
        borderRight: isDesktop ? '1px solid var(--glass-border)' : 'none',
        display: (activeConversationId && !isDesktop) ? 'none' : 'flex',
        flexDirection: 'column',
        background: isDesktop ? 'var(--bg-surface)' : 'var(--bg-dark)',
        backdropFilter: 'none',
        height: '100%'
      }}>
        {/* Sidebar Header */}
        <header style={{
          height: '68px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          background: 'var(--bg-dark)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-white)' }}>Conversations</h3>
          <button 
            type="button"
            onClick={() => setShowNewChatModal(true)}
            className="btn-primary" 
            style={{ width: '32px', height: '32px', minHeight: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <Plus size={16} />
          </button>
        </header>

        {/* Search */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input" 
              style={{ height: '34px', minHeight: '34px', paddingLeft: '34px', fontSize: '12.5px', borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* List scroll panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {sortedConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', opacity: 0.6 }}>
              <Smile size={32} style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', margin: 0 }}>No active chats.</p>
            </div>
          ) : (
            sortedConversations.map(c => {
              const member = users.find(u => u.id === c.otherUserId);
              if (!member) return null;
              
              const isSelected = c.id === activeConversationId;
              const isOnline = presenceList[member.id]?.isOnline;
              const msgs = p2pMessages[c.id] || [];
              const lastMsg = msgs[msgs.length - 1];
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

                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13.5px', color: 'var(--text-white)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{member.fullName}</strong>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{lastMsg ? formatTime(lastMsg.timestamp) : ''}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'block', marginTop: '1px' }}>{member.businessName || member.role}</span>
                    <p style={{ fontSize: '12px', color: unreadCount > 0 ? 'var(--text-white)' : 'var(--text-muted)', margin: '4px 0 0 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: unreadCount > 0 ? '700' : '400' }}>
                      {lastMsg ? lastMsg.text : 'No messages yet.'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span style={{ background: 'var(--accent-cyan)', color: 'var(--btn-primary-text)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>{unreadCount}</span>
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
        display: (!activeConversationId && !isDesktop) ? 'none' : 'flex',
        flexDirection: 'column',
        position: !isDesktop ? 'fixed' : 'relative',
        top: !isDesktop ? 0 : undefined,
        left: !isDesktop ? 0 : undefined,
        right: !isDesktop ? 0 : undefined,
        bottom: !isDesktop ? 'calc(60px + env(safe-area-inset-bottom))' : undefined,
        zIndex: !isDesktop ? 50 : undefined,
        height: isDesktop ? '100%' : undefined,
        width: '100%',
        overflow: 'hidden',
        background: !isDesktop ? 'var(--bg-deep)' : undefined
      }}>
        {activeConversationId && otherUser ? (
          <>
            <header style={isDesktop ? {
              height: '68px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              background: 'var(--bg-dark)',
              backdropFilter: 'none',
              zIndex: 10
            } : {
              height: '60px',
              minHeight: '60px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              background: 'var(--bg-dark)',
              flexShrink: 0,
              zIndex: 10,
              fontFamily: 'Rubik, sans-serif'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: isDesktop ? '12px' : '8px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setActiveConversationId(null)}
                  style={{ display: isDesktop ? 'none' : 'block', background: 'none', border: 'none', color: 'var(--text-white)', cursor: 'pointer', paddingRight: '4px', display: 'flex', alignItems: 'center' }}
                  id="chat-back-btn"
                >
                  <ChevronLeft size={24} />
                </button>

                <div 
                  style={{ position: 'relative', width: isDesktop ? '38px' : '34px', height: isDesktop ? '38px' : '34px', cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => setProfileDrawerOpen(!profileDrawerOpen)}
                >
                  <img 
                    src={otherUser.profilePhoto || otherUser.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                    alt={otherUser.fullName} 
                    style={{ width: isDesktop ? '38px' : '34px', height: isDesktop ? '38px' : '34px', borderRadius: otherUser.role === 'Business Holder' ? '8px' : '50%', objectFit: 'cover' }}
                  />
                  {presenceList[otherUser.id]?.isOnline && (
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: '9px', height: '9px', background: '#22c55e', borderRadius: '50%', border: '2.5px solid var(--bg-deep)' }} />
                  )}
                </div>

                <div style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: isDesktop ? '14.5px' : '13.5px', color: 'var(--text-white)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{otherUser.fullName}</strong>
                    {otherUser.verificationStatus && otherUser.verificationStatus !== 'Basic Verified' && (
                      <Award size={13} style={{ color: 'var(--accent-cyan)' }} />
                    )}
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {presenceList[otherUser.id]?.isOnline ? 'Online' : 'Offline'} • {otherUser.businessName || otherUser.role}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: isDesktop ? '10px' : '6px' }}>
                <button 
                  type="button"
                  onClick={() => showSuccessToast({ title: 'Calling Unavailable', subtitle: 'Calling feature coming soon!' })}
                  className="btn-outline-cyan"
                  style={{ width: isDesktop ? '36px' : '32px', height: isDesktop ? '36px' : '32px', minHeight: isDesktop ? '36px' : '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  title="Voice Call"
                >
                  <Phone size={14} />
                </button>
                <button 
                  type="button"
                  onClick={() => showSuccessToast({ title: 'Video Call Unavailable', subtitle: 'Calling feature coming soon!' })}
                  className="btn-outline-cyan"
                  style={{ width: isDesktop ? '36px' : '32px', height: isDesktop ? '36px' : '32px', minHeight: isDesktop ? '36px' : '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  title="Video Call"
                >
                  <Video size={14} />
                </button>
                {isDesktop && (
                  <button 
                    type="button"
                    onClick={() => setProfileDrawerOpen(!profileDrawerOpen)}
                    className="btn-outline-cyan"
                    style={{ height: '36px', minHeight: '36px', borderRadius: '10px', padding: '0 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={14} /> View Profile
                  </button>
                )}
                <div ref={actionsDropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button 
                    type="button"
                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    className="btn-outline-cyan"
                    style={{ width: isDesktop ? '36px' : '32px', height: isDesktop ? '36px' : '32px', minHeight: isDesktop ? '36px' : '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    title="More options"
                  >
                    <MoreVertical size={15} />
                  </button>
                  {showActionsDropdown && (
                    <div className="glass-panel animate-scale-up" style={{ 
                      position: 'absolute', 
                      top: '42px', 
                      right: 0, 
                      width: '180px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      padding: '6px', 
                      gap: '2px', 
                      borderRadius: '12px', 
                      zIndex: 100,
                      background: 'var(--bg-dark)',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <button 
                        type="button"
                        onClick={async () => {
                          setShowActionsDropdown(false);
                          const confirmed = await showConfirmation({
                            title: 'Delete Chat',
                            message: 'Are you sure you want to delete all messages in this chat? This action cannot be undone.',
                            confirmText: 'Delete',
                            cancelText: 'Cancel',
                            type: 'delete',
                            isDestructive: true
                          });
                          if (confirmed) {
                            deleteConversation(activeConversationId);
                            showSuccessToast({ title: '✔ Chat Deleted', subtitle: 'The conversation has been cleared.' });
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: 'var(--text-white)', padding: '8px 10px', fontSize: '12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                        className="glass-panel-hover"
                      >
                        <Trash2 size={14} style={{ color: '#ef4444' }} /> <span style={{ color: '#ef4444' }}>Delete Chat</span>
                      </button>
                      <button 
                        type="button"
                        onClick={async () => {
                          setShowActionsDropdown(false);
                          const confirmed = await showConfirmation({
                            title: 'Block User',
                            message: `Are you sure you want to block ${otherUser.fullName}? You will no longer be able to message each other.`,
                            confirmText: 'Block',
                            cancelText: 'Cancel',
                            type: 'block',
                            isDestructive: true
                          });
                          if (confirmed) {
                            blockUser(otherUser.id);
                            showSuccessToast({ title: '✔ User Blocked', subtitle: `${otherUser.fullName} has been blocked.` });
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: 'var(--text-white)', padding: '8px 10px', fontSize: '12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                        className="glass-panel-hover"
                      >
                        <Ban size={14} style={{ color: '#ef4444' }} /> <span style={{ color: '#ef4444' }}>Block User</span>
                      </button>
                      {!isDesktop && (
                        <button 
                          type="button"
                          onClick={() => {
                            setShowActionsDropdown(false);
                            setProfileDrawerOpen(true);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: 'var(--text-white)', padding: '8px 10px', fontSize: '12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                          className="glass-panel-hover"
                        >
                          <Eye size={14} /> <span>View Profile</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div style={isDesktop ? {
              flex: 1,
              overflowY: 'auto',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            } : {
              flex: 1,
              overflowY: 'auto',
              padding: '16px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-deep)',
              minHeight: 0
            }}>
              {messagesList.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.6 }}>
                  <Smile size={36} style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>Start your conversation.</p>
                </div>
              ) : (
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {renderMessageStream()}
                </div>
              )}

              {activeTypingUsers[otherUser.id] && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 10px', width: 'fit-content', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--glass-border)', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rubik, sans-serif' }}>{otherUser.fullName} is typing</span>
                  <div className="typing-dots" style={{ display: 'flex', gap: '3px' }}>
                    <span className="dot" style={{ width: '4px', height: '4px', background: 'var(--accent-cyan)', borderRadius: '50%', animation: 'bounce 1.4s infinite' }} />
                    <span className="dot" style={{ width: '4px', height: '4px', background: 'var(--accent-cyan)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s' }} />
                    <span className="dot" style={{ width: '4px', height: '4px', background: 'var(--accent-cyan)', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={isDesktop ? {
              borderTop: '1px solid var(--glass-border)',
              padding: '16px 20px',
              background: 'var(--bg-dark)',
              position: 'relative'
            } : {
              padding: '12px 16px',
              background: 'var(--bg-dark)',
              borderTop: '1px solid var(--glass-border)',
              flexShrink: 0
            }}>
              
              {isRecording ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 16px', borderRadius: '14px', color: '#ef4444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="rec-pulse" style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                    <span style={{ fontSize: '13.5px', fontWeight: '700' }}>Recording Voice Note: {recordingDuration}s</span>
                  </div>
                  <button type="button" onClick={() => stopRecording()} className="btn-primary" style={{ padding: '0 14px', minHeight: '32px', borderRadius: '8px', background: '#ef4444', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Square size={12} /> Stop & Send
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', width: '100%' }}>
                  
                  {isDesktop ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div ref={attachmentContainerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button 
                          type="button"
                          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          style={{ background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-gray)', cursor: 'pointer', transition: 'all 0.2s' }}
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
                                type="button"
                                onClick={() => triggerAttachment(act.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: 'var(--text-white)', padding: '8px 10px', fontSize: '12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                                className="glass-panel-hover"
                              >
                                {act.icon} <span>{act.label}</span>
                              </button>
                            ))}
                            <button 
                              type="button"
                              onClick={startRecording}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: 'var(--accent-cyan)', padding: '8px 10px', fontSize: '12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                              className="glass-panel-hover"
                            >
                              <Mic size={14} /> <span>Voice Recording</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div ref={emojiContainerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button 
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          style={{ background: 'var(--bg-deep)', border: '1px solid var(--glass-border)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-gray)', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <Smile size={16} />
                        </button>
                        {showEmojiPicker && (
                          <div className="glass-panel" style={{ position: 'absolute', bottom: '46px', left: 0, width: '220px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', padding: '12px', borderRadius: '16px', zIndex: 100 }}>
                            {['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬'].map(em => (
                              <span key={em} onClick={() => addEmoji(em)} style={{ fontSize: '18px', cursor: 'pointer', textAlign: 'center', display: 'block', transition: 'transform 0.1s' }} className="emoji-hover">{em}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {isDesktop ? (
                    <textarea 
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="form-input" 
                      placeholder="Message..." 
                      rows={1}
                      style={{ flex: 1, height: '40px', minHeight: '40px', resize: 'none', padding: '10px 16px', fontSize: '13.5px', borderRadius: '20px', background: 'var(--bg-deep)' }}
                    />
                  ) : (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg-deep)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '28px',
                      padding: '0 8px 0 12px',
                      minHeight: '48px',
                      maxHeight: '120px',
                      overflow: 'hidden'
                    }}>
                      <div ref={attachmentContainerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <button 
                          type="button"
                          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          style={{ background: 'none', border: 'none', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Paperclip size={22} />
                        </button>
                        {showAttachmentMenu && (
                          <div className="glass-panel" style={{ position: 'absolute', bottom: '46px', left: 0, width: '180px', display: 'flex', flexDirection: 'column', padding: '6px', gap: '2px', borderRadius: '12px', zIndex: 100, background: 'var(--bg-dark)', border: '1px solid var(--glass-border)' }}>
                            {[
                              { id: 'image', label: 'Image Upload', icon: <ImageIcon size={14} /> },
                              { id: 'document', label: 'Document File', icon: <FileText size={14} /> }
                            ].map(act => (
                              <button 
                                key={act.id} 
                                type="button"
                                onClick={() => triggerAttachment(act.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: 'var(--text-white)', padding: '8px 10px', fontSize: '12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                                className="glass-panel-hover"
                              >
                                {act.icon} <span>{act.label}</span>
                              </button>
                            ))}
                            <button 
                              type="button"
                              onClick={startRecording}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: 'var(--accent-cyan)', padding: '8px 10px', fontSize: '12px', textAlign: 'left', borderRadius: '8px', cursor: 'pointer' }}
                              className="glass-panel-hover"
                            >
                              <Mic size={14} /> <span>Voice Recording</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div ref={emojiContainerRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '6px' }}>
                        <button 
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          style={{ background: 'none', border: 'none', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Smile size={22} />
                        </button>
                        {showEmojiPicker && (
                          <div className="glass-panel" style={{ position: 'absolute', bottom: '46px', left: 0, width: '220px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', padding: '12px', borderRadius: '16px', zIndex: 100, background: 'var(--bg-dark)', border: '1px solid var(--glass-border)' }}>
                            {['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬'].map(em => (
                              <span key={em} onClick={() => addEmoji(em)} style={{ fontSize: '18px', cursor: 'pointer', textAlign: 'center', display: 'block', transition: 'transform 0.1s' }} className="emoji-hover">{em}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <textarea
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Message..."
                        rows={1}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: 'var(--text-white)',
                          padding: '12px 8px',
                          fontSize: '14px',
                          height: '40px',
                          minHeight: '40px',
                          resize: 'none',
                          fontFamily: 'Rubik, sans-serif'
                        }}
                      />
                    </div>
                  )}

                  <button 
                    type="button"
                    onClick={handleSend}
                    className={isDesktop ? "btn-primary" : ""} 
                    style={isDesktop ? { 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      minHeight: '40px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: 0 
                    } : {
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--btn-primary-bg)',
                      color: 'var(--btn-primary-text)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <Send size={isDesktop ? 15 : 18} style={isDesktop ? { marginLeft: '2px' } : { marginLeft: '3px' }} />
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

        {profileDrawerOpen && otherUser && (
          <aside className="glass-panel animate-scale-up" style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: isDesktop ? '320px' : '100%',
            height: '100%',
            borderLeft: isDesktop ? '1px solid var(--glass-border)' : 'none',
            background: 'var(--bg-dark)',
            backdropFilter: 'blur(16px)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '24px 20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-white)' }}>Creator Details</h4>
              <button onClick={() => setProfileDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

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

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginBottom: '16px' }}>
              <h5 style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-white)', marginBottom: '6px' }}>Bio</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-gray)', lineHeight: '1.5', margin: 0 }}>
                {otherUser.bio || otherUser.description || 'No summary bio provided.'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rating</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                  <Star size={12} fill="#eab308" stroke="#eab308" />
                  <strong style={{ fontSize: '13px', color: 'var(--text-white)' }}>{Number(otherUser.rating || 5.0).toFixed(1)}</strong>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Portfolio projects</span>
                <strong style={{ fontSize: '13px', color: 'var(--text-white)', display: 'block', marginTop: '3px' }}>{otherUser.portfolio?.length || '0'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
              <button onClick={() => showSuccessToast({ title: '✔ Hiring Request Sent', subtitle: `Request sent to ${otherUser.fullName}!` })} className="btn-primary" style={{ width: '100%', minHeight: '38px', borderRadius: '10px', fontSize: '12px' }}>
                Hire Creator
              </button>
              
              <button 
                onClick={async () => {
                  const confirmed = await showConfirmation({
                    title: 'Block User',
                    message: `Are you sure you want to block ${otherUser.fullName}? You will no longer be able to message each other.`,
                    confirmText: 'Block',
                    cancelText: 'Cancel',
                    type: 'block',
                    isDestructive: true
                  });
                  if (confirmed) {
                    blockUser(otherUser.id);
                    showSuccessToast({ title: '✔ User Blocked', subtitle: `${otherUser.fullName} has been blocked.` });
                    setProfileDrawerOpen(false);
                  }
                }} 
                className="btn-outline-cyan" 
                style={{ width: '100%', minHeight: '38px', borderRadius: '10px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.02)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
              >
                <Ban size={14} /> Block User
              </button>

              <button 
                onClick={() => showSuccessToast({ title: '✔ Report Submitted', subtitle: `${otherUser.fullName} has been reported to support.` })} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer', textAlign: 'center' }}
              >
                Report Profile
              </button>
            </div>
          </aside>
        )}
      </section>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowNewChatModal(false)}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '440px',
            background: 'var(--bg-dark)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--text-white)' }}>New Chat</h3>
              <button 
                type="button"
                onClick={() => setShowNewChatModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search by name, user or brand..." 
                value={newChatSearch}
                onChange={e => setNewChatSearch(e.target.value)}
                className="form-input" 
                style={{ height: '38px', minHeight: '38px', paddingLeft: '38px', fontSize: '13px', borderRadius: '12px' }}
              />
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredConnections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-gray)' }}>
                  <User size={28} style={{ opacity: 0.2, marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto', display: 'block' }} />
                  <span style={{ fontSize: '12.5px' }}>No users found.</span>
                </div>
              ) : (
                filteredConnections.map(user => (
                  <div 
                    key={user.id}
                    className="glass-panel-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <img 
                        src={user.profilePhoto || user.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                        alt={user.fullName} 
                        style={{ width: '36px', height: '36px', borderRadius: user.role === 'Business Holder' ? '6px' : '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <strong style={{ fontSize: '13px', color: 'var(--text-white)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.fullName}</strong>
                          {user.verificationStatus && user.verificationStatus !== 'Basic Verified' && (
                            <Award size={13} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {user.role} {user.location ? `• ${user.location}` : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowNewChatModal(false);
                          setNewChatSearch('');
                          if (onOpenProfile) {
                            onOpenProfile(user.id);
                          }
                        }}
                        className="btn-secondary"
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          minHeight: '28px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await startConversation(user.id);
                          setShowNewChatModal(false);
                          setNewChatSearch('');
                        }}
                        className="btn-primary"
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          minHeight: '28px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Styled Animations & Responsive CSS */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes messageFadeSlide {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-animate {
          animation: messageFadeSlide 200ms ease-out both;
        }
        .emoji-hover:hover {
          transform: scale(1.25);
        }
        @media (max-width: 1024px) {
          #chat-back-btn {
            display: block !important;
          }
        }
      `}</style>

    </div>
  );
};

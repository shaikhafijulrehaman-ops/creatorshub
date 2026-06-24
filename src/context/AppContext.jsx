/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useRef } from 'react';
import { supabase, setSupabaseUserHeader } from '../supabaseClient';

const LIGHTWEIGHT_COLUMNS = 'id,role,full_name,location,description,business_name,business_category,logo,profile_photo,bio,website,team_size,monthly_marketing_budget,content_categories,platforms,followers_count,average_reach,engagement_rate,languages,collaboration_pricing,verification_status,profile_strength,rating,reviews,fraud_audit,services,skills,experience,verification_requested,phone_visibility,email_visibility,website_visibility,social_links_visibility,contact_visibility,whatsapp,gst,contact_person,social_links,field_visibility,email,mobile_number,address';

const getConvIdFromNotif = (notifId) => {
  if (!notifId || !notifId.startsWith('notif-msg-')) return null;
  const withoutPrefix = notifId.substring('notif-msg-'.length);
  const lastDashIdx = withoutPrefix.lastIndexOf('-');
  if (lastDashIdx === -1) return withoutPrefix;
  return withoutPrefix.substring(0, lastDashIdx);
};

export const AppContext = createContext();

const generateUserId = (role) => {
  const now = Date.now();
  return role === 'Business Holder' ? `bh-${now}` : (role === 'Influencer' ? `inf-${now}` : `fl-${now}`);
};

// Helper functions for safe JSON parsing and stringifying
const safeStringify = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val);
  } catch (e) {
    console.error('Error stringifying value:', e);
    return null;
  }
};

const safeParse = (val, fallback = null) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    console.warn('Error parsing JSON field:', e, val);
    return fallback;
  }
};

const mapUserToDb = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    password: user.password,
    full_name: user.fullName,
    mobile_number: user.mobileNumber || null,
    location: user.location || null,
    description: user.description || null,
    business_name: user.businessName || null,
    business_category: user.businessCategory || null,
    logo: user.logo || null,
    profile_photo: user.profilePhoto || null,
    bio: user.bio || null,
    website: user.website || null,
    team_size: user.teamSize || null,
    monthly_marketing_budget: user.monthlyMarketingBudget || null,
    content_categories: safeStringify(user.contentCategories),
    platforms: safeStringify(user.platforms),
    followers_count: user.followersCount || null,
    average_reach: user.averageReach || null,
    engagement_rate: user.engagementRate || null,
    languages: safeStringify(user.languages),
    collaboration_pricing: user.collaborationPricing || null,
    verification_status: user.verificationStatus || 'Basic Verified',
    profile_strength: user.profileStrength || 15,
    rating: user.rating || 5.0,
    reviews: safeStringify(user.reviews),
    fraud_audit: safeStringify(user.fraudAudit),
    services: safeStringify(user.services),
    portfolio: safeStringify(user.portfolio),
    skills: safeStringify(user.skills),
    experience: user.experience || null,
    verification_requested: user.verificationRequested || false,
    phone_visibility: user.phoneVisibility || 'Private',
    email_visibility: user.emailVisibility || 'Private',
    website_visibility: user.websiteVisibility || 'Private',
    social_links_visibility: user.socialLinksVisibility || 'Private',
    contact_visibility: user.contactVisibility || 'Private',
    cover_banner: user.coverBanner || null,
    whatsapp: user.whatsapp || null,
    gst: user.gst || null,
    contact_person: user.contactPerson || null,
    address: user.address || null,
    social_links: safeStringify(user.socialLinks),
    field_visibility: safeStringify(user.fieldVisibility)
  };
};

const mapUserFromDb = (dbUser) => {
  if (!dbUser) return null;
  return {
    id: dbUser.id,
    role: dbUser.role,
    email: dbUser.email,
    password: dbUser.password,
    fullName: dbUser.full_name,
    mobileNumber: dbUser.mobile_number,
    location: dbUser.location,
    description: dbUser.description,
    businessName: dbUser.business_name,
    businessCategory: dbUser.business_category,
    logo: dbUser.logo,
    profilePhoto: dbUser.profile_photo,
    bio: dbUser.bio,
    website: dbUser.website,
    teamSize: dbUser.team_size,
    monthlyMarketingBudget: dbUser.monthly_marketing_budget,
    contentCategories: safeParse(dbUser.content_categories, []),
    platforms: safeParse(dbUser.platforms, {}),
    followersCount: dbUser.followers_count,
    averageReach: dbUser.average_reach,
    engagementRate: dbUser.engagement_rate,
    languages: safeParse(dbUser.languages, []),
    collaborationPricing: dbUser.collaboration_pricing,
    verificationStatus: dbUser.verification_status,
    profileStrength: dbUser.profile_strength,
    rating: dbUser.rating ? parseFloat(dbUser.rating) : 5.0,
    reviews: safeParse(dbUser.reviews, []),
    fraudAudit: safeParse(dbUser.fraud_audit, null),
    services: safeParse(dbUser.services, []),
    portfolio: safeParse(dbUser.portfolio, []),
    skills: safeParse(dbUser.skills, []),
    experience: dbUser.experience,
    verificationRequested: dbUser.verification_requested,
    phoneVisibility: dbUser.phone_visibility || 'Private',
    emailVisibility: dbUser.email_visibility || 'Private',
    websiteVisibility: dbUser.website_visibility || 'Private',
    socialLinksVisibility: dbUser.social_links_visibility || 'Private',
    contactVisibility: dbUser.contact_visibility || 'Private',
    coverBanner: dbUser.cover_banner || null,
    whatsapp: dbUser.whatsapp || null,
    gst: dbUser.gst || null,
    contactPerson: dbUser.contact_person || null,
    address: dbUser.address || null,
    socialLinks: safeParse(dbUser.social_links, {}),
    fieldVisibility: safeParse(dbUser.field_visibility, {}),
    createdAt: dbUser.created_at || null
  };
};

const mapProjectToDb = (proj) => {
  if (!proj) return null;
  return {
    id: proj.id,
    business_id: proj.businessId,
    business_name: proj.businessName,
    title: proj.title,
    category: proj.category || null,
    description: proj.description || null,
    budget: proj.budget || null,
    deadline: proj.deadline || null,
    status: proj.status || 'Open',
    attachments: proj.attachments || [],
    proposals: proj.proposals || [],
    invited_creators: proj.invitedCreators || [],
    team: proj.team || null,
    created_at: proj.createdAt || new Date().toISOString().split('T')[0]
  };
};

const mapProjectFromDb = (dbProj) => {
  if (!dbProj) return null;
  return {
    id: dbProj.id,
    businessId: dbProj.business_id,
    businessName: dbProj.business_name,
    title: dbProj.title,
    category: dbProj.category,
    description: dbProj.description,
    budget: dbProj.budget,
    deadline: dbProj.deadline,
    status: dbProj.status,
    attachments: typeof dbProj.attachments === 'string' ? JSON.parse(dbProj.attachments) : (dbProj.attachments || []),
    proposals: typeof dbProj.proposals === 'string' ? JSON.parse(dbProj.proposals) : (dbProj.proposals || []),
    invitedCreators: typeof dbProj.invited_creators === 'string' ? JSON.parse(dbProj.invited_creators) : (dbProj.invited_creators || []),
    team: typeof dbProj.team === 'string' ? JSON.parse(dbProj.team) : dbProj.team,
    createdAt: dbProj.created_at
  };
};

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ch_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activityFeed, setActivityFeed] = useState([]);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [followedProfiles, setFollowedProfiles] = useState([]);
  const [messages, setMessages] = useState({});

  const [loading, setLoading] = useState(true);

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  // Applications state
  const [applications, setApplications] = useState([]);

  // Connections & Requests state
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Global Active Dashboard Tab
  const [activeDashboardTab, setActiveDashboardTab] = useState('dashboard');

  const [theme] = useState('light');
  const [initialized, setInitialized] = useState(false);
  const [clientVersion, setClientVersion] = useState(0);

  const updateSupabaseClient = (userId) => {
    setSupabaseUserHeader(userId);
    setClientVersion(prev => prev + 1);
  };

  const profileCacheRef = useRef({});

  const fetchFullProfile = async (userId) => {
    if (!userId) return null;
    if (profileCacheRef.current[userId]) {
      return profileCacheRef.current[userId];
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching full profile:', error);
        return null;
      }
      if (data) {
        const fullProfile = mapUserFromDb(data);
        profileCacheRef.current[userId] = fullProfile;
        
        // Also update in global users list so other places see the updated/loaded fields
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...fullProfile } : u));
        
        return fullProfile;
      }
    } catch (err) {
      console.error('Exception fetching full profile:', err);
    }
    return null;
  };

  const loadMoreMessages = async (conversationId, beforeTimestamp = null) => {
    if (!conversationId) return;
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (beforeTimestamp) {
        query = query.lt('created_at', beforeTimestamp);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error loading more messages:', error);
        return;
      }

      if (data) {
        const formatted = data.map(m => ({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          text: m.message,
          attachmentUrl: m.attachment_url,
          messageType: m.message_type,
          seen: m.seen,
          timestamp: m.created_at
        })).reverse(); // Reverse so they are chronological

        setP2pMessages(prev => {
          const existing = prev[conversationId] || [];
          if (beforeTimestamp) {
            const filteredNew = formatted.filter(n => !existing.some(e => e.id === n.id));
            return {
              ...prev,
              [conversationId]: [...filteredNew, ...existing]
            };
          } else {
            return {
              ...prev,
              [conversationId]: formatted
            };
          }
        });
      }
    } catch (err) {
      console.error('Exception loading more messages:', err);
    }
  };

  const toggleTheme = () => {
    // Dark mode disabled
  };

  const fetchUserData = async (userId) => {
    try {
      console.log('fetchUserData: fetching relationships, notifications and blocks for user:', userId);
      const [dbConns, dbReqs, dbNotifs, dbBlocked] = await Promise.all([
        supabase.from('connections').select('*').or(`user_id1.eq.${userId},user_id2.eq.${userId}`),
        supabase.from('connection_requests').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('blocked_users').select('*').or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`)
      ]);

      if (dbConns.data) setConnections(dbConns.data);
      if (dbReqs.data) setConnectionRequests(dbReqs.data);
      if (dbNotifs.data) setNotifications(dbNotifs.data);
      if (dbBlocked.data) setBlockedUsers(dbBlocked.data);
    } catch (e) {
      console.error('Error fetching user details:', e);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');

    const initData = async () => {
      try {
        // Pre-set header for RLS if cached user session exists
        const cachedUser = localStorage.getItem('ch_current_user');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            if (parsedUser && parsedUser.id) {
              updateSupabaseClient(parsedUser.id);
            }
          } catch (e) {
            console.error('Error pre-setting supabase user header:', e);
          }
        }

        // 1. Fetch Users
        const { data: dbUsers, error: usersErr } = await supabase.from('profiles').select(LIGHTWEIGHT_COLUMNS);
        let finalUsers = [];
        if (usersErr) {
          console.warn('Error fetching users from Supabase:', usersErr);
        } else {
          finalUsers = dbUsers ? dbUsers.map(mapUserFromDb) : [];
        }
        setUsers(finalUsers);

        // 2. Fetch Projects
        const { data: dbProjects, error: projErr } = await supabase.from('projects').select('*');
        let finalProjects = [];
        if (projErr) {
          console.warn('Error fetching projects from Supabase:', projErr);
        } else {
          finalProjects = dbProjects ? dbProjects.map(mapProjectFromDb) : [];
        }
        setProjects(finalProjects);

        // 3. Fetch Activities
        const { data: dbActivities, error: actErr } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
        let finalActivities = [];
        if (actErr) {
          console.warn('Error fetching activities from Supabase:', actErr);
        } else {
          finalActivities = dbActivities || [];
        }
        setActivityFeed(finalActivities);

        // 4. Messages fetch removed (workspace messages load in memory or dynamically)

        // 4.5 Fetch Applications
        const { data: dbApps, error: appsErr } = await supabase.from('applications').select('*');
        let finalApps = [];
        if (appsErr) {
          console.warn('Error fetching applications from Supabase:', appsErr);
        } else {
          finalApps = dbApps || [];
        }
        setApplications(finalApps);

        // 5. Sync logged in user session & relationships
        let activeUser = null;

        // Check if there is an active Supabase Auth session (like Google OAuth redirect)
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (authSession?.user) {
          const emailNormalized = authSession.user.email ? authSession.user.email.trim().toLowerCase() : '';
          let dbUser = null;
          
          // First check by Google UID
          const { data: dbUserById } = await supabase.from('users').select('*').eq('id', authSession.user.id).maybeSingle();
          if (dbUserById) {
            dbUser = dbUserById;
          } else if (emailNormalized) {
            // Check by email (linking Google OAuth to existing email/password account if found)
            const { data: dbUserByEmail } = await supabase.from('users').select('*').eq('email', emailNormalized).maybeSingle();
            if (dbUserByEmail) {
              dbUser = dbUserByEmail;
            }
          }

          if (dbUser) {
            activeUser = mapUserFromDb(dbUser);
          } else {
            // New user signed in via Google OAuth
            const googleName = authSession.user.user_metadata?.full_name || authSession.user.user_metadata?.name || 'Google User';
            const googleEmail = emailNormalized || authSession.user.email;
            const newId = authSession.user.id;

            const newUser = {
              id: newId,
              role: 'Influencer', // Default role
              fullName: googleName,
              email: googleEmail,
              password: 'google-oauth-user',
              verificationStatus: 'Basic Verified',
              rating: 5.0,
              reviews: [],
              profileStrength: 35,
              socialLinks: { instagram: '', twitter: '' },
              platforms: {},
              portfolio: [],
              services: [],
              skills: [],
              verificationRequested: false,
              mobileNumber: '',
              location: '',
              description: '',
              businessName: '',
              businessCategory: '',
              logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
              profilePhoto: authSession.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              bio: 'Influencer profile created via Google SSO.',
              website: ''
            };

            const { error: insertErr } = await supabase.from('users').insert([mapUserToDb(newUser)]);
            if (insertErr) {
              console.error('Error inserting new Google OAuth user:', insertErr);
              throw new Error('Google registration failed: ' + insertErr.message);
            }
            activeUser = newUser;

            // Update local users list
            setUsers(prev => {
              if (prev.some(u => u.id === newId)) return prev;
              return [...prev, newUser];
            });
          }
        } else {
          if (cachedUser) {
            const parsedUser = JSON.parse(cachedUser);
            const { data: refreshedUser, error: refreshErr } = await supabase.from('users').select('*').eq('id', parsedUser.id).maybeSingle();
            if (refreshedUser) {
              activeUser = mapUserFromDb(refreshedUser);
            } else if (refreshErr) {
              console.warn('Network or database error refreshing user session. Restoring cached session:', refreshErr);
              activeUser = parsedUser;
            } else {
              console.warn('Current user session invalid/deleted from database. Logging out.');
              localStorage.removeItem('ch_current_user');
              activeUser = null;
            }
          }
        }

        if (activeUser) {
          setCurrentUser(activeUser);
          localStorage.setItem('ch_current_user', JSON.stringify(activeUser));

          await fetchUserData(activeUser.id);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error loading Supabase data:', err);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initData();
  }, []);

  // Realtime global subscription for users and projects
  useEffect(() => {
    const usersSub = supabase
      .channel('users-realtime-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
        console.log('Realtime database change on users table:', payload);
        if (payload.eventType === 'INSERT') {
          const mapped = mapUserFromDb(payload.new);
          setUsers(prev => {
            if (prev.some(u => u.id === mapped.id)) return prev;
            return [...prev, mapped];
          });
        } else if (payload.eventType === 'UPDATE') {
          const mapped = mapUserFromDb(payload.new);
          setUsers(prev => prev.map(u => u.id === mapped.id ? { ...u, ...mapped } : u));
          profileCacheRef.current[mapped.id] = mapped;
          
          // Sync current logged-in user state if they are updated
          setCurrentUser(curr => {
            if (curr && curr.id === mapped.id) {
              const updatedSession = { ...curr, ...mapped };
              localStorage.setItem('ch_current_user', JSON.stringify(updatedSession));
              return updatedSession;
            }
            return curr;
          });
        } else if (payload.eventType === 'DELETE') {
          const oldUser = payload.old;
          setUsers(prev => prev.filter(u => u.id !== oldUser.id));
        }
      })
      .subscribe();

    const projectsSub = supabase
      .channel('projects-realtime-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, payload => {
        console.log('Realtime database change on projects table:', payload);
        const proj = payload.new;
        if (payload.eventType === 'INSERT') {
          const mapped = mapProjectFromDb(proj);
          setProjects(prev => {
            if (prev.some(p => p.id === mapped.id)) return prev;
            return [...prev, mapped];
          });
        } else if (payload.eventType === 'UPDATE') {
          const mapped = mapProjectFromDb(proj);
          setProjects(prev => prev.map(p => p.id === mapped.id ? mapped : p));
        } else if (payload.eventType === 'DELETE') {
          const oldProj = payload.old;
          setProjects(prev => prev.filter(p => p.id !== oldProj.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersSub);
      supabase.removeChannel(projectsSub);
    };
  }, [clientVersion]);

  // Realtime database subscription for connections, requests, notifications
  useEffect(() => {
    if (!currentUser) {
      setConnections([]);
      setConnectionRequests([]);
      setNotifications([]);
      setBlockedUsers([]);
      return;
    }

    const connectionsSub = supabase
      .channel('connections-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, payload => {
        const conn = payload.new;
        if (payload.eventType === 'INSERT') {
          if (conn.user_id1 === currentUser.id || conn.user_id2 === currentUser.id) {
            setConnections(prev => {
              if (prev.some(c => c.id === conn.id)) return prev;
              return [...prev, conn];
            });
          }
        } else if (payload.eventType === 'DELETE') {
          const oldConn = payload.old;
          setConnections(prev => prev.filter(c => c.id !== oldConn.id));
        }
      })
      .subscribe();

    const requestsSub = supabase
      .channel('requests-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connection_requests' }, payload => {
        const req = payload.new;
        if (payload.eventType === 'INSERT') {
          if (req.sender_id === currentUser.id || req.receiver_id === currentUser.id) {
            setConnectionRequests(prev => {
              if (prev.some(r => r.id === req.id)) return prev;
              return [...prev, req];
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          if (req.sender_id === currentUser.id || req.receiver_id === currentUser.id) {
            setConnectionRequests(prev => prev.map(r => r.id === req.id ? req : r));
          }
        } else if (payload.eventType === 'DELETE') {
          const oldReq = payload.old;
          setConnectionRequests(prev => prev.filter(r => r.id !== oldReq.id));
        }
      })
      .subscribe();

    const notificationsSub = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, payload => {
        const notif = payload.new;
        if (payload.eventType === 'INSERT') {
          if (notif.user_id === currentUser.id) {
            setNotifications(prev => {
              if (prev.some(n => n.id === notif.id)) return prev;
              return [notif, ...prev];
            });
            if (notif.type === 'message') {
              const convId = getConvIdFromNotif(notif.id);
              if (convId) {
                syncConversationIfNeeded(convId);
              }
            }
          }
        } else if (payload.eventType === 'UPDATE') {
          if (notif.user_id === currentUser.id) {
            setNotifications(prev => prev.map(n => n.id === notif.id ? notif : n));
          }
        } else if (payload.eventType === 'DELETE') {
          const oldNotif = payload.old;
          setNotifications(prev => prev.filter(n => n.id !== oldNotif.id));
        }
      })
      .subscribe();

    const profileChannel = supabase.channel('profile-updates');
    profileChannel
      .on('broadcast', { event: 'profile_changed' }, ({ payload }) => {
        console.log('Realtime broadcast received: profile changed', payload);
        const mapped = mapUserFromDb(payload.user);
        setUsers(prev => {
          const exists = prev.some(u => u.id === mapped.id);
          if (exists) {
            return prev.map(u => u.id === mapped.id ? { ...u, ...mapped } : u);
          }
          return [...prev, mapped];
        });
      })
      .subscribe();

    const applicationsSub = supabase
      .channel('applications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, payload => {
        const app = payload.new;
        if (payload.eventType === 'INSERT') {
          setApplications(prev => {
            if (prev.some(a => a.id === app.id)) return prev;
            return [...prev, app];
          });
        } else if (payload.eventType === 'UPDATE') {
          setApplications(prev => prev.map(a => a.id === app.id ? app : a));
        } else if (payload.eventType === 'DELETE') {
          const oldApp = payload.old;
          setApplications(prev => prev.filter(a => a.id !== oldApp.id));
        }
      })
      .subscribe();

    const membersSub = supabase
      .channel('members-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_members' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMember = payload.new;
          if (newMember.user_id === currentUser.id) {
            const { data: convMembers } = await supabase
              .from('conversation_members')
              .select('conversation_id, user_id')
              .eq('conversation_id', newMember.conversation_id);
            
            if (convMembers) {
              const members = convMembers.map(m => m.user_id);
              const otherUserId = members.find(mId => mId !== currentUser.id);
              setConversations(prev => {
                if (prev.some(c => c.id === newMember.conversation_id)) return prev;
                return [...prev, {
                  id: newMember.conversation_id,
                  members,
                  otherUserId
                }];
              });
            }
          } else {
            setConversations(prev => {
              return prev.map(c => {
                if (c.id === newMember.conversation_id && !c.members.includes(newMember.user_id)) {
                  return {
                    ...c,
                    members: [...c.members, newMember.user_id],
                    otherUserId: newMember.user_id === currentUser.id ? c.otherUserId : newMember.user_id
                  };
                }
                return c;
              });
            });
          }
        }
      })
      .subscribe();

    const blockedSub = supabase
      .channel('blocked-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_users' }, payload => {
        const block = payload.new;
        if (payload.eventType === 'INSERT') {
          if (block.blocker_id === currentUser.id || block.blocked_id === currentUser.id) {
            setBlockedUsers(prev => {
              if (prev.some(b => b.id === block.id)) return prev;
              return [...prev, block];
            });
          }
        } else if (payload.eventType === 'DELETE') {
          const oldBlock = payload.old;
          setBlockedUsers(prev => prev.filter(b => b.id !== oldBlock.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(connectionsSub);
      supabase.removeChannel(requestsSub);
      supabase.removeChannel(notificationsSub);
      supabase.removeChannel(applicationsSub);
      supabase.removeChannel(membersSub);
      supabase.removeChannel(blockedSub);
    };
  }, [currentUser, clientVersion]);



  // Auth Operations
  const checkEmailExists = async (email) => {
    if (!email) return false;
    try {
      const { data, error } = await supabase.from('users').select('id').eq('email', email.trim().toLowerCase()).maybeSingle();
      if (error) {
        console.error('Error checking duplicate email:', error);
        return false;
      }
      return !!data;
    } catch (e) {
      console.error('Exception checking duplicate email:', e);
      return false;
    }
  };

  const registerUser = async (role, basicDetails, profileDetails = {}, verificationLevel = 'Basic Verified') => {
    const email = basicDetails?.email ? basicDetails.email.trim().toLowerCase() : '';
    if (!email) {
      throw new Error('Email is required.');
    }

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!basicDetails?.password || basicDetails.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (!basicDetails?.fullName || basicDetails.fullName.trim() === '') {
      throw new Error('Full Name is required.');
    }

    if (!['Business Holder', 'Freelancer', 'Influencer'].includes(role)) {
      throw new Error('Invalid account role.');
    }

    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      throw new Error('This email is already registered. Please log in instead.');
    }

    const newId = generateUserId(role);
    let fraudAudit = null;
    if (role === 'Influencer') {
      fraudAudit = {
        fakeFollowers: '2.4%',
        engagementAuthenticity: 'Excellent',
        suspiciousGrowth: 'None',
        badge: 'Verified Audience'
      };
    }

    const defaultData = {
      socialLinks: { instagram: '', twitter: '' },
      platforms: {},
      portfolio: [],
      services: [],
      skills: [],
      verificationRequested: false,
      mobileNumber: basicDetails?.mobileNumber || '',
      location: '',
      description: '',
      businessName: '',
      businessCategory: '',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: '',
      website: ''
    };

    const newUser = {
      id: newId,
      role,
      ...defaultData,
      ...basicDetails,
      email, // normalized
      ...profileDetails,
      verificationStatus: verificationLevel,
      rating: 5.0,
      reviews: [],
      ...(fraudAudit && { fraudAudit })
    };

    newUser.profileStrength = calculateProfileStrength(role, newUser);

    // Save immediately to Supabase database first!
    const { error } = await supabase.from('users').insert([mapUserToDb(newUser)]);
    if (error) {
      console.error('Error inserting user to Supabase:', error);
      if (error.code === '23505' || (error.message && (error.message.includes('unique constraint') || error.message.includes('already exists') || error.message.includes('duplicate key')))) {
        throw new Error('This email is already registered. Please log in instead.');
      }
      throw new Error('Registration failed: ' + error.message);
    }

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('ch_current_user', JSON.stringify(newUser));
    updateSupabaseClient(newId);

    // Fetch user relationships after registration
    fetchUserData(newId);

    return newUser;
  };

  const loginUser = async (email, password) => {
    try {
      const emailNormalized = email ? email.trim().toLowerCase() : '';
      if (!emailNormalized || !password) {
        return { success: false, message: 'Please enter both email and password.' };
      }

      const { data, error } = await supabase.rpc('login_user', { p_email: emailNormalized, p_password: password });
      if (error) {
        console.error('Database error during login:', error);
        return { success: false, message: 'Could not connect to database. Please check your internet connection.' };
      }
      
      if (data && data.length > 0) {
        const user = mapUserFromDb(data[0]);
        setCurrentUser(user);
        localStorage.setItem('ch_current_user', JSON.stringify(user));
        updateSupabaseClient(user.id);
        
        supabase.from('profiles').select(LIGHTWEIGHT_COLUMNS).then(({ data: refreshedUsers }) => {
          if (refreshedUsers) {
            const finalUsers = refreshedUsers.map(mapUserFromDb);
            setUsers(finalUsers);
          }
        });

        // Fetch user relationships after login
        fetchUserData(user.id);

        return { success: true, user };
      }
      return { success: false, message: 'Invalid email or password.' };
    } catch (err) {
      console.error('Login error:', err.message);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('ch_current_user');
    updateSupabaseClient(null);
    supabase.auth.signOut().catch(err => console.error('Error signing out of Supabase:', err));
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  };

  const mergeNonEmptyFields = (existing, updates) => {
    if (!existing) return updates;
    if (!updates) return existing;

    const result = { ...existing };

    const isValEmpty = (v) => {
      if (v === undefined || v === null) return true;
      if (typeof v === 'string' && v.trim() === '') return true;
      if (Array.isArray(v) && v.length === 0) return true;
      if (typeof v === 'object' && Object.keys(v).length === 0) return true;
      return false;
    };

    const isExistingEmpty = (v) => {
      if (v === undefined || v === null) return true;
      if (typeof v === 'string' && v.trim() === '') return true;
      if (Array.isArray(v) && v.length === 0) return true;
      if (typeof v === 'object' && Object.keys(v).length === 0) return true;
      return false;
    };

    Object.keys(updates).forEach(key => {
      const val = updates[key];

      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const existingVal = existing[key] || {};
        const mergedObj = { ...existingVal };

        Object.keys(val).forEach(subKey => {
          const subVal = val[subKey];
          if (!isValEmpty(subVal)) {
            mergedObj[subKey] = subVal;
          } else if (!isExistingEmpty(existingVal[subKey])) {
            mergedObj[subKey] = existingVal[subKey];
          } else {
            mergedObj[subKey] = subVal;
          }
        });
        result[key] = mergedObj;
      } else {
        if (!isValEmpty(val)) {
          result[key] = val;
        } else if (!isExistingEmpty(existing[key])) {
          result[key] = existing[key];
        } else {
          result[key] = val;
        }
      }
    });

    return result;
  };

  const updateProfile = async (userId, updatedDetails) => {
    console.log('AppContext: updateProfile triggered for:', userId, updatedDetails);
    try {
      // 1. Validation before saving
      if (updatedDetails.fullName !== undefined && (!updatedDetails.fullName || updatedDetails.fullName.trim() === '')) {
        throw new Error('Full Name is required.');
      }
      if (updatedDetails.businessName !== undefined && (!updatedDetails.businessName || updatedDetails.businessName.trim() === '')) {
        throw new Error('Business Name is required.');
      }
      if (updatedDetails.email !== undefined) {
        const email = updatedDetails.email.trim().toLowerCase();
        if (!email) {
          throw new Error('Email is required.');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Please enter a valid email address.');
        }
        // Check for duplicate email (excluding this user)
        const { data: duplicateUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .neq('id', userId)
          .maybeSingle();
        if (duplicateUser) {
          throw new Error('This email is already registered. Please log in instead.');
        }
      }

      let merged = null;
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const mergedFields = mergeNonEmptyFields(u, updatedDetails);
          let logoImg = mergedFields.logo || mergedFields.profilePhoto || null;
          merged = { 
            ...mergedFields,
            logo: logoImg,
            profilePhoto: logoImg
          };
          merged.profileStrength = calculateProfileStrength(u.role, merged);
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(merged);
            localStorage.setItem('ch_current_user', JSON.stringify(merged));
          }
          profileCacheRef.current[userId] = merged;
          return merged;
        }
        return u;
      }));

      if (merged) {
        console.log('AppContext: Syncing profile changes to Supabase via UPSERT...');
        const { error } = await supabase
          .from('users')
          .upsert(mapUserToDb(merged), { onConflict: 'id' });
        
        if (error) {
          console.error('Error upserting user in Supabase:', error);
          throw new Error('Failed to save profile changes to the database: ' + error.message);
        }
        console.log('AppContext: Supabase profile sync completed.');
      }
    } catch (e) {
      console.error('Error in AppContext: updateProfile:', e);
      throw e;
    }
  };

  const calculateProfileStrength = (role, user) => {
    if (!user) return 0;
    let score = 0;

    // 1. Profile Photo (10%)
    if (user.logo || user.profilePhoto) {
      score += 10;
    }

    // 2. Banner (10%)
    if (user.coverBanner) {
      score += 10;
    }

    // 3. Basic Info (20%)
    if (user.fullName && (user.description || user.bio)) {
      score += 20;
    } else if (user.fullName || user.description || user.bio) {
      score += 10;
    }

    // 4. Contact Info (20%)
    let contactFields = 0;
    if (user.email) contactFields++;
    if (user.mobileNumber) contactFields++;
    if (user.whatsapp) contactFields++;
    if (user.contactPerson) contactFields++;
    if (user.address) contactFields++;
    if (contactFields >= 2) {
      score += 20;
    } else if (contactFields === 1) {
      score += 10;
    }

    // 5. Portfolio (15%)
    if (role === 'Business Holder') {
      if (user.teamSize || user.monthlyMarketingBudget || user.gst) {
        score += 15;
      }
    } else {
      if (user.portfolio && user.portfolio.length > 0) {
        score += 15;
      }
    }

    // 6. Social Links (10%)
    let hasSocial = false;
    if (user.socialLinks) {
      hasSocial = Object.values(user.socialLinks).some(val => val && val.trim() !== '');
    }
    if (user.website) hasSocial = true;
    if (hasSocial) {
      score += 10;
    }

    // 7. Category Details (15%)
    if (role === 'Business Holder') {
      if (user.businessName || user.businessCategory) {
        score += 15;
      }
    } else if (role === 'Freelancer') {
      if (user.freelancerCategory || user.experience || (user.skills && user.skills.length > 0)) {
        score += 15;
      }
    } else if (role === 'Influencer') {
      if (user.influencerNiche || user.followerCount || user.engagementRate) {
        score += 15;
      }
    }

    return Math.min(100, score);
  };

  // Activity feed helper
  const addActivity = (text) => {
    const newAct = {
      id: `act-${Date.now()}`,
      text,
      time: 'Just now'
    };
    setActivityFeed(prev => [newAct, ...prev.slice(0, 9)]);

    // Supabase Insert
    supabase.from('activities').insert([{ id: newAct.id, text: newAct.text, time: newAct.time }]).then(({ error }) => {
      if (error) console.error('Error inserting activity to Supabase:', error);
    });
  };

  // Project Operations
  const createProject = (projectDetails) => {
    const newProject = {
      id: `proj-${Date.now()}`,
      businessId: currentUser.id,
      businessName: currentUser.businessName || currentUser.fullName,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      proposals: [],
      invitedCreators: [],
      team: null,
      ...projectDetails
    };
    setProjects(prev => [newProject, ...prev]);
    addActivity(`${newProject.businessName} posted a new project: "${newProject.title}"`);

    // Supabase Insert
    supabase.from('projects').insert([mapProjectToDb(newProject)]).then(({ error }) => {
      if (error) console.error('Error inserting project to Supabase:', error);
    });

    return newProject;
  };

  const applyToProject = async (projectId, proposalOrPitch, rate) => {
    if (!currentUser) return;
    
    let pitch = '';
    let rateVal = '';
    if (typeof proposalOrPitch === 'object' && proposalOrPitch !== null) {
      pitch = proposalOrPitch.coverLetter || proposalOrPitch.pitch || '';
      rateVal = proposalOrPitch.pricing || proposalOrPitch.rate || '';
    } else {
      pitch = proposalOrPitch;
      rateVal = rate;
    }

    const app = {
      id: `app-${Date.now()}`,
      project_id: projectId,
      applicant_id: currentUser.id,
      pitch,
      rate: rateVal,
      status: 'Pending'
    };

    setApplications(prev => {
      if (prev.some(a => a.project_id === projectId && a.applicant_id === currentUser.id)) return prev;
      return [...prev, app];
    });

    const proj = projects.find(p => p.id === projectId);
    addActivity(`${currentUser.fullName} applied to project: "${proj?.title || 'Unknown'}"`);

    const { error } = await supabase.from('applications').insert([app]);
    if (error) {
      console.error('Error applying to project in Supabase:', error);
    } else {
      if (proj) {
        await addNotification(proj.businessId, {
          type: 'project_application',
          title: 'New Project Application',
          message: `${currentUser.fullName} applied to your requirement: "${proj.title}".`
        });
      }
    }
  };

  const acceptApplication = async (appId) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return null;

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Accepted' } : a));
    await supabase.from('applications').update({ status: 'Accepted' }).eq('id', appId);

    const proj = projects.find(p => p.id === app.project_id);
    if (proj) {
      const applicant = users.find(u => u.id === app.applicant_id);
      const assignedRole = applicant?.role === 'Influencer' ? 'Influencer' : 'Contractor';
      
      const newTeam = {
        members: { [assignedRole]: app.applicant_id },
        milestones: [
          { id: 'm-1', title: 'Concept Alignment & Briefing', status: 'Completed', deadline: '2026-06-25' },
          { id: 'm-2', title: 'UI Layout Drafts & Scripting', status: 'In Progress', deadline: '2026-07-05' },
          { id: 'm-3', title: 'Design Handoff & Video Editing Draft', status: 'Pending', deadline: '2026-07-20' },
          { id: 'm-4', title: 'Website Launch & Campaign Rollout', status: 'Pending', deadline: '2026-08-10' }
        ],
        payments: [
          { id: 'p-1', title: 'Initial Deposit (Escrowed)', amount: '₹1,000', status: 'Paid' },
          { id: 'p-2', title: 'Milestone 2 Release', amount: '₹1,200', status: 'Pending' },
          { id: 'p-3', title: 'Final Deliverable Settlement', amount: '₹1,300', status: 'Pending' }
        ],
        deliverables: [
          { id: 'd-1', title: 'Summer Campaign Branding Book', type: 'Figma File', status: 'Uploaded', url: 'https://figma.com/design-book' },
          { id: 'd-2', title: 'Commercial Video Hook (15s)', type: 'Video', status: 'Pending', url: '' }
        ]
      };

      setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, status: 'Active Workspace', team: newTeam } : p));
      await supabase.from('projects').update({
        status: 'Active Workspace',
        team: newTeam
      }).eq('id', proj.id);

      const initialMsg = {
        senderId: 'system',
        senderName: 'Creators Hub AI',
        text: 'Workspace successfully activated! Creator Team fully assembled. You can now chat, share files, track milestones, and manage payments in one central place.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [proj.id]: [...(prev[proj.id] || []), initialMsg]
      }));

      await supabase.from('messages').insert([{
        project_id: proj.id,
        sender_id: initialMsg.senderId,
        sender_name: initialMsg.senderName,
        text: initialMsg.text
      }]);

      const convId = await startConversation(app.applicant_id);

      await addNotification(app.applicant_id, {
        type: 'application_accepted',
        title: 'Application Accepted',
        message: `${currentUser.businessName || currentUser.fullName || 'Business'} accepted your application for "${proj.title}".`
      });

      addActivity(`Creator Team assembled for project: "${proj.title}"! Workspace activated.`);
      return convId;
    }
    return null;
  };

  const rejectApplication = async (appId) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'Rejected' } : a));
    await supabase.from('applications').update({ status: 'Rejected' }).eq('id', appId);

    const proj = projects.find(p => p.id === app.project_id);
    if (proj) {
      await addNotification(app.applicant_id, {
        type: 'application_rejected',
        title: 'Application Update',
        message: `Your application for "${proj.title}" was not selected.`
      });
    }
  };

  const addConnection = async (user1Id, user2Id) => {
    const connId = `conn-${Date.now()}`;
    const newConn = {
      id: connId,
      user_id1: user1Id < user2Id ? user1Id : user2Id,
      user_id2: user1Id < user2Id ? user2Id : user1Id
    };
    const { error } = await supabase.from('connections').insert([newConn]);
    if (error) console.error('Error adding connection:', error);
  };

  const inviteCreatorToProject = (projectId, creatorId) => {
    const creator = users.find(u => u.id === creatorId);
    let updatedProject = null;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        if (p.invitedCreators.includes(creatorId)) return p;
        updatedProject = {
          ...p,
          invitedCreators: [...p.invitedCreators, creatorId]
        };
        return updatedProject;
      }
      return p;
    }));
    if (creator) {
      addActivity(`Invited ${creator.fullName} to join "${projects.find(p => p.id === projectId)?.title}"`);
    }

    setTimeout(() => {
      if (updatedProject) {
        supabase.from('projects').update({ invited_creators: updatedProject.invitedCreators }).eq('id', projectId).then(({ error }) => {
          if (error) console.error('Error inviting to project in Supabase:', error);
        });
      }
    }, 0);
  };

  // USP Creator Teams Workspace Activation
  const activateCreatorTeam = (projectId, teamMembers) => {
    let updatedProject = null;
    const newTeam = {
      members: teamMembers,
      milestones: [
        { id: 'm-1', title: 'Concept Alignment & Briefing', status: 'Completed', deadline: '2026-06-25' },
        { id: 'm-2', title: 'UI Layout Drafts & Scripting', status: 'In Progress', deadline: '2026-07-05' },
        { id: 'm-3', title: 'Design Handoff & Video Editing Draft', status: 'Pending', deadline: '2026-07-20' },
        { id: 'm-4', title: 'Website Launch & Campaign Rollout', status: 'Pending', deadline: '2026-08-10' }
      ],
      payments: [
        { id: 'p-1', title: 'Initial Deposit (Escrowed)', amount: '₹1,000', status: 'Paid' },
        { id: 'p-2', title: 'Milestone 2 Release', amount: '₹1,200', status: 'Pending' },
        { id: 'p-3', title: 'Final Deliverable Settlement', amount: '₹1,300', status: 'Pending' }
      ],
      deliverables: [
        { id: 'd-1', title: 'Summer Campaign Branding Book', type: 'Figma File', status: 'Uploaded', url: 'https://figma.com/design-book' },
        { id: 'd-2', title: 'Commercial Video Hook (15s)', type: 'Video', status: 'Pending', url: '' }
      ]
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        updatedProject = {
          ...p,
          status: 'Active Workspace',
          team: newTeam
        };
        return updatedProject;
      }
      return p;
    }));

    if (!messages[projectId]) {
      const initialMsg = {
        senderId: 'system',
        senderName: 'Creators Hub AI',
        text: 'Workspace successfully activated! Creator Team fully assembled. You can now chat, share files, track milestones, and manage payments in one central place.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [projectId]: [initialMsg]
      }));

      supabase.from('messages').insert([{
        project_id: projectId,
        sender_id: initialMsg.senderId,
        sender_name: initialMsg.senderName,
        text: initialMsg.text
      }]);
    }

    const title = projects.find(p => p.id === projectId)?.title;
    addActivity(`Creator Team assembled for project: "${title}"! Workspace activated.`);

    setTimeout(() => {
      if (updatedProject) {
        supabase.from('projects').update({
          status: 'Active Workspace',
          team: newTeam
        }).eq('id', projectId).then(({ error }) => {
          if (error) console.error('Error activating creator team in Supabase:', error);
        });
      }
    }, 0);
  };

  // Messaging operations
  const sendMessage = (projectId, text, senderId, senderName) => {
    const newMsg = {
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newMsg]
    }));

    // Supabase Insert
    supabase.from('messages').insert([{
      project_id: projectId,
      sender_id: senderId,
      sender_name: senderName,
      text: text
    }]).then(({ error }) => {
      if (error) console.error('Error sending message to Supabase:', error);
    });
  };

  // Social operations
  const toggleSaveUser = (userId) => {
    if (!currentUser) return;
    let added = false;
    setSavedProfiles(prev => {
      const exists = prev.includes(userId);
      if (exists) {
        return prev.filter(id => id !== userId);
      } else {
        added = true;
        return [...prev, userId];
      }
    });

    if (added) {
      supabase.from('saved_profiles').insert([{ user_id: currentUser.id, saved_user_id: userId }]).then(({ error }) => {
        if (error) console.error('Error saving user in Supabase:', error);
      });
    } else {
      supabase.from('saved_profiles').delete().eq('user_id', currentUser.id).eq('saved_user_id', userId).then(({ error }) => {
        if (error) console.error('Error unsaving user in Supabase:', error);
      });
    }
  };

  const toggleFollowUser = (userId) => {
    if (!currentUser) return;
    let added = false;
    setFollowedProfiles(prev => {
      const exists = prev.includes(userId);
      const targetUser = users.find(u => u.id === userId);
      if (exists) {
        return prev.filter(id => id !== userId);
      } else {
        added = true;
        if (targetUser) {
          addActivity(`You started following ${targetUser.fullName}`);
        }
        return [...prev, userId];
      }
    });

    if (added) {
      supabase.from('followed_profiles').insert([{ user_id: currentUser.id, followed_user_id: userId }]).then(({ error }) => {
        if (error) console.error('Error following user in Supabase:', error);
      });
    } else {
      supabase.from('followed_profiles').delete().eq('user_id', currentUser.id).eq('followed_user_id', userId).then(({ error }) => {
        if (error) console.error('Error unfollowing user in Supabase:', error);
      });
    }
  };

  // AI Match Engine logic
  const calculateMatchPercentage = (business, creator) => {
    let score = 65; // Baseline match
    
    // Category match
    if (creator.role === 'Influencer') {
      const bizCat = business.businessCategory ? business.businessCategory.toLowerCase() : '';
      const hasOverlap = creator.contentCategories.some(cat => 
        cat.toLowerCase().includes(bizCat) || bizCat.includes(cat.toLowerCase())
      );
      if (hasOverlap) score += 15;
    } else {
      // Freelancer match based on business category and freelancer's skills/portfolio
      const bizCat = business.businessCategory ? business.businessCategory.toLowerCase() : '';
      if (bizCat === 'e-commerce' && creator.skills.some(s => s.toLowerCase().includes('react') || s.toLowerCase().includes('next.js'))) {
        score += 15;
      }
    }

    // Location compatibility
    if (creator.location && business.location && creator.location.split(',')[1] === business.location.split(',')[1]) {
      score += 10; // State-level match
    }

    // Rating boost
    if (creator.rating) {
      score += (creator.rating - 4.5) * 20; // 5.0 gets +10 points
    }

    // Verification boost
    if (creator.verificationStatus === 'Premium Verified') score += 10;
    else if (creator.verificationStatus === 'Professional Verified') score += 5;

    return Math.round(Math.min(99, score));
  };

  // Mock AI Profile Builder
  const generateAiProfileContent = (role, prompt) => {
    const cleanPrompt = prompt.toLowerCase();
    
    if (role === 'Influencer') {
      if (cleanPrompt.includes('travel') || cleanPrompt.includes('adventure')) {
        return {
          bio: 'Wanderlust-driven travel content creator documenting hidden boutique gems, outdoor adventures, and sustainable eco-tourism hubs.',
          description: 'Specializing in cinematic aesthetic reels on Instagram and high-quality vlogs on YouTube that motivate viewers to discover off-the-beaten-path destinations.',
          pricing: '₹850/Post',
          suggestedCategories: ['Travel', 'Lifestyle', 'Photography']
        };
      }
      return {
        bio: 'Tech-focused content creator translating complex digital trends, hardware engineering, and startup ideas into short, engaging social video packages.',
        description: 'Publishing deep-dive comparison guides and aesthetic daily-vlog workspaces that captivate tech enthusiasts and software engineers alike.',
        pricing: '₹1,200/Post',
        suggestedCategories: ['Technology', 'Education', 'Business']
      };
    } else {
      // Freelancer
      if (cleanPrompt.includes('design') || cleanPrompt.includes('ux') || cleanPrompt.includes('logo')) {
        return {
          bio: 'UI/UX Designer specializing in building pixel-perfect, clean, conversion-focused layout designs and comprehensive design systems for web apps.',
          description: 'Working closely with high-growth SaaS startups and modern brands to elevate their visual identity through glassmorphic styling and smooth animations.',
          skills: ['Figma', 'Adobe Creative Suite', 'UI/UX Design', 'Design Systems', 'Brand Identity'],
          experience: '4+ Years'
        };
      }
      return {
        bio: 'Full Stack Web Developer crafting high-performance, responsive React & Next.js client-side websites and robust Node.js backend frameworks.',
        description: 'Focusing on clean semantic layouts, speed optimization, and building secure, database-driven business admin controls and booking checkouts.',
        skills: ['React', 'Next.js', 'Node.js', 'JavaScript', 'CSS Modules', 'WebSockets'],
        experience: '5+ Years'
      };
    }
  };

  // P2P Messaging States
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeTabToRedirect, setActiveTabToRedirect] = useState(null);
  const [p2pMessages, setP2pMessages] = useState({});
  const [presenceList, setPresenceList] = useState({});

  // Custom Confirmation Modal state
  const [confirmationModal, setConfirmationModal] = useState(null);

  const showConfirmation = (config) => {
    return new Promise((resolve) => {
      setConfirmationModal({
        ...config,
        resolve
      });
    });
  };

  // Refs to prevent stale closures in realtime subscriptions
  const conversationsRef = useRef([]);
  const activeConversationIdRef = useRef(null);

  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);
  useEffect(() => { activeConversationIdRef.current = activeConversationId; }, [activeConversationId]);

  const syncConversationIfNeeded = async (conversationId) => {
    if (!currentUser || !conversationId) return;
    const exists = conversationsRef.current.some(c => c.id === conversationId);
    if (exists) return;

    console.log('syncConversationIfNeeded: fetching conversation details from DB for:', conversationId);
    try {
      const { data: membersData } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', conversationId);

      if (membersData && membersData.length > 0) {
        const members = membersData.map(m => m.user_id);
        if (members.includes(currentUser.id)) {
          const otherUserId = members.find(mId => mId !== currentUser.id);
          const conv = { id: conversationId, members, otherUserId };
          setConversations(prev => {
            if (prev.some(c => c.id === conversationId)) return prev;
            return [...prev, conv];
          });

          // Fetch messages for this conversation as well
          const { data: convMsgs } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
          
          if (convMsgs && convMsgs.length > 0) {
            const formatted = convMsgs.map(m => ({
              id: m.id,
              conversationId: m.conversation_id,
              senderId: m.sender_id,
              text: m.message,
              attachmentUrl: m.attachment_url,
              messageType: m.message_type,
              seen: m.seen,
              timestamp: m.created_at
            }));
            setP2pMessages(prev => ({
              ...prev,
              [conversationId]: formatted
            }));
          }
        }
      }
    } catch (e) {
      console.warn('Error syncing conversation dynamically:', e);
    }
  };

  // Sync P2P conversations and messages on load/currentUser change
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      return;
    }

    const fetchConversations = async () => {
      // 1. Fetch memberships where user_id is current user
      const { data: myMemberships, error: memErr } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', currentUser.id);

      if (memErr) {
        console.warn('Error fetching conversation memberships:', memErr.message);
        // Fallback to localStorage
        const savedConv = localStorage.getItem('ch_p2p_conversations');
        const savedMsgs = localStorage.getItem('ch_p2p_messages');
        if (savedConv) setConversations(JSON.parse(savedConv));
        if (savedMsgs) setP2pMessages(JSON.parse(savedMsgs));
        return;
      }

      if (!myMemberships || myMemberships.length === 0) {
        setConversations([]);
        setP2pMessages({});
        return;
      }

      const conversationIds = myMemberships.map(m => m.conversation_id);

      // 2. Fetch all members for these conversations to find the other user's info
      const { data: allMembers, error: allMemErr } = await supabase
        .from('conversation_members')
        .select('conversation_id, user_id')
        .in('conversation_id', conversationIds);

      if (allMemErr) {
        console.warn('Error fetching all conversation members:', allMemErr.message);
        return;
      }

      // Fetch conversations to get updated_at
      const { data: dbConvs } = await supabase
        .from('conversations')
        .select('id, updated_at')
        .in('id', conversationIds);

      // 3. Fetch latest 1 message for each conversation to populate list preview
      const latestMsgsPromises = conversationIds.map(cId => 
        supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', cId)
          .order('created_at', { ascending: false })
          .limit(1)
      );
      const latestMsgsResults = await Promise.all(latestMsgsPromises);

      const msgsGrouped = {};
      latestMsgsResults.forEach((result, idx) => {
        const dbMsgs = result.data;
        const cId = conversationIds[idx];
        if (dbMsgs && dbMsgs.length > 0) {
          const m = dbMsgs[0];
          msgsGrouped[cId] = [{
            id: m.id,
            conversationId: m.conversation_id,
            senderId: m.sender_id,
            text: m.message,
            attachmentUrl: m.attachment_url,
            messageType: m.message_type,
            seen: m.seen,
            timestamp: m.created_at
          }];
        } else {
          msgsGrouped[cId] = [];
        }
      });
      setP2pMessages(msgsGrouped);

      // Map conversation details
      const convList = conversationIds.map(cId => {
        const members = allMembers.filter(m => m.conversation_id === cId).map(m => m.user_id);
        const otherUserId = members.find(mId => mId !== currentUser.id);
        const dbConv = dbConvs ? dbConvs.find(dc => dc.id === cId) : null;
        return {
          id: cId,
          members,
          otherUserId,
          updatedAt: dbConv ? dbConv.updated_at : null
        };
      });

      setConversations(convList);
    };

    fetchConversations();
  }, [currentUser, users]);

  // Sync P2P LocalStorage


  // Realtime Messages Subscription (filtered at socket level for active conversation)
  useEffect(() => {
    if (!currentUser || !activeConversationId) return;

    console.log('Subscribing to realtime messages for conversation:', activeConversationId);
    const messagesSubscription = supabase
      .channel(`messages-${activeConversationId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${activeConversationId}`
      }, async (payload) => {
        const msg = payload.new;
        if (!msg) return;

        if (payload.eventType === 'INSERT') {
          await syncConversationIfNeeded(msg.conversation_id);

          const formattedMsg = {
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            text: msg.message,
            attachmentUrl: msg.attachment_url,
            messageType: msg.message_type,
            seen: msg.seen,
            timestamp: msg.created_at
          };

          setP2pMessages(prev => {
            const list = prev[msg.conversation_id] || [];
            if (list.some(m => m.id === formattedMsg.id)) return prev;
            return {
              ...prev,
              [msg.conversation_id]: [...list, formattedMsg]
            };
          });

          setConversations(prev => {
            return prev.map(c => {
              if (c.id === msg.conversation_id) {
                return { ...c, updatedAt: msg.created_at };
              }
              return c;
            });
          });

          if (msg.sender_id !== currentUser.id) {
            supabase
              .from('messages')
              .update({ seen: true })
              .eq('id', msg.id)
              .then(() => {});
          }
        } else if (payload.eventType === 'UPDATE') {
          setP2pMessages(prev => {
            const list = prev[msg.conversation_id] || [];
            const updated = list.map(m => m.id === msg.id ? { ...m, seen: msg.seen } : m);
            return {
              ...prev,
              [msg.conversation_id]: updated
            };
          });
        }
      })
      .subscribe();

    return () => {
      console.log('Unsubscribing from realtime messages for conversation:', activeConversationId);
      supabase.removeChannel(messagesSubscription);
    };
  }, [currentUser, activeConversationId, clientVersion]);

  // Load first 30 messages when activeConversationId changes
  useEffect(() => {
    if (activeConversationId) {
      loadMoreMessages(activeConversationId);
    }
  }, [activeConversationId]);

  // Presence Synchronization
  useEffect(() => {
    const fetchPresence = async () => {
      const { data, error } = await supabase.from('user_presence').select('*');
      if (error) {
        console.warn('Error fetching presence:', error.message);
        return;
      }
      if (data) {
        const presences = {};
        data.forEach(p => {
          presences[p.user_id] = {
            isOnline: p.is_online,
            lastSeen: p.last_seen
          };
        });
        setPresenceList(presences);
      }
    };

    fetchPresence();

    const presenceSubscription = supabase
      .channel('public:user_presence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, payload => {
        const pres = payload.new;
        if (pres) {
          setPresenceList(prev => ({
            ...prev,
            [pres.user_id]: {
              isOnline: pres.is_online,
              lastSeen: pres.last_seen
            }
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceSubscription);
    };
  }, [clientVersion]);

  // Update Presence for Online Statuses
  useEffect(() => {
    if (!currentUser) return;

    const setOnline = async () => {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: currentUser.id,
          is_online: true,
          last_seen: new Date().toISOString()
        });
    };

    setOnline();

    const setOffline = () => {
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${currentUser.id}`,
        JSON.stringify({ is_online: false, last_seen: new Date().toISOString() })
      );
    };

    window.addEventListener('beforeunload', setOffline);
    return () => {
      window.removeEventListener('beforeunload', setOffline);
      supabase
        .from('user_presence')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('user_id', currentUser.id)
        .then(() => {});
    };
  }, [currentUser]);

  // startConversation handler (creates P2P chat)
  const startConversation = async (targetUserId) => {
    if (!currentUser) return null;

    const existing = conversations.find(c => c.members.includes(targetUserId));
    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTabToRedirect('messages');
      return existing.id;
    }

    const newConvId = `conv-${Date.now()}`;
    const newConv = {
      id: newConvId,
      members: [currentUser.id, targetUserId],
      otherUserId: targetUserId,
      updatedAt: new Date().toISOString()
    };

    setConversations(prev => [...prev, newConv]);
    setActiveConversationId(newConvId);
    setActiveTabToRedirect('messages');

    try {
      await supabase.from('conversations').insert([{ id: newConvId }]);
      await supabase.from('conversation_members').insert([
        { id: `mem-1-${Date.now()}`, conversation_id: newConvId, user_id: currentUser.id },
        { id: `mem-2-${Date.now()}`, conversation_id: newConvId, user_id: targetUserId }
      ]);
    } catch (err) {
      console.error('Error creating conversation in Supabase:', err.message);
    }

    return newConvId;
  };

  // sendP2PMessage handler
  const sendP2PMessage = async (conversationId, text, attachmentUrl = null, messageType = 'text') => {
    if (!currentUser) return;

    const newMsgId = `msg-${Date.now()}`;
    const newMsg = {
      id: newMsgId,
      conversationId,
      senderId: currentUser.id,
      text,
      attachmentUrl,
      messageType,
      seen: false,
      timestamp: new Date().toISOString()
    };

    setP2pMessages(prev => {
      const list = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: [...list, newMsg]
      };
    });

    setConversations(prev => {
      return prev.map(c => {
        if (c.id === conversationId) {
          return { ...c, updatedAt: new Date().toISOString() };
        }
        return c;
      });
    });

    const { error } = await supabase
      .from('messages')
      .insert([{
        id: newMsgId,
        conversation_id: conversationId,
        sender_id: currentUser.id,
        message: text,
        attachment_url: attachmentUrl,
        message_type: messageType,
        seen: false
      }]);

    if (error) {
      console.error('Error sending P2P message to Supabase:', error.message);
    } else {
      // Touch conversation updated_at in database
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    // Send in-app notification to the receiver
    const conv = conversationsRef.current.find(c => c.id === conversationId);
    if (conv) {
      const receiverId = conv.members.find(mId => mId !== currentUser.id);
      if (receiverId) {
        const notifId = `notif-msg-${conversationId}-${Date.now()}`;
        const senderName = currentUser.fullName || currentUser.businessName || 'Someone';
        await supabase.from('notifications').insert([{
          id: notifId,
          user_id: receiverId,
          sender_id: currentUser.id,
          type: 'message',
          title: `${senderName} sent you a message`,
          message: text.length > 80 ? text.substring(0, 80) + '...' : text,
          read: false
        }]);
      }
    }
  };

  // markMessagesAsSeen handler
  const markMessagesAsSeen = async (conversationId) => {
    if (!currentUser) return;

    setP2pMessages(prev => {
      const list = prev[conversationId] || [];
      const updated = list.map(m => m.senderId !== currentUser.id ? { ...m, seen: true } : m);
      return {
        ...prev,
        [conversationId]: updated
      };
    });

    await supabase
      .from('messages')
      .update({ seen: true })
      .eq('conversation_id', conversationId)
      .not('sender_id', 'eq', currentUser.id)
      .eq('seen', false);
  };

  // === Connection System & Notifications ===
  const addNotification = async (targetUserId, notifData) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: targetUserId,
      sender_id: currentUser.id,
      type: notifData.type,
      title: notifData.title,
      message: notifData.message,
      read: false
    };
    await supabase.from('notifications').insert([newNotif]);
  };

  const markNotificationRead = async (notifId) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId);
  };

  const clearNotifications = async () => {
    await supabase.from('notifications').delete().eq('user_id', currentUser.id);
  };

  const markMessageNotificationsAsRead = async (conversationId) => {
    if (!currentUser || !conversationId) return;
    const prefix = `notif-msg-${conversationId}`;
    // Update local state
    setNotifications(prev => prev.map(n => 
      n.id && n.id.startsWith(prefix) && !n.read ? { ...n, read: true } : n
    ));
    // Update in database - fetch matching IDs and update them
    const { data: matchingNotifs } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('read', false)
      .like('id', `${prefix}%`);
    if (matchingNotifs && matchingNotifs.length > 0) {
      const ids = matchingNotifs.map(n => n.id);
      await supabase.from('notifications').update({ read: true }).in('id', ids);
    }
  };

  const isConnected = (userAId, userBId) => {
    return connections.some(c =>
      (c.user_id1 === userAId && c.user_id2 === userBId) ||
      (c.user_id1 === userBId && c.user_id2 === userAId)
    );
  };

  const getConnections = (userId) => {
    return connections
      .filter(c => c.user_id1 === userId || c.user_id2 === userId)
      .map(c => c.user_id1 === userId ? c.user_id2 : c.user_id1);
  };

  const sendConnectionRequest = async (targetUserId) => {
    const reqId = `req-${Date.now()}`;
    const newReq = {
      id: reqId,
      sender_id: currentUser.id,
      receiver_id: targetUserId,
      status: 'Pending'
    };
    // Optimistic update
    setConnectionRequests(prev => [...prev, newReq]);
    const { error } = await supabase.from('connection_requests').insert([newReq]);
    if (error) {
      // Revert on failure
      setConnectionRequests(prev => prev.filter(r => r.id !== reqId));
      console.error('Error sending connection request:', error.message);
    } else {
      const displayName = currentUser.fullName || currentUser.businessName || 'Someone';
      await addNotification(targetUserId, {
        type: 'connection_request',
        title: `🤝 ${displayName} sent you a connection request.`,
        message: ''
      });
    }
  };

  const acceptConnectionRequest = async (requestId, senderId) => {
    // Optimistic: remove the request and add the connection
    setConnectionRequests(prev => prev.filter(r => r.id !== requestId));
    const connId = `conn-${Date.now()}`;
    const newConn = {
      id: connId,
      user_id1: currentUser.id < senderId ? currentUser.id : senderId,
      user_id2: currentUser.id < senderId ? senderId : currentUser.id
    };
    setConnections(prev => [...prev, newConn]);

    // Optimistically remove the notification
    setNotifications(prev => prev.filter(n => 
      !(n.user_id === currentUser.id && n.sender_id === senderId && n.type === 'connection_request')
    ));

    await supabase.from('connection_requests').delete().eq('id', requestId);
    await supabase.from('notifications')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('sender_id', senderId)
      .eq('type', 'connection_request');

    const { error } = await supabase.from('connections').insert([newConn]);
    if (!error) {
      const sender = users.find(u => u.id === senderId);
      const senderName = sender?.fullName || sender?.businessName || 'Someone';
      const displayName = currentUser.fullName || currentUser.businessName || 'Someone';
      
      await addNotification(senderId, {
        type: 'connection_accepted',
        title: `You are now connected with ${displayName}.`,
        message: ''
      });
      await addNotification(currentUser.id, {
        type: 'connection_accepted',
        title: `You are now connected with ${senderName}.`,
        message: ''
      });
    }
  };

  const declineConnectionRequest = async (requestId, senderId = null) => {
    let resolvedSenderId = senderId;
    if (!resolvedSenderId) {
      const req = connectionRequests.find(r => r.id === requestId);
      resolvedSenderId = req ? req.sender_id : null;
    }

    setConnectionRequests(prev => prev.filter(r => r.id !== requestId));
    if (resolvedSenderId) {
      setNotifications(prev => prev.filter(n => 
        !(n.user_id === currentUser.id && n.sender_id === resolvedSenderId && n.type === 'connection_request')
      ));
    }

    await supabase.from('connection_requests').delete().eq('id', requestId);

    if (resolvedSenderId) {
      await supabase.from('notifications')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('sender_id', resolvedSenderId)
        .eq('type', 'connection_request');
    }
  };

  const removeConnection = async (targetUserId) => {
    setConnections(prev => prev.filter(c => 
      !(c.user_id1 === currentUser.id && c.user_id2 === targetUserId) &&
      !(c.user_id1 === targetUserId && c.user_id2 === currentUser.id)
    ));
    await supabase.from('connections')
      .delete()
      .or(`and(user_id1.eq.${currentUser.id},user_id2.eq.${targetUserId}),and(user_id1.eq.${targetUserId},user_id2.eq.${currentUser.id})`);
  };

  const isBlockedRelation = (targetUserId) => {
    return (blockedUsers || []).some(b => 
      (b.blocker_id === currentUser?.id && b.blocked_id === targetUserId) ||
      (b.blocker_id === targetUserId && b.blocked_id === currentUser?.id)
    );
  };

  const blockUser = async (targetUserId) => {
    if (!currentUser) return;
    const blockId = `block-${Date.now()}`;
    const newBlock = { id: blockId, blocker_id: currentUser.id, blocked_id: targetUserId };
    
    // Optimistic state updates
    setBlockedUsers(prev => [...prev, newBlock]);
    setConnections(prev => prev.filter(c => 
      !(c.user_id1 === currentUser.id && c.user_id2 === targetUserId) &&
      !(c.user_id1 === targetUserId && c.user_id2 === currentUser.id)
    ));
    setConnectionRequests(prev => prev.filter(r => 
      !(r.sender_id === currentUser.id && r.receiver_id === targetUserId) &&
      !(r.sender_id === targetUserId && r.receiver_id === currentUser.id)
    ));

    const conv = conversations.find(c => c.members.includes(targetUserId));
    if (conv) {
      setConversations(prev => prev.filter(c => c.id !== conv.id));
      setP2pMessages(prev => {
        const copy = { ...prev };
        delete copy[conv.id];
        return copy;
      });
      if (activeConversationId === conv.id) {
        setActiveConversationId(null);
      }
    }

    // Database updates
    await supabase.from('blocked_users').insert([newBlock]);
    await supabase.from('connections')
      .delete()
      .or(`and(user_id1.eq.${currentUser.id},user_id2.eq.${targetUserId}),and(user_id1.eq.${targetUserId},user_id2.eq.${currentUser.id})`);
    await supabase.from('connection_requests')
      .delete()
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUser.id})`);
    if (conv) {
      await supabase.from('conversations').delete().eq('id', conv.id);
    }
  };

  const unblockUser = async (targetUserId) => {
    if (!currentUser) return;
    setBlockedUsers(prev => prev.filter(b => !(b.blocker_id === currentUser.id && b.blocked_id === targetUserId)));
    await supabase.from('blocked_users')
      .delete()
      .eq('blocker_id', currentUser.id)
      .eq('blocked_id', targetUserId);
  };

  const deleteConversation = async (conversationId) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    setP2pMessages(prev => {
      const copy = { ...prev };
      delete copy[conversationId];
      return copy;
    });
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
    await supabase.from('conversations').delete().eq('id', conversationId);
  };

  return (
    <AppContext.Provider value={{
      users,
      projects,
      setProjects,
      applications,
      currentUser,
      activityFeed,
      savedProfiles,
      followedProfiles,
      messages,
      registerUser,
      loginUser,
      logoutUser,
      checkEmailExists,
      loginWithGoogle,
      updateProfile,
      fetchFullProfile,
      loadMoreMessages,
      createProject,
      applyToProject,
      acceptApplication,
      rejectApplication,
      addConnection,
      inviteCreatorToProject,
      activateCreatorTeam,
      sendMessage,
      toggleSaveUser,
      toggleFollowUser,
      calculateMatchPercentage,
      generateAiProfileContent,
      loading,
      initialized,
      theme,
      toggleTheme,
      conversations,
      activeConversationId,
      setActiveConversationId,
      activeTabToRedirect,
      setActiveTabToRedirect,
      p2pMessages,
      sendP2PMessage,
      startConversation,
      markMessagesAsSeen,
      presenceList,
      notifications,
      addNotification,
      markNotificationRead,
      clearNotifications,
      connections,
      isConnected,
      getConnections,
      connectionRequests,
      sendConnectionRequest,
      acceptConnectionRequest,
      declineConnectionRequest,
      removeConnection,
      activeDashboardTab,
      setActiveDashboardTab,
      markMessageNotificationsAsRead,
      blockedUsers,
      blockUser,
      unblockUser,
      deleteConversation,
      isBlockedRelation,
      confirmationModal,
      setConfirmationModal,
      showConfirmation
    }}>
      {children}
    </AppContext.Provider>
  );
};

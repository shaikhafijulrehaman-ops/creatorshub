/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { supabase, setSupabaseUserHeader } from '../supabaseClient';

export const AppContext = createContext();

const generateUserId = (role) => {
  const now = Date.now();
  return role === 'Business Holder' ? `bh-${now}` : (role === 'Influencer' ? `inf-${now}` : `fl-${now}`);
};

// Pre-seeded high quality profiles for immersive experience
const INITIAL_USERS = [];

const INITIAL_PROJECTS = [];

const INITIAL_ACTIVITIES = [];

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
    content_categories: user.contentCategories || null,
    platforms: user.platforms || null,
    followers_count: user.followersCount || null,
    average_reach: user.averageReach || null,
    engagement_rate: user.engagementRate || null,
    languages: user.languages || null,
    collaboration_pricing: user.collaborationPricing || null,
    verification_status: user.verificationStatus || 'Basic Verified',
    profile_strength: user.profileStrength || 15,
    rating: user.rating || 5.0,
    reviews: user.reviews || [],
    fraud_audit: user.fraudAudit || null,
    services: user.services || [],
    portfolio: user.portfolio || [],
    skills: user.skills || [],
    experience: user.experience || null,
    verification_requested: user.verificationRequested || false,
    phone_visibility: user.phoneVisibility || 'Private',
    email_visibility: user.emailVisibility || 'Private',
    website_visibility: user.websiteVisibility || 'Private',
    social_links_visibility: user.socialLinksVisibility || 'Private',
    contact_visibility: user.contactVisibility || 'Private'
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
    contentCategories: typeof dbUser.content_categories === 'string' ? JSON.parse(dbUser.content_categories) : (dbUser.content_categories || []),
    platforms: typeof dbUser.platforms === 'string' ? JSON.parse(dbUser.platforms) : (dbUser.platforms || {}),
    followersCount: dbUser.followers_count,
    averageReach: dbUser.average_reach,
    engagementRate: dbUser.engagement_rate,
    languages: typeof dbUser.languages === 'string' ? JSON.parse(dbUser.languages) : (dbUser.languages || []),
    collaborationPricing: dbUser.collaboration_pricing,
    verificationStatus: dbUser.verification_status,
    profileStrength: dbUser.profile_strength,
    rating: dbUser.rating ? parseFloat(dbUser.rating) : 5.0,
    reviews: typeof dbUser.reviews === 'string' ? JSON.parse(dbUser.reviews) : (dbUser.reviews || []),
    fraudAudit: typeof dbUser.fraud_audit === 'string' ? JSON.parse(dbUser.fraud_audit) : dbUser.fraud_audit,
    services: typeof dbUser.services === 'string' ? JSON.parse(dbUser.services) : (dbUser.services || []),
    portfolio: typeof dbUser.portfolio === 'string' ? JSON.parse(dbUser.portfolio) : (dbUser.portfolio || []),
    skills: typeof dbUser.skills === 'string' ? JSON.parse(dbUser.skills) : (dbUser.skills || []),
    experience: dbUser.experience,
    verificationRequested: dbUser.verification_requested,
    phoneVisibility: dbUser.phone_visibility || 'Private',
    emailVisibility: dbUser.email_visibility || 'Private',
    websiteVisibility: dbUser.website_visibility || 'Private',
    socialLinksVisibility: dbUser.social_links_visibility || 'Private',
    contactVisibility: dbUser.contact_visibility || 'Private'
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
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('ch_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ch_projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ch_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activityFeed, setActivityFeed] = useState(() => {
    const saved = localStorage.getItem('ch_activity');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedProfiles, setSavedProfiles] = useState(() => {
    const saved = localStorage.getItem('ch_saved');
    return saved ? JSON.parse(saved) : [];
  });

  const [followedProfiles, setFollowedProfiles] = useState(() => {
    const saved = localStorage.getItem('ch_followed');
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ch_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [loading, setLoading] = useState(() => {
    // Start with loading=false if we have cached data — render instantly from cache
    const hasCachedUser = localStorage.getItem('ch_current_user');
    const hasCachedUsers = localStorage.getItem('ch_users');
    return !(hasCachedUser || hasCachedUsers);
  });

  const [theme] = useState('light');

  const toggleTheme = () => {
    // Dark mode disabled
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'light');
  }, []);

  // Fetch initial data from Supabase, seed if empty, and sync local state
  useEffect(() => {
    const initData = async () => {
      try {
        // Don't set loading=true here — if we have cached data, we're already showing it
        // 1. Fetch Users
        const { data: dbUsers, error: usersErr } = await supabase.from('profiles').select('*');
        let finalUsers = [];
        if (usersErr) {
          console.warn('Error fetching users from Supabase:', usersErr);
          const saved = localStorage.getItem('ch_users');
          finalUsers = saved ? JSON.parse(saved) : [];
        } else {
          finalUsers = dbUsers ? dbUsers.map(mapUserFromDb) : [];
        }
        setUsers(finalUsers);
        localStorage.setItem('ch_users', JSON.stringify(finalUsers));

        // 2. Fetch Projects
        const { data: dbProjects, error: projErr } = await supabase.from('projects').select('*');
        let finalProjects = [];
        if (projErr) {
          console.warn('Error fetching projects from Supabase:', projErr);
          const saved = localStorage.getItem('ch_projects');
          finalProjects = saved ? JSON.parse(saved) : [];
        } else {
          finalProjects = dbProjects ? dbProjects.map(mapProjectFromDb) : [];
        }
        setProjects(finalProjects);
        localStorage.setItem('ch_projects', JSON.stringify(finalProjects));

        // 3. Fetch Activities
        const { data: dbActivities, error: actErr } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
        let finalActivities = [];
        if (actErr) {
          console.warn('Error fetching activities from Supabase:', actErr);
          const saved = localStorage.getItem('ch_activity');
          finalActivities = saved ? JSON.parse(saved) : [];
        } else {
          finalActivities = dbActivities || [];
        }
        setActivityFeed(finalActivities);
        localStorage.setItem('ch_activity', JSON.stringify(finalActivities));

        // 4. Fetch Messages
        const { data: dbMessages, error: msgErr } = await supabase.from('messages').select('*');
        const groupedMessages = {};
        if (msgErr) {
          console.warn('Error fetching messages from Supabase:', msgErr);
          const saved = localStorage.getItem('ch_messages');
          if (saved) Object.assign(groupedMessages, JSON.parse(saved));
        } else if (dbMessages && dbMessages.length > 0) {
          dbMessages.forEach(msg => {
            if (!groupedMessages[msg.project_id]) {
              groupedMessages[msg.project_id] = [];
            }
            groupedMessages[msg.project_id].push({
              senderId: msg.sender_id,
              senderName: msg.sender_name,
              text: msg.text,
              timestamp: msg.timestamp
            });
          });
        }
        setMessages(groupedMessages);
        localStorage.setItem('ch_messages', JSON.stringify(groupedMessages));

        // 5. Sync logged in user session & relationships
        let activeUser = null;

        // Check if there is an active Supabase Auth session (like Google OAuth redirect)
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (authSession?.user) {
          const { data: dbUser } = await supabase.from('users').select('*').eq('id', authSession.user.id).maybeSingle();
          if (dbUser) {
            activeUser = mapUserFromDb(dbUser);
          } else {
            // New user signed in via Google OAuth
            const googleName = authSession.user.user_metadata?.full_name || authSession.user.user_metadata?.name || 'Google User';
            const googleEmail = authSession.user.email;
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

            await supabase.from('users').insert([mapUserToDb(newUser)]);
            activeUser = newUser;

            // Update local users list
            setUsers(prev => {
              if (prev.some(u => u.id === newId)) return prev;
              return [...prev, newUser];
            });
          }
        } else {
          const cachedUser = localStorage.getItem('ch_current_user');
          if (cachedUser) {
            const parsedUser = JSON.parse(cachedUser);
            const { data: refreshedUser } = await supabase.from('users').select('*').eq('id', parsedUser.id).maybeSingle();
            if (refreshedUser) {
              activeUser = mapUserFromDb(refreshedUser);
            } else {
              activeUser = parsedUser;
            }
          }
        }

        if (activeUser) {
          setCurrentUser(activeUser);
          localStorage.setItem('ch_current_user', JSON.stringify(activeUser));

          const { data: dbSaved } = await supabase.from('saved_profiles').select('saved_user_id').eq('user_id', activeUser.id);
          const savedIds = dbSaved ? dbSaved.map(s => s.saved_user_id) : [];
          setSavedProfiles(savedIds);
          localStorage.setItem('ch_saved', JSON.stringify(savedIds));

          const { data: dbFollowed } = await supabase.from('followed_profiles').select('followed_user_id').eq('user_id', activeUser.id);
          const followedIds = dbFollowed ? dbFollowed.map(f => f.followed_user_id) : [];
          setFollowedProfiles(followedIds);
          localStorage.setItem('ch_followed', JSON.stringify(followedIds));
        }
      } catch (err) {
        console.error('Error loading Supabase data:', err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Sync state mutations to LocalStorage as a local cache/fallback
  useEffect(() => {
    localStorage.setItem('ch_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ch_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ch_current_user', JSON.stringify(currentUser));
      setSupabaseUserHeader(currentUser.id);
    } else {
      localStorage.removeItem('ch_current_user');
      setSupabaseUserHeader(null);
    }
  }, [currentUser]);

  // Auth Operations
  const registerUser = (role, basicDetails, profileDetails = {}, verificationLevel = 'Basic Verified') => {
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
      mobileNumber: '',
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
      ...profileDetails,
      verificationStatus: verificationLevel,
      rating: 5.0,
      reviews: [],
      ...(fraudAudit && { fraudAudit })
    };

    newUser.profileStrength = calculateProfileStrength(role, newUser);

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    addActivity(`${newUser.fullName} (${newUser.businessName || newUser.role}) joined Creators Hub!`);

    // Supabase Insert
    supabase.from('users').insert([mapUserToDb(newUser)]).then(({ error }) => {
      if (error) console.error('Error inserting user to Supabase:', error);
    });

    return newUser;
  };

  const loginUser = async (email, password) => {
    try {
      const { data, error } = await supabase.rpc('login_user', { p_email: email, p_password: password });
      if (error) throw error;
      
      if (data && data.length > 0) {
        const user = mapUserFromDb(data[0]);
        setCurrentUser(user);
        localStorage.setItem('ch_current_user', JSON.stringify(user));
        setSupabaseUserHeader(user.id);
        
        // Refresh users list from profiles view now that we are logged in and session header is set
        supabase.from('profiles').select('*').then(({ data: refreshedUsers }) => {
          if (refreshedUsers) {
            const finalUsers = refreshedUsers.map(mapUserFromDb);
            setUsers(finalUsers);
            localStorage.setItem('ch_users', JSON.stringify(finalUsers));
          }
        });

        return { success: true, user };
      }
      return { success: false, message: 'Invalid email or password.' };
    } catch (err) {
      console.error('Login error:', err.message);
      return { success: false, message: 'Login failed: ' + err.message };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
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

  const updateProfile = (userId, updatedDetails) => {
    let merged = null;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        merged = { ...u, ...updatedDetails };
        merged.profileStrength = calculateProfileStrength(u.role, merged);
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(merged);
        }
        return merged;
      }
      return u;
    }));

    setTimeout(() => {
      if (merged) {
        supabase.from('users').update(mapUserToDb(merged)).eq('id', userId).then(({ error }) => {
          if (error) console.error('Error updating user in Supabase:', error);
        });
      }
    }, 0);
  };

  // Helper to calculate profile strength dynamically
  const calculateProfileStrength = (role, user) => {
    if (!user) return 15;
    let score = 15; // baseline
    if (role === 'Business Holder') {
      const hasBusinessProfile = user.businessName && user.businessCategory && user.description;
      const hasContactDetails = user.mobileNumber && user.address;
      const hasVerification = user.verificationRequested || (user.verificationStatus && user.verificationStatus !== 'Basic Verified');
      const hasPreferences = user.teamSize && user.monthlyMarketingBudget && user.website;
      
      if (hasBusinessProfile) score += 25; // to 40%
      if (hasContactDetails) score += 20;  // to 60%
      if (hasVerification) score += 20;    // to 80%
      if (hasPreferences) score += 20;      // to 100%
    } else if (role === 'Influencer') {
      const hasContentCategory = user.contentCategories && user.contentCategories.length > 0;
      const hasPlatform = user.platforms && Object.keys(user.platforms).length > 0;
      const hasProfileUrl = user.profileUrl || (user.platforms && Object.values(user.platforms).some(p => p.url));
      const hasVerification = user.verificationRequested || (user.verificationStatus && user.verificationStatus !== 'Basic Verified');
      const hasAudienceDetails = user.followersCount && user.averageReach && user.collaborationPricing && user.bio;
      
      if (hasContentCategory) score += 5;   // to 20%
      if (hasPlatform) score += 20;         // to 40%
      if (hasProfileUrl) score += 20;       // to 60%
      if (hasVerification) score += 20;     // to 80%
      if (hasAudienceDetails) score += 20;  // to 100%
    } else {
      const hasServices = user.services && user.services.length > 0;
      const hasPortfolio = user.portfolio && user.portfolio.length > 0;
      const hasPreviousWork = user.experience && user.bio;
      const hasSkills = user.skills && user.skills.length > 0;
      const hasVerification = user.verificationRequested || (user.verificationStatus && user.verificationStatus !== 'Basic Verified');
      
      if (hasServices) score += 5;          // to 20%
      if (hasPortfolio) score += 20;         // to 40%
      if (hasPreviousWork) score += 20;      // to 60%
      if (hasSkills) score += 20;            // to 80%
      if (hasVerification) score += 20;      // to 100%
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

  const applyToProject = (projectId, proposal) => {
    let updatedProject = null;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const exists = p.proposals.some(prop => prop.creatorId === proposal.creatorId);
        if (exists) return p;
        updatedProject = {
          ...p,
          proposals: [...p.proposals, { ...proposal, status: 'Pending' }]
        };
        return updatedProject;
      }
      return p;
    }));
    addActivity(`${proposal.creatorName} submitted a proposal for "${projects.find(p => p.id === projectId)?.title}"`);

    setTimeout(() => {
      if (updatedProject) {
        supabase.from('projects').update({ proposals: updatedProject.proposals }).eq('id', projectId).then(({ error }) => {
          if (error) console.error('Error applying to project in Supabase:', error);
        });
      }
    }, 0);
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

      if (!myMemberships || myMemberships.length === 0) return;

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

      // 3. Fetch all messages for these conversations
      const { data: allMsgs, error: msgsErr } = await supabase
        .from('messages')
        .select('*')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true });

      if (msgsErr) {
        console.warn('Error fetching P2P messages:', msgsErr.message);
      }

      // Group messages by conversation ID
      const msgsGrouped = {};
      if (allMsgs) {
        allMsgs.forEach(m => {
          if (!msgsGrouped[m.conversation_id]) {
            msgsGrouped[m.conversation_id] = [];
          }
          msgsGrouped[m.conversation_id].push({
            id: m.id,
            conversationId: m.conversation_id,
            senderId: m.sender_id,
            text: m.message,
            attachmentUrl: m.attachment_url,
            messageType: m.message_type,
            seen: m.seen,
            timestamp: m.created_at
          });
        });
      }
      setP2pMessages(msgsGrouped);

      // Map conversation details
      const convList = conversationIds.map(cId => {
        const members = allMembers.filter(m => m.conversation_id === cId).map(m => m.user_id);
        const otherUserId = members.find(mId => mId !== currentUser.id);
        return {
          id: cId,
          members,
          otherUserId
        };
      });

      setConversations(convList);
    };

    fetchConversations();
  }, [currentUser, users]);

  // Sync P2P LocalStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('ch_p2p_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (Object.keys(p2pMessages).length > 0) {
      localStorage.setItem('ch_p2p_messages', JSON.stringify(p2pMessages));
    }
  }, [p2pMessages]);

  // Realtime Messages Subscription
  useEffect(() => {
    if (!currentUser) return;

    const messagesSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        const msg = payload.new;
        if (!msg) return;

        const conv = conversations.find(c => c.id === msg.conversation_id);
        if (!conv) return;

        if (payload.eventType === 'INSERT') {
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

          if (activeConversationId === msg.conversation_id && msg.sender_id !== currentUser.id) {
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
      supabase.removeChannel(messagesSubscription);
    };
  }, [currentUser, conversations, activeConversationId]);

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
  }, []);

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
      otherUserId: targetUserId
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

  return (
    <AppContext.Provider value={{
      users,
      projects,
      currentUser,
      activityFeed,
      savedProfiles,
      followedProfiles,
      messages,
      registerUser,
      loginUser,
      logoutUser,
      loginWithGoogle,
      updateProfile,
      createProject,
      applyToProject,
      inviteCreatorToProject,
      activateCreatorTeam,
      sendMessage,
      toggleSaveUser,
      toggleFollowUser,
      calculateMatchPercentage,
      generateAiProfileContent,
      loading,
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
      presenceList
    }}>
      {children}
    </AppContext.Provider>
  );
};

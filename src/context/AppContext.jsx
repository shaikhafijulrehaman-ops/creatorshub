/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const AppContext = createContext();

const generateUserId = (role) => {
  const now = Date.now();
  return role === 'Business Holder' ? `bh-${now}` : (role === 'Influencer' ? `inf-${now}` : `fl-${now}`);
};

// Pre-seeded high quality profiles for immersive experience
const INITIAL_USERS = [
  // Business Holders
  {
    id: 'bh-1',
    role: 'Business Holder',
    fullName: 'Robert Sterling',
    email: 'robert@sterlingcafe.com',
    mobileNumber: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    businessName: 'Sterling Cafe & Co.',
    businessCategory: 'Cafe',
    password: 'password123',
    logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&auto=format&fit=crop&q=80',
    description: 'An artisan bakery and cafe franchise known for micro-batch roasted coffee and organic sourdough pastries.',
    website: 'https://sterlingcafe.co',
    socialLinks: { instagram: 'https://instagram.com/sterlingcafe', twitter: 'https://twitter.com/sterlingcafe' },
    address: '456 Market St, San Francisco, CA',
    teamSize: '15-50',
    monthlyMarketingBudget: '₹5,000 - ₹10,000',
    verificationStatus: 'Premium Verified',
    profileStrength: 95,
  },
  {
    id: 'bh-2',
    role: 'Business Holder',
    fullName: 'Amanda Vance',
    email: 'amanda@aurorahotels.com',
    mobileNumber: '+1 (555) 987-6543',
    location: 'Miami, FL',
    businessName: 'Aurora Boutique Hotels',
    businessCategory: 'Hotel',
    password: 'password123',
    logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80',
    description: 'Luxury eco-friendly beach hotels providing immersive wellness retreats and high-end gastronomy.',
    website: 'https://aurorahotels.com',
    socialLinks: { instagram: 'https://instagram.com/aurorahotels' },
    address: '100 Ocean Dr, Miami, FL',
    teamSize: '50-100',
    monthlyMarketingBudget: '₹20,000+',
    verificationStatus: 'Professional Verified',
    profileStrength: 90,
  },

  // Influencers
  {
    id: 'inf-1',
    role: 'Influencer',
    fullName: 'Emma Watson (Emma Vlogs)',
    email: 'emma@emmavlogs.com',
    mobileNumber: '+1 (555) 246-8101',
    location: 'Los Angeles, CA',
    password: 'password123',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    contentCategories: ['Travel', 'Lifestyle', 'Fashion'],
    platforms: {
      Instagram: { url: 'https://instagram.com/emmavlogs', followers: '450K', reach: '1.2M', engagement: '4.8%' },
      YouTube: { url: 'https://youtube.com/emmavlogs', followers: '820K', reach: '3M', engagement: '6.2%' }
    },
    followersCount: '1.27M Total',
    averageReach: '4.2M Monthly',
    engagementRate: '5.5%',
    languages: ['English', 'Spanish'],
    collaborationPricing: '₹1,500/Post',
    bio: 'Visual storyteller exploring luxury eco-destinations and highlighting sustainable fashion brands worldwide.',
    verificationStatus: 'Premium Verified',
    profileStrength: 100,
    rating: 4.9,
    reviews: [
      { id: 'r-1', businessName: 'Aurora Boutique Hotels', rating: 5, comment: 'Phenomenal reach! Our room bookings grew by 24% during Emma\'s stay campaign.' }
    ],
    fraudAudit: {
      fakeFollowers: '3.1%', // low
      engagementAuthenticity: 'Excellent',
      suspiciousGrowth: 'None',
      badge: 'Verified Audience'
    }
  },
  {
    id: 'inf-2',
    role: 'Influencer',
    fullName: 'Alex Carter (Alex Tech)',
    email: 'alex@techreview.com',
    mobileNumber: '+1 (555) 369-1215',
    location: 'Austin, TX',
    password: 'password123',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    contentCategories: ['Technology', 'Education'],
    platforms: {
      YouTube: { url: 'https://youtube.com/alextech', followers: '1.2M', reach: '5M', engagement: '8.5%' },
      LinkedIn: { url: 'https://linkedin.com/in/alextech', followers: '95K', reach: '200K', engagement: '4.1%' }
    },
    followersCount: '1.295M Total',
    averageReach: '5.2M Monthly',
    engagementRate: '8.2%',
    languages: ['English'],
    collaborationPricing: '₹3,000/Video',
    bio: 'No-nonsense review of consumer hardware, developer tools, and cutting-edge software products.',
    verificationStatus: 'Professional Verified',
    profileStrength: 92,
    rating: 4.8,
    reviews: [],
    fraudAudit: {
      fakeFollowers: '12.4%', // medium
      engagementAuthenticity: 'Normal',
      suspiciousGrowth: 'Spike in Jan 2026',
      badge: 'Suspicious Activity Warning'
    }
  },
  {
    id: 'inf-3',
    role: 'Influencer',
    fullName: 'Chloe Jean',
    email: 'chloe@eatwithchloe.com',
    mobileNumber: '+1 (555) 482-9018',
    location: 'Chicago, IL',
    password: 'password123',
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    contentCategories: ['Food', 'Lifestyle'],
    platforms: {
      Instagram: { url: 'https://instagram.com/eatwithchloe', followers: '180K', reach: '500K', engagement: '5.9%' }
    },
    followersCount: '180K',
    averageReach: '500K Monthly',
    engagementRate: '5.9%',
    languages: ['English', 'French'],
    collaborationPricing: '₹750/Post',
    bio: 'Finding the finest street food, hidden bistros, and high-end culinary concepts across North America.',
    verificationStatus: 'Basic Verified',
    profileStrength: 85,
    rating: 4.7,
    reviews: [
      { id: 'r-2', businessName: 'Sterling Cafe & Co.', rating: 4.5, comment: 'Chloe did a lovely Instagram Reels highlight of our sourdough croissants.' }
    ],
    fraudAudit: {
      fakeFollowers: '1.8%',
      engagementAuthenticity: 'Excellent',
      suspiciousGrowth: 'None',
      badge: 'Verified Audience'
    }
  },

  // Freelancers
  {
    id: 'fl-1',
    role: 'Freelancer',
    fullName: 'Liam Dev (Liam O\'Connor)',
    email: 'liam@devstudio.com',
    mobileNumber: '+1 (555) 753-1598',
    location: 'New York, NY',
    password: 'password123',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    services: ['Website Development', 'App Development'],
    portfolio: [
      { service: 'Website Development', type: 'Link', url: 'https://hyperloopcommerce.com', description: 'Next.js e-commerce app with custom WebGL animations.' },
      { service: 'App Development', type: 'Link', url: 'https://fitnesstracker.app', description: 'React Native workout companion with offline sync.' }
    ],
    skills: ['React', 'Next.js', 'Node.js', 'React Native', 'GraphQL', 'WebGL'],
    experience: '6 Years (Ex-Stripe Developer)',
    verificationStatus: 'Premium Verified',
    profileStrength: 98,
    rating: 5.0,
    reviews: [
      { id: 'r-3', businessName: 'Sterling Cafe & Co.', rating: 5.0, comment: 'Liam built our custom ordering website. It is insanely fast and beautiful!' }
    ]
  },
  {
    id: 'fl-2',
    role: 'Freelancer',
    fullName: 'Sophia Miller',
    email: 'sophia@millersigns.com',
    mobileNumber: '+1 (555) 864-2017',
    location: 'Seattle, WA',
    password: 'password123',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    services: ['UI/UX Design', 'Graphic Design', 'Logo Design'],
    portfolio: [
      { service: 'UI/UX Design', type: 'Link', url: 'https://dribbble.com/shots/sophia-saas', description: 'Glassmorphic Web Dashboard mockup.' }
    ],
    skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'Design Systems', 'Brand Identity'],
    experience: '4 Years',
    verificationStatus: 'Professional Verified',
    profileStrength: 90,
    rating: 4.8,
    reviews: []
  },
  {
    id: 'fl-3',
    role: 'Freelancer',
    fullName: 'Noah Wilder',
    email: 'noah@wildercut.com',
    mobileNumber: '+1 (555) 951-7382',
    location: 'Portland, OR',
    password: 'password123',
    profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    services: ['Video Editing', 'AI Video Creation'],
    portfolio: [
      { service: 'Video Editing', type: 'Link', url: 'https://vimeo.com/7123984', description: 'Cinematic brand commercial edit for outdoor products.' }
    ],
    skills: ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Runway ML', 'Midjourney'],
    experience: '5 Years',
    verificationStatus: 'Professional Verified',
    profileStrength: 88,
    rating: 4.6,
    reviews: []
  }
];

const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    businessId: 'bh-1',
    businessName: 'Sterling Cafe & Co.',
    title: 'Modern Summer Campaign Launch',
    category: 'Cafe',
    description: 'We are looking to promote our new organic cold brew series and ice pastries. We need a combination of video editing, influencer posts, and a landing page refresh.',
    budget: '₹3,500',
    deadline: '2026-08-15',
    attachments: ['summer_concept.pdf'],
    proposals: [
      { creatorId: 'inf-3', creatorName: 'Chloe Jean', coverLetter: 'I would love to highlight your drinks at Sterling Cafe. My Chicago food audience absolutely loves coffee reels!', pricing: '₹750', daysToComplete: 10, status: 'Pending' },
      { creatorId: 'fl-3', creatorName: 'Noah Wilder', coverLetter: 'I can create premium high-energy kinetic text video commercials using your footage.', pricing: '₹1,200', daysToComplete: 7, status: 'Pending' }
    ],
    invitedCreators: ['inf-1', 'fl-1'],
    status: 'Open',
    createdAt: '2026-06-12',
    team: null // when created, turns into { members: { 'Influencer': 'inf-x', 'Developer': 'fl-y' }, chat: [] }
  }
];

const INITIAL_ACTIVITIES = [
  { id: 'act-1', text: 'Emma Watson verified her Audience Authenticity with score of 96.9%.', time: '2 hours ago' },
  { id: 'act-2', text: 'Sterling Cafe & Co. posted a new project: Modern Summer Campaign Launch.', time: '1 day ago' },
  { id: 'act-3', text: 'Liam Dev was premium verified after manual review.', time: '2 days ago' },
  { id: 'act-4', text: 'Alex Tech reached 1.2M subscribers on YouTube.', time: '3 days ago' }
];

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
    verification_requested: user.verificationRequested || false
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
    verificationRequested: dbUser.verification_requested
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
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ch_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ch_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activityFeed, setActivityFeed] = useState(() => {
    const saved = localStorage.getItem('ch_activity');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
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
    return saved ? JSON.parse(saved) : {
      'proj-1': [
        { senderId: 'bh-1', senderName: 'Robert Sterling', text: 'Hi everyone! Welcome to our workspace. Super excited to collaborate!', timestamp: '2026-06-13T10:00:00Z' }
      ]
    };
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
        // 1. Fetch Users
        const { data: dbUsers, error: usersErr } = await supabase.from('users').select('*');
        let finalUsers = [];
        if (usersErr) {
          console.warn('Error fetching users from Supabase, falling back to local mocks:', usersErr);
          const saved = localStorage.getItem('ch_users');
          finalUsers = saved ? JSON.parse(saved) : INITIAL_USERS;
        } else if (!dbUsers || dbUsers.length === 0) {
          const mappedUsers = INITIAL_USERS.map(mapUserToDb);
          const { error: seedUsersErr } = await supabase.from('users').insert(mappedUsers);
          if (seedUsersErr) console.error('Error seeding users:', seedUsersErr);
          finalUsers = INITIAL_USERS;
        } else {
          finalUsers = dbUsers.map(mapUserFromDb);
        }
        setUsers(finalUsers);
        localStorage.setItem('ch_users', JSON.stringify(finalUsers));

        // 2. Fetch Projects
        const { data: dbProjects, error: projErr } = await supabase.from('projects').select('*');
        let finalProjects = [];
        if (projErr) {
          console.warn('Error fetching projects from Supabase, falling back to local mocks:', projErr);
          const saved = localStorage.getItem('ch_projects');
          finalProjects = saved ? JSON.parse(saved) : INITIAL_PROJECTS;
        } else if (!dbProjects || dbProjects.length === 0) {
          const mappedProj = INITIAL_PROJECTS.map(mapProjectToDb);
          const { error: seedProjErr } = await supabase.from('projects').insert(mappedProj);
          if (seedProjErr) console.error('Error seeding projects:', seedProjErr);
          finalProjects = INITIAL_PROJECTS;
        } else {
          finalProjects = dbProjects.map(mapProjectFromDb);
        }
        setProjects(finalProjects);
        localStorage.setItem('ch_projects', JSON.stringify(finalProjects));

        // 3. Fetch Activities
        const { data: dbActivities, error: actErr } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
        let finalActivities = [];
        if (actErr) {
          console.warn('Error fetching activities from Supabase, falling back to local mocks:', actErr);
          const saved = localStorage.getItem('ch_activity');
          finalActivities = saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
        } else if (!dbActivities || dbActivities.length === 0) {
          const mappedAct = INITIAL_ACTIVITIES.map(a => ({ id: a.id, text: a.text, time: a.time }));
          await supabase.from('activities').insert(mappedAct);
          finalActivities = INITIAL_ACTIVITIES;
        } else {
          finalActivities = dbActivities;
        }
        setActivityFeed(finalActivities);
        localStorage.setItem('ch_activity', JSON.stringify(finalActivities));

        // 4. Fetch Messages
        const { data: dbMessages, error: msgErr } = await supabase.from('messages').select('*');
        const groupedMessages = {};
        if (msgErr) {
          console.warn('Error fetching messages from Supabase, falling back to local mocks:', msgErr);
          const saved = localStorage.getItem('ch_messages');
          if (saved) {
            Object.assign(groupedMessages, JSON.parse(saved));
          } else {
            groupedMessages['proj-1'] = [{
              senderId: 'bh-1',
              senderName: 'Robert Sterling',
              text: 'Hi everyone! Welcome to our workspace. Super excited to collaborate!',
              timestamp: new Date().toISOString()
            }];
          }
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
        } else {
          const initialMsg = {
            project_id: 'proj-1',
            sender_id: 'bh-1',
            sender_name: 'Robert Sterling',
            text: 'Hi everyone! Welcome to our workspace. Super excited to collaborate!'
          };
          await supabase.from('messages').insert([initialMsg]);
          groupedMessages['proj-1'] = [{
            senderId: 'bh-1',
            senderName: 'Robert Sterling',
            text: 'Hi everyone! Welcome to our workspace. Super excited to collaborate!',
            timestamp: new Date().toISOString()
          }];
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
    } else {
      localStorage.removeItem('ch_current_user');
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

  const loginUser = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password.' };
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
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

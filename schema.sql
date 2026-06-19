-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Create users table
create table if not exists public.users (
    id text primary key,
    role text not null,
    email text not null unique,
    password text not null,
    full_name text not null,
    mobile_number text,
    location text,
    description text,
    business_name text,
    business_category text,
    logo text,
    profile_photo text,
    bio text,
    website text,
    team_size text,
    monthly_marketing_budget text,
    content_categories text, -- JSON array string
    platforms text, -- JSON object string
    followers_count text,
    average_reach text,
    engagement_rate text,
    languages text, -- JSON array string
    collaboration_pricing text,
    verification_status text default 'Basic Verified',
    profile_strength integer default 15,
    rating text default '5.0',
    reviews text, -- JSON array string
    fraud_audit text, -- JSON object string
    services text, -- JSON array string
    portfolio text, -- JSON array string
    skills text, -- JSON array string
    experience text,
    verification_requested boolean default false,
    phone_visibility text default 'Private',
    email_visibility text default 'Private',
    website_visibility text default 'Private',
    social_links_visibility text default 'Private',
    contact_visibility text default 'Private',
    cover_banner text,
    whatsapp text,
    gst text,
    contact_person text,
    address text,
    social_links text,
    field_visibility text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create projects table
create table if not exists public.projects (
    id text primary key,
    business_id text references public.users(id) on delete cascade not null,
    business_name text,
    title text not null,
    category text,
    description text,
    budget text,
    deadline text,
    status text default 'Open',
    attachments jsonb default '[]'::jsonb,
    proposals jsonb default '[]'::jsonb,
    team jsonb default null,
    invited_creators jsonb default '[]'::jsonb,
    remote_type text default 'Remote',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create applications table
create table if not exists public.applications (
    id text primary key,
    project_id text references public.projects(id) on delete cascade not null,
    applicant_id text references public.users(id) on delete cascade not null,
    pitch text,
    rate text,
    status text default 'Pending' not null, -- 'Pending', 'Accepted', 'Rejected', 'Completed'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(project_id, applicant_id)
);

-- 4. Create activities table
create table if not exists public.activities (
    id serial primary key,
    text text not null,
    time text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create conversations table
create table if not exists public.conversations (
    id text primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create conversation_members table
create table if not exists public.conversation_members (
    id text primary key,
    conversation_id text references public.conversations(id) on delete cascade not null,
    user_id text references public.users(id) on delete cascade not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(conversation_id, user_id)
);

-- 7. Create messages table
create table if not exists public.messages (
    id text primary key,
    conversation_id text references public.conversations(id) on delete cascade not null,
    sender_id text references public.users(id) on delete cascade not null,
    message text not null,
    attachment_url text,
    message_type text default 'text'::text not null,
    seen boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create user_presence table
create table if not exists public.user_presence (
    user_id text references public.users(id) on delete cascade primary key,
    is_online boolean default false not null,
    last_seen timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create connections table
create table if not exists public.connections (
    id text primary key,
    user_id1 text references public.users(id) on delete cascade not null,
    user_id2 text references public.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id1, user_id2)
);

-- 10. Create connection_requests table
create table if not exists public.connection_requests (
    id text primary key,
    sender_id text references public.users(id) on delete cascade not null,
    receiver_id text references public.users(id) on delete cascade not null,
    status text default 'Pending' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(sender_id, receiver_id)
);

-- 11. Create notifications table
create table if not exists public.notifications (
    id text primary key,
    user_id text references public.users(id) on delete cascade not null,
    sender_id text references public.users(id) on delete cascade,
    type text not null,
    title text not null,
    message text not null,
    read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.applications enable row level security;
alter table public.activities enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.user_presence enable row level security;
alter table public.connections enable row level security;
alter table public.connection_requests enable row level security;
alter table public.notifications enable row level security;

-- Helper function to get current user ID
create or replace function public.current_user_id()
returns text as $$
begin
    return coalesce(
        nullif(current_setting('request.jwt.claims', true)::json->>'sub', ''),
        nullif(current_setting('request.headers', true)::json->>'x-user-id', '')
    );
end;
$$ language plpgsql security definer;

-- Configure RLS Policies
create policy "Users can select their own user row" on public.users for select using (id = public.current_user_id());
create policy "Anyone can insert user row" on public.users for insert with check (true);
create policy "Users can update their own user row" on public.users for update using (id = public.current_user_id());

create policy "Allow public read/write projects" on public.projects for all using (true);
create policy "Allow public read/write activities" on public.activities for all using (true);

-- Applications Policies
create policy "View applications" on public.applications
    for select using (
        applicant_id = public.current_user_id() or
        exists (
            select 1 from public.projects
            where projects.id = applications.project_id
            and projects.business_id = public.current_user_id()
        )
    );
create policy "Insert applications" on public.applications for insert with check (applicant_id = public.current_user_id());
create policy "Update/Delete applications" on public.applications
    for all using (
        applicant_id = public.current_user_id() or
        exists (
            select 1 from public.projects
            where projects.id = applications.project_id
            and projects.business_id = public.current_user_id()
        )
    );

-- Conversations Policies
create policy "View conversations" on public.conversations
    for select using (
        exists (
            select 1 from public.conversation_members
            where conversation_members.conversation_id = conversations.id
            and conversation_members.user_id = public.current_user_id()
        )
    );
create policy "Insert conversations" on public.conversations for insert with check (true);

-- Conversation Members Policies
create policy "View conversation members" on public.conversation_members
    for select using (
        exists (
            select 1 from public.conversation_members m
            where m.conversation_id = conversation_members.conversation_id
            and m.user_id = public.current_user_id()
        )
    );
create policy "Insert conversation members" on public.conversation_members for insert with check (true);

-- Messages Policies
create policy "View messages" on public.messages
    for select using (
        exists (
            select 1 from public.conversation_members
            where conversation_members.conversation_id = messages.conversation_id
            and conversation_members.user_id = public.current_user_id()
        )
    );
create policy "Insert messages" on public.messages
    for insert with check (
        sender_id = public.current_user_id()
        and exists (
            select 1 from public.conversation_members
            where conversation_members.conversation_id = messages.conversation_id
            and conversation_members.user_id = public.current_user_id()
        )
    );
create policy "Update messages" on public.messages
    for update using (
        exists (
            select 1 from public.conversation_members
            where conversation_members.conversation_id = messages.conversation_id
            and conversation_members.user_id = public.current_user_id()
        )
    );

-- User Presence Policies
create policy "View presence" on public.user_presence for select using (true);
create policy "Modify presence" on public.user_presence for all using (user_id = public.current_user_id());

-- Connections Policies
create policy "View connections" on public.connections for select using (user_id1 = public.current_user_id() or user_id2 = public.current_user_id());
create policy "Insert connections" on public.connections for insert with check (true);
create policy "Delete connections" on public.connections for delete using (user_id1 = public.current_user_id() or user_id2 = public.current_user_id());

-- Connection Requests Policies
create policy "View connection requests" on public.connection_requests for select using (sender_id = public.current_user_id() or receiver_id = public.current_user_id());
create policy "Insert connection requests" on public.connection_requests for insert with check (sender_id = public.current_user_id());
create policy "Update connection requests" on public.connection_requests for update using (sender_id = public.current_user_id() or receiver_id = public.current_user_id());
create policy "Delete connection requests" on public.connection_requests for delete using (sender_id = public.current_user_id() or receiver_id = public.current_user_id());

-- Notifications Policies
create policy "View notifications" on public.notifications for select using (user_id = public.current_user_id());
create policy "Insert notifications" on public.notifications for insert with check (true);
create policy "Update notifications" on public.notifications for update using (user_id = public.current_user_id());
create policy "Delete notifications" on public.notifications for delete using (user_id = public.current_user_id());

-- Postgres RPC to authenticate
create or replace function public.login_user(p_email text, p_password text)
returns setof public.users as $$
begin
    return query select * from public.users where email = p_email and password = p_password;
end;
$$ language plpgsql security definer;

-- Secure get_profiles function (bypass RLS internally to allow search and directory listings)
create or replace function public.get_profiles()
returns table (
    id text,
    role text,
    full_name text,
    location text,
    description text,
    business_name text,
    business_category text,
    logo text,
    profile_photo text,
    bio text,
    website text,
    team_size text,
    monthly_marketing_budget text,
    content_categories text,
    platforms text,
    followers_count text,
    average_reach text,
    engagement_rate text,
    languages text,
    collaboration_pricing text,
    verification_status text,
    profile_strength integer,
    rating text,
    reviews text,
    fraud_audit text,
    services text,
    portfolio text,
    skills text,
    experience text,
    verification_requested boolean,
    phone_visibility text,
    email_visibility text,
    website_visibility text,
    social_links_visibility text,
    contact_visibility text,
    cover_banner text,
    whatsapp text,
    gst text,
    contact_person text,
    social_links text,
    field_visibility text,
    email text,
    mobile_number text,
    address text
) as $$
begin
    return query
    select 
        u.id,
        u.role,
        u.full_name,
        u.location,
        u.description,
        u.business_name,
        u.business_category,
        u.logo,
        u.profile_photo,
        u.bio,
        u.website,
        u.team_size,
        u.monthly_marketing_budget,
        u.content_categories,
        u.platforms,
        u.followers_count,
        u.average_reach,
        u.engagement_rate,
        u.languages,
        u.collaboration_pricing,
        u.verification_status,
        u.profile_strength,
        u.rating,
        u.reviews,
        u.fraud_audit,
        u.services,
        u.portfolio,
        u.skills,
        u.experience,
        u.verification_requested,
        u.phone_visibility,
        u.email_visibility,
        u.website_visibility,
        u.social_links_visibility,
        u.contact_visibility,
        u.cover_banner,
        u.whatsapp,
        u.gst,
        u.contact_person,
        u.social_links,
        u.field_visibility,
        case 
            when u.id = public.current_user_id() then u.email
            when u.role = 'Business Holder' and coalesce(u.contact_visibility, 'Private') = 'Public' then u.email
            else null
        end as email,
        case 
            when u.id = public.current_user_id() then u.mobile_number
            when u.role = 'Business Holder' and coalesce(u.contact_visibility, 'Private') = 'Public' then u.mobile_number
            else null
        end as mobile_number,
        case 
            when u.id = public.current_user_id() then u.address
            when u.role = 'Business Holder' and coalesce(u.contact_visibility, 'Private') = 'Public' then u.address
            else null
        end as address
    from public.users u;
end;
$$ language plpgsql security definer;

-- Create secure view exposing profiles
create or replace view public.profiles as select * from public.get_profiles();

-- Grant permissions
grant select on public.profiles to anon, authenticated;
grant execute on function public.login_user(text, text) to anon, authenticated;
grant execute on function public.get_profiles() to anon, authenticated;

-- Setup Realtime Publication
drop publication if exists supabase_realtime;
create publication supabase_realtime;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.conversation_members;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.user_presence;
alter publication supabase_realtime add table public.connections;
alter publication supabase_realtime add table public.connection_requests;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.applications;
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.users;

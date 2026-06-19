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
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create projects table
create table if not exists public.projects (
    id text primary key,
    business_id text references public.users(id) on delete cascade,
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

-- 3. Create activities table
create table if not exists public.activities (
    id serial primary key,
    text text not null,
    time text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create conversations table
create table if not exists public.conversations (
    id text primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create conversation_members table
create table if not exists public.conversation_members (
    id text primary key,
    conversation_id text references public.conversations(id) on delete cascade not null,
    user_id text references public.users(id) on delete cascade not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(conversation_id, user_id)
);

-- 6. Create messages table
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

-- 7. Create user_presence table
create table if not exists public.user_presence (
    user_id text references public.users(id) on delete cascade primary key,
    is_online boolean default false not null,
    last_seen timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.activities enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.user_presence enable row level security;

-- Idempotent column additions for existing tables
alter table public.users add column if not exists phone_visibility text default 'Private';
alter table public.users add column if not exists email_visibility text default 'Private';
alter table public.users add column if not exists website_visibility text default 'Private';
alter table public.users add column if not exists social_links_visibility text default 'Private';
alter table public.users add column if not exists contact_visibility text default 'Private';

-- Helper function to get current user ID (either from JWT claim or custom header)
create or replace function public.current_user_id()
returns text as $$
begin
    return coalesce(
        nullif(current_setting('request.jwt.claims', true)::json->>'sub', ''),
        nullif(current_setting('request.headers', true)::json->>'x-user-id', '')
    );
end;
$$ language plpgsql security definer;

-- Drop old policies if they exist
drop policy if exists "Allow public read/write users" on public.users;
drop policy if exists "Allow public read/write projects" on public.projects;
drop policy if exists "Allow public read/write activities" on public.activities;
drop policy if exists "Allow public read/write conversations" on public.conversations;
drop policy if exists "Allow public read/write conversation_members" on public.conversation_members;
drop policy if exists "Allow public read/write messages" on public.messages;
drop policy if exists "Allow public read/write user_presence" on public.user_presence;

drop policy if exists "View conversations" on public.conversations;
drop policy if exists "Insert conversations" on public.conversations;
drop policy if exists "View conversation members" on public.conversation_members;
drop policy if exists "Insert conversation members" on public.conversation_members;
drop policy if exists "View messages" on public.messages;
drop policy if exists "Insert messages" on public.messages;
drop policy if exists "Update messages" on public.messages;
drop policy if exists "View presence" on public.user_presence;
drop policy if exists "Modify presence" on public.user_presence;

drop policy if exists "Users can select their own user row" on public.users;
drop policy if exists "Anyone can insert user row" on public.users;
drop policy if exists "Users can update their own user row" on public.users;

-- Configure RLS Policies for users table (strict owner access for select/update)
create policy "Users can select their own user row" on public.users
    for select using (id = public.current_user_id());

create policy "Anyone can insert user row" on public.users
    for insert with check (true);

create policy "Users can update their own user row" on public.users
    for update using (id = public.current_user_id());

-- Configure RLS Policies for other public tables
create policy "Allow public read/write projects" on public.projects for all using (true);
create policy "Allow public read/write activities" on public.activities for all using (true);

-- Conversations Policies
create policy "View conversations" on public.conversations
    for select using (
        exists (
            select 1 from public.conversation_members
            where conversation_members.conversation_id = conversations.id
            and conversation_members.user_id = public.current_user_id()
        )
    );

create policy "Insert conversations" on public.conversations
    for insert with check (true);

-- Conversation Members Policies
create policy "View conversation members" on public.conversation_members
    for select using (
        exists (
            select 1 from public.conversation_members m
            where m.conversation_id = conversation_members.conversation_id
            and m.user_id = public.current_user_id()
        )
    );

create policy "Insert conversation members" on public.conversation_members
    for insert with check (true);

-- Messages Policies
create policy "View messages" on public.messages
    for select using (
        exists (
            select 1 from public.conversation_members
            where conversation_members.conversation_id = messages.conversation_id
            and conversation_members.user_id = public.current_user_id()
        )
    );

-- Users can only insert messages as themselves and in a conversation they are in
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
create policy "View presence" on public.user_presence
    for select using (true);

create policy "Modify presence" on public.user_presence
    for all using (user_id = public.current_user_id());

-- Postgres RPC to authenticate user without selecting users table directly from frontend
create or replace function public.login_user(p_email text, p_password text)
returns setof public.users as $$
begin
    return query select * from public.users where email = p_email and password = p_password;
end;
$$ language plpgsql security definer;

-- Table-valued function to return secure filtered profiles (bypassing RLS internally, but checking visibility rules on the current session ID)
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
        -- Secure conditional exposures: only show to self, or for Business Holders with Public visibility settings
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

-- Create secure view exposing profiles via the secure definer get_profiles function
create or replace view public.profiles as
select * from public.get_profiles();

-- Grant permissions to access view and RPC functions
grant select on public.profiles to anon, authenticated;
grant execute on function public.login_user(text, text) to anon, authenticated;
grant execute on function public.get_profiles() to anon, authenticated;

-- Add tables to the Supabase Realtime publication
alter publication supabase_realtime drop table if exists conversations;
alter publication supabase_realtime drop table if exists conversation_members;
alter publication supabase_realtime drop table if exists messages;
alter publication supabase_realtime drop table if exists user_presence;

alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table conversation_members;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table user_presence;



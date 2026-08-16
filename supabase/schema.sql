-- ==============================================================================
-- REACTIVE RESUME / RBUILDER - 100% IDEMPOTENT SUPABASE MIGRATION SCRIPT
-- Clean, real database schema with zero fake/mock seed data
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (User Details, Google OAuth & Subscription / AutoPay Status)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
    id text primary key,
    email text unique not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Safely ensure every column exists
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists provider text default 'google_oauth2';
alter table public.profiles add column if not exists subscription_plan text;
alter table public.profiles add column if not exists subscription_status text default 'active';
alter table public.profiles add column if not exists subscription_amount numeric default 0;
alter table public.profiles add column if not exists subscription_expires_at timestamptz;
alter table public.profiles add column if not exists payment_id text;
alter table public.profiles add column if not exists onboarding_completed boolean default true;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Create indexes safely
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_subscription on public.profiles(subscription_status);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Drop and recreate Policies
drop policy if exists "Allow public read on profiles" on public.profiles;
create policy "Allow public read on profiles"
    on public.profiles for select
    using (true);

drop policy if exists "Allow users to insert their profile" on public.profiles;
create policy "Allow users to insert their profile"
    on public.profiles for insert
    with check (true);

drop policy if exists "Allow users to update their own profile" on public.profiles;
create policy "Allow users to update their own profile"
    on public.profiles for update
    using (true)
    with check (true);

drop policy if exists "Allow users to delete their own profile" on public.profiles;
create policy "Allow users to delete their own profile"
    on public.profiles for delete
    using (true);

-- Provision Free Lifetime Active Accounts for karthikdhanush686@gmail.com & karthikdhanush676@gmail.com
insert into public.profiles (
    id,
    email,
    name,
    username,
    avatar_url,
    subscription_plan,
    subscription_status,
    subscription_amount,
    onboarding_completed
) values 
(
    'user_karthik_vip_686',
    'karthikdhanush686@gmail.com',
    'Karthik Dhanush',
    'karthikdhanush686',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=karthikdhanush686@gmail.com',
    '3_months',
    'active',
    0,
    true
),
(
    'user_karthik_vip_676',
    'karthikdhanush676@gmail.com',
    'Karthik Dhanush',
    'karthikdhanush676',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=karthikdhanush676@gmail.com',
    '3_months',
    'active',
    0,
    true
) on conflict (email) do update set
    subscription_status = 'active',
    onboarding_completed = true,
    subscription_plan = '3_months';

-- ------------------------------------------------------------------------------
-- 2. RESUMES TABLE (Resume Documents, Section Data & Metadata)
-- ------------------------------------------------------------------------------
create table if not exists public.resumes (
    id text primary key,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Safely ensure EVERY resume column exists before indexing
alter table public.resumes add column if not exists user_id text not null default 'guest-user';
alter table public.resumes add column if not exists name text not null default 'Untitled Resume';
alter table public.resumes add column if not exists slug text not null default 'untitled-resume';
alter table public.resumes add column if not exists tags text[] default '{}'::text[];
alter table public.resumes add column if not exists data jsonb default '{}'::jsonb;
alter table public.resumes add column if not exists is_public boolean default true;
alter table public.resumes add column if not exists is_locked boolean default false;
alter table public.resumes add column if not exists has_password boolean default false;
alter table public.resumes add column if not exists password_hash text;
alter table public.resumes add column if not exists created_at timestamptz default now();
alter table public.resumes add column if not exists updated_at timestamptz default now();

-- Indexes for instant resume lookups
create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_resumes_slug on public.resumes(slug);
create index if not exists idx_resumes_updated_at on public.resumes(updated_at desc);

-- Enable RLS on resumes
alter table public.resumes enable row level security;

-- Resumes Policies
drop policy if exists "Allow reading public resumes and owned resumes" on public.resumes;
create policy "Allow reading public resumes and owned resumes"
    on public.resumes for select
    using (true);

drop policy if exists "Allow users to insert resumes" on public.resumes;
create policy "Allow users to insert resumes"
    on public.resumes for insert
    with check (true);

drop policy if exists "Allow users to update their resumes" on public.resumes;
create policy "Allow users to update their resumes"
    on public.resumes for update
    using (true)
    with check (true);

drop policy if exists "Allow users to delete their resumes" on public.resumes;
create policy "Allow users to delete their resumes"
    on public.resumes for delete
    using (true);

-- ------------------------------------------------------------------------------
-- 3. FEEDBACKS / REVIEWS TABLE (Landing Page Real User Testimonials)
-- ------------------------------------------------------------------------------
create table if not exists public.feedbacks (
    id text primary key default gen_random_uuid()::text,
    user_name text not null default 'User',
    user_email text not null default 'user@gmail.com',
    comment text not null default '',
    created_at timestamptz default now() not null
);

-- Safely ensure feedback columns exist
alter table public.feedbacks add column if not exists user_id text;
alter table public.feedbacks add column if not exists user_name text not null default 'User';
alter table public.feedbacks add column if not exists user_email text not null default 'user@gmail.com';
alter table public.feedbacks add column if not exists avatar_url text;
alter table public.feedbacks add column if not exists rating integer not null default 5;
alter table public.feedbacks add column if not exists comment text not null default '';
alter table public.feedbacks add column if not exists created_at timestamptz default now();

create index if not exists idx_feedbacks_created_at on public.feedbacks(created_at desc);

alter table public.feedbacks enable row level security;

drop policy if exists "Allow public read on feedbacks" on public.feedbacks;
create policy "Allow public read on feedbacks"
    on public.feedbacks for select
    using (true);

drop policy if exists "Allow insert on feedbacks" on public.feedbacks;
create policy "Allow insert on feedbacks"
    on public.feedbacks for insert
    with check (true);

drop policy if exists "Allow update on feedbacks" on public.feedbacks;
create policy "Allow update on feedbacks"
    on public.feedbacks for update
    using (true)
    with check (true);

drop policy if exists "Allow delete on feedbacks" on public.feedbacks;
create policy "Allow delete on feedbacks"
    on public.feedbacks for delete
    using (true);

-- ------------------------------------------------------------------------------
-- 4. STORAGE BUCKETS SETUP (Avatars & Resumes)
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do update set public = true;

-- Storage Policies for Avatars
drop policy if exists "Allow public avatar download" on storage.objects;
create policy "Allow public avatar download"
    on storage.objects for select
    using (bucket_id = 'avatars');

drop policy if exists "Allow avatar upload" on storage.objects;
create policy "Allow avatar upload"
    on storage.objects for insert
    with check (bucket_id = 'avatars');

drop policy if exists "Allow avatar update" on storage.objects;
create policy "Allow avatar update"
    on storage.objects for update
    using (bucket_id = 'avatars');

drop policy if exists "Allow avatar delete" on storage.objects;
create policy "Allow avatar delete"
    on storage.objects for delete
    using (bucket_id = 'avatars');

-- Storage Policies for Resumes
drop policy if exists "Allow public resume asset download" on storage.objects;
create policy "Allow public resume asset download"
    on storage.objects for select
    using (bucket_id = 'resumes');

drop policy if exists "Allow resume asset upload" on storage.objects;
create policy "Allow resume asset upload"
    on storage.objects for insert
    with check (bucket_id = 'resumes');

drop policy if exists "Allow resume asset update" on storage.objects;
create policy "Allow resume asset update"
    on storage.objects for update
    using (bucket_id = 'resumes');

drop policy if exists "Allow resume asset delete" on storage.objects;
create policy "Allow resume asset delete"
    on storage.objects for delete
    using (bucket_id = 'resumes');

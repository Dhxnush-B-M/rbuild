# Supabase Backend Configuration Guide

This application is fully powered by **Supabase** for Authentication, PostgreSQL Database, and Object Storage.

## 1. Apply Database Schema

1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** from the left navigation bar.
3. Open or copy the contents of [`schema.sql`](file:///Users/kxrthik07/Downloads/builder-main-2/supabase/schema.sql).
4. Click **Run** to execute the script.
   - This creates the `profiles` and `resumes` tables.
   - Sets up Row Level Security (RLS) policies for high performance and security.
   - Creates the `avatars` and `resumes` storage buckets.
   - Configures automatic user profile synchronization from Auth.

## 2. Configure Environment Variables

Create or update `.env` or `.env.local` in your root project:

```env
# Supabase URL & Public Anon Key
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## 3. Enable Authentication Providers

In the Supabase Dashboard:
1. Navigate to **Authentication** > **Providers**.
2. **Email**: Enable Email Auth (Disable "Confirm email" if you want instant test signups).
3. **Google** (Optional): Enable Google OAuth and supply your Google Client ID & Client Secret from Google Cloud Console.

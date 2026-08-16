# Resume Builder

A fast, private, and customizable web resume builder built with React, Vite, and Supabase.

---

## Features

- **Supabase Powered Backend**: Direct PostgreSQL database storage for user profiles, resumes, and uploads.
- **Fast Performance**: Instant client routing and debounced auto-saving.
- **Multiple Resume Templates**: Clean, modern templates optimized for ATS compatibility and custom styling.
- **PDF Export**: Instant client-side and server-side PDF document generation.
- **Privacy First**: Self-hosted database and full ownership of your data.

---

## Getting Started

### 1. Database Setup

1. Open your Supabase project.
2. Go to the **SQL Editor**.
3. Run the schema script located at [`supabase/schema.sql`](supabase/schema.sql).

### 2. Environment Variables

Create `.env` in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Installation & Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:web
```

Open [http://localhost:3000](http://localhost:3000) to start building resumes.

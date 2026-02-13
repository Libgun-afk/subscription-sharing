# ShareSub - Subscription Cost-Sharing Marketplace (Frontend)

A frontend app for sharing subscription costs (Netflix, Spotify, etc.) with others. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase Auth.

## Features

- **User authentication** - Email/password via Supabase Auth
- **Create listing** - Service name, total slots, available slots, monthly price
- **Browse & filter** - Listings page with filter by service
- **Join subscription** - Decrease available slots when user joins
- **Rating system** - 1-5 star ratings with optional comments (members/owners only)
- **Responsive UI** - Mobile-friendly design

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth
- **Backend API:** separate service (set `NEXT_PUBLIC_API_BASE_URL`)

## Folder Structure

```
subscription-marketplace/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   ├── auth/
│   │   ├── error/page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── signout/page.tsx
│   ├── dashboard/page.tsx
│   ├── listings/
│   │   ├── [id]/page.tsx
│   │   ├── create/page.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── navbar.tsx
│   └── providers.tsx
├── lib/
│   ├── api-client.ts
│   ├── i18n.ts
│   └── supabase/
│       ├── client.ts
│       ├── middleware.ts
│       └── server.ts
├── middleware.ts
└── ...
```

## Backend

This repository is now **frontend-only**. Marketplace data comes from a separate backend service.

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- PostgreSQL (or use Supabase)

### 2. Install Dependencies

```bash
cd subscription-marketplace
yarn install
# or: npm install
```

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Authentication** → **Providers** → enable **Email**
3. (Optional) Disable **Confirm email** in Auth settings for easier local dev
4. Go to **Project Settings** → **API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. (Optional) If your separate backend uses Supabase Postgres, you may need the database connection string there.

### 4. Environment Variables

Create `.env` from the example:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com
```

### 6. Supabase Auth URL Configuration

In Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL:** `http://localhost:3000` (dev) or your production URL
- **Redirect URLs:** Add the following:
  - `http://localhost:3000/api/auth/callback`
  - `http://localhost:3000/**` (or your production URL for deploy)

**Email confirmation:** If "Confirm email" is enabled, go to **Authentication** → **Email Templates** → **Confirm signup** and set the redirect URL to `{{ .SiteURL }}/api/auth/callback` so users complete sign-in after verifying.

### 7. Run Development Server

```bash
yarn dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/auth/callback` | Supabase auth callback (session exchange) |

## Scripts

- `yarn dev` - Start dev server
- `yarn build` - Production build
- `yarn start` - Start production server

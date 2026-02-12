# ShareSub - Subscription Cost-Sharing Marketplace

A fullstack MVP for sharing subscription costs (Netflix, Spotify, etc.) with others. Built with Next.js 14, TypeScript, Tailwind CSS, Supabase Auth, and Prisma ORM.

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
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma

## Folder Structure

```
subscription-marketplace/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   │   │   └── me/route.ts
│   │   ├── listings/
│   │   │   ├── [id]/
│   │   │   │   ├── join/route.ts
│   │   │   │   ├── ratings/route.ts
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── services/route.ts
│   │   └── user/
│   │       └── listings/route.ts
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
│   ├── auth.ts
│   ├── prisma.ts
│   └── supabase/
│       ├── client.ts
│       ├── middleware.ts
│       └── server.ts
├── prisma/
│   └── schema.prisma
├── middleware.ts
└── ...
```

## Database Schema

```
User
├── id (cuid)
├── supabaseId (unique, links to Supabase Auth)
├── email
└── timestamps

Listing
├── id (cuid)
├── serviceName
├── totalSlots
├── availableSlots
├── monthlyPrice
├── description (optional)
├── ownerId → User
└── timestamps

SubscriptionMember
├── id (cuid)
├── listingId → Listing
├── userId → User
└── joinedAt

Rating
├── id (cuid)
├── listingId → Listing
├── userId → User
├── score (1-5)
├── comment (optional)
└── createdAt
```

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
5. Go to **Project Settings** → **Database** and copy the connection string → `DATABASE_URL`

### 4. Environment Variables

Create `.env` from the example:

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 5. Database Setup

```bash
yarn db:generate
yarn db:push
# or: npx prisma generate && npx prisma db push
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
| GET | `/api/listings` | List all listings (query: `?service=Netflix`) |
| POST | `/api/listings` | Create listing (auth required) |
| GET | `/api/listings/[id]` | Get single listing |
| POST | `/api/listings/[id]/join` | Join subscription (auth required) |
| GET | `/api/listings/[id]/ratings` | Get ratings |
| POST | `/api/listings/[id]/ratings` | Submit/update rating (auth, member/owner only) |
| GET | `/api/services` | List distinct service names |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/user/listings` | Get user's owned & joined listings (auth required) |

## Scripts

- `yarn dev` - Start dev server
- `yarn build` - Production build
- `yarn start` - Start production server
- `yarn db:generate` - Generate Prisma client
- `yarn db:push` - Push schema to DB (no migrations)
- `yarn db:migrate` - Run migrations

## Production Notes

- Use `prisma migrate dev` for migrations in production
- Set `NEXT_PUBLIC_SITE_URL` for correct redirects
- Configure Supabase redirect URLs for your domain
- Consider rate limiting and input validation

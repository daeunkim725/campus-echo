# Campus Echo — Next.js

Self-hosted rewrite of Campus Echo, migrated from Base44.  
**Stack:** Next.js 14 App Router · PostgreSQL · Prisma · Jose JWT · Nodemailer

---

## Quick Start

### 1. Start the database
```bash
docker compose up -d
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.local.example .env.local
# Edit .env.local — fill in JWT_SECRET and SMTP_* values
```

### 4. Run Prisma migrations
```bash
npm run db:generate
npm run db:migrate
# When prompted, name the migration: "init"
```

### 5. Start dev server
```bash
npm run dev
# → http://localhost:3000
```

---

## Data Migration from Base44

### Step 1 — Export existing data
```bash
BASE44_APP_ID=your_app_id BASE44_TOKEN=your_token npm run export:base44
# Writes JSON files to ./tmp/base44-export/
```

### Step 2 — Import to Postgres
```bash
# Ensure your DB is running and migrated first
npm run import:postgres
```

### Step 3 — Validate
```bash
npx prisma studio   # visual check of row counts
```

---

## Frontend Cutover

Replace `src/api/base44Client.js` imports with `lib/apiClient.ts`:

```ts
// Before (Base44)
import { base44 } from "@/api/base44Client";
const posts = await base44.entities.Post.filter(...);

// After (Next.js)
import { feed } from "@/lib/apiClient";
const { posts } = await feed.list({ sort: "new" });
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/send-code` | Send OTP to school email |
| POST | `/api/auth/verify-code` | Verify OTP |
| POST | `/api/onboarding/age` | Submit DOB for age gate |
| GET/POST | `/api/feed` | List/create posts |
| GET/DELETE | `/api/posts/[id]` | Get/delete post |
| GET/POST | `/api/posts/[id]/comments` | List/create comments |
| POST | `/api/votes` | Vote on post or comment |
| POST | `/api/polls/vote` | Vote on poll option |
| GET/POST | `/api/market/listings` | List/create listings |
| GET/PATCH/DELETE | `/api/market/listings/[id]` | Listing detail |
| GET/POST | `/api/market/threads` | List/create threads |
| GET/POST | `/api/market/threads/[id]/messages` | Messages |
| POST | `/api/reports` | Report content |
| GET | `/api/leaderboard` | School leaderboard |

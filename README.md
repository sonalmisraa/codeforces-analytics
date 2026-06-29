# CPAnalytics 🚀

A **production-grade Competitive Programming Analytics Dashboard** that tracks your Codeforces and LeetCode performance, visualizes rating history, analyzes problem-solving patterns, and generates personalized insights.

Built as a flagship resume project for SWE internship applications.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard** | Stat cards for CF rating, max rating, rank, contests, LC easy/medium/hard, streaks |
| **Rating Graph** | Interactive Recharts area chart with tier markers (Pupil → Grandmaster), tooltips |
| **Contest History** | Searchable, sortable, paginated table with CSV export |
| **Topic Analytics** | Pie chart breakdown across Greedy, DP, Graphs, Trees, Binary Search, Math, etc. |
| **Activity Heatmap** | GitHub-style heatmap with 365-day view, color-coded intensity |
| **Weekly Progress** | Bar chart for problems/week + manual hours logging |
| **AI Insights** | Rule-based engine: streak alerts, weak topics, rating trends, recommendations |
| **Leaderboard** | Compare users by rating, solved count, streak, college with podium view |
| **Profile** | Handle connection, college/branch/language config, report export |
| **Dark Mode** | Full dark/light theme toggle |
| **Responsive** | Desktop, tablet, and mobile optimized |

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15** (App Router) + **TypeScript**
- **TailwindCSS** + **shadcn/ui** components
- **Recharts** for all charts
- **Clerk** for authentication
- **Zustand** for state management
- **Axios** for API calls
- Deploy: **Vercel**

### Backend
- **Node.js + Express** + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **node-cache** for Redis-style caching
- **Winston** for structured logging
- **express-rate-limit** for rate limiting
- **Helmet + CORS** for security
- Deploy: **Render**

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon/Supabase free tier)
- Clerk account (free)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/cp-analytics.git
cd cp-analytics

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/cp_analytics
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=300
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Set up the Database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run in Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
cp-analytics/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB schema: User, Profile, ContestHistory, etc.
│   └── src/
│       ├── config/
│       │   └── prisma.ts           # Prisma singleton
│       ├── controllers/
│       │   └── userController.ts   # All route handlers (MVC)
│       ├── middleware/
│       │   ├── auth.ts             # Clerk JWT verification
│       │   ├── errorHandler.ts     # Global error handler
│       │   └── rateLimiter.ts      # Rate limiting (general + sync)
│       ├── routes/
│       │   └── index.ts            # All API routes
│       ├── services/
│       │   ├── codeforcesService.ts  # CF API + topic/activity derivation
│       │   ├── leetcodeService.ts    # LC GraphQL API
│       │   ├── syncService.ts        # Orchestrates DB sync
│       │   └── insightsService.ts    # Rule-based AI insights engine
│       ├── types/
│       │   └── index.ts            # TypeScript interfaces
│       ├── utils/
│       │   ├── cache.ts            # node-cache wrapper + key factory
│       │   ├── logger.ts           # Winston logger
│       │   └── response.ts         # Standardized API response helpers
│       └── index.ts                # Express app + startup
│
└── frontend/
    └── src/
        ├── app/                    # Next.js App Router pages
        │   ├── page.tsx            # Landing page
        │   ├── layout.tsx          # Root layout (Clerk + Theme)
        │   ├── sign-in/            # Clerk sign-in
        │   ├── sign-up/            # Clerk sign-up
        │   └── dashboard/
        │       ├── layout.tsx      # Dashboard layout (sidebar)
        │       ├── page.tsx        # Overview dashboard
        │       ├── rating/         # Rating history page
        │       ├── contests/       # Contest history + CSV export
        │       ├── topics/         # Topic analytics + weakness view
        │       ├── heatmap/        # Activity heatmap + weekly chart
        │       ├── insights/       # AI insights page
        │       ├── leaderboard/    # Leaderboard with filters
        │       └── profile/        # Profile + handle setup + export
        ├── components/
        │   ├── charts/
        │   │   ├── RatingGraph.tsx    # Recharts area chart
        │   │   ├── TopicPieChart.tsx  # Recharts donut chart
        │   │   ├── ActivityHeatmap.tsx # GitHub-style heatmap
        │   │   └── WeeklyBarChart.tsx  # Weekly bar chart
        │   ├── dashboard/
        │   │   └── StatCard.tsx       # Animated stat card
        │   ├── layout/
        │   │   ├── Sidebar.tsx        # Main nav sidebar
        │   │   ├── ThemeProvider.tsx  # next-themes wrapper
        │   │   └── ApiInitializer.tsx # Clerk token provider setup
        │   └── shared/
        │       ├── Skeleton.tsx       # Loading skeletons
        │       ├── EmptyState.tsx     # Empty state component
        │       ├── SectionCard.tsx    # Card wrapper
        │       ├── SyncButton.tsx     # Sync data button
        │       └── ThemeToggle.tsx    # Dark/light toggle
        ├── hooks/
        │   ├── useApi.ts             # Data fetching hook
        │   └── useAnimatedCounter.ts # Number animation hook
        ├── lib/
        │   └── utils.ts              # cn(), formatters, heatmap utils
        ├── services/
        │   └── api.ts                # Axios instance + all API calls
        ├── store/
        │   └── userStore.ts          # Zustand user state
        └── types/
            └── index.ts              # Shared TypeScript types
```

---

## 🌐 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/users` | ❌ | Create/upsert user after Clerk signup |
| GET | `/api/users/me` | ✅ | Get current user + profile |
| PUT | `/api/users/me/profile` | ✅ | Update profile + trigger sync |
| GET | `/api/dashboard/stats` | ✅ | Aggregated dashboard stats |
| GET | `/api/contests` | ✅ | Contest history (search, sort, paginate) |
| GET | `/api/activity/daily` | ✅ | Daily activity for heatmap |
| GET | `/api/topics` | ✅ | Topic breakdown stats |
| GET | `/api/progress/weekly` | ✅ | Weekly progress chart data |
| POST | `/api/progress/hours` | ✅ | Log coding hours manually |
| POST | `/api/sync` | ✅ | Trigger CF + LC data sync |
| GET | `/api/leaderboard` | ❌ | Public leaderboard (filter by college/country) |
| GET | `/api/insights` | ✅ | AI-generated insights |
| GET | `/health` | ❌ | Health check |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
vercel --prod
# Set all NEXT_PUBLIC_* env vars in Vercel dashboard
```

### Backend → Render
1. Connect GitHub repo to Render
2. Build command: `npm run build`
3. Start command: `npm start`
4. Add all backend env vars in Render dashboard
5. Add `DATABASE_URL` pointing to Neon/Supabase PostgreSQL

---

## 🗺 Roadmap

- [ ] AtCoder integration
- [ ] CodeChef integration
- [ ] Friend comparison feature
- [ ] Real LLM-powered insights (Anthropic API)
- [ ] Push notifications for contest reminders
- [ ] Advanced PDF report with charts
- [ ] OAuth with Codeforces API

---

## 📄 License

MIT © Sonal — Built for IITK SWE Internship Recruitment

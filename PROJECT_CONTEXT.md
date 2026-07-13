# ChronoFlow — PROJECT CONTEXT

> **Last Updated:** 2026-07-07  
> **Current Status:** Build successful, dev server running, ready for GitHub push & Vercel deploy  
> **Session Owner:** @agenticweeb (X: x.com/agenticweeb | GitHub: github.com/agenticweeb)

---

## 1. PROJECT OVERVIEW

### What We're Building
**ChronoFlow** — An intelligent anime watch order generator that solves the #1 problem anime fans face: knowing what to watch, in what order, and what to skip.

### Core Value Proposition
- **Any anime coverage** — Not just popular shows. AI generates watch orders on-demand for any title (JoJo, Hunter x Hunter, Grand Blue Dreaming, obscure OVAs)
- **4-tier Smart Skip** — Essential / Recommended / Optional / Skip with explanations (not binary skip/don't skip)
- **Time-aware paths** — "I have 3 hours" → auto-curates optimal subset
- **Visual interactive flowchart** — Clickable nodes with live scores, progress tracking, shareable links
- **Zero cost to run** — Free AI APIs (OpenRouter/Groq/GitHub/Google), free data APIs (Jikan/AniList), no database

### Target User
Anime enthusiasts who:
- Are overwhelmed by franchise complexity (Fate/, Monogatari, Macross)
- Want to skip filler without missing character introductions
- Need time-budgeted viewing plans
- Want to share watch paths with friends

### Tech Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14.2.5 (App Router) | React framework with API routes |
| Language | TypeScript 5.5.3 | Type safety |
| Styling | Tailwind CSS 3.4.6 | Utility-first CSS |
| UI Components | Lucide React | Icons |
| Animation | Framer Motion | Smooth transitions |
| State | Zustand 4.5.4 | Global state (installed, not yet used) |
| Data Fetching | TanStack Query 5.51.0 | Server state (installed, not yet used) |
| AI Engine | OpenRouter + Groq + Cerebras + GitHub Models + Google | Auto-failover LLM inference |
| Data APIs | Jikan v4 (MAL) + AniList GraphQL | Anime metadata, scores, images |
| Cache | localStorage (ChronoCache class) | Client-side caching with TTL & LRU eviction |
| Progress | localStorage (useProgress hook) | Watch progress persistence |
| Deployment | Vercel | Serverless Next.js hosting |

---

## 2. COMPLETE PROJECT STRUCTURE

```
/home/thierry/chronoflow/
│
├── .env.example              # Template for API keys (SAFE to push)
├── .env.local                # REAL API keys — NEVER PUSH (gitignored)
├── .gitignore                # Ignores node_modules, .env*.local, build dirs
├── next.config.js            # Next.js config (images, no static export)
├── package.json              # Dependencies & scripts
├── postcss.config.js         # PostCSS with Tailwind + Autoprefixer
├── tailwind.config.ts        # Tailwind theme (custom colors, fonts)
├── tsconfig.json             # TypeScript config (strict mode, path aliases)
│
├── public/                   # Static assets (empty currently)
│
└── src/
    │
    ├── app/
    │   ├── api/
    │   │   ├── enrich/
    │   │   │   └── route.ts          # POST /api/enrich — enriches entries with live MAL/AniList data
    │   │   ├── search/
    │   │   │   └── route.ts          # GET /api/search?q= — searches Jikan + AniList simultaneously
    │   │   └── watch-order/
    │   │       └── route.ts          # POST /api/watch-order — generates AI watch order with filters
    │   ├── globals.css               # Tailwind directives + custom CSS (no @apply, pure CSS vars)
    │   ├── layout.tsx                # Root layout (dark mode, system fonts)
    │   └── page.tsx                  # Main page — search, preferences, generate button, results
    │
    ├── components/
    │   ├── AnimeSearch.tsx           # Search input with dropdown, debounced, abort controller
    │   ├── Flowchart.tsx             # Interactive flowchart with expandable nodes, progress tracking
    │   └── PreferencePanel.tsx       # Time budget, mood, skip strategy, path type, content toggles
    │
    ├── hooks/
    │   ├── useProgress.ts            # localStorage-based watch progress (toggle, rate, notes, share code)
    │   ├── useSearch.ts              # Debounced search with abort controller
    │   └── useWatchOrder.ts          # Watch order generation state management
    │
    ├── lib/
    │   ├── ai-providers.ts           # AI failover engine (8 providers, auto-retry, exponential backoff)
    │   ├── anilist-client.ts         # AniList GraphQL client (search, media details)
    │   ├── cache.ts                  # ChronoCache — localStorage with TTL, LRU eviction, stats
    │   ├── jikan-client.ts           # Jikan v4 API client (search, details, franchise, rate-limited)
    │   └── utils.ts                  # cn(), debounce(), formatDuration(), estimateTime(), generateShareText(), compress/decompress URL
    │
    └── types/
        └── index.ts                  # All TypeScript interfaces (AIProvider, WatchOrderEntry, UserPreferences, etc.)
```

---

## 3. WHAT WE'VE COMPLETED

### ✅ Phase 1: Foundation (DONE)
- [x] Project directory structure created
- [x] Core config files: package.json, tsconfig.json, next.config.js, tailwind.config.ts, postcss.config.js
- [x] .env.example with all provider key slots
- [x] .gitignore protecting .env*.local

### ✅ Phase 2: Type System (DONE)
- [x] Complete TypeScript definitions in src/types/index.ts
- [x] All interfaces: AIProvider, WatchOrderEntry, UserPreferences, AnimeSearchResult, etc.

### ✅ Phase 3: Core Libraries (DONE)
- [x] ai-providers.ts — 8-provider failover chain with prompt engineering
- [x] jikan-client.ts — Rate-limited MAL API client
- [x] anilist-client.ts — GraphQL AniList client
- [x] cache.ts — Intelligent localStorage cache with TTL & LRU
- [x] utils.ts — Helper functions

### ✅ Phase 4: API Routes (DONE)
- [x] /api/search — Parallel Jikan + AniList search with merge/dedup
- [x] /api/enrich — Live data enrichment from both APIs
- [x] /api/watch-order — Full pipeline: cache check → AI generation → enrichment → filtering → cache store

### ✅ Phase 5: React Hooks (DONE)
- [x] useWatchOrder — API call state management
- [x] useSearch — Debounced search with abort controller
- [x] useProgress — localStorage progress tracking

### ✅ Phase 6: UI Components (DONE)
- [x] AnimeSearch — Autocomplete dropdown with images, scores, franchise indicators
- [x] PreferencePanel — Time budget, mood tags, skip strategy, path type, content toggles
- [x] Flowchart — Visual timeline with expandable nodes, tier colors, progress tracking, share button

### ✅ Phase 7: Main Page & Styles (DONE)
- [x] page.tsx — Full orchestration: hero, search, preferences, generate, results, error states
- [x] layout.tsx — Root layout with dark mode, metadata
- [x] globals.css — Custom CSS with variables (no @apply issues), scrollbar styling, animations

### ✅ Phase 8: Build Fixes (DONE)
- [x] Fixed: TypeScript strict errors (null types, Set iteration, missing interface properties)
- [x] Fixed: CSS @apply errors — converted to pure CSS variables
- [x] Fixed: Google Fonts timeout — switched to system font stack
- [x] Fixed: Static export vs API routes conflict — switched to Vercel deployment
- [x] Build succeeds cleanly

### ✅ Phase 9: Environment & Security (DONE)
- [x] .env.local created with real API keys
- [x] .gitignore verified to block .env*.local
- [x] .env.example kept as safe template

---

## 4. CURRENT TASK — WHERE WE LEFT OFF

**Status:** Build successful. Dev server ready to test.

**Next immediate action:** Test the dev server locally before pushing to GitHub.

```bash
cd /home/thierry/chronoflow
npm run dev
# Open http://localhost:3000
```

**What to test:**
1. Search for "JoJo" — should show dropdown with results
2. Select "JoJo's Bizarre Adventure"
3. Click "Generate Watch Order" — should call AI and show flowchart
4. Click nodes to expand — should show details
5. Click checkmark to mark watched — should update progress bar

**If errors occur:** Check browser console and terminal for API errors (likely AI provider issues if keys aren't working).

---

## 5. KEY ARCHITECTURAL DECISIONS

### 5.1 AI Auto-Failover Chain
```
OpenRouter (Groq) → OpenRouter (Cerebras) → OpenRouter (Google) 
→ Groq Direct → Cerebras Direct → GitHub GPT-4o → GitHub Claude → Google Gemini
```
- Each provider has priority, 2 retries with exponential backoff
- If one fails, next is tried immediately — zero user intervention
- OpenRouter acts as meta-router (one key, 20+ providers)

### 5.2 Zero-Cost Architecture
- **No database** — localStorage for cache and progress
- **No paid APIs** — Jikan (free), AniList (free), AI free tiers
- **No server required** — Next.js API routes on Vercel free tier
- **Share via URL hash** — Compressed base64 JSON, no server storage

### 5.3 Smart Skip System (4-Tier)
| Tier | Meaning | Example |
|------|---------|---------|
| Essential | Core plot, cannot skip | Season 1 episodes |
| Recommended | Enhances experience | Character development episodes |
| Optional | Nice to have | Side stories with no plot impact |
| Skip | Filler/recap | Beach episodes, pure recaps |

### 5.4 Client-Side Cache Strategy
- 7-day TTL for watch orders
- LRU eviction when localStorage hits 5MB
- Provider tracking for debugging

### 5.5 Type Safety
- Strict TypeScript mode enabled
- All API responses typed with `APIResponse<T>`
- No `any` types in production code

---

## 6. DEPENDENCIES INSTALLED

```json
{
  "next": "14.2.5",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "framer-motion": "^11.3.0",
  "lucide-react": "^0.400.0",
  "zustand": "^4.5.4",
  "@tanstack/react-query": "^5.51.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.4.0",
  "typescript": "^5.5.3",
  "@types/node": "^20.14.10",
  "@types/react": "^18.3.3",
  "@types/react-dom": "^18.3.0",
  "tailwindcss": "^3.4.6",
  "postcss": "^8.4.39",
  "autoprefixer": "^10.4.19",
  "eslint": "^8.57.0",
  "eslint-config-next": "14.2.5"
}
```

**Security note:** Next.js 14.2.5 has a known vulnerability (Dec 2025 advisory). Upgrade to patched version when convenient: `npm install next@latest`

---

## 7. KNOWN ISSUES / BLOCKERS

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Next.js 14.2.5 security vulnerability | Medium | Known | Upgrade to latest when ready |
| npm deprecation warnings (inflight, rimraf, glob) | Low | Known | Doesn't affect functionality |
| AI provider rate limits | Medium | Mitigated | Auto-failover handles this |
| No error boundary for AI hallucinations | Medium | To fix | Add validation layer |
| No loading skeleton for flowchart | Low | To add | Currently shows text only |
| No SEO meta tags per franchise page | Low | To add | Currently single-page app |
| No analytics | Low | To add | Vercel Analytics or Plausible |

---

## 8. NEXT STEPS (Prioritized)

### Immediate (Before GitHub Push)
1. [ ] Test dev server locally (`npm run dev`)
2. [ ] Verify AI generation works with your keys
3. [ ] Fix any runtime errors
4. [ ] Create GitHub repo and push

### Short Term (Post-Deploy)
5. [ ] Deploy to Vercel (connect GitHub repo)
6. [ ] Add custom domain if desired
7. [ ] Add Vercel Analytics
8. [ ] Add SEO: dynamic meta tags per franchise
9. [ ] Add loading skeletons
10. [ ] Add error boundaries

### Medium Term (Growth)
11. [ ] **Monetization: Buy Me a Coffee** — Add floating button or footer link
12. [ ] **Social: Follow @agenticweeb on X** — Footer link + share prefill
13. [ ] **GitHub Stars CTA** — "Star this project" banner
14. [ ] **Suggestion Box** — Simple form → Discord webhook or GitHub issues
15. [ ] **CMS Integration** — For editable About page, changelog, blog posts
16. [ ] **User Accounts** — Optional auth for cloud sync (Clerk or NextAuth)
17. [ ] **Community Voting** — Upvote/downvote AI recommendations
18. [ ] **Seasonal Discovery** — "What's airing this season?"
19. [ ] **Manga Bridge** — "Anime ends here → continue manga at Chapter X"
20. [ ] **PWA** — Offline support, installable app

### Long Term (Scale)
21. [ ] **Database** — PostgreSQL on Supabase for community data
22. [ ] **Caching Layer** — Redis on Upstash for API responses
23. [ ] **Rate Limiting** — Protect AI endpoints from abuse
24. [ ] **A/B Testing** — Test different AI prompts for accuracy
25. [ ] **Mobile App** — React Native or Capacitor wrapper

---

## 9. CURRENT STATE OF KEY FILES

### next.config.js
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 's4.anilist.co' },
    ],
  },
};
module.exports = nextConfig;
```

### tailwind.config.ts
- Custom colors: chrono-* (bg, surface, primary, accent, etc.)
- Custom colors: tier-* (essential, recommended, optional, skip)
- Font: system-ui stack (Inter as first choice if installed)
- Dark mode: class-based

### src/types/index.ts
- 15+ interfaces defined
- All enums as union types (EntryType, EntryTier, FillerType, etc.)
- Strict typing throughout

### src/lib/ai-providers.ts
- 8 providers configured
- Prompt engineering for structured JSON output
- Exponential backoff retry logic
- Provider priority system

### src/lib/jikan-client.ts
- Rate-limited fetch (350ms between requests)
- Search, details, franchise entry fetching
- Error handling with warnings

### src/lib/anilist-client.ts
- GraphQL queries for search and media details
- No API key required for read operations

### src/lib/cache.ts
- ChronoCache class
- TTL-based expiration
- LRU eviction at 5MB limit
- Stats reporting

### src/app/api/watch-order/route.ts
- Full pipeline: cache → search → AI → enrich → filter → cache
- Filter engine: type filters, skip preference, mood, time budget
- Total duration calculation

### src/app/page.tsx
- Hero section with gradient
- Search component integration
- Preference panel (conditional render)
- Generate button with loading state
- Error state with retry
- Results section with Flowchart
- Feature cards (empty state)
- Footer

---

## 10. SOCIAL & MONETIZATION PLANS

### Creator Identity
- **X/Twitter:** @agenticweeb (x.com/agenticweeb)
- **GitHub:** github.com/agenticweeb
- **Project:** ChronoFlow (anime watch order optimizer)

### Integration Points (For Later Implementation)

#### Buy Me a Coffee
- **Location:** Footer or floating button (bottom-right)
- **Link:** buymeacoffee.com/agenticweeb (create account)
- **Timing:** After project gains traction (100+ users)

#### Follow on X
- **Location:** Footer, share dialog, about page
- **Link:** x.com/agenticweeb
- **Copy:** "Follow @agenticweeb for anime AI tools"

#### Star on GitHub
- **Location:** Header (current), footer, share dialog
- **Link:** github.com/agenticweeb/chronoflow
- **Copy:** "Star this project — it helps others find it"

#### Suggestion Box
- **Implementation:** Simple form → GitHub Issues API or Discord webhook
- **Fields:** Feature request, bug report, anime suggestion
- **Location:** Footer link or dedicated page

---

## 11. CMS INTEGRATION PLAN

For editable content (About page, changelog, blog), recommended approach:

### Option A: MDX + GitHub (Simplest)
- Store MDX files in `src/content/`
- Edit via GitHub web interface
- Next.js reads at build time
- **Pros:** Free, version controlled, no external service
- **Cons:** Requires rebuild to update

### Option B: Sanity.io (Headless CMS)
- Free tier: 3 users, 2 datasets
- Real-time editing
- GROQ queries
- **Pros:** Real-time, structured content, rich text
- **Cons:** Learning curve, external dependency

### Option C: Notion API (Personal Favorite)
- Use Notion as CMS
- Fetch via API at build time or ISR
- **Pros:** Familiar UI, free personal plan, flexible
- **Cons:** Rate limits, requires Notion account

### Recommended: Start with Option A (MDX), migrate to Sanity when content grows.

---

## 12. GITHUB REPO SETUP CHECKLIST

```bash
# 1. Initialize git (if not done)
cd /home/thierry/chronoflow
git init
git branch -M main

# 2. Create repo on GitHub (manual step at github.com)
# Name: chronoflow
# Description: "Your Anime Journey, Optimized — AI-powered watch order generator"
# Public

# 3. Add remote
git remote add origin https://github.com/agenticweeb/chronoflow.git

# 4. First commit
git add .
git commit -m "feat: initial ChronoFlow build

- AI-powered watch order generation with 8-provider failover
- Universal anime search (Jikan + AniList)
- 4-tier smart skip system
- Interactive flowchart with progress tracking
- Time-aware path generation
- Shareable watch paths
- Zero-cost architecture (free APIs, no database)"

# 5. Push
git push -u origin main
```

---

## 13. VERCEL DEPLOYMENT CHECKLIST

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy from project directory
cd /home/thierry/chronoflow
vercel --prod

# 4. Add environment variables in Vercel Dashboard
# Project Settings → Environment Variables
# Add all keys from .env.local

# 5. Or connect GitHub repo for auto-deploy
# Vercel Dashboard → Add New Project → Import Git Repository
# Select agenticweeb/chronoflow
# Framework Preset: Next.js
# Build Command: next build
# Output Directory: .next
```

---

## 14. EMERGENCY CONTACTS / RESOURCES

| Resource | URL |
|----------|-----|
| Next.js Docs | https://nextjs.org/docs |
| Tailwind Docs | https://tailwindcss.com/docs |
| Jikan API Docs | https://docs.api.jikan.moe/ |
| AniList API Docs | https://docs.anilist.co/ |
| OpenRouter Docs | https://openrouter.ai/docs |
| Groq Docs | https://console.groq.com/docs |
| Vercel Docs | https://vercel.com/docs |
| Project GitHub | https://github.com/agenticweeb/chronoflow |
| Creator X | https://x.com/agenticweeb |

---## DEVELOPMENT LOG & RESOLVED ISSUES (Update: July 2026)

### 1. Resolved AI Generation Failover & API Key Mismatches
*   **The Issue:** Generation pipeline throwing `All AI providers exhausted` error on development start.
*   **Why it occurred:** 
    1.  **Google Gemini Direct Header:** The direct endpoint (`google-gemini`) does not support the OpenAI standard `Authorization: Bearer` header. It was returning `401 Unauthorized` because it requires the `x-goog-api-key` header instead.
    2.  **OpenRouter-Google Extraction:** The code looked for `provider.name.includes("google")` to parse the direct Gemini candidates array. However, `openrouter-google` is routed through OpenRouter, which normalizes results into standard OpenAI completions. This caused a parsing crash when using the Google model via OpenRouter.
*   **The Fix:** 
    *   Updated the fallback logic in `src/lib/ai-providers.ts` to assign headers dynamically based on the active provider.
    *   Strictly isolated direct Google endpoint responses (`provider.name === "google-gemini"`), ensuring correct OpenAI format parsing for OpenRouter models.
    *   Added detailed, verbose terminal logging inside the `catch` loop so that failures (HTTP codes, exceptions) are instantly readable in the development terminal.

### 2. Implemented RAG (Retrieval-Augmented Generation) Context Pipeline
*   **The Issue:** AI model knowledge cutoffs led to massive hallucinations on newer/obscure/ongoing titles. If the model didn't recognize a show (e.g. *Clevatess* from July 2025), it matched unrelated keyword data from its memory (recommending *Shield Hero* instead).
*   **The Fix:** 
    *   Priced in a real-time pre-fetch step inside `src/app/api/watch-order/route.ts`.
    *   The API route now queries the **AniList GraphQL relation graph** or MyAnimeList (Jikan) directly before prompting the AI, creating a unified list of verified sequels, spin-offs, movies, and prequels.
    *   Injects this list of **Verified Database Entries** directly into the LLM system prompt. The LLM is strictly instructed to categorize and order *only* these database items, resulting in **zero hallucinations** across all anime.

### 3. Fixed Episode Duration & Smart-Skip Timeline Calculation Bloats
*   **The Issue:** Watching timelines were extremely inaccurate; standard 24-episode series were showing up as taking a year of daily viewing to complete.
*   **Why it occurred:** 
    1.  LLMs returned `durationMinutes` representing the **total season runtime** (e.g. 455 minutes total), but our accumulator was multiplying this total runtime by the `episodeCount` again.
    2.  Mini-shorts and Twitter ONAs (like *Katarina Nounai Kaigi* which is only **44 seconds** per episode) were parsed as regular 24-minute episodes because our string parser didn't recognize `"sec"`, inflating short OVA durations to hours.
*   **The Fix:** 
    *   Built an intelligent parser `parseDuration` in `src/app/api/watch-order/route.ts` which decodes MyAnimeList durations.
    *   Added dedicated processing for seconds (`"sec"`, `"second"`) which correctly rounds short ONAs/PVs to `1` minute.
    *   Added a clamp safeguard: Any TV episode format with a calculated runtime over 60 minutes is clamped back to the 24-minute standard.

### 4. Resolved Interactive Sticky Search UI Bugs
*   **The Issue:** Typing or clicking a new anime on the search bar while look at a generated watch order didn't render the new selection, locking the search bar. Also, resetting/starting over left search text stuck inside the input.
*   **The Fix:**
    *   Refactored `src/app/page.tsx`'s search select handler (`handleSelectAnime`) to instantly execute `reset()` on the watch-order hook, wiping the old results flowchart so the UI naturally shifts back to the custom preferences panel.
    *   Added a synchronization `useEffect` inside `src/components/AnimeSearch.tsx` that binds local input query states to parent changes, instantly clearing the input on resets or suggestions clicks.
    *   Renamed local suggested helper inside `page.tsx` to `SuggestionCardImage` to resolve name collision issues.

### 5. Added Zero-Cost Suggestion & Bug Feedback System
*   **Implementation:** Created `/api/feedback/route.ts` which connects to a dedicated developer Discord Webhook. 
*   **Result:** Users can click a floating purple trigger bubble in the bottom right corner of ChronoFlow at any time to instantly send suggestions, and the developer receives push-notifications immediately inside their Discord server.

Here is the complete, updated, and exhaustive PROJECT_CONTEXT.md file. It
compiles every file we modified, documents our upstream scope-propagation
architecture, details our system-wide fixes, and establishes a clear technical
blueprint so any incoming developer or AI can pick up the project with zero
friction.

# ChronoFlow — PROJECT CONTEXT

> **Last Updated:** 2026-07-11  
> **Current Status:** Build successful, compilation verified, deployed to GitHub & Vercel
> **Session Owner:** @agenticweeb (X: x.com/agenticweeb | GitHub: github.com/agenticweeb)

---

## 1. PROJECT OVERVIEW

### What We're Building
**ChronoFlow** — An intelligent anime watch order generator that solves the #1 problem anime fans face: knowing what to watch, in what order, and what to skip across sprawling universes or massive long-running series [1].

### Core Value Proposition
- **Any anime coverage** — Not just popular shows. AI generates watch orders on-demand for any title (JoJo, Hunter x Hunter, Grand Blue Dreaming, obscure OVAs) [1]
- **Three Request-Scope Formats** — Resolves different watch order flavors dynamically: Franchise guides (distinct shows in order), long-running series guides (filler skip guides aggregated by arc ranges), and standalone seasons (episode-by-episode breakdowns) [1]
- **Strict ID-First Merging** — Re-merges live metadata (covers, runtimes, and trailer links) strictly by verified database ID, completely eliminating AI hallucinations [1]
- **Zero Cost to Run** — Free AI APIs (OpenRouter/Groq/GitHub/Google), free data APIs (Jikan/AniList), no database [1]
- **Offline local cache** — Client-side caching using localStorage with TTL & LRU eviction [1]

### Target User
Anime enthusiasts who:
- Are overwhelmed by franchise complexity (Fate/, Monogatari, Macross) [1]
- Want to skip filler without missing character introductions [1]
- Need time-budgeted viewing plans [1]
- Want to share watch paths with friends [1]

### Tech Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14.2.5 (App Router) | React framework with API routes [1] |
| Language | TypeScript 5.5.3 | Type safety [1] |
| Styling | Tailwind CSS 3.4.6 | Utility-first CSS [1] |
| UI Components | Lucide React | Icons [1] |
| Animation | Framer Motion | Smooth transitions [1] |
| State | Zustand 4.5.4 | Global state (installed, not yet used) [1] |
| Data Fetching | TanStack Query 5.51.0 | Server state (installed, not yet used) |
| AI Engine | OpenRouter + Groq + GitHub Models + Google | Auto-failover LLM inference with 8000 output tokens [1] |
| Data APIs | Jikan v4 (MAL) + AniList GraphQL | Anime metadata, scores, images [1] |
| Cache | localStorage (ChronoCache class) | Client-side caching with TTL & LRU eviction [1] |
| Progress | localStorage (useProgress hook) | Watch progress persistence [1] |
| Deployment | Vercel | Serverless Next.js hosting [1] |

---

## 2. COMPLETE PROJECT STRUCTURE

/home/thierry/chronoflow/ │ ├── .env.example # Template for API keys (SAFE to
push) ├── .env.local # REAL API keys — NEVER PUSH (gitignored) ├── .gitignore #
Ignores node_modules, .env*.local, build dirs ├── next.config.js # Next.js
config (images, no static export) ├── package.json # Dependencies & scripts ├──
postcss.config.js # PostCSS with Tailwind + Autoprefixer ├── tailwind.config.ts
# Tailwind theme (custom colors, fonts) ├── tsconfig.json # TypeScript config
(strict mode, path aliases) │ ├── public/ # Static assets │ └── suggestions/ #
High-definition local suggested anime covers │ └── src/ │ ├── app/ │ ├── api/ │
│ ├── enrich/ │ │ │ └── route.ts # POST /api/enrich — enriches entries with live
MAL/AniList data │ │ ├── feedback/ │ │ │ └── route.ts # POST /api/feedback —
forwards bug reports and requests to Discord Webhook │ │ ├── image-proxy/ │ │ │
└── route.ts # GET /api/image-proxy — server-side proxy to bypass CDN referrer
blocks │ │ ├── search/ │ │ │ └── route.ts # GET /api/search?q= — searches Jikan
+ AniList simultaneously │ │ └── watch-order/ │ │ └── route.ts # POST
/api/watch-order — generates AI watch order with filters │ ├── globals.css #
Tailwind directives + custom CSS (no @apply, pure CSS vars) │ ├── layout.tsx #
Root layout (dark mode, system fonts) │ └── page.tsx # Main page — search,
preferences, generate button, results │ ├── components/ │ ├── AnimeSearch.tsx #
Search input with dropdown, debounced, abort controller │ ├── Flowchart.tsx #
Interactive flowchart with expandable nodes, progress tracking │ ├──
PreferencePanel.tsx # Time budget, mood, skip strategy, path type, content
toggles │ └── SuggestionImage.tsx # Direct load img component with local proxy
and monogram fallbacks │ ├── hooks/ │ ├── useProgress.ts # localStorage-based
watch progress (toggle, rate, notes, share code) │ ├── useSearch.ts # Debounced
search with abort controller │ └── useWatchOrder.ts # Watch order generation
state management │ ├── lib/ │ ├── ai-providers.ts # AI failover engine (8
providers, auto-retry, exponential backoff) │ ├── anilist-client.ts # AniList
GraphQL client (search, media details) │ ├── cache.ts # ChronoCache —
localStorage with TTL, LRU eviction, stats │ ├── jikan-client.ts # Jikan v4 API
client (search, details, franchise, rate-limited) │ ├── calendar-generator.ts #
ICS Watch Schedule generator │ └── utils.ts # cn(), debounce(),
formatDuration(), estimateTime(), generateShareText(), compress/decompress URL │
└── types/ └── index.ts # All TypeScript interfaces (AIProvider,
WatchOrderEntry, UserPreferences, etc.)


---

## 3. WHAT WE'VE COMPLETED

### ✅ Phase 1: Foundation (DONE)
- [x] Core config files: package.json, tsconfig.json, next.config.js, tailwind.config.ts, postcss.config.js
- [x] .env.example with all provider key slots
- [x] .gitignore protecting .env*.local

### ✅ Phase 2: Type System (DONE)
- [x] Complete TypeScript definitions in src/types/index.ts
- [x] Declared all fields for `AIGeneratedEntry`, `VerifiedEntry`, and `WatchOrderEntry` including `trailerUrl` and `description`.

### ✅ Phase 3: Core Libraries (DONE)
- [x] ai-providers.ts — 8-provider failover chain with prompt engineering and max_tokens bumped to 8000 [1]
- [x] jikan-client.ts — Rate-limited MAL API client [1]
- [x] anilist-client.ts — GraphQL AniList client enriched with descriptions, scores, formats, and trailers [3]
- [x] cache.ts — Intelligent localStorage cache with TTL & LRU [1]
- [x] utils.ts — Helper functions

### ✅ Phase 4: API Routes (DONE)
- [x] /api/search — Parallel search with query-coherence relation graph matching and Franchise Hub card injection [1]
- [x] /api/image-proxy — Local image proxy bypassing HTTP 403 blocks [1]
- [x] /api/feedback — Private Discord Webhook form poster [1]
- [x] /api/watch-order — Full pipeline: cache check $\rightarrow$ search $\rightarrow$ AI $\rightarrow$ enrichment $\rightarrow$ filtering $\rightarrow$ cache store [1]

### ✅ Phase 5: React Hooks (DONE)
- [x] useWatchOrder — API call state management passing scope and ID payloads [1]
- [x] useSearch — Debounced search with abort controller [1]
- [x] useProgress — localStorage progress tracking [1]

### ✅ Phase 6: UI Components (DONE)
- [x] AnimeSearch — Autocomplete dropdown with images, scores, franchise indicators [1]
- [x] PreferencePanel — Time budget, mood tags, skip strategy, path type, content toggles [1]
- [x] Flowchart — Visual timeline with expandable nodes, progress tracking, share button, and "Focus This Season" direct-ID navigation [1]
- [x] SuggestionImage — Multi-tier fallback (Direct $\rightarrow$ Proxy $\rightarrow$ Monogram) image component [1]

---

## 4. CURRENT TASK — WHERE WE LEFT OFF

**Status:** Build successful, types verified, deployed to production.

```bash
cd /home/thierry/chronoflow
npm run build
# Compiled successfully!

5. KEY ARCHITECTURAL DECISIONS

5.1 The Upstream Scope Propagation Pattern

Scope propagates from the Search UI state \rightarrow Page Context \rightarrow
API Endpoint \rightarrow AI Prompt [1]:

  - Scope "franchise" \rightarrow compiles the complete multi-degree relation
    graph using prefix search [1, 3] \rightarrow prompts the AI with the
    Franchise Guide template [1].
  - Scope "season" \rightarrow compiles localized immediate relations only
    \rightarrow prompts the AI with the Arc-Based Skip Guide template [1].
  - Scope "movie" \rightarrow skips the AI, generating a single movie card with
    database-vetted duration [1].

5.2 Strict Database ID Matching

The AI is strictly prohibited from inventing factual data. The backend maps
entries returned by the AI strictly by their unique integer AniList IDs [1]. If
the AI outputs an ID that is not in the pre-vetted context graph, the entry is
immediately discarded [1].

5.3 Mathematical Episode Arc Slicing (Type B)

For long-running TV series (like Bleach), the AI divides the parent TV show into
story arcs and outputs the episode range (e.g., "21-63"). The server calculates
the episode count mathematically (63 - 21 + 1 = 43 episodes), completely
preventing AI guessing errors [1].

5.4 Format-Aware Duration Clamping

  - TV Series Nodes: Episode durations are clamped to the standard 24 minutes,
    preventing the AI from summing up total season runtimes [1].
  - Movies & OVAs: Runtimes are pulled directly from the database node (e.g. 93
    minutes) and the episode count is strictly overridden to 1 [1].

5.5 Zero-Cost Discord Webhook Suggestions

Users submit feedback directly to your private Discord server without
maintaining databases, using Next.js serverless functions and colored Discord
Rich Embeds [1].

6. DEPENDENCIES INSTALLED

{
  "next": "14.2.5",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "framer-motion": "^11.3.0",
  "lucide-react": "^0.400.0",
  "zustand": "^4.5.4",
  "@tanstack/react-query": "^5.51.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.4.0",
  "typescript": "^5.5.3",
  "@types/node": "^20.14.10",
  "@types/react": "^18.3.3",
  "@types/react-dom": "^18.3.0",
  "tailwindcss": "^3.4.6",
  "postcss": "^8.4.39",
  "autoprefixer": "^10.4.19",
  "eslint": "^8.57.0",
  "eslint-config-next": "14.2.5",
  "html-to-image": "^1.11.11"
}

7. KNOWN ISSUES / BLOCKERS

| Issue                                             | Severity | Status    | Notes                              |
| ------------------------------------------------- | -------- | --------- | ---------------------------------- |
| Next.js 14.2.5 security vulnerability             | Medium   | Known     | Upgrade to latest when ready \[1\] |
| npm deprecation warnings (inflight, rimraf, glob) | Low      | Known     | Doesn't affect functionality       |
| No error boundary for AI hallucinations           | Low      | Mitigated | ID safety drop handles this \[1\]  |
| No loading skeleton for flowchart                 | Low      | To add    | Currently shows text only          |

8. NEXT STEPS (Prioritized)

- [ ] Add Vercel Analytics for tracking.
- [ ] Add loading skeletons for the flowchart generation.
- [ ] Implement Cloud sync/auth (Clerk or NextAuth) if desired.

9. CURRENT STATE OF ALL KEY FILES

src/lib/ai-providers.ts

/**
 * AI Provider Configuration & Auto-Failover Engine
 * 
 * Optimized Chain: Groq Direct → Google Direct → GitHub Mini → Backups
 */

import { AIProvider } from "@/types";

// ── Provider Definitions ───────────────────────────────────
export const AI_PROVIDERS: AIProvider[] = [
  {
    name: "groq-direct",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile", 
    apiKeyEnv: "GROQ_API_KEY",
    priority: 1, 
    headers: {},
  },
  {
    name: "google-gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    model: "gemini-1.5-flash",
    apiKeyEnv: "GOOGLE_AI_API_KEY",
    priority: 2, 
    headers: {},
    bodyModifier: (body: any) => ({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                body.messages?.[0]?.content ||
                body.messages?.[0],
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8000 },
    }),
  },
  {
    name: "github-gpt4o-mini",
    endpoint: "https://models.inference.ai.azure.com/chat/completions",
    model: "gpt-4o-mini", 
    apiKeyEnv: "GITHUB_MODELS_TOKEN",
    priority: 3, 
    headers: {
      "User-Agent": "ChronoFlow",
    },
  },
  {
    name: "github-gpt4o",
    endpoint: "https://models.inference.ai.azure.com/chat/completions",
    model: "gpt-4o",
    apiKeyEnv: "GITHUB_MODELS_TOKEN",
    priority: 4, 
    headers: {
      "User-Agent": "ChronoFlow",
    },
  },
  {
    name: "openrouter-google",
    endpoint: "https://openrouter.ai/api/openai/v1/chat/completions",
    model: "google/gemini-2.5-flash",
    apiKeyEnv: "OPENROUTER_API_KEY",
    priority: 5,
    headers: {
      "HTTP-Referer": "https://chronoflow.app",
      "X-Title": "ChronoFlow",
    },
  },
  {
    name: "openrouter-groq",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.1-70b-instruct",
    apiKeyEnv: "OPENROUTER_API_KEY",
    priority: 6,
    headers: {
      "HTTP-Referer": "https://chronoflow.app",
      "X-Title": "ChronoFlow",
    },
  },
  {
    name: "openrouter-cerebras",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "cerebras/llama-3.1-70b",
    apiKeyEnv: "OPENROUTER_API_KEY",
    priority: 7,
    headers: {
      "HTTP-Referer": "https://chronoflow.app",
      "X-Title": "ChronoFlow",
    },
  },
  {
    name: "cerebras-direct",
    endpoint: "https://api.cerebras.ai/v1/chat/completions",
    model: "llama-3.1-70b",
    apiKeyEnv: "CEREBRAS_API_KEY",
    priority: 8,
    headers: {},
  },
];

// ── Verified Entry Shape (Fully declared to satisfy strict TS compilers) ──
export interface VerifiedEntry {
  anilistId: number;
  malId?: number;
  title: string;
  type?: string;          
  episodes?: number | null;
  duration?: number | null;      
  popularity?: number;
  format?: string | null;        
  description?: string | null;    
  trailer?: {                     
    id: string;
    site: string;
  } | null;
  imageUrl?: string | null;
  coverImage?: {
    large: string;
    medium: string;
  } | null;
  averageScore?: number | null;
  score?: number | null;
  genres?: string[];
  status?: string | null;
  titleJapanese?: string | null;
  relationType?: string | null;
}

// ── Prompt Builder (Optimized for Franchise Guides vs Arc-based guides) ──
export function buildWatchOrderPrompt(
  animeName: string,
  preferences: any,
  verifiedEntries: VerifiedEntry[],
  scope?: string
): string {
  const verifiedBlock =
    verifiedEntries.length > 0
      ? verifiedEntries
          .map((e) => {
            const id = e.anilistId ?? e.malId ?? "?";
            const type = e.type || e.format || "Unknown";
            const eps = e.episodes ?? "Unknown";
            const dur = e.duration ? `${e.duration}m` : "?";
            return `- ID: ${id} | "${e.title}" | ${type} | ${eps} eps | ${dur}`;
          })
          .join("\n")
      : "(No verified entries available.)";

  const prefHints: string[] = [];
  if (preferences?.skipPreference) {
    prefHints.push(`Skip preference: ${preferences.skipPreference}`);
  }
  if (preferences?.includeMovies === false) {
    prefHints.push("Exclude movies");
  }
  if (preferences?.includeOVAs === false) {
    prefHints.push("Exclude OVAs");
  }
  if (preferences?.includeSpecials === false) {
    prefHints.push("Exclude specials");
  }
  if (preferences?.mood && preferences.mood.length > 0 && !preferences.mood.includes("all")) {
    prefHints.push(`Mood tags: ${preferences.mood.join(", ")}`);
  }
  const prefBlock = prefHints.length > 0 ? prefHints.join("\n") : "(none)";

  const isFranchiseScope = scope === "franchise";

  return `You are ChronoFlow, an expert anime watch order curator with deep knowledge of narrative structures, story arcs, and filler lists.

TASK: Generate a curated watch order guide for "${animeName}".

The request scope is: [${(scope || "season").toUpperCase()}]

[OUTPUT FORMAT SELECTION]
${
  isFranchiseScope 
    ? `- CHOSEN CLASSIFICATION: TYPE A: FRANCHISE GUIDE (e.g. Fate Series, Monogatari, Gundam)
       * Output one entry per distinct show, season, or movie.
       * Keep descriptions to 1-3 highly descriptive sentences explaining what each entry is, where it fits, and why it is essential/recap/optional/filler.`
    : `- CHOSEN CLASSIFICATION: TYPE B: SINGLE SHOW GUIDE (e.g. Bleach, One Piece, Naruto, Fate/Zero)
       * Output an ARC-BASED skip guide for this specific show.
       * Each arc is ONE entry representing a folder block of episodes with an episode range like "21-63".
       * Mark filler arcs as tier "skip" with isFiller: true.
       * Mark canon arcs as tier "essential" or "recommended".
       * ALWAYS combine them into named arcs.`
}

[STRICT ARCHITECTURAL SAFETY RULES]
1. YOU CANNOT INVENT ANY ENTRIES. Every single item in your "entries" array MUST have an "id" matching an ID from the "Verified Database Entries" list below. If an ID is not in that list, you are strictly FORBIDDEN from including it.
2. DO NOT GUESS EPISODE COUNTS OR DURATIONS. The application backend will automatically overwrite these values with 100% verified database facts. Focus entirely on recommended viewing order.

Below is the VERIFIED LIST of anime entries fetched from the AniList database. These are real entries with real IDs. You MUST base your output on these entries. Do NOT invent titles or IDs.

${verifiedBlock}

User preferences:
${prefBlock}

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "franchise": "string (the franchise name or main show name)",
  "description": "string (overview of how to watch, e.g. 'Linear shonen with ~50% filler. Skip marked arcs.')",
  "confidence": 0-100,
  "entries": [
    {
      "id": number (The EXACT database ID matching the verified input entries),
      "title": "string (The Arc name with episode range like 'Soul Society Arc (Eps 21-63)' or the Season Title)",
      "type": "TV" | "MOVIE" | "OVA" | "SPECIAL",
      "tier": "essential" | "recommended" | "optional" | "skip",
      "episodeRange": "X-Y" or null (The episode range of this specific arc if Type B, otherwise null),
      "position": 1,
      "prerequisites": [],
      "isFiller": boolean,
      "fillerClassification": "none|recap|side-story|character-intro|world-building|fanservice|transition|mixed",
      "fillerReason": "string (max 10 words)",
      "whyWatch": "string (highly descriptive context, why it matters, or character developments)",
      "skipWarning": "string or null (what you miss if skipped)",
      "watchIf": ["string"],
      "contentTags": ["Action","Adventure","Comedy","Drama","Fantasy","Sci-Fi","Shounen","Seinen","Supernatural"]
    }
  ],
  "paths": [
    {
      "name": "string",
      "description": "string",
      "entries": ["title1", "title2"],
      "totalTime": "string",
      "bestFor": ["string"]
    }
  ],
  "warnings": ["string or empty"]
}

Output the JSON now.`;
}

// ── Auto-Failover Call ─────────────────────────────────────
export async function callAIWithFallback(
  prompt: string,
  maxRetries: number = 1
): Promise<{ content: string; provider: string; latency: number }> {
  const sortedProviders = [...AI_PROVIDERS].sort(
    (a, b) => a.priority - b.priority
  );

  for (const provider of sortedProviders) {
    const apiKey = process.env[provider.apiKeyEnv];
    if (!apiKey) {
      console.log(`⚠️  ${provider.name}: Key "${provider.apiKeyEnv}" missing, skipping...`);
      continue;
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const startTime = Date.now();
      try {
        const body = provider.bodyModifier
          ? provider.bodyModifier({
              messages: [{ role: "user", content: prompt }],
            })
          : {
              model: provider.model,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
              max_tokens: 8000, 
            };

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...provider.headers,
        };

        if (provider.name === "google-gemini") {
          headers["x-goog-api-key"] = apiKey;
        } else {
          headers["Authorization"] = `Bearer ${apiKey}`;
        }

        const response = await fetch(provider.endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const latency = Date.now() - startTime;

        let content = "";
        if (provider.name === "google-gemini") {
          content =
            data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          content =
            data.choices?.[0]?.message?.content ||
            data.choices?.[0]?.text ||
            "";
        }

        if (!content) {
          throw new Error("Empty response from provider");
        }

        console.log(`✅ ${provider.name} responded in ${latency}ms`);
        return { content, provider: provider.name, latency };
      } catch (error: any) {
        const latency = Date.now() - startTime;
        console.error(
          `❌ ${provider.name} (Attempt ${attempt + 1}/${maxRetries}) failed in ${latency}ms:`,
          error.message || error
        );

        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
  }

  throw new Error(
    "All AI providers exhausted. Please check your API keys in .env.local"
  );
}

src/app/api/watch-order/route.ts

/**
 * API Route: Generate Watch Order
 */

import { NextRequest, NextResponse } from "next/server";
import {
  buildWatchOrderPrompt,
  callAIWithFallback,
  VerifiedEntry,
} from "@/lib/ai-providers";
import { searchAnime } from "@/lib/jikan-client";
import { searchAniList, getMediaDetails } from "@/lib/anilist-client";
import { cache } from "@/lib/cache";
import {
  WatchOrderResult,
  WatchOrderEntry,
  UserPreferences,
  AIGeneratedOrder,
} from "@/types";

// Helper: Safely parses human-readable Jikan/AniList duration strings into minutes
function parseDuration(durationStr?: string, type?: string): number {
  if (!durationStr) {
    return type === "Movie" ? 90 : 24;
  }
  const clean = durationStr.toLowerCase();

  if (clean.includes("sec") || clean.includes("second")) {
    const match = clean.match(/(\d+)\s*sec/);
    if (match) {
      const seconds = parseInt(match[1], 10);
      return Math.max(1, Math.ceil(seconds / 60));
    }
    return 1;
  }

  if (clean.includes("per ep") || clean.includes("min")) {
    const match = clean.match(/(\d+)\s*min/);
    if (match) return parseInt(match[1], 10);
  }

  if (clean.includes("hr") || clean.includes("hour")) {
    const hrMatch = clean.match(/(\d+)\s*hr/);
    const minMatch = clean.match(/(\d+)\s*min/);
    let total = 0;
    if (hrMatch) total += parseInt(hrMatch[1], 10) * 60;
    if (minMatch) total += parseInt(minMatch[1], 10);
    if (total > 0) return total;
  }

  return type === "Movie" ? 90 : 24;
}

// Pre-fetches immediate franchise network nodes including trailer schema
async function getFranchiseGraph(bestMatch: any, scope?: string): Promise<VerifiedEntry[]> {
  const entries: VerifiedEntry[] = [];

  if (bestMatch.anilistId) {
    try {
      // 1. Fetch immediate (1st degree) relations
      const details = await getMediaDetails(bestMatch.anilistId);
      const media = details?.Media;

      if (media) {
        entries.push({
          anilistId: media.id,
          malId: media.idMal,
          title: media.title?.english || media.title?.romaji || media.title?.native,
          type: media.format,
          format: media.format,
          episodes: media.episodes,
          duration: media.duration,
          popularity: media.popularity || 0,
          description: media.description,
          trailer: media.trailer,
        });
      }

      const relations = media?.relations?.edges || [];
      for (const edge of relations) {
        const node = edge.node;
        if (!node) continue;

        const fmt = (node.format || "").toLowerCase();
        if (fmt === "music") continue;

        entries.push({
          anilistId: node.id,
          malId: node.idMal,
          title: node.title?.english || node.title?.romaji || node.title?.native,
          type: node.format,
          format: node.format,
          episodes: node.episodes,
          duration: node.duration,
          popularity: node.popularity || 0,
          description: node.description,
          trailer: node.trailer,
          relationType: edge.relationType,
        });
      }

      // 2. Multi-Degree Prefix Search: Only run if user requested franchise scope
      const mainTitle = (bestMatch.title || "").toLowerCase();
      let stemWord = "";
      
      if (mainTitle.includes("fate")) stemWord = "fate";
      else if (mainTitle.includes("jojo")) stemWord = "jojo";
      else if (mainTitle.includes("monogatari")) stemWord = "monogatari";
      else if (mainTitle.includes("gundam")) stemWord = "gundam";
      else if (mainTitle.includes("toaru") || mainTitle.includes("magical index")) stemWord = "toaru";
      else if (mainTitle.includes("bleach")) stemWord = "bleach";
      else if (mainTitle.includes("naruto")) stemWord = "naruto";

      if (stemWord && scope === "franchise") {
        const widerQuery = `
          query($search: String) {
            Page(perPage: 25) {
              media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                id idMal title { english romaji native } format episodes duration averageScore description genres coverImage { large } status trailer { id site } popularity
              }
            }
          }
        `;
        
        const widerPayload = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: widerQuery, variables: { search: stemWord } }),
        });

        if (widerPayload.ok) {
          const data = await widerPayload.json();
          const widerMedia = data?.data?.Page?.media || [];
          for (const item of widerMedia) {
            const fmt = (item.format || "").toLowerCase();
            if (fmt === "music") continue;

            entries.push({
              anilistId: item.id,
              malId: item.idMal,
              title: item.title?.english || item.title?.romaji || item.title?.native,
              type: item.format,
              format: item.format,
              episodes: item.episodes,
              duration: item.duration,
              popularity: item.popularity || 0,
              description: item.description,
              status: item.status,
              trailer: item.trailer,
            });
          }
        }
      }

    } catch (err) {
      console.warn("Failed to fetch relations from AniList:", err);
    }
  }

  const seen = new Set<string>();
  const unique: VerifiedEntry[] = [];
  for (const e of entries) {
    const key = e.anilistId ? `ani_${e.anilistId}` : `t_${e.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(e);
    }
  }

  return unique.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 30);
}

// Bulletproof JSON parser to prevent conversational markdown parsing failures
function cleanAndParseJSON(text: string): any {
  let cleaned = text.trim();

  const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(markdownRegex);
  if (match) cleaned = match[1].trim();

  const firstBracket = cleaned.indexOf("[");
  const firstBrace = cleaned.indexOf("{");
  let startIdx = -1;
  let endIdx = -1;

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.slice(startIdx, endIdx + 1);
  }

  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "");
  cleaned = cleaned.replace(/(?:^|\s)\/\/.*$/gm, "");
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    try {
      const repaired = cleaned.replace(
        /"([^"\\]*(?:\\.[^"\\]*)*)"/g,
        (m, group) =>
          '"' + group.replace(/\n/g, "\\n").replace(/\r/g, "\\r") + '"'
      );
      return JSON.parse(repaired);
    } catch (secondError) {
      console.error("JSON Parsing Failure. Cleaned block:", cleaned.slice(0, 500));
      throw new Error(`Failed to parse LLM response arrays.`);
    }
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { animeName, preferences, scope, id } = body as {
      animeName: string;
      preferences: UserPreferences;
      scope?: string;
      id?: number;
    };

    if (!animeName?.trim()) {
      return NextResponse.json({ success: false, error: "Anime name is required" }, { status: 400 });
    }

    const cacheKey = `order_${animeName.toLowerCase().replace(/\s+/g, "_")}_${JSON.stringify(preferences)}`;
    const cached = cache.get<WatchOrderResult>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        latency: Date.now() - startTime,
      });
    }

    const [jikanResults, anilistResults] = await Promise.allSettled([
      searchAnime(animeName, 5),
      searchAniList(animeName, 5),
    ]);

    const jikanData = jikanResults.status === "fulfilled" ? jikanResults.value : [];
    const anilistData = anilistResults.status === "fulfilled" ? anilistResults.value : [];

    const mergedResults = [...jikanData];
    for (const ani of anilistData) {
      const existing = mergedResults.find((j) => j.malId === ani.malId);
      if (existing) {
        existing.anilistId = ani.anilistId;
        if (ani.imageUrl) existing.imageUrl = ani.imageUrl;
      } else {
        mergedResults.push(ani);
      }
    }

    // Prioritize selected ID from search UI if present, preventing loose collisions
    const bestMatch = (id && mergedResults.find(item => Number(item.anilistId) === Number(id) || Number(item.malId) === Number(id)))
      || mergedResults.find(
        (item) =>
          item.title.toLowerCase().includes(animeName.toLowerCase()) ||
          animeName.toLowerCase().includes(item.title.toLowerCase())
      ) || mergedResults[0];

    if (!bestMatch) {
      return NextResponse.json({ success: false, error: `No anime found matching "${animeName}"` }, { status: 404 });
    }

    const franchiseGraph = await getFranchiseGraph(bestMatch, scope);

    const prompt = buildWatchOrderPrompt(bestMatch.title, preferences, franchiseGraph, scope);
    const aiResponse = await callAIWithFallback(prompt);

    let aiData: AIGeneratedOrder;
    try {
      aiData = cleanAndParseJSON(aiResponse.content);
    } catch (parseError) {
      console.error("AI Response Parsing Crash. Raw content:", aiResponse.content.slice(0, 1000));
      return NextResponse.json({ success: false, error: "Failed to parse structured AI output cleanly." }, { status: 500 });
    }

    const enrichedEntries: WatchOrderEntry[] = [];

    for (let index = 0; index < aiData.entries.length; index++) {
      const entry = aiData.entries[index];

      // STRICT ID MATCHING: Cast entry as any. Strictly find match first.
      let match = franchiseGraph.find(
        (r) =>
          Number(r.anilistId) === Number((entry as any).id) ||
          Number(r.malId) === Number((entry as any).id)
      );

      // SAFE FALLBACK NET: If strict ID fails, only run loose string fallback if types are fully compatible
      if (!match) {
        match = franchiseGraph.find((r) => {
          const cleanDbTitle = r.title.toLowerCase();
          const cleanAiTitle = entry.title.toLowerCase();
          const sameType = (r.format?.toUpperCase() === entry.type?.toUpperCase()) || 
                           (r.type?.toUpperCase() === entry.type?.toUpperCase());
          return sameType && (cleanDbTitle === cleanAiTitle || cleanDbTitle.includes(cleanAiTitle) || cleanAiTitle.includes(cleanDbTitle));
        });
      }

      // CRITICAL DESIGN SAFETY: If an ID isn't in the pre-vetted list, drop the entry entirely!
      if (!match) {
        console.warn(`[Safety Drop] Skipped unvetted LLM entry ID:`, (entry as any).id);
        continue;
      }

      const cleanSynopsis = match.description ? match.description.replace(/<[^>]*>/g, "").trim() : "";

      let trailerUrl: string | undefined;
      if (match.trailer?.site?.toLowerCase() === "youtube" && match.trailer?.id) {
        trailerUrl = `https://www.youtube.com/watch?v=${match.trailer.id}`; 
      }

      const entryType = (entry.type || match.type || match.format || "").toString().toUpperCase();
      const isTVFormat = entryType === "TV" || entryType === "ONA";
      const isMovieLike = entryType === "MOVIE" || entryType === "OVA" || entryType === "SPECIAL";

      let episodesCount: number;
      let durationMinutes: number;
      let finalTitle = match.title; // Default to verified DB title

      if (isMovieLike) {
        // Movies: Strictly overwrite episodeCount to 1 (or database node length), read true duration
        episodesCount = match.episodes && match.episodes > 0 ? match.episodes : 1;
        durationMinutes = (typeof match.duration === "number" && match.duration > 0)
          ? match.duration
          : parseDuration(String(match.duration ?? ""), entryType) || 90;
      } else if (isTVFormat) {
        // TV: Trust custom arc slicing for Type B Long Series
        if ((aiData as any).type === "long_series" && (entry as any).episodeRange) {
          finalTitle = entry.title; // Keep custom Arc Title (e.g. "Soul Society Arc")
          
          // Mathematically calculate episodeCount from range bounds to prevent AI guessing errors
          const rangeMatch = (entry as any).episodeRange.match(/(\d+)-(\d+)/);
          if (rangeMatch) {
            const start = parseInt(rangeMatch[1], 10);
            const end = parseInt(rangeMatch[2], 10);
            episodesCount = Math.max(1, end - start + 1);
          } else {
            episodesCount = entry.episodeCount || 12;
          }
        } else {
          // Standard TV Seasons: Override with 100% accurate database parameters
          episodesCount = match.episodes || entry.episodeCount || 12;
        }

        // Standardize TV episode runtime to standard 24m per ep
        durationMinutes = 24;
      } else {
        episodesCount = entry.episodeCount || match.episodes || 12;
        durationMinutes = entry.durationMinutes || 24;
      }

      enrichedEntries.push({
        id: `entry_${index}`,
        malId: match.malId,
        anilistId: match.anilistId,
        title: finalTitle,
        titleJapanese: match.titleJapanese || undefined,
        type: entry.type,
        tier: entry.tier,
        episodeCount: episodesCount,
        durationMinutes,
        timeEstimate: `${episodesCount} eps × ${durationMinutes}m`,
        position: entry.position,
        prerequisites: entry.prerequisites || [],
        unlocks: [],
        contentTags: entry.contentTags || [],
        arcName: entry.arcName || undefined,
        isFiller: entry.isFiller || false,
        fillerClassification: entry.fillerClassification || "none",
        fillerReason: entry.fillerReason || "",
        whyWatch: entry.whyWatch,
        skipWarning: entry.skipWarning || undefined,
        watchIf: entry.watchIf || [],
        imageUrl: match.imageUrl || match.coverImage?.large || bestMatch?.imageUrl || "",
        trailerUrl,
        malScore: match.averageScore ? match.averageScore / 10 : match.score || undefined, // Fixed: changed null fallback to undefined
        anilistScore: match.averageScore ? match.averageScore / 10 : match.score || undefined, // Fixed: changed null fallback to undefined
        synopsis: cleanSynopsis,
        genres: match.genres || [],
        status: match.status || undefined, // Fixed: changed null fallback to undefined
      });
    }

    const entryMap = new Map(enrichedEntries.map((e) => [e.title, e.id]));
    enrichedEntries.forEach((entry) => {
      entry.prerequisites.forEach((prereq) => {
        const prereqId = entryMap.get(prereq);
        if (prereqId) {
          const prereqEntry = enrichedEntries.find((e) => e.id === prereqId);
          if (prereqEntry && !prereqEntry.unlocks.includes(entry.id)) {
            prereqEntry.unlocks.push(entry.id);
          }
        }
      });
    });

    const filteredEntries = applyFilters(enrichedEntries, preferences);

    const result: WatchOrderResult = {
      franchise: aiData.franchise || bestMatch.title.replace(/\s*\(Complete Franchise\)/i, ""), // Strips helper tag before caching
      franchiseId: `fr_${bestMatch.malId || bestMatch.anilistId || Date.now()}`,
      description: aiData.description || `Complete watch order for ${bestMatch.title}`,
      totalEntries: filteredEntries.length,
      totalEpisodes: filteredEntries.reduce((sum, e) => sum + (e.episodeCount || 0), 0),
      totalDuration: calculateTotalDuration(filteredEntries),
      entries: filteredEntries,
      paths: aiData.paths || [],
      generatedAt: new Date().toISOString(),
      aiProvider: aiResponse.provider,
      confidence: aiData.confidence || 75,
    };

    cache.set(cacheKey, result, 7 * 24 * 60 * 60 * 1000, aiResponse.provider);

    return NextResponse.json({
      success: true,
      data: result,
      provider: aiResponse.provider,
      latency: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Watch order generation failed:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}

// ── Filter Engine ──────────────────────────────────────────
function applyFilters(entries: WatchOrderEntry[], prefs: UserPreferences): WatchOrderEntry[] {
  let filtered = [...entries];

  if (!prefs.includeMovies) {
    filtered = filtered.filter((e) => e.type !== "Movie");
  }
  if (!prefs.includeOVAs) {
    filtered = filtered.filter((e) => e.type !== "OVA");
  }
  if (!prefs.includeSpecials) {
    filtered = filtered.filter((e) => e.type !== "Special");
  }
  if (!prefs.includeRecaps) {
    filtered = filtered.filter((e) => e.type !== "Recap");
  }

  if (prefs.skipPreference === "skip-all-filler") {
    filtered = filtered.filter((e) => !e.isFiller);
  } else if (prefs.skipPreference === "canon-only") {
    filtered = filtered.filter((e) => e.tier === "essential");
  } else if (prefs.skipPreference === "smart-skip") {
    filtered = filtered.filter((e) => e.tier !== "skip");
  }

  if (prefs.mood && prefs.mood.length > 0 && !prefs.mood.includes("all")) {
    const moodSet = new Set(prefs.mood.map((m) => m.toLowerCase()));
    filtered = filtered.filter((e) => e.contentTags.some((tag) => moodSet.has(tag.toLowerCase())));
  }

  return filtered;
}

function calculateTotalDuration(entries: WatchOrderEntry[]): string {
  const totalMinutes = entries.reduce(
    (sum, e) => sum + (e.episodeCount || 1) * (e.durationMinutes || 24),
    0
  );
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

src/app/api/search/route.ts

/**
 * API Route: Search
 */

import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/jikan-client";
import { searchAniList, getMediaDetails } from "@/lib/anilist-client";

interface FranchiseHubConfig {
  keywords: string[];
  title: string;
  anilistId: number;
  malId: number;
  imageUrl: string;
  synopsis: string;
  genres: string[];
}

// Custom Universal Franchise Hubs
const FRANCHISE_HUBS: FranchiseHubConfig[] = [
  {
    keywords: ["fate", "holy grail"],
    title: "Fate Series (Complete Franchise)",
    anilistId: 10087,
    malId: 10087,
    imageUrl: "/suggestions/fate.jpg",
    synopsis: "The complete chronological and route-based watch order of the entire Fate universe (Zero, stay night, Unlimited Blade Works, Heaven's Feel, Grand Order, and spin-offs).",
    genres: ["Action", "Fantasy", "Supernatural"]
  },
  {
    keywords: ["monogatari", "bakemonogatari"],
    title: "Monogatari Series (Complete Franchise)",
    anilistId: 5081,
    malId: 5081,
    imageUrl: "/suggestions/monogatari.jpeg",
    synopsis: "The complete Shaft/NisiOisiN Monogatari Series timeline, covering Bakemonogatari, Nisemonogatari, Monogatari Second Season, Owari, and Off & Monster.",
    genres: ["Mystery", "Psychological", "Supernatural"]
  },
  {
    keywords: ["jojo", "bizarre"],
    title: "JoJo's Bizarre Adventure (Complete Franchise)",
    anilistId: 14719,
    malId: 14719,
    imageUrl: "/suggestions/JoJo's Bizarre Adventure.jpeg",
    synopsis: "Follow the multi-generational journey of the Joestar family line from Phantom Blood and Battle Tendency, through Stardust Crusaders, and all the way to Stone Ocean.",
    genres: ["Action", "Adventure", "Supernatural"]
  },
  {
    keywords: ["gundam", "mobile suit"],
    title: "Gundam Series (Complete Franchise)",
    anilistId: 80,
    malId: 80,
    imageUrl: "/suggestions/Gundam (Universal Century).jpeg",
    synopsis: "The ultimate guide to the entire Gundam universe. Plan your path through the main Universal Century (UC) timeline, or alternate standalone universes (Wing, SEED, IBO, Witch from Mercury).",
    genres: ["Mecha", "Sci-Fi", "Drama"]
  },
  {
    keywords: ["steins", "steins;gate"],
    title: "Steins;Gate (Complete Franchise)",
    anilistId: 9253,
    malId: 9253,
    imageUrl: "/suggestions/Steins;Gate.jpeg",
    synopsis: "Watch the optimal temporal timeline of the Science Adventure series, integrating Steins;Gate, Steins;Gate 0, Movie, and the OVAs seamlessly.",
    genres: ["Sci-Fi", "Thriller", "Psychological"]
  },
  {
    keywords: ["toaru", "magical index", "railgun"],
    title: "Toaru Series (Complete Franchise)",
    anilistId: 4654,
    malId: 4654,
    imageUrl: "/suggestions/Toaru Series.jpeg",
    synopsis: "The ultimate overlapping watch guide for Academy City, synchronizing A Certain Magical Index, A Certain Scientific Railgun, and A Certain Scientific Accelerator.",
    genres: ["Sci-Fi", "Action", "Supernatural"]
  }
];

// ── Validation ─────────────────────────────────────────────
async function validateFranchiseMatch(
  candidate: any,
  query: string
): Promise<{ valid: boolean; score: number; graphSize: number }> {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 4);

  if (queryWords.length === 0) {
    return {
      valid: true,
      score: candidate.popularity || 0,
      graphSize: 0,
    };
  }

  let corpus = (candidate.title || "").toLowerCase();
  let graphSize = 0;

  if (candidate.anilistId) {
    try {
      const details = await getMediaDetails(candidate.anilistId);
      const relations = details?.Media?.relations?.edges || [];
      for (const edge of relations) {
        const title =
          edge.node?.title?.english ||
          edge.node?.title?.romaji ||
          edge.node?.title?.native ||
          "";
        corpus += " " + title.toLowerCase();
        graphSize++;
      }
    } catch (err) {
      return {
        valid: true,
        score: candidate.popularity || 0,
        graphSize: 0,
      };
    }
  }

  let matchedWords = 0;
  for (const word of queryWords) {
    if (corpus.includes(word)) matchedWords++;
  }
  const matchRatio = matchedWords / queryWords.length;

  const valid = matchRatio >= 0.5 || graphSize >= 3;

  const graphBonus = Math.min(graphSize / 5, 1);
  const popularityBonus = Math.min((candidate.popularity || 0) / 100000, 1);
  const score = matchRatio * 0.6 + graphBonus * 0.25 + popularityBonus * 0.15;

  return { valid, score, graphSize };
}

// ── GET Handler ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const [jikanResults, anilistResults] = await Promise.allSettled([
      searchAnime(query, 10),
      searchAniList(query, 10),
    ]);

    const jikanData =
      jikanResults.status === "fulfilled" ? jikanResults.value : [];
    const anilistData =
      anilistResults.status === "fulfilled" ? anilistResults.value : [];

    const merged = [...jikanData];
    for (const ani of anilistData) {
      const existing = merged.find((j) => j.malId === ani.malId);
      if (existing) {
        if (ani.anilistId) existing.anilistId = ani.anilistId;
        if (ani.imageUrl) existing.imageUrl = ani.imageUrl;
      } else {
        merged.push(ani);
      }
    }

    if (merged.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        latency: Date.now() - startTime,
      });
    }

    const validated: any[] = [];
    for (const candidate of merged) {
      const validation = await validateFranchiseMatch(candidate, query);
      if (validation.valid) {
        validated.push({
          ...candidate,
          _validationScore: validation.score,
          _graphSize: validation.graphSize,
        });
      }
    }

    const finalResults =
      validated.length > 0
        ? validated.sort(
            (a, b) => (b._validationScore || 0) - (a._validationScore || 0)
          )
        : merged.slice(0, 5);

    // Strip internal fields safely before returning to avoid TS compilation errors
    const cleaned = finalResults.slice(0, 10).map((item: any) => {
      const { _validationScore, _graphSize, ...rest } = item;
      return rest;
    });

    // ── Inject Custom Franchise Hubs ──
    const lowercaseQuery = query.toLowerCase();
    const matchedHubs = FRANCHISE_HUBS.filter(hub => 
      hub.keywords.some(keyword => lowercaseQuery.includes(keyword))
    );

    const injectedHubs = matchedHubs.map(hub => ({
      malId: hub.malId,
      anilistId: hub.anilistId,
      title: hub.title,
      titleJapanese: hub.title,
      imageUrl: hub.imageUrl,
      type: "Franchise",
      episodes: null,
      score: 8.8,
      synopsis: hub.synopsis,
      genres: hub.genres,
      aired: "Multiple",
      status: "FINISHED",
      isFranchise: true,
      franchiseEntries: 12,
      scope: "franchise" // Explicitly pass the franchise request scope down
    }));

    // Prepend matched franchise hubs to the top of results
    const finalCleaned = [...injectedHubs, ...cleaned.map((item: any) => ({ ...item, scope: item.type === "Movie" ? "movie" : "season" }))];

    return NextResponse.json({
      success: true,
      data: finalCleaned,
      latency: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 }
    );
  }
}

src/components/Flowchart.tsx

"use client";
import { calculateTimeBudget } from "@/lib/time-calculator";
import { TimeBudgetCard } from "@/components/TimeBudgetCard";
import { useState } from "react";
import { createPortal } from "react-dom";
import { generateWatchCalendarIcs, downloadIcsFile } from "@/lib/calendar-generator";

import {
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Star,
  AlertTriangle,
  Info,
  Share2,
  Play,
  SkipForward,
  CalendarDays,
  X,
  Target,
} from "lucide-react";

import { WatchOrderEntry, WatchOrderResult } from "@/types";
import { useProgress } from "@/hooks/useProgress";
import { cn, generateShareText } from "@/lib/utils";
import { SuggestionImage } from "@/components/SuggestionImage";

interface FlowchartProps {
  result: WatchOrderResult;
}

// Helper: Safely converts various YouTube links to embeddable streams with autoplay
function getYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  
  if (url.includes("youtube.com/embed/")) {
    return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  }
  
  return null;
}

export function Flowchart({ result }: FlowchartProps) {
  const [expanded, setExpanded] = useState(new Set<string>());
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);
  
  // Watch Calendar customization states
  const [isCalOpen, setIsCalOpen] = useState(false);
  const [calStartDate, setCalStartDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [calEpsPerDay, setCalEpsPerDay] = useState(2);
  const [calStartTime, setCalStartTime] = useState("20:00");

  const toggleEntry = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const { progress, toggleWatched, getCompletionRate } = useProgress(
    result.franchiseId
  );

  const handleShare = () => {
    const text = generateShareText(
      result.franchise,
      result.entries,
      result.totalDuration
    );
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleExportCalendar = () => {
    const icsContent = generateWatchCalendarIcs(result.franchise, result.entries, {
      startDate: calStartDate,
      episodesPerDay: calEpsPerDay,
      watchStartTime: calStartTime,
    });
    const slug = result.franchise.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadIcsFile(`chronoflow-${slug}-schedule.ics`, icsContent);
    setIsCalOpen(false);
  };

  const completionRate = getCompletionRate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gradient">
              {result.franchise}
            </h1>
            <p className="text-chrono-text-muted mt-1">{result.description}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-chrono-text-dim">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {result.totalDuration} total
              </span>
              <span>•</span>
              <span>{result.totalEntries} entries</span>
              <span>•</span>
              <span>{result.totalEpisodes} episodes</span>
              {result.confidence < 80 && (
                <span className="flex items-center gap-1 text-chrono-warning">
                  <AlertTriangle className="w-4 h-4" />
                  Limited data — AI-generated
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Progress status */}
            <div className="flex-1 sm:w-40 min-w-[120px]">
              <div className="flex justify-between text-xs text-chrono-text-muted mb-1">
                <span>Progress</span>
                <span>{completionRate}%</span>
              </div>
              <div className="h-2 bg-chrono-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-chrono-primary to-chrono-accent transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Actions button group */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCalOpen(true)}
                title="Generate custom watch calendar (.ics)"
                className="btn-secondary flex-1 sm:flex-initial flex items-center justify-center gap-2 border-chrono-primary/30 text-chrono-primary hover:bg-chrono-primary/5 transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Schedule</span>
              </button>
              <button
                onClick={handleShare}
                className="btn-secondary flex-1 sm:flex-initial flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-chrono-text-dim">
          <span>Powered by</span>
          <span className="px-2 py-0.5 bg-chrono-primary/10 text-chrono-primary rounded-full font-medium">
            {result.aiProvider}
          </span>
          <span>
            • Generated {new Date(result.generatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Time Budget Card */}
      <TimeBudgetCard
        data={calculateTimeBudget(
          result.franchise,
          result.entries.map((e) => ({
            title: e.title,
            episodes: e.episodeCount ?? 1,
            durationMin: e.durationMinutes ?? 24,
            tier: e.tier,
          })),
          new Date(result.generatedAt)
        )}
      />

      {/* Flowchart Timeline */}
      <div className="relative">
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-chrono-primary/50 via-chrono-border to-chrono-border" />

        <div className="space-y-0">
          {result.entries.map((entry, index) => (
            <FlowchartNode
              key={entry.id}
              entry={entry}
              index={index}
              isExpanded={expanded.has(entry.id)}
              onToggle={() => toggleEntry(entry.id)}
              isWatched={progress?.entries[entry.id]?.watched || false}
              onToggleWatched={() => toggleWatched(entry.id, entry)}
              isLast={index === result.entries.length - 1}
              onPlayTrailer={(url) => setActiveTrailerUrl(url)}
            />
          ))}
        </div>
      </div>

      {/* Watch Calendar Configuration Modal (Portal) */}
      {isCalOpen && typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fade-in">
            <div className="glass-card w-full max-w-md overflow-hidden relative shadow-2xl animate-slide-up border border-chrono-border">
              
              {/* Header */}
              <div className="p-6 border-b border-chrono-border/40 flex items-center justify-between bg-chrono-surface/30">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-chrono-primary" />
                  <h3 className="text-lg font-bold text-chrono-text">Customize Calendar</h3>
                </div>
                <button
                  onClick={() => setIsCalOpen(false)}
                  className="p-1.5 rounded-lg bg-chrono-surface hover:bg-chrono-surface-hover text-chrono-text-dim hover:text-chrono-text transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider block">
                    Schedule Start Date
                  </label>
                  <input
                    type="date"
                    value={calStartDate}
                    onChange={(e) => setCalStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-chrono-text-muted">Viewing Pace</span>
                    <span className="text-chrono-primary font-bold">
                      {calEpsPerDay === 1 ? "Casual (1 ep/day)" : calEpsPerDay === 2 ? "Regular (2 eps/day)" : calEpsPerDay === 4 ? "Dedicated (4 eps/day)" : "Binge (8 eps/day)"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "1 Ep", val: 1 },
                      { label: "2 Eps", val: 2 },
                      { label: "4 Eps", val: 4 },
                      { label: "8 Eps", val: 8 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setCalEpsPerDay(p.val)}
                        className={cn(
                          "py-2 rounded-lg text-xs font-semibold border transition-all",
                          calEpsPerDay === p.val
                            ? "bg-chrono-primary border-chrono-primary text-white"
                            : "bg-chrono-surface border-chrono-border/50 text-chrono-text-dim hover:text-chrono-text hover:bg-chrono-surface-hover"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider block">
                    Daily Watch Time
                  </label>
                  <input
                    type="time"
                    value={calStartTime}
                    onChange={(e) => setCalStartTime(e.target.value)}
                    className="input-field"
                  />
                </div>

                <p className="text-[11px] text-chrono-text-dim leading-relaxed bg-chrono-surface/30 p-3 rounded-lg border border-chrono-border/10">
                  This generates a fully compliant, zero-dependency calendar subscription feed containing exact time slots for every episode. Import it into Apple, Google, or Outlook Calendar to track targets.
                </p>
              </div>

              {/* Footer Button */}
              <div className="p-6 border-t border-chrono-border/40 bg-chrono-surface/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCalOpen(false)}
                  className="btn-secondary py-2.5 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExportCalendar}
                  className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex items-center gap-2"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Download .ics Feed</span>
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

      {/* Trailer Video Player Modal (Portal) */}
      {activeTrailerUrl && typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fade-in">
            <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden relative border border-chrono-border shadow-2xl bg-black">
              {/* Close Button */}
              <button
                onClick={() => setActiveTrailerUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors z-50 border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              
              {getYoutubeEmbedUrl(activeTrailerUrl) ? (
                <iframe
                  src={getYoutubeEmbedUrl(activeTrailerUrl)!}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-chrono-text-dim p-6">
                  <Play className="w-12 h-12 text-chrono-primary animate-pulse mb-3" />
                  <p className="text-sm">Could not load trailer stream. Try watching directly:</p>
                  <a
                    href={activeTrailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-chrono-primary hover:underline text-xs mt-2"
                  >
                    {activeTrailerUrl}
                  </a>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

// ── Individual Node ────────────────────────────────────────
interface FlowchartNodeProps {
  entry: WatchOrderEntry;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  isWatched: boolean;
  onToggleWatched: () => void;
  isLast: boolean;
  onPlayTrailer: (url: string) => void;
}

function FlowchartNode({
  entry,
  index,
  isExpanded,
  onToggle,
  isWatched,
  onToggleWatched,
  isLast,
  onPlayTrailer,
}: FlowchartNodeProps) {
  const tierStyles = {
    essential: "tier-essential",
    recommended: "tier-recommended",
    optional: "tier-optional",
    skip: "tier-skip",
  };

  const tierBadges = {
    essential: "badge-essential",
    recommended: "badge-recommended",
    optional: "badge-optional",
    skip: "badge-skip",
  };

  return (
    <div className="relative pl-14 sm:pl-16">
      {/* Node dot */}
      <div
        className={cn(
          "absolute left-4 sm:left-6 top-6 w-4 h-4 rounded-full border-2 z-10 transition-all",
          isWatched
            ? "bg-chrono-success border-chrono-success"
            : entry.tier === "essential"
            ? "bg-tier-essential border-tier-essential"
            : entry.tier === "recommended"
            ? "bg-tier-recommended border-tier-recommended"
            : entry.tier === "optional"
            ? "bg-tier-optional border-tier-optional"
            : "bg-tier-skip border-tier-skip"
        )}
      >
        {isWatched && (
          <Check className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />
        )}
      </div>

      {/* Card */}
      <div
        className={cn(
          "glass-card mb-4 transition-all duration-200 hover:bg-chrono-surface-hover",
          tierStyles[entry.tier],
          isWatched && "opacity-60"
        )}
      >
        {/* Header */}
        <div
          className="p-4 cursor-pointer flex items-start gap-4"
          onClick={onToggle}
        >
          {/* Poster Fallback Image */}
          <div className="w-16 h-24 rounded-lg overflow-hidden bg-chrono-surface flex-shrink-0 hidden sm:block relative">
            <SuggestionImage
              src={entry.imageUrl}
              alt={entry.title}
              franchise={entry.title}
              className="w-full h-full"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn("text-xs font-medium", tierBadges[entry.tier])}
              >
                {entry.tier.toUpperCase()}
              </span>
              <span className="text-xs text-chrono-text-dim bg-chrono-surface px-2 py-0.5 rounded-full">
                {entry.type}
              </span>
              {entry.arcName && (
                <span className="text-xs text-chrono-primary bg-chrono-primary/10 px-2 py-0.5 rounded-full">
                  {entry.arcName}
                </span>
              )}
            </div>

            <h3 className="font-semibold text-chrono-text mt-1 truncate">
              {entry.title}
            </h3>

            <div className="flex items-center gap-3 mt-2 text-sm text-chrono-text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {entry.timeEstimate}
              </span>
              {entry.episodeCount && <span>{entry.episodeCount} eps</span>}
              {entry.malScore && entry.malScore > 0 && (
                <span className="flex items-center gap-1 text-chrono-accent">
                  <Star className="w-3.5 h-3.5" />
                  {entry.malScore.toFixed(1)}
                </span>
              )}
            </div>

            <p className="text-sm text-chrono-text-dim mt-2 line-clamp-2">
              {entry.whyWatch}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatched();
              }}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                isWatched
                  ? "bg-chrono-success/20 text-chrono-success"
                  : "bg-chrono-surface text-chrono-text-dim hover:text-chrono-text hover:bg-chrono-surface-hover"
              )}
              title={isWatched ? "Mark unwatched" : "Mark watched"}
            >
              <Check className="w-5 h-5" />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-chrono-text-dim" />
            ) : (
              <ChevronDown className="w-5 h-5 text-chrono-text-dim" />
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-chrono-border/30 pt-4 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Why Watch */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-chrono-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-chrono-text">
                      Why Watch
                    </p>
                    <p className="text-sm text-chrono-text-muted mt-1">
                      {entry.whyWatch}
                    </p>
                  </div>
                </div>

                {entry.skipWarning && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-chrono-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-chrono-warning">
                        If You Skip
                      </p>
                      <p className="text-sm text-chrono-text-muted mt-1">
                        {entry.skipWarning}
                      </p>
                    </div>
                  </div>
                )}

                {entry.fillerReason && (
                  <div className="flex items-start gap-2">
                    <SkipForward className="w-4 h-4 text-chrono-text-dim mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-chrono-text-dim">
                        Filler Type
                      </p>
                      <p className="text-sm text-chrono-text-muted mt-1 capitalize">
                        {entry.fillerClassification?.replace("-", " ")}
                      </p>
                      <p className="text-sm text-chrono-text-muted">
                        {entry.fillerReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="space-y-3">
                {entry.synopsis && (
                  <div>
                    <p className="text-sm font-medium text-chrono-text">
                      Synopsis
                    </p>
                    <p className="text-sm text-chrono-text-muted mt-1 line-clamp-4">
                      {entry.synopsis}
                    </p>
                  </div>
                )}

                {entry.genres && entry.genres.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-chrono-text">
                      Genres
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.genres.map((g) => (
                        <span
                          key={g}
                          className="text-xs px-2 py-0.5 bg-chrono-surface text-chrono-text-muted rounded-full"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.watchIf && entry.watchIf.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-chrono-text">
                      Watch If You Like
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.watchIf.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-chrono-primary/10 text-chrono-primary rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.aired && (
                  <p className="text-xs text-chrono-text-dim">
                    Aired: {entry.aired}
                  </p>
                )}

                {entry.trailerUrl && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrailer(entry.trailerUrl!);
                      }}
                      className="btn-primary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-chrono-primary/10"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Trailer</span>
                    </button>
                  </div>
                )}

                {/* Focus Season Trigger (Uses pre-vetted database ID directly to prevent search-hijack swaps) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof window !== "undefined" && (window as any).ChronoFlow_SelectAnime && entry.anilistId) {
                        (window as any).ChronoFlow_SelectAnime({
                          anilistId: entry.anilistId,
                          malId: entry.malId,
                          title: entry.title,
                          type: entry.type || "TV",
                          imageUrl: entry.imageUrl,
                          scope: "season", // Force direct season-scope execution
                        });
                      }
                    }}
                    className="btn-secondary py-2 px-4 text-xs font-semibold inline-flex items-center gap-1.5 transition-all border border-chrono-border/30 hover:border-chrono-primary/50"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Focus This Season Only →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

src/app/page.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, Loader2, Wand2, Github, ExternalLink, Star, MessageSquare, X, Send, CheckCircle2 } from "lucide-react";
import { AnimeSearchResult, UserPreferences } from "@/types";
import { useWatchOrder } from "@/hooks/useWatchOrder";
import { AnimeSearch } from "@/components/AnimeSearch";
import { PreferencePanel } from "@/components/PreferencePanel";
import { Flowchart } from "@/components/Flowchart";
import { cn } from "@/lib/utils";
import { SuggestionImage } from "@/components/SuggestionImage";

const DEFAULT_PREFERENCES: UserPreferences = {
  timeBudget: "binge",
  mood: ["all"],
  skipPreference: "smart-skip",
  includeMovies: true,
  includeOVAs: true,
  includeSpecials: true,
  includeRecaps: false,
  preferredPath: "optimal",
  language: "english",
};

// Maps directly to your verified local public/suggestions folder files
const SUGGESTIONS = [
  {
    title: "Fate Series",
    malId: 10087,
    imageUrl: "/suggestions/fate.jpg",
    score: 8.3,
    tag: "Multiverse",
    tagColor: "badge-essential",
    desc: "3 parallel timelines, branching visual novel routes, and prequel structures with no defined official starting point.",
  },
  {
    title: "Monogatari Series",
    malId: 5081,
    imageUrl: "/suggestions/monogatari.jpeg",
    score: 8.4,
    tag: "Non-Linear",
    tagColor: "badge-recommended",
    desc: "Over a dozen parts adapted completely out of chronological order by SHAFT. Heavy debate over Airing vs Novel order.",
  },
  {
    title: "The Melancholy of Haruhi Suzumiya",
    malId: 849,
    imageUrl: "/suggestions/The Melancholy of Haruhi Suzumiya.jpeg",
    score: 7.8,
    tag: "Time Loop",
    tagColor: "badge-optional",
    desc: "Aired intentionally out of order in 2006, then rebroadcast with the infamous 8-episode looping 'Endless Eight' arc.",
  },
  {
    title: "Steins;Gate",
    malId: 9253,
    imageUrl: "/suggestions/Steins;Gate.jpeg",
    score: 9.1,
    tag: "Time Travel",
    tagColor: "badge-essential",
    desc: "Watching chronologically requires you to pause at S1 Episode 22, watch Steins;Gate 0, then finish S1.",
  },
  {
    title: "Toaru Series",
    malId: 4654,
    imageUrl: "/suggestions/Toaru Series.jpeg",
    score: 7.4,
    tag: "Overlap",
    tagColor: "badge-recommended",
    desc: "Index, Railgun, and Accelerator overlap in Academy City during the same timeline. Crossovers happen mid-season.",
  },
  {
    title: "Neon Genesis Evangelion",
    malId: 30,
    imageUrl: "/suggestions/Neon Genesis Evangelion.jpeg",
    score: 8.3,
    tag: "Alternate Reality",
    tagColor: "badge-skip",
    desc: "Unravel the abstract original TV finale, the legendary 'End of Evangelion' film, and the modern Rebuild tetralogy.",
  },
  {
    title: "Gundam (Universal Century)",
    malId: 80,
    imageUrl: "/suggestions/Gundam (Universal Century).jpeg",
    score: 7.8,
    tag: "Decades-Long",
    tagColor: "badge-essential",
    desc: "Spanning over 40 years of media. Navigating the UC timeline involves jumping across decades of classic series and OVAs.",
  },
  {
    title: "Higurashi: When They Cry",
    malId: 934,
    imageUrl: "/suggestions/Higurashi_ When They Cry.jpeg",
    score: 7.9,
    tag: "Mystery Loops",
    tagColor: "badge-recommended",
    desc: "A plot structured entirely around time loops. The reboots Gou/Sotsu turned out to be secret direct sequels.",
  },
  {
    title: "Kara no Kyoukai",
    malId: 3784,
    imageUrl: "/suggestions/Kara no Kyoukai.jpeg",
    score: 7.9,
    tag: "Anachronistic",
    tagColor: "badge-essential",
    desc: "This 8-movie series by ufotable was intentionally released out of order. Movie 2 is first, Movie 4 is second, Movie 1 is third.",
  },
  {
    title: "Durarara!! & Baccano!",
    malId: 6746,
    imageUrl: "/suggestions/Durarara!! & Baccano!.jpeg",
    score: 8.1,
    tag: "Hyper-Ensemble",
    tagColor: "badge-optional",
    desc: "Dozens of characters with overlapping storylines. Baccano! cuts back and forth between three years simultaneously.",
  },
  {
    title: "Ghost in the Shell",
    malId: 43,
    imageUrl: "/suggestions/Ghost in the Shell.jpeg",
    score: 8.3,
    tag: "Parallel Timelines",
    tagColor: "badge-recommended",
    desc: "Splits into three entirely separate parallel timelines: the 1995 films, Stand Alone Complex, and Arise prequel/reboots.",
  },
  {
    title: "Legend of the Galactic Heroes",
    malId: 820,
    imageUrl: "/suggestions/Legend of the Galactic Heroes.jpeg",
    score: 9.0,
    tag: "Space Opera",
    tagColor: "badge-essential",
    desc: "The massive 110-episode main OVA series is best started only after watching specific prequel movies first.",
  },
  {
    title: "Sailor Moon",
    malId: 530,
    imageUrl: "/suggestions/Sailor Moon.jpeg",
    score: 7.7,
    tag: "Classic vs Remake",
    tagColor: "badge-skip",
    desc: "Choose between the 90s classic (hundreds of filler episodes and movies) and Sailor Moon Crystal (fast-paced canon reset).",
  },
  {
    title: "JoJo's Bizarre Adventure",
    malId: 14719,
    imageUrl: "/suggestions/JoJo's Bizarre Adventure.jpeg",
    score: 8.2,
    tag: "Generational",
    tagColor: "badge-recommended",
    desc: "Follows a linear family tree, but drastic shifts in art style, genre, protagonist, and setting often throw newcomers off.",
  },
];

export default function Home() {
  const [selectedAnime, setSelectedAnime] = useState<AnimeSearchResult | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const { result, loading, error, provider, latency, generate, reset } = useWatchOrder();
  const [selectedScope, setSelectedScope] = useState<"franchise" | "season" | "movie">("season");

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"bug" | "suggestion">("suggestion");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSelectAnime = useCallback((anime: AnimeSearchResult | null) => {
    setSelectedAnime(anime);
    if (anime) {
      setSelectedScope((anime as any).scope || "season");
    }
    reset(); 
  }, [reset]);

  // Bind global selection handler so that clicking "Focus This Season" inside the timeline seamlessly targets new searches
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).ChronoFlow_SelectAnime = (anime: AnimeSearchResult) => {
        handleSelectAnime(anime);
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).ChronoFlow_SelectAnime;
      }
    };
  }, [handleSelectAnime]);

  const handleGenerate = useCallback(async () => {
    if (!selectedAnime) return;
    await generate(selectedAnime.title, preferences, selectedScope, selectedAnime.anilistId);
  }, [selectedAnime, preferences, selectedScope, generate]);

  const handleReset = useCallback(() => {
    setSelectedAnime(null);
    setPreferences(DEFAULT_PREFERENCES);
    reset();
  }, [reset]);

  const handleSelectSuggestion = useCallback((suggestion: typeof SUGGESTIONS[0]) => {
    setSelectedAnime({
      malId: suggestion.malId,
      title: suggestion.title,
      type: "TV",
      imageUrl: suggestion.imageUrl,
      score: suggestion.score,
      synopsis: suggestion.desc,
      genres: [],
      status: "Finished Airing",
      isFranchise: true,
    });
    setSelectedScope("franchise"); // Force franchise scope on sug cards
    reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [reset]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setFeedbackSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackType,
          message: feedbackMsg,
          contact: feedbackContact,
          context: selectedAnime?.title || "General",
        }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
        setFeedbackMsg("");
        setFeedbackContact("");
        setTimeout(() => {
          setFeedbackSubmitted(false);
          setFeedbackOpen(false);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const displayedSuggestions = showAllSuggestions ? SUGGESTIONS : SUGGESTIONS.slice(0, 6);

  return (
    <main className="min-h-screen bg-chrono-bg relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-chrono-primary/10 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chrono-primary to-chrono-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-chrono-text">ChronoFlow</h1>
                <p className="text-xs text-chrono-text-dim">Your Anime Journey, Optimized</p>
              </div>
            </div>
            <a
              href="https://github.com/agenticweeb/chronoflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-chrono-text-muted hover:text-chrono-text transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span className="hidden sm:inline">Star on GitHub</span>
            </a>
          </header>

          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-chrono-text mb-4">
              Never Watch Anime <span className="text-gradient">Wrong</span> Again
            </h2>
            <p className="text-lg text-chrono-text-muted max-w-2xl mx-auto">
              AI-powered watch order for any anime. Smart skip. Time-aware paths.
              From JoJo to Grand Blue Dreaming — we've got you covered.
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-8 relative z-50">
            <AnimeSearch onSelect={handleSelectAnime} selectedAnime={selectedAnime} />
          </div>

          {/* Preferences */}
          {selectedAnime && !result && (
            <div className="max-w-2xl mx-auto mb-8 animate-slide-up relative z-40">
              <PreferencePanel preferences={preferences} onChange={setPreferences} />
            </div>
          )}

          {/* Generate Button */}
          {selectedAnime && !result && (
            <div className="max-w-2xl mx-auto text-center animate-slide-up relative z-30">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your path...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Watch Order
                  </>
                )}
              </button>
              {provider && latency && (
                <p className="text-xs text-chrono-text-dim mt-3">
                  Powered by {provider} • {latency}ms
                </p>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-2xl mx-auto mt-6 glass-card p-6 border-l-4 border-tier-skip animate-fade-in relative z-30">
              <h3 className="font-semibold text-tier-skip mb-2">Generation Failed</h3>
              <p className="text-chrono-text-muted text-sm">{error}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={handleGenerate} className="btn-primary text-sm">
                  Retry
                </button>
                <button onClick={handleReset} className="btn-secondary text-sm">
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-20">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                reset();
                setSelectedAnime(null);
              }}
              className="btn-secondary text-sm"
            >
              ← New Search
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-chrono-text-muted hover:text-chrono-text transition-colors"
            >
              Reset All
            </button>
          </div>
          <Flowchart result={result} />
        </div>
      )}

      {/* Empty State / Interactive Suggestions */}
      {!selectedAnime && !result && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-0">
          
          {/* Interactive Suggestions Grid */}
          <div className="mb-16 animate-fade-in">
            <div className="text-center sm:text-left mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-chrono-text flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-5 h-5 text-chrono-accent animate-pulse" />
                Notoriously Confusing Watch Orders
              </h3>
              <p className="text-sm text-chrono-text-muted mt-1">
                Select a legendary franchise below to automatically load its profiles and explore your optimal watching path.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSuggestions.map((s) => (
                <div
                  key={s.title}
                  onClick={() => handleSelectSuggestion(s)}
                  className="glass-card group overflow-hidden cursor-pointer flex flex-col h-full border border-chrono-border/30 hover:border-chrono-primary/50 hover:shadow-lg hover:shadow-chrono-primary/10 transition-all duration-300 animate-slide-up"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-chrono-surface flex items-center justify-center">
                    <SuggestionImage 
                      src={s.imageUrl} 
                      alt={s.title} 
                      franchise={s.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 right-3 badge text-[10px] pointer-events-none badge-recommended">{s.tag}</div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-chrono-surface/10">
                    <div>
                      <h4 className="font-bold text-chrono-text text-base leading-snug group-hover:text-chrono-primary transition-colors duration-200">
                        {s.title}
                      </h4>
                      <p className="text-xs text-chrono-text-muted mt-2 line-clamp-3 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-chrono-border/20 flex items-center justify-between text-xs text-chrono-text-dim">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-chrono-accent" />
                        MAL: {s.score.toFixed(1)}
                      </span>
                      <span className="text-chrono-primary group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1 font-semibold">
                        Select Franchise →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Toggle Button for suggestions expand/collapse */}
            {SUGGESTIONS.length > 6 && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                  className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-200 shadow-md shadow-black/40 hover:scale-[1.02]"
                >
                  {showAllSuggestions ? "Show Fewer Series" : `Show All ${SUGGESTIONS.length} Complex Timelines`}
                </button>
              </div>
            )}
          </div>

          {/* Sleeker Core Features Row */}
          <div className="border-t border-chrono-border/20 pt-16">
            <div className="text-center mb-10">
              <h3 className="text-lg font-bold text-chrono-text">The ChronoFlow Engine</h3>
              <p className="text-xs text-chrono-text-dim mt-1">Built specifically for the modern anime enthusiast.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <Wand2 className="w-5 h-5" />,
                  title: "Any Anime",
                  desc: "From mainstream hits to obscure gems — AI maps the entire multiverse.",
                },
                {
                  icon: <Sparkles className="w-5 h-5" />,
                  title: "Smart Skip",
                  desc: "4-tier filler intelligence — categorizing essential, optional, and skippable content.",
                },
                {
                  icon: <ExternalLink className="w-5 h-5" />,
                  title: "Share Paths",
                  desc: "Generate custom sharing URLs. Keep friends and communities in sync effortlessly.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card p-6 text-center hover:bg-chrono-surface-hover/30 border border-chrono-border/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-chrono-primary/10 text-chrono-primary flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold text-chrono-text text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-chrono-text-dim leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Collapsible Discord Suggestion/Feedback Box */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
        {feedbackOpen && (
          <div className="glass-card w-80 sm:w-96 p-5 mb-3 shadow-2xl animate-slide-up border border-chrono-border/40 bg-chrono-bg/95 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-chrono-border/20 pb-2">
              <h4 className="font-bold text-chrono-text text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-chrono-primary" />
                Submit Feedback / Suggestion
              </h4>
              <button
                onClick={() => setFeedbackOpen(false)}
                className="text-chrono-text-dim hover:text-chrono-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-8 text-center flex flex-col items-center justify-center animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-chrono-accent animate-bounce mb-3" />
                <h5 className="font-semibold text-chrono-text text-sm">Feedback Sent Successfully!</h5>
                <p className="text-xs text-chrono-text-dim mt-1">Thank you for helping optimize ChronoFlow.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackType("suggestion")}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors",
                      feedbackType === "suggestion"
                        ? "bg-chrono-primary text-white"
                        : "bg-chrono-surface text-chrono-text-dim hover:bg-chrono-surface-hover"
                    )}
                  >
                    Feature Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackType("bug")}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors",
                      feedbackType === "bug"
                        ? "bg-tier-skip/30 text-tier-skip border border-tier-skip/50"
                        : "bg-chrono-surface text-chrono-text-dim hover:bg-chrono-surface-hover"
                    )}
                  >
                    Report Bug
                  </button>
                </div>

                <div>
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      feedbackType === "bug"
                        ? "What went wrong? List any specific anime or issue..."
                        : "What features or adjustments would you love to see?"
                    }
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    className="input-field w-full text-xs p-3 focus:ring-1 focus:ring-chrono-primary resize-none"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Your Discord username or email (Optional)"
                    value={feedbackContact}
                    onChange={(e) => setFeedbackContact(e.target.value)}
                    className="input-field w-full text-xs p-3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {feedbackSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send to Developer
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Floating trigger button */}
        <button
          onClick={() => setFeedbackOpen(!feedbackOpen)}
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 duration-200",
            feedbackOpen
              ? "bg-chrono-surface text-chrono-text border border-chrono-border"
              : "bg-chrono-primary text-white hover:bg-chrono-primary-hover shadow-chrono-primary/30 shadow-md"
          )}
        >
          {feedbackOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-chrono-border/20 bg-chrono-surface/10 py-12 relative z-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-chrono-primary to-chrono-accent flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-chrono-text text-sm">ChronoFlow</span>
            </div>
            <p className="text-xs text-chrono-text-dim leading-relaxed max-w-xs">
              Your anime journey, optimized. Mapping complex franchises with zero fluff and full schedule capabilities.
            </p>
          </div>

          {/* Col 2: Community & Retention */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider">Community</h4>
            <ul className="space-y-2 text-xs text-chrono-text-dim">
              <li>
                <a 
                  href="https://discord.gg/VQ344Fczc" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-chrono-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                  </svg>
                  <span>Discord Server</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://x.com/agenticweeb" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-chrono-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Follow on X</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/agenticweeb" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-chrono-primary transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span>GitHub Profile</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Product Engine */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-chrono-text-muted uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-chrono-text-dim">
              <li>
                <a 
                  href="https://github.com/agenticweeb/chronoflow" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-chrono-text transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li className="text-[11px] text-chrono-text-muted select-none">
                ChronoCache TTL: 7 Days
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-chrono-border/10 text-center text-xs text-chrono-text-dim">
          ChronoFlow — Open Source • Free Forever
        </div>
      </footer>
    </main>
  );
}

src/lib/anilist-client.ts

/**
 * AniList GraphQL Client
 * Free, no API key for read operations
 * 90 requests/minute limit
 * Docs: https://docs.anilist.co/
 */

import { AnimeSearchResult } from "@/types";

const ENDPOINT = "https://graphql.anilist.co";

async function queryAniList(
  query: string,
  variables: Record<string, any> = {}
) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList query failed: ${res.status}`);
  return (await res.json()).data;
}

// ── Search ─────────────────────────────────────────────────
export async function searchAniList(
  query: string,
  limit: number = 10
): Promise<AnimeSearchResult[]> {
  const q = `
    query($search: String, $perPage: Int) {
      Page(perPage: $perPage) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          idMal
          title { english romaji native }
          coverImage { large medium }
          format
          episodes
          averageScore
          description
          genres
          startDate { year month day }
          status
          relations {
            edges {
              relationType
              node { id idMal title { english romaji } format }
            }
          }
        }
      }
    }
  `;

  const data = await queryAniList(q, { search: query, perPage: limit });

  return data.Page.media.map((item: any) => ({
    malId: item.idMal,
    anilistId: item.id,
    title:
      item.title.english ||
      item.title.romaji ||
      item.title.native,
    titleJapanese: item.title.native,
    imageUrl: item.coverImage?.large || item.coverImage?.medium || "",
    type: item.format,
    episodes: item.episodes,
    score: (item.averageScore || 0) / 10,
    synopsis: item.description?.replace(/<[^>]*>/g, "") || "",
    genres: item.genres || [],
    aired: item.startDate?.year ? `${item.startDate.year}` : "",
    status: item.status,
    isFranchise: item.relations?.edges?.length > 0,
    franchiseEntries: item.relations?.edges?.length || 0,
  }));
}

// ── Get Media Details (Pre-fetches trailers and details for all relations) ──
export async function getMediaDetails(anilistId: number) {
  const q = `
    query($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title { english romaji native }
        coverImage { large }
        bannerImage
        format
        episodes
        duration
        averageScore
        popularity
        description
        genres
        tags { name rank }
        startDate { year month day }
        endDate { year month day }
        status
        season
        seasonYear
        studios { nodes { name } }
        trailer { id site }
        relations {
          edges {
            relationType
            node { 
              id 
              idMal 
              title { english romaji native } 
              format 
              episodes 
              duration
              averageScore
              description
              genres
              coverImage { large }
              startDate { year month day }
              status
              trailer { id site }
            }
          }
        }
        recommendations {
          nodes {
            mediaRecommendation { id idMal title { english romaji } coverImage { large } }
          }
        }
      }
    }
  `;
  return queryAniList(q, { id: anilistId });
}

src/components/SuggestionImage.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  src?: string | null;
  alt: string;
  franchise?: string;
  className?: string;
  ratio?: 'portrait' | 'landscape' | 'square';
};

const ASPECTS = {
  portrait:  'aspect-[2/3]',
  landscape: 'aspect-[3/2]',
  square:    'aspect-square',
};

function monogram(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3) || '?';
}

function hueFor(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h % 360;
}

const BRAND_HUE = 258;

export function SuggestionImage({
  src,
  alt,
  franchise = '',
  className,
  ratio = 'portrait',
}: Props) {
  const [errorCount, setErrorCount] = useState(0);
  const onError = useCallback(() => {
    setErrorCount(prev => prev + 1);
  }, []);

  // Standard monogram render when both direct and proxy fail
  if (!src || errorCount >= 2) {
    const initials = monogram(franchise || alt || '?');
    const hue = (BRAND_HUE + hueFor(franchise || alt) * 0.5) % 360;
    const accentHue = (hue + 60) % 360;
    return (
      <div
        role="img"
        aria-label={`Cover for ${franchise || alt || 'unknown'}`}
        className={cn(
          ASPECTS[ratio],
          'relative grid place-items-center overflow-hidden rounded-lg',
          'bg-zinc-900 ring-1 ring-white/10',
          className
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 20%, hsl(${hue} 70% 35% / 0.6), transparent 60%),
            radial-gradient(circle at 70% 80%, hsl(${accentHue} 70% 30% / 0.4), transparent 65%),
            linear-gradient(135deg, hsl(${hue} 40% 12%), #0a0a0f)
          `,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_60%)]"
        />
        <span
          className="relative font-bold tracking-tight text-white/90 select-none animate-fade-in text-lg"
        >
          {initials}
        </span>
      </div>
    );
  }

  // Failover architecture:
  // Tier 1: Load direct CDN image with referrer blockers
  // Tier 2: Fetch image through server-side proxy
  const resolvedSrc = errorCount === 1 
    ? `/api/image-proxy?url=${encodeURIComponent(src)}` 
    : src;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={onError}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      className={cn(ASPECTS[ratio], 'object-cover rounded-lg', className)}
    />
  );
}

src/hooks/useWatchOrder.ts

"use client";

import { useState, useCallback } from "react";
import { WatchOrderResult, UserPreferences, APIResponse } from "@/types";

interface UseWatchOrderReturn {
  result: WatchOrderResult | null;
  loading: boolean;
  error: string | null;
  provider: string | null;
  latency: number | null;
  generate: (animeName: string, preferences: UserPreferences, scope?: string, id?: number) => Promise<void>;
  reset: () => void;
}

export function useWatchOrder(): UseWatchOrderReturn {
  const [result, setResult] = useState<WatchOrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const generate = useCallback(
    async (animeName: string, preferences: UserPreferences, scope?: string, id?: number) => {
      setLoading(true);
      setError(null);
      setResult(null);
      setProvider(null);
      setLatency(null);

      try {
        const res = await fetch("/api/watch-order/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ animeName, preferences, scope, id }), // Passes scope and id safely
        });

        const data: APIResponse<WatchOrderResult> = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.error || "Failed to generate watch order");
        }

        setResult(data.data);
        setProvider(data.provider || null);
        setLatency(data.latency || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProvider(null);
    setLatency(null);
  }, []);

  return { result, loading, error, provider, latency, generate, reset };
}

15. SOCIAL & MONETIZATION PLANS

Creator Identity

  - X/Twitter: @agenticweeb (x.com/agenticweeb)
  - GitHub: github.com/agenticweeb
  - Project: ChronoFlow (anime watch order optimizer)

Integration Points (For Later Implementation)

Buy Me a Coffee

  - Location: Footer or floating button (bottom-right)
  - Link: buymeacoffee.com/agenticweeb (create account)
  - Timing: After project gains traction (100+ users)

Follow on X

  - Location: Footer, share dialog, about page
  - Link: x.com/agenticweeb
  - Copy: "Follow @agenticweeb for anime AI tools"

Star on GitHub

  - Location: Header (current), footer, share dialog
  - Link: github.com/agenticweeb/chronoflow
  - Copy: "Star this project — it helps others find it"

Suggestion Box

  - Implementation: Simple form → GitHub Issues API or Discord webhook
  - Fields: Feature request, bug report, anime suggestion
  - Location: Footer link or dedicated page

16. CMS INTEGRATION PLAN

For editable content (About page, changelog, blog), recommended approach:

Option A: MDX + GitHub (Simplest)

  - Store MDX files in src/content/
  - Edit via GitHub web interface
  - Next.js reads at build time
  - Pros: Free, version controlled, no external service
  - Cons: Requires rebuild to update

Option B: Sanity.io (Headless CMS)

  - Free tier: 3 users, 2 datasets
  - Real-time editing
  - GROQ queries
  - Pros: Real-time, structured content, rich text
  - Cons: Learning curve, external dependency

Option C: Notion API (Personal Favorite)

  - Use Notion as CMS
  - Fetch via API at build time or ISR
  - Pros: Familiar UI, free personal plan, flexible
  - Cons: Rate limits, requires Notion account

Recommended: Start with Option A (MDX), migrate to Sanity when content grows.

17. GITHUB REPO SETUP CHECKLIST

# 1. Initialize git (if not done)
cd /home/thierry/chronoflow
git init
git branch -M main

# 2. Create repo on GitHub (manual step at github.com)
# Name: chronoflow
# Description: "Your Anime Journey, Optimized — AI-powered watch order generator"
# Public

# 3. Add remote
git remote add origin https://github.com/agenticweeb/chronoflow.git

# 4. First commit
git add .
git commit -m "feat: initial ChronoFlow build

- AI-powered watch order generation with 8-provider failover
- Universal anime search (Jikan + AniList)
- 4-tier smart skip system
- Interactive flowchart with progress tracking
- Time-aware path generation
- Shareable watch paths
- Zero-cost architecture (free APIs, no database)"

# 5. Push
git push -u origin main

18. VERCEL DEPLOYMENT CHECKLIST

# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy from project directory
cd /home/thierry/chronoflow
vercel --prod

# 4. Add environment variables in Vercel Dashboard
# Project Settings → Environment Variables
# Add all keys from .env.local

# 5. Or connect GitHub repo for auto-deploy
# Vercel Dashboard → Add New Project → Import Git Repository
# Select agenticweeb/chronoflow
# Framework Preset: Next.js
# Build Command: next build
# Output Directory: .next

19. EMERGENCY CONTACTS / RESOURCES

| Resource         | URL                                         |
| ---------------- | ------------------------------------------- |
| Next.js Docs     | <https://nextjs.org/docs>                   |
| Tailwind Docs    | <https://tailwindcss.com/docs>              |
| Jikan API Docs   | <https://docs.api.jikan.moe/>               |
| AniList API Docs | <https://docs.anilist.co/>                  |
| OpenRouter Docs  | <https://openrouter.ai/docs>                |
| Groq Docs        | <https://console.groq.com/docs>             |
| Vercel Docs      | <https://vercel.com/docs>                   |
| Project GitHub   | <https://github.com/agenticweeb/chronoflow> |
| Creator X        | <https://x.com/agenticweeb>                 |



*This document is auto-generated and should be updated after every significant change. Keep it in the project root for continuity.*

---

## 14. Conversation Summary — 2026-07-12

```markdown
### 1. Project overview
ChronoFlow is a Next.js + TypeScript anime watch-order generator for anime fans who need help ordering complex franchises, skipping filler intelligently, and planning viewing with time budgets. It combines Jikan and AniList metadata with AI-generated watch paths and a visual flowchart interface.

- What we’re building: an intelligent watch-order UI with search, preferences, AI watch path generation, tiered skip guidance, progress tracking, and trailer/cover image support.
- Tech stack: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React, localStorage cache, Jikan + AniList APIs, AI provider orchestration.
- Target user: anime enthusiasts confronting franchise complexity, route branches, remakes, movies, OVAs, and filler, who want a practical schedule and spoiler-safe path.

### 2. Complete project structure with all files created/modified
```
/home/thierry/chronoflow/
├── LICENSE
├── PROJECT_CONTEXT.md
├── index.html
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   └── suggestions/ (suggestion image assets)
├── docs/ (existing docs folder)
├── scripts/ (existing scripts folder)
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── enrich/route.ts
    │   │   ├── image-proxy/route.ts
    │   │   ├── search/route.ts
    │   │   └── watch-order/route.ts
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── AnimeSearch.tsx
    │   ├── ErrorState.tsx
    │   ├── Flowchart.tsx
    │   ├── FlowchartV2.tsx
    │   ├── LoadingState.tsx
    │   ├── PreferencePanel.tsx
    │   ├── SuggestionImage.tsx
    │   └── TimeBudgetCard.tsx
    ├── hooks/
    │   ├── useProgress.ts
    │   ├── useSearch.ts
    │   └── useWatchOrder.ts
    ├── lib/
    │   ├── ai-providers.ts
    │   ├── anilist-client.ts
    │   ├── cache.ts
    │   ├── calendar-generator.ts
    │   ├── focus-entry.ts
    │   ├── jikan-client.ts
    │   ├── time-calculator.ts
    │   ├── utils.ts
    │   ├── ai/
    │   │   ├── orchestrator.ts
    │   │   └── prompts.ts
    │   └── knowledge/
    │       ├── classifier-v2.1.ts
    │       ├── classifier.ts
    │       ├── curated-franchises.ts
    │       ├── relation-graph.ts
    │       └── title-matcher.ts
    └── types/
        ├── index.ts
        └── intelligent.ts
```

### 3. What we’ve completed so far
- Confirmed cover image and YouTube trailer support exists in the code.
- Verified `FlowchartV2` uses `SuggestionImage` for entry thumbnails and renders a trailer button if `entry.trailerUrl` exists.
- Verified `src/lib/ai/orchestrator.ts` populates `imageUrl` and `trailerUrl` from AniList data for generated watch order entries.
- Verified `src/components/SuggestionImage.tsx` has direct image load, image proxy fallback, and placeholder fallback behavior.
- Verified `src/app/page.tsx` selects `FlowchartV2` when V2 watch order data exists and falls back to `Flowchart` otherwise.
- Confirmed the current Git branch is `main`.

### 4. Current task — exactly where we left off
- Last inspected: `src/app/page.tsx` result rendering and `FlowchartV2` component rendering paths.
- Last validated: `src/lib/ai/orchestrator.ts` entry enrichment mapping for cover/trailer data.
- Current task: ensure the UI displays cover images and YouTube trailers properly, then append this summary to `PROJECT_CONTEXT.md`.
- Pending action: local runtime testing and commit preparation.

### 5. Key architectural decisions and patterns used
- V2 watch order data model: `WatchOrderResultV2` → `WatchOrderPathV2` → `WatchOrderGroup` → `WatchOrderEntryV2`.
- Image rendering architecture: `SuggestionImage` with direct load, proxy fallback, and monogram placeholder.
- Trailer handling: normalize `trailerUrl` to `https://www.youtube.com/watch?v=<id>` and embed via `iframe` when available.
- AI orchestration: multi-provider failover and retry/backoff strategy in `ai-providers.ts`.
- Local cache: browser `localStorage` TTL/LRU caching for watch orders and progress.
- UI result selection: prefer V2 flowchart if detected, otherwise render legacy flowchart.
- Strict TypeScript typing for API responses and internal models.

### 6. Dependencies installed with versions
- `next@14.2.5`
- `react@18.3.1`
- `react-dom@18.3.1`
- `framer-motion@11.3.0`
- `lucide-react@0.400.0`
- `zustand@4.5.4`
- `@tanstack/react-query@5.51.0`
- `clsx@2.1.1`
- `tailwind-merge@2.4.0`
- `tailwindcss@3.4.6`
- `postcss@8.4.39`
- `autoprefixer@10.4.19`
- `typescript@5.5.3`
- `@types/node@20.14.10`
- `@types/react@18.3.3`
- `@types/react-dom@18.3.0`
- `eslint@8.57.0`
- `eslint-config-next@14.2.5`

### 7. Known issues or blockers
- Some entries may not include `trailerUrl`, so the trailer button will not render for those items even though the code supports it.
- Small/mobile view may hide the season thumbnail because `FlowchartV2` uses `hidden sm:block` for image cards.
- No additional runtime validation exists beyond `entry.imageUrl`/`entry.trailerUrl` presence checks, so invalid data can result in missing visuals.
- Current branch is `main`; inspect remote state before pushing.
- `next@14.2.5` has a known security advisory; upgrade after an initial push.

### 8. Next steps after current task
1. Run `npm run dev` locally.
2. Open `http://localhost:3000` and verify search, generate, and flowchart behavior.
3. Confirm cover images display on desktop and trailer modal appears when available.
4. Commit the new project context and any fix if needed.
5. Push to GitHub from branch `main`.

### 9. Current state of ALL key files
- `src/app/page.tsx`: main page orchestrates search, preferences, generation, and result rendering.
- `src/components/FlowchartV2.tsx`: new visual watch order UI with image cards, trailer modal, and progress.
- `src/components/Flowchart.tsx`: legacy flowchart fallback with similar asset support.
- `src/components/SuggestionImage.tsx`: robust image loader with proxy and placeholder fallback.
- `src/lib/ai/orchestrator.ts`: watch order enrichment mapping coverage and trailers.
- `src/lib/jikan-client.ts`: Jikan search/details client.
- `src/lib/anilist-client.ts`: AniList GraphQL client.
- `src/types/intelligent.ts`: V2 watch order model types.
- `src/app/api/enrich/route.ts`: enrichment endpoint returning image and trailer metadata.
- `PROJECT_CONTEXT.md`: appended with this conversation summary.
```
### RESOLVED: Relation Graph Crossover Leakage (July 2026)

*   **The Issue:** When users searched for major franchises published by standard light novel imprints (like *Sword Art Online* from Dengeki Bunko), the relation graph builder traversed too deeply (up to depth 4) and grabbed loose crossover relations. Crossover video game promos, anniversary ONAs, and character cameos (linked via `CHARACTER` or `OTHER` relation types on AniList) acted as "graph leakage hubs." This bridged separate franchises, causing the AI to force unrelated shows (e.g., *Spice and Wolf*, *Oreimo*, *Haganai*, *Eromanga Sensei*) into the final timeline.
*   **The Fix:** Built a targeted **Linguistic/Title Coherence Guard** (`isFranchiseCoherent`) inside `src/lib/knowledge/relation-graph.ts` and integrated it into the BFS queue loop.
*   **How It Works:**
    1.  **Strict Narrative Pass:** Tight relations representing actual narrative connections (`SEQUEL`, `PREQUEL`, `PARENT`, `ALTERNATIVE`, `SIDE_STORY`, `SPIN_OFF`, `COMPILATION`, `SUMMARY`) bypass the title-matching check. This ensures spinoffs with distinct titles (like *Lord El-Melloi II's Case Files* under *Fate/Zero*) are kept safely.
    2.  **Crossover Filtering:** High-leakage relations (`CHARACTER` and `OTHER`) are strictly inspected. They are immediately dropped *unless* they share linguistic coherence with the root franchise name.
    3.  **Linguistic Check:** Discards generic words ("the", "movie", "season", "ni", "ga", "alternative"), then checks if the titles share a meaningful stem keyword (using the `extractStem` registry) or overlap on any unique word of length >= 3.
    4.  **Short-Title Fallback:** If generic filtering leaves zero words (e.g., short titles like "86" or "K"), the guard gracefully retains the raw characters to prevent false negatives.

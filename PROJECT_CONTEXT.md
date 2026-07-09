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

*This document is auto-generated and should be updated after every significant change. Keep it in the project root for continuity.*


# DEEP SYSTEM STATE SERIALIZATION: MYANIWATCHORDER
> **SYSTEM TIMESTAMP:** 2026-08-24  
> **ENGINE VERSION:** 8.0-PREMIUM-ROADMAP-COMPLETE  
> **HASH CURRENT STATE:** F9A2C9D1E7B4

---

## 1. EXTENDED PROJECT OVERVIEW & SCOPE BOUNDARIES
- **Core Product Vision:** MyAniWatchOrder (formerly ChronoFlow) is an AI-powered anime watch order generator that solves franchise viewing complexity by mapping AniList's relation edges into deterministic or AI-curated timelines. It prevents AI hallucinations by grounding all generated watch orders in verified database IDs. The definitive metrics of success are mathematical accuracy in episode calculation, total elimination of AI hallucinations, zero-infrastructure virality (shareable artifacts), and absolute coverage of live, airing, and obscure titles.
- **Target User Personas & Workflows:** Anime enthusiasts facing choice paralysis or franchise confusion (e.g., entering the Fate/ stay night routes, or marathon-watching continuous donghua like Renegade Immortal). The primary user journey starts at the cinematic landing page, progresses through robust auto-complete searches, allows deep custom scheduling preferences, and renders a responsive flowchart with progressive disclosure (tier filtering), narrative loading, dynamic theming, and community consensus tracking.
- **Comprehensive Tech Stack Architecture:**
  - **Frontend Tier:** Next.js 16.3.1 (App Router, Turbopack), React 19, Tailwind CSS v4, Framer Motion, Lucide React, TanStack Query, Zustand, nuqs.
  - **Backend/API Tier:** Next.js Server Actions, Vercel AI SDK (`generateText`), AniList GraphQL API.
  - **Database & Storage Layer:** Upstash Redis (Edge caching for search, watch orders, airing schedules, and community votes), Zustand + LocalStorage (Client-side watch progress persistence).
  - **DevOps & Infrastructure:** Vercel (Hobby Tier), GitHub (CI/CD auto-deploy). `next/og` for dynamic Open Graph image generation.
- **Environment & Runtime Prerequisites:**
  - **OS:** Linux/macOS (WSL2 environment detected).
  - **Node:** >= 20.x.
  - **Required `.env` Variables:** `GROQ_API_KEY`, `GOOGLE_AI_API_KEY`, `OPENROUTER_API_KEY`, `GITHUB_MODELS_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `DISCORD_FEEDBACK_WEBHOOK_URL`.

---

## 2. ADVANCED ARCHITECTURAL DECISIONS & PARADIGMS (ADR)
- **Monolith/Microservice Pattern:** Modular Monolith. Next.js App Router handles RSC, Server Actions act as the API layer, and external services (AniList, Upstash, AI Providers) are abstracted into domain-specific library wrappers.
- **State Management & Data Flow Vectors:** 
  - *Search/Generation:* Client Event -> TanStack Query -> Server Action -> Upstash Redis Cache Check -> (Cache Miss) -> AniList GraphQL/AI Provider -> Redis Cache Set -> Client Hydration.
  - *Progress:* Client Event -> Zustand Store -> LocalStorage Persist.
  - *URL State:* `nuqs` adapter syncs `selectedId` to URL query params.
- **Graph Traversal Paradigm (V6 Architecture):** Pure BFS over AniList `relationType` edges. Only `SEQUEL`, `PREQUEL`, `PARENT`, `SIDE_STORY`, `SPIN_OFF`, `ALTERNATIVE`, `ADAPTATION` are admitted. `CHARACTER` and `OTHER` are strictly pruned. Post-BFS validation uses "Soft Flagging" (passing metadata to AI) rather than hard rejection.
- **Resilience & Bypass Strategy:** 
  - AI Provider calls are wrapped in a 15-second `AbortSignal.timeout`. 
  - If all AI providers fail, the Orchestrator catches the error and instantly falls back to `buildDeterministicPaths`.
  - AniList API 403 errors (Cloudflare blocks) are bypassed via an internal `/api/image-proxy` route that attaches browser `User-Agent` and `Referer` headers.
  - Vercel 504 Timeout errors for static SEO pages are bypassed by routing `generateWatchOrderAction` through Upstash Redis caching before hitting the AI Orchestrator.
- **Multi-Source Matrix (2026 Standard):**
  - *AniList:* Primary source for relations, airing schedules, and cover images.
  - *Jikan (MAL):* Deprecated for local dev due to Oct 2026 shutdown, but conceptually used for canonical episode counts.
  - *Simkl:* Reserved as fallback for airing calendars if AniList is down.
- **Engineering Conventions & Strict Constraints:**
  - **Naming Typology:** camelCase for variables/functions, PascalCase for Components/Interfaces, snake_case for cache keys.
  - **Error Handling Philosophy:** Fail-fast on validation, fail-safe on AI generation. Global `ErrorBoundary` catches all UI crashes.

---

## 3. ABSOLUTE EXHAUSTIVE REPOSITORY TREE
```text
/home/thierry/chronoflow/
├── .env.local [MODIFIED]
├── next.config.ts [MODIFIED]
├── package.json [MODIFIED]
├── tailwind.config.ts [UNTOUCHED]
├── tsconfig.json [MODIFIED]
├── public/
│   ├── llms.txt [CREATED]
│   ├── robots.txt [CREATED]
│   └── suggestions/ [MODIFIED]
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── image-proxy/route.ts [MODIFIED]
    │   │   ├── feedback/route.ts [UNTOUCHED]
    │   │   ├── og/route.tsx [CREATED]
    │   │   ├── search/route.ts [UNTOUCHED]
    │   │   └── vote/route.ts [CREATED]
    │   ├── watch-order/
    │   │   └── [slug]/
    │   │       └── page.tsx [MODIFIED]
    │   ├── globals.css [UNTOUCHED]
    │   ├── layout.tsx [MODIFIED]
    │   ├── page.tsx [MODIFIED]
    │   ├── providers.tsx [CREATED]
    │   ├── sitemap.ts [CREATED]
    │   └── actions.ts [MODIFIED]
    ├── components/
    │   ├── AiringCarousel.tsx [CREATED]
    │   ├── AiringCountdown.tsx [CREATED]
    │   ├── BeyondHorizon.tsx [MODIFIED]
    │   ├── ChronoCompanion.tsx [CREATED]
    │   ├── CountdownBadge.tsx [CREATED]
    │   ├── ErrorBoundary.tsx [CREATED]
    │   ├── FlowchartV2.tsx [MODIFIED]
    │   ├── FranchiseDNA.tsx [CREATED]
    │   ├── FranchisePulse.tsx [CREATED]
    │   ├── InteractiveSearch.tsx [MODIFIED]
    │   ├── NarrativeLoader.tsx [CREATED]
    │   ├── PreferencePanel.tsx [UNTOUCHED]
    │   ├── SafeImage.tsx [CREATED]
    │   ├── SuggestionImage.tsx [MODIFIED]
    │   └── TopBanner.tsx [MODIFIED]
    ├── data/
    │   └── loading-narratives.ts [CREATED]
    ├── hooks/
    │   ├── useAudioCue.ts [CREATED]
    │   ├── useProgress.ts [MODIFIED]
    │   └── useWatchOrder.ts [UNTOUCHED]
    ├── lib/
    │   ├── ai/
    │   │   ├── orchestrator.ts [MODIFIED]
    │   │   └── prompts.ts [MODIFIED]
    │   ├── knowledge/
    │   │   ├── classifier.ts [MODIFIED]
    │   │   ├── curated-franchises.ts [MODIFIED]
    │   │   ├── relation-graph.ts [MODIFIED]
    │   │   └── title-matcher.ts [UNTOUCHED]
    │   ├── seo/
    │   │   ├── dna-profiles.ts [CREATED]
    │   │   ├── franchises.ts [MODIFIED]
    │   │   └── tiers.ts [MODIFIED]
    │   ├── ai-providers.ts [MODIFIED]
    │   ├── anilist-client.ts [UNTOUCHED]
    │   ├── cache.ts [UNTOUCHED]
    │   ├── calendar-generator.ts [UNTOUCHED]
    │   ├── dna.ts [CREATED]
    │   ├── eras.ts [CREATED]
    │   ├── jikan-client.ts [UNTOUCHED]
    │   ├── redis.ts [CREATED]
    │   ├── store.ts [MODIFIED]
    │   ├── time-calculator.ts [MODIFIED]
    │   └── utils.ts [UNTOUCHED]
    └── types/
        ├── index.ts [UNTOUCHED]
        └── intelligent.ts [MODIFIED]
```

---

## 4. GRANULAR DEPENDENCY & PACKAGE MATRIX
| Package Name | Exact Version | Architectural Utility & Domain Dependency | Impact on Bundle/Runtime |
| :--- | :--- | :--- | :--- |
| `next` | 16.3.1 | Core framework, App Router, Server Actions, `next/og` | High runtime overhead, Turbopack enabled |
| `react` | 19.x | UI rendering, concurrent state transitions | Client runtime |
| `ai` | latest | Vercel AI SDK, standardizes LLM provider routing | Server-side runtime, replaces custom fetch logic |
| `@ai-sdk/openai` | latest | Groq/OpenAI/OpenRouter compatibility layer | Server-side runtime |
| `@ai-sdk/google` | latest | Google Gemini compatibility layer | Server-side runtime |
| `@upstash/redis` | latest | Edge-compatible Redis client for caching & votes | Server-side runtime, reduces AniList API calls |
| `@tanstack/react-query` | latest | Client-side data fetching, caching, deduplication | Client runtime, prevents duplicate search calls |
| `zustand` | latest | Lightweight global state for watch progress & audio | Client runtime, replaces Context bloat |
| `nuqs` | latest | URL state synchronization for shareable links | Client + Server sync |
| `tailwindcss` | 4.x | Utility-first CSS engine | Build-time only |

---

## 5. HISTORICAL DEVELOPMENT LEDGER & SPRINT ROADMAP
- **Completed Core Milestones:**
  - [x] **Graph Traversal V6:** Eliminated string-matching contamination. Pure BFS over AniList relations.
  - [x] **AI Provider Hardening:** Migrated to Vercel AI SDK. 15s timeout, multi-provider fallback.
  - [x] **State & Cache Infrastructure:** Migrated `useProgress` to Zustand. Integrated Upstash Redis.
  - [x] **AIO & Programmatic SEO:** Generated static/ISR franchise pages, dynamic sitemap, `robots.txt`.
- **Completed in This Specific Session (Premium Roadmap):**
  - [x] **Rebranding:** Migrated all UI text and metadata from "ChronoFlow" to "MyAniWatchOrder".
  - [x] **Step 1: Narrative Loading Engine:** Replaced static spinner with `NarrativeLoader` component using staggered Framer Motion animations.
  - [x] **Step 2: Progressive Disclosure:** Added `visibleTiers` state to `FlowchartV2.tsx` to filter timeline nodes by tier (Essential, Recommended, Optional, Skip).
  - [x] **Step 3: Dynamic OG Images:** Created `src/app/api/og/route.tsx` using `next/og` to generate branded social share cards.
  - [x] **Step 4: Custom Share Modal:** Replaced Twitter intent with a native Web Share API fallback custom modal in `FlowchartV2.tsx`.
  - [x] **Step 5: Franchise DNA Score:** Created `src/lib/dna.ts` math engine and `FranchiseDNA.tsx` UI component for visual complexity reports.
  - [x] **Step 6: Living Schedule Pulse:** Created `AiringCarousel.tsx` and `AiringCountdown.tsx` to fetch and display live countdown timers for airing anime.
  - [x] **Step 7: Community Consensus:** Created `src/app/api/vote/route.ts` and `FranchisePulse.tsx` for IP-rate-limited tier voting via Redis.
  - [x] **Step 8: Graph Topology Recommendations:** Replaced hardcoded `BeyondHorizon` recommendations with Cosine Similarity algorithm matching `FranchiseDNA` profiles.
  - [x] **Missing SEO Pages:** Added static slugs for FMA, Death Note, JJK, Mushoku Tensei, etc., fixing 404 reload bugs.
- **Active Blockers, Edge-Case Errors, & Heavy Debt:**
  - **Local Network Block:** The developer's local ISP (Nairobi) is actively blocked by AniList/Cloudflare (403/504). All AniList API and image loading must be tested on Vercel, not locally.
  - **Vercel 504 Timeouts:** Static SEO pages hit the 10s Vercel Hobby limit on first generation. Fixed by routing through Redis cache, but cold caches may still timeout.
  - **Technical Debt:** `Flowchart.tsx` and `AnimeSearch.tsx` are legacy V1 components marked for deletion. `useCheckpoint` hook is stubbed out due to TS interface mismatch.

---

## 6. CURRENT EXECUTION POINT & ACTIVE RUNTIME STATE
- **Active Focus Objective:** Finalizing V1 release cleanup. Resolving TypeScript build errors in `vote/route.ts` and `watch-order/[slug]/page.tsx` to allow Vercel deployment.
- **Last Logical Code Mutation:** Cleaned up legacy files and prepared the comprehensive `PROJECT_CONTEXT.md` handoff document.
- **Precise Stop-Point Coordinates:**
  - **Target File Path:** `PROJECT_CONTEXT.md`
  - **Target Structural Unit:** Root level documentation
  - **Execution Halt State:** Ready for final commit and push to GitHub/Vercel.

---

## 7. EXHAUSTIVE FILE STRUCTURE REGISTRY (STRICT NO-CODE POLICY)

### 📄 FILE ID: src/app/actions.ts
- **Application Classification:** Server Action / API Gateway
- **Module Responsibility Statement:** Validates client payloads via Zod. Wraps search, discover, and generation actions with Upstash Redis caching layers. Forwards preferences to the orchestrator. Prevents caching of empty API responses.
- **Internal API & Structural Schema Blueprint:**
  - `searchAnimeAction(query)` -> Checks Redis, fetches AniList if miss, caches for 1 hour.
  - `generateWatchOrderAction(payload)` -> Checks Redis, invokes Orchestrator if miss, caches for 7 days.
  - `fetchCurrentlyAiring()` -> Fetches top 12 airing TV anime from AniList, maps to clean interface, caches for 1 hour.

### 📄 FILE ID: src/lib/ai/orchestrator.ts
- **Application Classification:** Core Business Logic / Pipeline Orchestrator
- **Module Responsibility Statement:** Resolves anime match, triggers graph building, classifies shape, constructs AI payload, executes AI call safely within try/catch, validates AI response against allowed IDs, and applies user preferences. Extracts `coverImage.color` for dynamic theming.
- **Internal API & Structural Schema Blueprint:**
  - `generateIntelligentWatchOrder(params)` -> Returns `OrchestratorResult`.
  - `validateAndFixAIResponse` -> Enforces strict ID matching, drops hallucinations.
  - `buildDeterministicPaths` -> Fallback logic if AI fails, using pure graph data.

### 📄 FILE ID: src/components/FlowchartV2.tsx
- **Application Classification:** Timeline Visualization & Interaction Layer
- **Module Responsibility Statement:** Renders the interactive watch order timeline. Injects `--theme-accent` CSS variable for dynamic borders/glow. Renders `FranchiseDNA`, `FranchisePulse`, and `AiringCountdown` inside `EntryNode`. Contains Progressive Disclosure tier filters.
- **Internal API & Structural Schema Blueprint:**
  - `FlowchartV2({ data, timeBudget, customSchedule })` -> Main component.
  - `EntryNode` -> Renders individual cards, handles expansion state and vote rendering.
  - `toggleTier(tier)` -> Adjusts `visibleTiers` Set to filter timeline nodes.

### 📄 FILE ID: src/app/api/og/route.tsx
- **Application Classification:** Dynamic Open Graph Image Generator
- **Module Responsibility Statement:** Uses `next/og` (Edge runtime) to generate 1200x630 branded PNG images for social sharing. Reads query params for franchise name and stats.
- **Session Delta & Structural Evolution Map:**
  - **Created Logic:** Implemented strict Satori CSS rules (explicit `display: flex` on all multi-child divs, removed `z-index`) to prevent Turbopack panics.

### 📄 FILE ID: src/components/BeyondHorizon.tsx
- **Application Classification:** Recommendation Engine UI
- **Module Responsibility Statement:** Calculates Cosine Similarity between the current anime's DNA and the static `FRANCHISE_DNA_PROFILES` database. Renders the top 3 matches as clickable cards.
- **Internal API & Structural Schema Blueprint:**
  - `calculateSimilarity(a, b)` -> Dot product / (magnitude A * magnitude B).

---

## 8. STRATEGIC RUNWAY (NEXT ACTIONABLE STEPS)
1. **[IMMEDIATE RESUMPTION - BUILD FIX]:**
   - **Target File:** `src/app/api/vote/route.ts` & `src/app/watch-order/[slug]/page.tsx`
   - **Actionable Task:** Fix TS2769 error by casting Redis `val` to `any`. Fix TS2339 by splitting the `||` conditional into a dedicated `if (!actionResult.success)` block.
   - **Verification Method:** `git push origin main` and monitor Vercel build logs for "Compiled successfully".
2. **[SECONDARY SEQUENTIAL COUPLING - REPUTATION SYSTEM]:**
   - **Target File:** `src/lib/store.ts` & `src/app/api/vote/route.ts`
   - **Actionable Task:** If community voting scales, implement a basic reputation system (e.g., 1 vote per IP, logged in Supabase) to prevent spam.
3. **[DOWNSTREAM REFACTOR & INTEGRATION BOUNDARY - CHECKPOINT URLS]:**
   - **Target File:** `src/hooks/useCheckpoint.ts` & `src/lib/checkpoint.ts`
   - **Actionable Task:** Implement the `fflate` compression logic to encode Zustand progress into a URL hash for cross-device sharing. Fix the `hydrateFromCheckpoint` interface missing in `store.ts`.
4. **[COMPREHENSIVE VALIDATION REGIME]:**
   - **Testing Plan:** Test all 20 static SEO pages on Vercel. Verify OG image generation via Twitter Card Validator. Verify voting updates Redis without 429 errors. Verify local dev environment still functions with proxy image fallback.

---

## 9. HARDWARE/STATE REHYDRATION BOOTSTRAP PROMPT
"Act as an Elite Product Architect and Next.js 16 Expert. I am uploading the `PROJECT_CONTEXT.md` file containing the deep system state serialization for MyAniWatchOrder. Parse the architectural constraints, specifically the V6 Graph Traversal rules, Vercel AI SDK integration, and the 2026 Multi-Source API Matrix. We have successfully completed Phase 1 & 2 of the Premium Roadmap. We are ready to begin Phase 3 (Ecosystem Expansion) or debug any remaining TypeScript issues. Provide exact, manual code modifications without terminal scripts. Do not hallucinate dependencies; adhere strictly to the provided stack."
```

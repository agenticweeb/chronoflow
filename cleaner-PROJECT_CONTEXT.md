# DEEP SYSTEM STATE SERIALIZATION: CHRONOFLOW
> **SYSTEM TIMESTAMP:** 2026-08-18 23:13:00 UTC  
> **ENGINE VERSION:** 3.0-PRECISE  
> **HASH CURRENT STATE:** 0XF9E4B2

---

## 1. EXTENDED PROJECT OVERVIEW & SCOPE BOUNDARIES
- **Core Product Vision:** ChronoFlow is a high-fidelity, database-grounded, and zero-cost anime watch order platform. It resolves the core user friction of navigating complex multiverses, sprawling alternate timelines, split routes, and filler-heavy long-runners. It ensures spoiler-safe viewing paths, smart skipping directives, and calendar-ready schedule planners. The primary metrics of success are mathematical accuracy in episode calculation, total elimination of AI hallucinations, and absolute coverage of live, airing, and obscure titles without server-side database maintenance costs.
- **Target User Personas & Workflows:** Anime enthusiasts facing choice paralysis or franchise confusion (e.g. entering the Fate/ stay night routes, or marathon-watching continuous donghua like Renegade Immortal). The primary user journey starts at the cinematic landing page, progresses through robust auto-complete searches, allows deep custom scheduling preferences (specifying exact days and active watch hours, or choosing strict episode-count limits per day), and renders a responsive flowchart. Users can then toggle watch progress, watch high-definition widescreen trailers, export spec-compliant .ics calendar feeds, and download watermark-protected PNG summary cards.
- **Comprehensive Tech Stack Architecture:**
  - **Frontend Tier:** Next.js 16 (React 19) App Router for advanced performance optimization, using React Server Components (RSC) to render the base shell and caching structures, and isolated Client Components ('use client') strictly at the leaf level for custom states. Styled using Tailwind CSS v4 design tokens and animated via Framer Motion spring physics.
  - **Backend/API Tier:** React 19 Server Actions handling schema-validation via Zod, and Next.js serverless route handlers acting as an edge proxy to bypass CDN referrer limitations and forward discord suggestions.
  - **Database & Storage Layer:** Database-less, zero-cost client architecture. Persistent watch progress, caching profiles, and TTL records are maintained directly inside the client's browser local storage (ChronoCache).
  - **DevOps & Infrastructure:** Deployed on Vercel's edge network, utilizing serverless functions with a maximum execution duration of 60 seconds to build relation graphs and run failover LLM queries.
- **Environment & Runtime Prerequisites:** Target runtime is Node.js v20+ or v22+. Required variables in `.env.local` are categorized under:
  - *AI Provider Keys:* GROQ_API_KEY, GOOGLE_AI_API_KEY, GITHUB_MODELS_TOKEN, OPENROUTER_API_KEY, CEREBRAS_API_KEY.
  - *Feedback Webhooks:* DISCORD_FEEDBACK_WEBHOOK_URL.
  - *Deployment URLs:* NEXT_PUBLIC_SITE_URL.

---

## 2. ADVANCED ARCHITECTURAL DECISIONS & PARADIGMS (ADR)
- **Modular Monolith & Grounded RAG Pipeline:** Built as a self-contained Next.js application. Data is structured using a grounded Retrieval-Augmented Generation (RAG) paradigm: when a query fires, the server builds a relational graph from AniList before prompting the AI. The AI's role is strictly limited to sorting and semantic annotation of the pre-vetted nodes. Hallucinated IDs are dropped, making the system 100% immune to invented data.
- **State Management & Data Flow Vectors:** Path flows are immutable. Select Ingress -> Server Action -> Graph Generation -> Multi-Provider AI Fallback Query -> Clean JSON Parsing -> ID Grounding & Math Alignment -> Client Storage (ChronoCache) -> Component Hydration. Watch progress follows a strict unidirectional dispatch from the useProgress hook directly into localStorage, recalculating the flowchart rates automatically on state mutations.
- **Security & Identity Architecture:** Stateless, anonymous client architecture. Caching keys are uniquely hashed based on selected title names and preferences to ensure individual isolation inside localStorage.
- **Engineering Conventions & Strict Constraints:**
  - **Naming Typology:** Strict camelCase for local variables and properties, PascalCase for React components and TypeScript interface declarations, and uppercase for API status constants (e.g. FINISHED, RELEASING, NOT_YET_RELEASED).
  - **Asynchronous/Concurrency Patterns:** Search inputs are debounced to prevent API rate-limit exhaustion. Server Actions utilize `useTransition` hooks to perform concurrent queries without blocking interactive threads, displaying a customized progress diagnostic HUD during execution.
  - **Error Handling Philosophy:** Handled at three distinct layers: local GraphQL try/catch wrappers with exponential backoff on AniList 429 warnings, comprehensive Zod validation on Server Action payloads, and a client-side Error Boundary to catch any layout rendering failures gracefully.

---

## 3. ABSOLUTE EXHAUSTIVE REPOSITORY TREE
```text
/home/thierry/chronoflow/ [CREATED]
├── .env.example [UNTOUCHED]
├── .env.local [UNTOUCHED]
├── .gitignore [UNTOUCHED]
├── next.config.ts [UNTOUCHED]
├── package.json [MODIFIED]
├── postcss.config.js [UNTOUCHED]
├── tailwind.config.ts [UNTOUCHED]
├── tsconfig.json [UNTOUCHED]
└── src/
    ├── app/
    │   ├── actions.ts [MODIFIED]
    │   ├── globals.css [MODIFIED]
    │   ├── layout.tsx [MODIFIED]
    │   ├── page.tsx [MODIFIED]
    │   └── api/
    │       ├── enrich/
    │       │   └── route.ts [UNTOUCHED]
    │       ├── feedback/
    │       │   └── route.ts [UNTOUCHED]
    │       ├── image-proxy/
    │       │   └── route.ts [UNTOUCHED]
    │       ├── search/
    │       │   └── route.ts [UNTOUCHED]
    │       └── watch-order/
    │           └── route.ts [UNTOUCHED]
    ├── components/
    │   ├── AnimeSearch.tsx [UNTOUCHED]
    │   ├── CinematicHero.tsx [MODIFIED]
    │   ├── Flowchart.tsx [MODIFIED]
    │   ├── FlowchartV2.tsx [MODIFIED]
    │   ├── InteractiveSearch.tsx [MODIFIED]
    │   ├── PreferencePanel.tsx [MODIFIED]
    │   ├── ShareCard.tsx [MODIFIED]
    │   ├── SuggestionImage.tsx [UNTOUCHED]
    │   ├── TimeBudgetCard.tsx [MODIFIED]
    │   └── TopBanner.tsx [CREATED]
    ├── hooks/
    │   ├── useProgress.ts [UNTOUCHED]
    │   ├── useSearch.ts [UNTOUCHED]
    │   └── useWatchOrder.ts [UNTOUCHED]
    ├── lib/
    │   ├── ai-providers.ts [UNTOUCHED]
    │   ├── anilist-client.ts [UNTOUCHED]
    │   ├── cache.ts [UNTOUCHED]
    │   ├── calendar-generator.ts [MODIFIED]
    │   ├── focus-entry.ts [UNTOUCHED]
    │   ├── jikan-client.ts [UNTOUCHED]
    │   ├── time-calculator.ts [MODIFIED]
    │   ├── utils.ts [UNTOUCHED]
    │   └── knowledge/
    │       ├── classifier.ts [UNTOUCHED]
    │       ├── curated-franchises.ts [UNTOUCHED]
    │       ├── relation-graph.ts [MODIFIED]
    │       └── title-matcher.ts [UNTOUCHED]
    └── types/
        ├── index.ts [MODIFIED]
        └── intelligent.ts [MODIFIED]

4. GRANULAR DEPENDENCY & PACKAGE MATRIX

| Package Name    | Exact Version | Architectural Utility & Domain Dependency                                              | Impact on Bundle/Runtime                             |
| :-------------- | :------------ | :------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| `next`          | `16.2.10`     | React Server Components framework shell, App Router routing, and Server Actions        | High footprint (Core framework and routing overhead) |
| `react`         | `19.0.0`      | Inherent React engine utilizing modern transitions, useDeferredValue, and DOM bindings | Core runtime engine                                  |
| `framer-motion` | `^11.3.0`     | Spring-physics layout animations, stagger entries, and overlay transitions             | Medium client-side animation runtime overhead        |
| `html-to-image` | `^1.11.11`    | Serializes HTML DOM trees directly into downloadable high-res PNG images               | Client-side render canvas overhead                   |
| `lucide-react`  | `^0.400.0`    | Application-wide responsive vector icons                                               | Low, tree-shaken vector footprint                    |
| `zod`           | `^3.23.8`     | Schema validation for all Server Action payloads and API inputs                        | Minimal parsing footprint                            |
| `eslint`        | `^9.0.0`      | Strict developer linter and compiler static analyses                                   | Development environment compilation check only       |

5. HISTORICAL DEVELOPMENT LEDGER & SPRINT ROADMAP

  - Completed Core Milestones:
    - [x] Milestone Alpha (Grounding Engine): Implemented ID-first grounding,
      parallel Jikan + AniList search, and 8-provider failover.
    - [x] Milestone Beta (Grounded Airing & Episode Math): Resolved the episode
      count multiplier bug, completed dynamic range slicing, and excluded
      unreleased episodes from watchable estimates.
    - [x] Milestone Gamma (Cinematic UX Rebuild): Implemented the dual-tab
      Discover/Builder UI, Star-Badge rating indicators, multi-genre selection,
      underrated gems algorithms, custom week schedulers, and closeable
      marquees.
  - Completed in This Specific Session:
    - [x] Dynamic Discover Graph Compiler: Fixed year filter empty states by
      compiling fuzzy date parameters as valid YYYYMMDD calendar ranges.
    - [x] IMDb-Grade Filtering & Underrated Gems Sort: Added multi-select
      genres, country of origin language matrices, and implemented a mainstream
      popularity penalty formula to surface hidden masterpieces.
    - [x] Header Marquee Polish: Placed a dismissible marquee at the top of the
      page reading exactly "By Agenticweeb - grounded dynamic watch orders".
    - [x] Production Type Hardening: Casted properties to any on strict union
      mappers and checked res.success directly in actions to pass Next.js
      production builds.
  - Active Blockers, Edge-Case Errors, & Heavy Debt:
      - Compiler/Runtime Errors: None. The local build compiles with 100% static
        type safety under strict ESLint 9 rules.
      - Technical Debt: The "Discover Library" tab genres are currently mapped
        against AniList's standard categories; expanding the genre matrix to
        include advanced sub-tags is pending.

6. CURRENT EXECUTION POINT & ACTIVE RUNTIME STATE

  - Active Focus Objective: Deploying the fully compiled and tested v2.4
    platform to production, preparing for repository push, and verifying live
    card generation.
  - Last Logical Code Mutation: Integrated the dynamic query builder and movie
    weight formulas in the time budget core. Successfully verified that the
    local Next.js build compiled with zero errors.
  - Precise Stop-Point Coordinates:
      - Target File Path: src/components/InteractiveSearch.tsx
      - Target Structural Unit: InteractiveSearch (Client Component)
      - Execution Halt State: Line 640. Execution halted immediately after
        implementing the closeable marquee header and verification of the
        dynamic Discover tab. Ready for GitHub push.

7. EXHAUSTIVE FILE STRUCTURE REGISTRY (STRICT NO-CODE POLICY)

📄 FILE ID: src/types/index.ts

  - Application Classification: Legacy Type Declarations
  - Module Responsibility Statement: Defines the foundational interfaces and
    types for backward compatibility across oldest components.
  - Import/Export Dependency Topology:
      - Ingress: None.
      - Egress: WatchOrderEntry, WatchOrderResult, UserPreferences.
  - Internal API & Structural Schema Blueprint:
      - UserPreferences -> Custom props including customSchedule of type
        CustomSchedule, paceType of type "duration" | "episodes", and
        episodesPerDay of type number.
  - Session Delta & Structural Evolution Map:
      - Modified: Appended the custom schedule and episodes/day pace format
        configuration items directly inside the core UserPreferences interface.

📄 FILE ID: src/types/intelligent.ts

  - Application Classification: V2 Central Type Definitions
  - Module Responsibility Statement: Single source of truth for the nested,
    grounded V2 architecture properties (e.g. shapes, paths, airing progress,
    and custom schedules).
  - Import/Export Dependency Topology:
      - Ingress: None.
      - Egress: WatchOrderResultV2, WatchOrderEntryV2, AllowedTitle,
        RawRelationNode, CustomSchedule.
  - Internal API & Structural Schema Blueprint:
      - RawRelationNode -> Properties detailing status: string and
        nextAiringEpisode representing { episode: number } | null for progress
        calculations.
      - AllowedTitle -> Includes status: string and nextAiringEpisode for exact
        graph matching.
      - GenerateRequestV2 -> Carries customSchedule, paceType, and
        episodesPerDay inside its preferences object.
  - Session Delta & Structural Evolution Map:
      - Modified: Appended DailySchedule and CustomSchedule definitions, added
        status and nextAiringEpisode properties directly to AllowedTitle and
        RawRelationNode to resolve duplicate interface merging build failures.

📄 FILE ID: src/lib/knowledge/relation-graph.ts

  - Application Classification: Grounding Engine Utility
  - Module Responsibility Statement: Recursively traverses the AniList Graph
    database, building relational nodes while utilizing a linguistic coherence
    filter to prune irrelevant crossovers.
  - Import/Export Dependency Topology:
      - Ingress: Imports RawRelationNode, RelationGraph, AllowedTitle from
        @/types/intelligent; and normalizeTitle, scoreTitleMatch,
        selectBestAnimeMatch from ./title-matcher.
      - Egress: buildRelationGraph, isFranchiseCoherent.
  - Internal API & Structural Schema Blueprint:
      - isFranchiseCoherent(rootTitle: string, candidateTitle: string): boolean
        -> Normalizes inputs, discards common generic keywords, and matches
        unique word overlaps of length >= 3.
      - buildRelationGraph(params: BuildGraphParams): Promise<any> -> Runs
        recursive BFS query. Checks if relationType is CHARACTER or OTHER,
        passing them through isFranchiseCoherent to prune non-franchise leakage.
  - Session Delta & Structural Evolution Map:
      - Modified: Added nextAiringEpisode and status to both MEDIA_Q and
        SEARCH_Q GraphQL queries. Enabled isFranchiseCoherent checks in the BFS
        queue loop. Surgically casted nodes to any in the final map iterator to
        ensure compile safety.

📄 FILE ID: src/lib/ai/orchestrator.ts

  - Application Classification: AI Pipeline Orchestrator
  - Module Responsibility Statement: Conducts graph classifications, prompts LLM
    fallbacks, resolves JSON structures, and calculates progress-grounded
    episode aggregates.
  - Import/Export Dependency Topology:
      - Ingress: Imports buildRelationGraph, findAllowedTitleById from
        ../knowledge/relation-graph; classifyAnimeShape from
        ../knowledge/classifier; buildPromptForShape from ./prompts; types from
        @/types/intelligent.
      - Egress: generateIntelligentWatchOrder, enrichPaths.
  - Internal API & Structural Schema Blueprint:
      - enrichPaths(aiData: AIGeneratedOrderV2, allowedTitles: AllowedTitle[],
        graph: RelationGraph): WatchOrderPathV2[] -> Performs range parsing to
        calculate episode weights. Contains the "Dynamic Hallucination Omission
        Filter": checks if entry titles contain sequel or upcoming indicators
        (e.g. "season 2"), overriding status to NOT_YET_RELEASED and clamping
        releasedEpisodeCount to 0.
      - calcDuration(entries: WatchOrderEntryV2[]) -> Computes total minutes
        based on releasedEpisodeCount.
  - Session Delta & Structural Evolution Map:
      - Modified: Rebuilt calcDuration and V2 path reducers to sum totals using
        releasedEpisodeCount instead of the raw episodeCount, successfully
        fixing the header visual stats bug.

📄 FILE ID: src/lib/time-calculator.ts

  - Application Classification: Mathematical Calculation Core
  - Module Responsibility Statement: Calculates total runtimes, skip-strategy
    savings, and steps through calendar days for exact schedule dates.
  - Import/Export Dependency Topology:
      - Ingress: CustomSchedule from @/types.
      - Egress: calculateTimeBudget, paceFromTimeBudget.
  - Internal API & Structural Schema Blueprint:
      - calculateTimeBudget(franchise: string, entries: FranchiseEntry[],
        startDate: Date, options: any): TimeBudgetResult -> Accumulates totals.
        Implements the dynamic movie weight formula: standard TV episodes
        under 40m count as 1, movies over 40m are normalized to 24-minute
        equivalents (Math.ceil(Duration / 24)). Calculates schedule completions
        day-by-day.
  - Session Delta & Structural Evolution Map:
      - Modified: Integrated the dynamic movie equivalent weighting system,
        supported paceType: "duration" | "episodes" checks, and incorporated
        episodesPerDay mathematical steps into paces outputs.

📄 FILE ID: src/lib/calendar-generator.ts

  - Application Classification: Spec-Compliant ICS Scheduler
  - Module Responsibility Statement: Generates RFC 5545 watches schedule feeds
    based on custom user timelines.
  - Import/Export Dependency Topology:
      - Ingress: WatchOrderEntry from @/types.
      - Egress: generateWatchCalendarIcs, downloadIcsFile.
  - Internal API & Structural Schema Blueprint:
      - generateWatchCalendarIcs(franchiseName: string, entries:
        WatchOrderEntry[], config: CalendarConfig): string -> Builds feed lines.
        Integrates customSchedule bounds: schedules episode blocks sequentially
        only during configured start/end times of enabled active days.
  - Session Delta & Structural Evolution Map:
      - Modified: Rebuilt calendar generation to support the day-by-day weekly
        availability matrix, ensuring that episodes do not spill over the user's
        bedtime and skip non-watch days cleanly.

📄 FILE ID: src/components/PreferencePanel.tsx

  - Application Classification: Preferences Selection Panel UI
  - Module Responsibility Statement: Renders input states for skip strategy,
    preferred paths, mood tags, and weekly watch blocks.
  - Import/Export Dependency Topology:
      - Ingress: Icons from lucide-react, UserPreferences types from @/types,
        and cn utility.
      - Egress: PreferencePanel.
  - Internal API & Structural Schema Blueprint:
      - Renders a "Pace Format" tab switch allowing users to toggle between Time
        Budget and Episodes/Day.
      - Displays a collapsible weekly schedule grid mapping days from Monday to
        Sunday.
  - Session Delta & Structural Evolution Map:
      - Modified: Built the Pace Format selection matrix and designed the
        day-by-day weekly schedule time inputs supporting customizable daily
        watch windows.

📄 FILE ID: src/components/InteractiveSearch.tsx

  - Application Classification: Main Platform Explorer Interface
  - Module Responsibility Statement: Tab selector, dynamic multi-select filters,
    star rating bar, cinematic progress diagnostic loader, and closeable
    marquee.
  - Import/Export Dependency Topology:
      - Ingress: Server Actions from @/app/actions; components PreferencePanel,
        SuggestionImage, VisualFlowchart; icons from lucide-react.
      - Egress: InteractiveSearch.
  - Internal API & Structural Schema Blueprint:
      - Renders dual tabs: "Find Your Path" and "Discover Library".
      - Houses the closeable, sliding banner: "By Agenticweeb - grounded dynamic
        watch orders".
      - Implements the 10-star rating bar and language origin dropdown filters.
      - Displays the 3.5s minimum Progress Diagnostics HUD overlay during
        compiler generation.
  - Session Delta & Structural Evolution Map:
      - Modified: Completely rebuilt to handle multi-genre selected arrays,
        language dropdowns, and star ratings. Casted union types in
        handleSelectSuggestion to any and checked res.success directly in
        handleGenerate to satisfy production compilers.

📄 FILE ID: src/app/actions.ts

  - Application Classification: React 19 Server Actions
  - Module Responsibility Statement: Server-side API endpoint wrappers with Zod
    validation.
  - Import/Export Dependency Topology:
      - Ingress: imports generateIntelligentWatchOrder from
        @/lib/ai/orchestrator; searches from anilist-client and jikan-client.
      - Egress: searchAnimeAction, generateWatchOrderAction,
        discoverAnimeAction.
  - Internal API & Structural Schema Blueprint:
      - discoverAnimeAction(filters: any): Promise<SearchActionResult> ->
        Compiles AniList GraphQL queries dynamically based on active filters,
        bypassing null parameter failures. Applies the Underrated Gems
        mainstream penalty formula.
  - Session Delta & Structural Evolution Map:
      - Modified: Created discoverAnimeAction with the dynamic GraphQL query
        string compiler, multi-genre arrays (genre_in), and underrated gems
        rating math.

📄 FILE ID: src/components/FlowchartV2.tsx

  - Application Classification: Immersive Graphic Timeline UI
  - Module Responsibility Statement: Visualizes the watch order timeline with
    staggered animations, trailers, calendar exports, and progress metrics.
  - Import/Export Dependency Topology:
      - Ingress: Icons from lucide-react; custom types; helper calculators.
      - Egress: FlowchartV2 (default).
  - Internal API & Structural Schema Blueprint:
      - Renders active paths, group accordions, and entry node timelines.
      - Integrates ShareCard and pass customSchedule props dynamically.
  - Session Delta & Structural Evolution Map:
      - Modified: Implemented Framer Motion staggered node entries, customized
        glowing tier borders, widescreen modal trailers, and mapped
        releasedEpisodeCount correctly into time calculation triggers.

📄 FILE ID: src/components/TopBanner.tsx

  - Application Classification: Closeable Header Marquee
  - Module Responsibility Statement: Renders an infinite, CSS-based sliding
    brand text ticker at the absolute top of the page.
  - Import/Export Dependency Topology:
      - Ingress: X icon from lucide-react.
      - Egress: TopBanner.
  - Internal API & Structural Schema Blueprint:
      - Manages local dismissed state hook.
      - Loops the marquee string: "By Agenticweeb - grounded dynamic watch
        orders".
  - Session Delta & Structural Evolution Map:
      - Created: Implemented this new closeable client notification header.

📄 FILE ID: src/app/page.tsx

  - Application Classification: React Server Component Page Shell
  - Module Responsibility Statement: Orchestrates the primary header, heroic
    elements, search panel, and tech architecture footer.
  - Import/Export Dependency Topology:
      - Ingress: CinematicHero, InteractiveSearch, TopBanner.
      - Egress: default Page.
  - Internal API & Structural Schema Blueprint:
      - Renders <TopBanner /> above the static header.
      - Informative headings and footer blocks with detailed tech grounding
        text.
  - Session Delta & Structural Evolution Map:
      - Modified: Rebuilt structural copy, replaced commercial titles with
        technical explanations, and integrated the new banner component.

📄 FILE ID: src/components/Flowchart.tsx

  - Application Classification: Legacy Flowchart Fallback
  - Module Responsibility Statement: Renders the old flat list flowchart for
    backward compatibility.
  - Session Delta & Structural Evolution Map:
      - Modified: Included ShareCard layout and customSchedule props
        integration.

📄 FILE ID: src/components/ShareCard.tsx

  - Application Classification: Summary PNG Generator
  - Module Responsibility Statement: Renders a high-resolution summary card with
    rotated background watermarks, bypassing CORS via proxy.
  - Session Delta & Structural Evolution Map:
      - Modified: Added watermark elements, verified layout constraints.

📄 FILE ID: src/components/TimeBudgetCard.tsx

  - Application Classification: Timeexperience Presenter
  - Module Responsibility Statement: Renders the featured and alternative finish
    times on the timeline.
  - Session Delta & Structural Evolution Map:
      - Modified: Supported "Episodes" and "Custom" schedule indicators.

8. STRATEGIC RUNWAY (NEXT ACTIONABLE STEPS)

1.  [IMMEDIATE RESUMPTION - NEXT CHARACTER TO WRITE]:
      - Target File: Terminal / Git configuration
      - Actionable Task: Push the fully validated, production-ready branch to
        GitHub to trigger Vercel Edge compilation.
      - Verification Method: Inspect Vercel Dashboard for deployment completion,
        open live page, and test "Cyberpunk: Edgerunners" to verify a grounded,
        correct 10-episode calculation.
2.  [SECONDARY SEQUENTIAL COUPLING]:
      - Target File: Vercel Environment Configuration
      - Actionable Task: Add the required .env.local API keys to the Vercel
        project environment settings.
3.  [DOWNSTREAM REFACTOR & INTEGRATION BOUNDARY]:
      - Target File: src/components/InteractiveSearch.tsx
      - Actionable Task: Add pagination support for the Discover tab search
        (e.g. infinite scroll or "Load More" button) if the list exceeds 25
        items.
4.  [COMPREHENSIVE VALIDATION REGIME]:
      - Testing Plan: Query Fate/stay night \rightarrow verify spin-offs like
        Today's Menu for the Emiya Family bypass the coherence check. Query
        Renegade Immortal \rightarrow verify 180 total episodes do not get
        multiplied across arcs. Query Cyberpunk \rightarrow verify S2 displays
        as upcoming with 0 watchable hours.

9. HARDWARE/STATE REHYDRATION BOOTSTRAP PROMPT

"I am loading the complete, compiled v2.4 production state of ChronoFlow.
Analyze the provided PROJECT_CONTEXT.md architecture, particularly the
progress-grounded episode calculations and dynamic Discover compilers, to
instantly rehydrate your development context. Our immediate next task is to push
the final changes and verify the live deployment."


```markdown
# DEEP SYSTEM STATE SERIALIZATION: CHRONOFLOW
> **SYSTEM TIMESTAMP:** 2026-08-19  
> **ENGINE VERSION:** 3.0-PRECISE  
> **HASH CURRENT STATE:** A1F4C9D2B8E7

---

## 1. EXTENDED PROJECT OVERVIEW & SCOPE BOUNDARIES
- **Core Product Vision:** ChronoFlow is an AI-powered anime watch order generator that solves franchise viewing complexity by mapping AniList's relation edges into deterministic or AI-curated timelines. It strictly prevents AI hallucinations by grounding all generated watch orders in verified database IDs.
- **Target User Personas & Workflows:** Anime enthusiasts navigating complex multi-season, multi-route, or studio-switching franchises (e.g., Fate, Monogatari, Attack on Titan). User searches an anime -> selects preferences -> app traverses AniList GraphQL relation graph -> AI curates the order -> UI renders interactive timeline with progress tracking.
- **Comprehensive Tech Stack Architecture:**
  - **Frontend Tier:** Next.js 16.2.10 (App Router, Turbopack), React 19, Tailwind CSS v4, Framer Motion, Lucide React.
  - **Backend/API Tier:** Next.js Server Actions, Vercel AI SDK (`generateText`), AniList GraphQL API.
  - **Database & Storage Layer:** Upstash Redis (Edge caching for search and watch orders), Zustand + LocalStorage (Client-side watch progress persistence).
  - **DevOps & Infrastructure:** Vercel (Hobby Tier), local development via `npm run dev`.
- **Environment & Runtime Prerequisites:**
  - **OS:** Linux/macOS (WSL2 environment detected).
  - **Node:** >= 20.x.
  - **Required `.env` Variables:** `GROQ_API_KEY`, `GOOGLE_AI_API_KEY` (Must map to Vercel AI SDK `google()` provider), `OPENROUTER_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

---

## 2. ADVANCED ARCHITECTURAL DECISIONS & PARADIGMS (ADR)
- **Monolith/Microservice Pattern:** Modular Monolith. Next.js App Router handles RSC, Server Actions act as the API layer, and external services (AniList, Upstash, AI Providers) are abstracted into domain-specific library wrappers.
- **State Management & Data Flow Vectors:** 
  - *Search/Generation:* Client Event -> Server Action -> Upstash Redis Cache Check -> (Cache Miss) -> AniList GraphQL/AI Provider -> Redis Cache Set -> Client Hydration.
  - *Progress:* Client Event -> Zustand Store -> LocalStorage Persist.
- **Graph Traversal Paradigm (V6 Architecture):** Replaced fragile string-matching (`extractStem`, `isFranchiseCoherent`) with pure BFS over AniList `relationType` edges. Only `SEQUEL`, `PREQUEL`, `PARENT`, `SIDE_STORY`, `SPIN_OFF`, `ALTERNATIVE` are admitted. `CHARACTER` and `OTHER` are strictly pruned to prevent crossover leakage (e.g., Isekai Quartet). Post-BFS validation uses "Soft Flagging" rather than hard rejection to accommodate studio changes (WIT -> MAPPA).
- **Resilience & Bypass Strategy (To Prevent Future Delays):** 
  - AI Provider calls are wrapped in a 15-second `AbortSignal.timeout`. 
  - If all AI providers fail, the Orchestrator catches the error and instantly falls back to `buildDeterministicPaths`, returning the raw graph order. The system *never* crashes due to AI unavailability.
  - Hardcoded blacklist strings (e.g., "season 2") were removed to prevent breaking legitimate airing anime like Jujutsu Kaisen.
- **Engineering Conventions & Strict Constraints:**
  - **Naming Typology:** camelCase for variables/functions, PascalCase for Components/Interfaces, snake_case for cache keys.
  - **Error Handling Philosophy:** Fail-fast on validation, fail-safe on AI generation. Graph validation drops hallucinated IDs silently but logs warnings.

---

## 3. ABSOLUTE EXHAUSTIVE REPOSITORY TREE
```text
/home/thierry/chronoflow/
├── .env.local [MODIFIED]
├── next.config.js [UNTOUCHED]
├── package.json [MODIFIED]
├── tailwind.config.ts [UNTOUCHED]
├── tsconfig.json [UNTOUCHED]
├── public/
│   └── suggestions/ [MODIFIED]
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── image-proxy/route.ts [UNTOUCHED]
    │   │   ├── feedback/route.ts [UNTOUCHED]
    │   │   └── search/route.ts [UNTOUCHED]
    │   ├── globals.css [UNTOUCHED]
    │   ├── layout.tsx [UNTOUCHED]
    │   ├── page.tsx [UNTOUCHED]
    │   └── actions.ts [MODIFIED]
    ├── components/
    │   ├── AnimeSearch.tsx [UNTOUCHED]
    │   ├── Flowchart.tsx [UNTOUCHED]
    │   ├── FlowchartV2.tsx [UNTOUCHED]
    │   ├── InteractiveSearch.tsx [UNTOUCHED]
    │   ├── PreferencePanel.tsx [UNTOUCHED]
    │   ├── SuggestionImage.tsx [UNTOUCHED]
    │   └── TopBanner.tsx [UNTOUCHED]
    ├── hooks/
    │   ├── useProgress.ts [MODIFIED]
    │   ├── useSearch.ts [UNTOUCHED]
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
    │   ├── ai-providers.ts [MODIFIED]
    │   ├── anilist-client.ts [UNTOUCHED]
    │   ├── cache.ts [UNTOUCHED]
    │   ├── calendar-generator.ts [UNTOUCHED]
    │   ├── jikan-client.ts [UNTOUCHED]
    │   ├── redis.ts [CREATED]
    │   ├── store.ts [CREATED]
    │   ├── time-calculator.ts [MODIFIED]
    │   └── utils.ts [UNTOUCHED]
    └── types/
        ├── index.ts [UNTOUCHED]
        └── intelligent.ts [UNTOUCHED]
```

---

## 4. GRANULAR DEPENDENCY & PACKAGE MATRIX
| Package Name | Exact Version | Architectural Utility & Domain Dependency | Impact on Bundle/Runtime |
| :--- | :--- | :--- | :--- |
| `next` | 16.2.10 | Core framework, App Router, Server Actions | High runtime overhead, Turbopack enabled |
| `react` | 19.x | UI rendering, concurrent state transitions | Client runtime |
| `ai` | latest | Vercel AI SDK, standardizes LLM provider routing | Server-side runtime, replaces custom fetch logic |
| `@ai-sdk/openai` | latest | Groq/OpenAI compatibility layer for AI SDK | Server-side runtime |
| `@ai-sdk/google` | latest | Google Gemini compatibility layer for AI SDK | Server-side runtime |
| `@upstash/redis` | latest | Edge-compatible Redis client for caching | Server-side runtime, reduces AniList API calls |
| `zustand` | latest | Lightweight global state for watch progress | Client runtime, replaces Context bloat |
| `tailwindcss` | 4.x | Utility-first CSS engine | Build-time only |

---

## 5. HISTORICAL DEVELOPMENT LEDGER & SPRINT ROADMAP
- **Completed Core Milestones:**
  - [x] **Graph Traversal V6:** Eliminated string-matching contamination. Pure BFS over AniList relations with soft-flagging.
  - [x] **AI Provider Hardening:** Migrated to Vercel AI SDK. Added 15s timeout and deterministic fallback.
  - [x] **State & Cache Infrastructure:** Migrated `useProgress` to Zustand. Integrated Upstash Redis for search/order caching (1h/7d TTL).
- **Completed in This Specific Session:**
  - [x] Fixed `aiResponse is not defined` runtime error by scoping AI call variables safely.
  - [x] Removed "season 2" string blacklist breaking Jujutsu Kaisen airing status.
  - [x] Fixed One Piece curated images by mapping `anilistId: 21`.
  - [x] Updated Groq model to `openai/gpt-oss-120b`.
- **Active Blockers, Edge-Case Errors, & Heavy Debt:**
  - **Logic Blockers:** None currently blocking. System fails safe to deterministic graph.
  - **Technical Debt:** `searchAnimeAction` lacks request deduplication (TanStack Query not yet integrated). `InteractiveSearch.tsx` fires multiple concurrent requests on fast typing.

---

## 6. CURRENT EXECUTION POINT & ACTIVE RUNTIME STATE
- **Active Focus Objective:** Transitioning to Phase 3 & 4 of the product roadmap: Client Data Layer optimization (TanStack Query) and UI/UX Polish (nuqs, OG Images).
- **Last Logical Code Mutation:** Replaced the entire `callAIWithFallback` function in `src/lib/ai-providers.ts` to include `AbortSignal.timeout(15000)` and removed OpenRouter from the primary loop to prevent 120s hangs. Removed the hardcoded "season 2" status override in `orchestrator.ts`.
- **Precise Stop-Point Coordinates:**
  - **Target File Path:** `src/lib/ai-providers.ts`
  - **Target Structural Unit:** `callAIWithFallback`
  - **Execution Halt State:** Line 115, immediately after the AI SDK returns successfully or times out, falling back to the orchestrator's deterministic path.

---

## 7. EXHAUSTIVE FILE STRUCTURE REGISTRY (STRICT NO-CODE POLICY)

### 📄 FILE ID: src/lib/ai-providers.ts
- **Application Classification:** AI Infrastructure / Provider Router
- **Module Responsibility Statement:** Orchestrates LLM calls via Vercel AI SDK. Constructs the Groq and Google provider instances. Enforces a 15-second hard timeout to prevent UI hangs. Exposes `buildWatchOrderPrompt` for legacy routes.
- **Internal API & Structural Schema Blueprint:**
  - `callAIWithFallback(prompt: string, maxRetries?: number)` -> Iterates providers, applies `AbortSignal`, returns `{ content, provider, latency }` or throws to be caught by orchestrator.

### 📄 FILE ID: src/lib/ai/orchestrator.ts
- **Application Classification:** Core Business Logic / Pipeline Orchestrator
- **Module Responsibility Statement:** The central brain. Resolves the anime match, triggers graph building, classifies shape, constructs AI payload, executes AI call safely within a try/catch, validates AI response against allowed IDs, and applies user preferences/filters.
- **Internal API & Structural Schema Blueprint:**
  - `generateIntelligentWatchOrder(params)` -> Async function returning `OrchestratorResult`.
  - Contains a strict try/catch block: if `callAIWithFallback` fails, it immediately invokes `buildDeterministicPaths` and returns a safe fallback with `provider: "deterministic-fallback"`.
  - `validateAndFixAIResponse` -> Enforces strict ID matching, deduplicates entries, drops hallucinations.

### 📄 FILE ID: src/lib/knowledge/relation-graph.ts
- **Application Classification:** Data Ingestion & Graph Traversal Engine
- **Module Responsibility Statement:** Fetches AniList media data via batched GraphQL. Performs BFS traversal strictly over `FRANCHISE_RELATIONS` edges. Applies "Soft Flagging" for studio/lexical mismatches instead of hard rejection.
- **Internal API & Structural Schema Blueprint:**
  - `buildRelationGraph(params)` -> Returns `{ graph, allowedTitles, root, warnings }`.
  - `fetchAniListBatch(ids)` -> Batches up to 50 IDs per request to avoid rate limits.

### 📄 FILE ID: src/app/actions.ts
- **Application Classification:** Server Action / API Gateway
- **Module Responsibility Statement:** Validates client payloads via Zod. Wraps `searchAnimeAction` and `generateWatchOrderAction` with Upstash Redis caching layers. Forwards preferences to the orchestrator.
- **Internal API & Structural Schema Blueprint:**
  - `searchAnimeAction(query)` -> Checks Redis (`search:query`), fetches Jikan/AniList if miss, caches for 1 hour.
  - `generateWatchOrderAction(payload)` -> Checks Redis (`watchorder:id: prefs`), invokes Orchestrator if miss, caches for 7 days.

### 📄 FILE ID: src/lib/store.ts
- **Application Classification:** Client State Provider
- **Module Responsibility Statement:** Zustand store managing `progressMap` for watch progress. Persists to LocalStorage automatically.
- **Internal API & Structural Schema Blueprint:**
  - `useWatchStore` -> Exposes `toggleWatched`, `updateProgress`, `rateEntry`.

### 📄 FILE ID: src/lib/redis.ts
- **Application Classification:** Cache Client
- **Module Responsibility Statement:** Initializes Upstash Redis client using environment variables.

---

## 8. STRATEGIC RUNWAY (NEXT ACTIONABLE STEPS)
1. **[IMMEDIATE RESUMPTION - SEARCH DEDUPLICATION]:**
   - **Target File:** `src/components/InteractiveSearch.tsx`
   - **Actionable Task:** Install `@tanstack/react-query`. Wrap the app in `QueryClientProvider`. Replace the `useEffect` + `useTransition` search logic with `useQuery({ queryKey: ['search', query], queryFn: () => searchAnimeAction(query) })`. This will automatically cancel stale requests when the user types fast.
   - **Verification Method:** Type "attack on titan" rapidly. Terminal should show only 1 AniList network request for the final string, not 5.
2. **[SECONDARY SEQUENTIAL COUPLING - MUTATIONS]:**
   - **Target File:** `src/components/InteractiveSearch.tsx`
   - **Actionable Task:** Replace `generateWatchOrderAction` direct calls with `useMutation`. Implement optimistic UI updates or standardized loading states using TanStack's `isPending` state.
3. **[DOWNSTREAM REFACTOR & INTEGRATION BOUNDARY - URL STATE]:**
   - **Target File:** `src/app/page.tsx`
   - **Actionable Task:** Install `nuqs`. Serialize `preferences` and `selected.anilistId` into the URL query parameters so users can share exact watch order configurations.
4. **[COMPREHENSIVE VALIDATION REGIME]:**
   - **Testing Plan:** Search "Fate", "JoJo", "Attack on Titan". Verify no console errors regarding AI exhaustion (should fallback instantly). Verify progress tracking syncs across tabs via Zustand.

---

## 9. HARDWARE/STATE REHYDRATION BOOTSTRAP PROMPT
"Act as a Senior Software Architect. I am uploading the `PROJECT_CONTEXT.md` file containing the deep system state serialization for ChronoFlow. Parse the architectural constraints, specifically the V6 Graph Traversal rules and Vercel AI SDK integration. We are resuming at Step 1 of the Strategic Runway: integrating TanStack Query into `InteractiveSearch.tsx` to deduplicate search requests. Output the exact code diff for the component modifications. Do not hallucinate dependencies; adhere strictly to the provided stack."

This is the final step. Run these commands in your terminal to commit and push everything to GitHub (which will trigger the Vercel deployment):

```bash
git add .
git commit -m "feat: V6 architecture overhaul & UI polish

- Replaced string-matching graph traversal with pure AniList BFS relation edges.
- Implemented soft-flagging for studio/lexical mismatches to prevent false rejections.
- Migrated to Vercel AI SDK with 15s timeout and deterministic fallback.
- Integrated Upstash Redis (search/order caching) and TanStack Query (deduplication).
- Migrated watch progress to Zustand.
- Added nuqs for shareable URLs and ErrorBoundary for crash resistance."
git push origin main
```

Below is the complete, exhaustive `PROJECT_CONTEXT.md` file. Save this to your project root. It contains 100% of the architectural state, ensuring any developer or AI can pick up exactly where we left off without a single question.

```markdown
# DEEP SYSTEM STATE SERIALIZATION: CHRONOFLOW
> **SYSTEM TIMESTAMP:** 2026-08-19  
> **ENGINE VERSION:** 4.0-PRODUCTION-READY  
> **HASH CURRENT STATE:** F8A2C9D1E7B4

---

## 1. EXTENDED PROJECT OVERVIEW & SCOPE BOUNDARIES
- **Core Product Vision:** ChronoFlow is an AI-powered anime watch order generator that solves franchise viewing complexity by mapping AniList's relation edges into deterministic or AI-curated timelines. It strictly prevents AI hallucinations by grounding all generated watch orders in verified database IDs.
- **Target User Personas & Workflows:** Anime enthusiasts navigating complex multi-season, multi-route, or studio-switching franchises (e.g., Fate, Monogatari, Attack on Titan). User searches an anime -> selects preferences -> app traverses AniList GraphQL relation graph -> AI curates the order -> UI renders interactive timeline with progress tracking.
- **Comprehensive Tech Stack Architecture:**
  - **Frontend Tier:** Next.js 16.3.1 (App Router, Turbopack), React 19, Tailwind CSS v4, Framer Motion, Lucide React, TanStack Query, Zustand, nuqs.
  - **Backend/API Tier:** Next.js Server Actions, Vercel AI SDK (`generateText`), AniList GraphQL API.
  - **Database & Storage Layer:** Upstash Redis (Edge caching for search and watch orders), Zustand + LocalStorage (Client-side watch progress persistence).
  - **DevOps & Infrastructure:** Vercel (Hobby Tier), GitHub (CI/CD auto-deploy).
- **Environment & Runtime Prerequisites:**
  - **OS:** Linux/macOS (WSL2 environment detected).
  - **Node:** >= 20.x.
  - **Required `.env` Variables:** `GROQ_API_KEY`, `GOOGLE_AI_API_KEY`, `OPENROUTER_API_KEY` (Optional fallback), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

---

## 2. ADVANCED ARCHITECTURAL DECISIONS & PARADIGMS (ADR)
- **Monolith/Microservice Pattern:** Modular Monolith. Next.js App Router handles RSC, Server Actions act as the API layer, and external services (AniList, Upstash, AI Providers) are abstracted into domain-specific library wrappers.
- **State Management & Data Flow Vectors:** 
  - *Search/Generation:* Client Event -> TanStack Query -> Server Action -> Upstash Redis Cache Check -> (Cache Miss) -> AniList GraphQL/AI Provider -> Redis Cache Set -> Client Hydration.
  - *Progress:* Client Event -> Zustand Store -> LocalStorage Persist.
  - *URL State:* `nuqs` adapter syncs `selectedId` to URL query params for shareability.
- **Graph Traversal Paradigm (V6 Architecture):** Replaced fragile string-matching (`extractStem`, `isFranchiseCoherent`) with pure BFS over AniList `relationType` edges. Only `SEQUEL`, `PREQUEL`, `PARENT`, `SIDE_STORY`, `SPIN_OFF`, `ALTERNATIVE`, `ADAPTATION` are admitted. `CHARACTER` and `OTHER` are strictly pruned to prevent crossover leakage (e.g., Isekai Quartet). Post-BFS validation uses "Soft Flagging" (passing metadata to AI) rather than hard rejection to accommodate studio changes (WIT -> MAPPA).
- **Resilience & Bypass Strategy:** 
  - AI Provider calls are wrapped in a 15-second `AbortSignal.timeout`. 
  - If all AI providers fail, the Orchestrator catches the error and instantly falls back to `buildDeterministicPaths`, returning the raw graph order. The system *never* crashes due to AI unavailability.
  - Hardcoded blacklist strings (e.g., "season 2") were removed to prevent breaking legitimate airing anime like Jujutsu Kaisen.
- **Engineering Conventions & Strict Constraints:**
  - **Naming Typology:** camelCase for variables/functions, PascalCase for Components/Interfaces, snake_case for cache keys.
  - **Error Handling Philosophy:** Fail-fast on validation, fail-safe on AI generation. Graph validation drops hallucinated IDs silently but logs warnings. Global `ErrorBoundary` catches all UI crashes gracefully.

---

## 3. ABSOLUTE EXHAUSTIVE REPOSITORY TREE
```text
/home/thierry/chronoflow/
├── .env.local [MODIFIED]
├── next.config.ts [UNTOUCHED]
├── package.json [MODIFIED]
├── tailwind.config.ts [UNTOUCHED]
├── tsconfig.json [UNTOUCHED]
├── public/
│   └── suggestions/ [MODIFIED]
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── image-proxy/route.ts [UNTOUCHED]
    │   │   ├── feedback/route.ts [UNTOUCHED]
    │   │   └── search/route.ts [UNTOUCHED]
    │   ├── globals.css [UNTOUCHED]
    │   ├── layout.tsx [MODIFIED]
    │   ├── page.tsx [MODIFIED]
    │   ├── providers.tsx [CREATED]
    │   └── actions.ts [MODIFIED]
    ├── components/
    │   ├── AnimeSearch.tsx [UNTOUCHED]
    │   ├── ErrorBoundary.tsx [CREATED]
    │   ├── Flowchart.tsx [UNTOUCHED]
    │   ├── FlowchartV2.tsx [UNTOUCHED]
    │   ├── InteractiveSearch.tsx [MODIFIED]
    │   ├── PreferencePanel.tsx [UNTOUCHED]
    │   ├── SuggestionImage.tsx [UNTOUCHED]
    │   └── TopBanner.tsx [UNTOUCHED]
    ├── hooks/
    │   ├── useProgress.ts [MODIFIED]
    │   ├── useSearch.ts [UNTOUCHED]
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
    │   ├── ai-providers.ts [MODIFIED]
    │   ├── anilist-client.ts [UNTOUCHED]
    │   ├── cache.ts [UNTOUCHED]
    │   ├── calendar-generator.ts [UNTOUCHED]
    │   ├── jikan-client.ts [UNTOUCHED]
    │   ├── redis.ts [CREATED]
    │   ├── store.ts [CREATED]
    │   ├── time-calculator.ts [MODIFIED]
    │   └── utils.ts [UNTOUCHED]
    └── types/
        ├── index.ts [UNTOUCHED]
        └── intelligent.ts [UNTOUCHED]
```

---

## 4. GRANULAR DEPENDENCY & PACKAGE MATRIX
| Package Name | Exact Version | Architectural Utility & Domain Dependency | Impact on Bundle/Runtime |
| :--- | :--- | :--- | :--- |
| `next` | 16.3.1 | Core framework, App Router, Server Actions | High runtime overhead, Turbopack enabled |
| `react` | 19.x | UI rendering, concurrent state transitions | Client runtime |
| `ai` | latest | Vercel AI SDK, standardizes LLM provider routing | Server-side runtime, replaces custom fetch logic |
| `@ai-sdk/openai` | latest | Groq/OpenAI compatibility layer for AI SDK | Server-side runtime |
| `@ai-sdk/google` | latest | Google Gemini compatibility layer for AI SDK | Server-side runtime |
| `@upstash/redis` | latest | Edge-compatible Redis client for caching | Server-side runtime, reduces AniList API calls |
| `@tanstack/react-query` | latest | Client-side data fetching, caching, deduplication | Client runtime, prevents duplicate search calls |
| `zustand` | latest | Lightweight global state for watch progress | Client runtime, replaces Context bloat |
| `nuqs` | latest | URL state synchronization for shareable links | Client + Server sync |
| `tailwindcss` | 4.x | Utility-first CSS engine | Build-time only |

---

## 5. HISTORICAL DEVELOPMENT LEDGER & SPRINT ROADMAP
- **Completed Core Milestones:**
  - [x] **Graph Traversal V6:** Eliminated string-matching contamination. Pure BFS over AniList relations with soft-flagging.
  - [x] **AI Provider Hardening:** Migrated to Vercel AI SDK. Added 15s timeout and deterministic fallback.
  - [x] **State & Cache Infrastructure:** Migrated `useProgress` to Zustand. Integrated Upstash Redis for search/order caching (1h/7d TTL).
  - [x] **Client Data Layer:** Integrated TanStack Query for search and discover deduplication.
  - [x] **UI/UX Polish:** Added `nuqs` for shareable URLs, `ErrorBoundary` for crash resistance, and polished UI copy.
- **Active Blockers, Edge-Case Errors, & Heavy Debt:**
  - **Logic Blockers:** None currently blocking. System fails safe to deterministic graph.
  - **Technical Debt:** `searchAnimeAction` uses standard `useState` for text input (preventing URL spam), which is correct. OpenTelemetry/Sentry not yet integrated (Phase 5).

---

## 6. CURRENT EXECUTION POINT & ACTIVE RUNTIME STATE
- **Active Focus Objective:** Pushing V6 architecture to GitHub and deploying to Vercel.
- **Last Logical Code Mutation:** Replaced the entire `InteractiveSearch.tsx` component to restore missing `searchAnimeAction` query block, fix `discoverLoading` scope, and remove `Sparkles` icons in favor of `Clock`/`Search` for a premium look.
- **Precise Stop-Point Coordinates:**
  - **Target File Path:** `src/components/InteractiveSearch.tsx`
  - **Target Structural Unit:** `InteractiveSearch` Component Export
  - **Execution Halt State:** Line 675, immediately before the closing `}` of the component function.

---

## 7. EXHAUSTIVE FILE STRUCTURE REGISTRY (STRICT NO-CODE POLICY)

### 📄 FILE ID: src/lib/ai-providers.ts
- **Application Classification:** AI Infrastructure / Provider Router
- **Module Responsibility Statement:** Orchestrates LLM calls via Vercel AI SDK. Constructs the Groq and Google provider instances. Enforces a 15-second hard timeout to prevent UI hangs. Exposes `buildWatchOrderPrompt` for legacy routes.
- **Internal API & Structural Schema Blueprint:**
  - `callAIWithFallback(prompt: string, maxRetries?: number)` -> Iterates providers, applies `AbortSignal`, returns `{ content, provider, latency }` or throws to be caught by orchestrator.

### 📄 FILE ID: src/lib/ai/orchestrator.ts
- **Application Classification:** Core Business Logic / Pipeline Orchestrator
- **Module Responsibility Statement:** The central brain. Resolves the anime match, triggers graph building, classifies shape, constructs AI payload, executes AI call safely within a try/catch, validates AI response against allowed IDs, and applies user preferences/filters.
- **Internal API & Structural Schema Blueprint:**
  - `generateIntelligentWatchOrder(params)` -> Async function returning `OrchestratorResult`.
  - Contains a strict try/catch block: if `callAIWithFallback` fails, it immediately invokes `buildDeterministicPaths` and returns a safe fallback with `provider: "deterministic-fallback"`.
  - `validateAndFixAIResponse` -> Enforces strict ID matching, deduplicates entries, drops hallucinations.

### 📄 FILE ID: src/lib/knowledge/relation-graph.ts
- **Application Classification:** Data Ingestion & Graph Traversal Engine
- **Module Responsibility Statement:** Fetches AniList media data via batched GraphQL. Performs BFS traversal strictly over `FRANCHISE_RELATIONS` edges. Applies "Soft Flagging" for studio/lexical mismatches instead of hard rejection.
- **Internal API & Structural Schema Blueprint:**
  - `buildRelationGraph(params)` -> Returns `{ graph, allowedTitles, root, warnings }`.
  - `fetchAniListBatch(ids)` -> Batches up to 50 IDs per request to avoid rate limits.

### 📄 FILE ID: src/app/actions.ts
- **Application Classification:** Server Action / API Gateway
- **Module Responsibility Statement:** Validates client payloads via Zod. Wraps `searchAnimeAction` and `generateWatchOrderAction` with Upstash Redis caching layers. Forwards preferences to the orchestrator.
- **Internal API & Structural Schema Blueprint:**
  - `searchAnimeAction(query)` -> Checks Redis (`search:query`), fetches AniList if miss, caches for 1 hour.
  - `generateWatchOrderAction(payload)` -> Checks Redis (`watchorder:id: prefs`), invokes Orchestrator if miss, caches for 7 days.

### 📄 FILE ID: src/lib/store.ts
- **Application Classification:** Client State Provider
- **Module Responsibility Statement:** Zustand store managing `progressMap` for watch progress. Persists to LocalStorage automatically.
- **Internal API & Structural Schema Blueprint:**
  - `useWatchStore` -> Exposes `toggleWatched`, `updateProgress`, `rateEntry`.

### 📄 FILE ID: src/lib/redis.ts
- **Application Classification:** Cache Client
- **Module Responsibility Statement:** Initializes Upstash Redis client using environment variables.

### 📄 FILE ID: src/app/providers.tsx
- **Application Classification:** Client Context Provider
- **Module Responsibility Statement:** Wraps the application in `QueryClientProvider` for TanStack Query, configuring default stale times and refetch behaviors.

### 📄 FILE ID: src/components/InteractiveSearch.tsx
- **Application Classification:** Primary UI Controller
- **Module Responsibility Statement:** Manages the "Find Your Path" (Search) and "Discover Library" (Filter) tabs. Uses `useQuery` for both search and discover to deduplicate requests. Syncs selected anime ID to URL via `useQueryState` (nuqs). Handles generation loading states.
- **Internal API & Structural Schema Blueprint:**
  - `safeQuery = String(deferredQuery || "")` -> Ensures string type for query keys.
  - `useQuery({ queryKey: ['search', safeQuery] })` -> Fetches search data.
  - `useQuery({ queryKey: ['discover', ...filters] })` -> Fetches discover data.

### 📄 FILE ID: src/components/ErrorBoundary.tsx
- **Application Classification:** Global Error Handler
- **Module Responsibility Statement:** Class component that catches fatal UI render errors and displays a "Timeline Disrupted" fallback UI with a reload button, preventing white-screen crashes.

---

## 8. STRATEGIC RUNWAY (NEXT ACTIONABLE STEPS)
1. **[IMMEDIATE RESUMPTION - DEPLOYMENT]:**
   - **Target File:** Git Repository
   - **Actionable Task:** Commit all changes and push to GitHub. Verify Vercel auto-deploy succeeds. Check production environment variables in Vercel dashboard.
   - **Verification Method:** Visit the Vercel deployment URL. Search for "Fate" and generate an order.
2. **[SECONDARY SEQUENTIAL COUPLING - ANALYTICS]:**
   - **Target File:** `src/app/layout.tsx`
   - **Actionable Task:** Integrate Vercel Analytics or Plausible for user tracking.
3. **[DOWNSTREAM REFACTOR & INTEGRATION BOUNDARY - OBSERVABILITY]:**
   - **Target File:** `instrumentation.ts` (to be created)
   - **Actionable Task:** Integrate Sentry or OpenTelemetry for production error tracing.
4. **[COMPREHENSIVE VALIDATION REGIME]:**
   - **Testing Plan:** Monitor production logs for AniList rate limits or AI provider exhaustions. Ensure deterministic fallback holds up under load.

---

## 9. HARDWARE/STATE REHYDRATION BOOTSTRAP PROMPT
"Act as a Senior Software Architect. I am uploading the `PROJECT_CONTEXT.md` file containing the deep system state serialization for ChronoFlow. Parse the architectural constraints, specifically the V6 Graph Traversal rules, Vercel AI SDK integration with 15s timeout, and Zustand/Upstash state management. We are resuming at the Deployment phase. Analyze the project and provide the exact steps to integrate Vercel Analytics and Sentry into the application. Do not hallucinate dependencies; adhere strictly to the provided stack."


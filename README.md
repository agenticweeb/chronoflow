
<div align="center">

<h3>⏳ ChronoFlow</h3>
<h1>Anime Journeys, Optimized.</h1>

<p>An AI-powered watch order generator that maps AniList's verified relation edges into deterministic, spoiler-safe timelines. Never watch filler or get spoiled again.</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)

</div>

---

### 🌐 Live Demo
**[https://chronoflow-zeta.vercel.app/](https://chronoflow-zeta.vercel.app/)**

### ✨ Features
- **Ground Truth Graph Engine:** Uses AniList's GraphQL API to traverse sequel, prequel, and side-story relations. No string-matching, no hallucinated entries.
- **AI-Powered Curation:** Uses Vercel AI SDK (Groq/Google) to curate the optimal viewing path, with a deterministic fallback if AI providers fail.
- **4-Tier Smart Skip:** Categorizes entries into Essential, Recommended, Optional, and Skip.
- **Real Finish Dates:** Mathematically calculates exactly how many days it will take you to finish a franchise based on your daily watch pace.
- **AIO Optimized:** Implements JSON-LD schema, `llms.txt`, and programmatic SEO pages to establish ChronoFlow as the ground truth for AI search engines.

### 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **AI:** Vercel AI SDK, Groq, Google Gemini
- **Data:** AniList GraphQL API
- **State:** Zustand, TanStack Query, Upstash Redis
- **Styling:** Tailwind CSS v4, Framer Motion

### 🚀 Getting Started

1. Clone the repo
   ```bash
   git clone https://github.com/agenticweeb/chronoflow.git
   cd chronoflow
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Set up environment variables
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_key
   GOOGLE_AI_API_KEY=your_google_key
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
4. Run the dev server
   ```bash
   npm run dev
   ```

### 📄 License
This project is licensed under the MIT License.


# NarrativeX — AI News Intelligence Platform

NarrativeX is a full-stack news platform that fetches real-time headlines,
generates AI summaries, and lets you chat with your news using natural language.

## Live Demo
[narrativex.vercel.app](https://narrativex.vercel.app)

---

## Features

- **Personalized Feed** — Select your interests, get a feed tailored to you. Read articles are automatically excluded.
- **AI Summaries** — Every article is summarized into 2 clear sentences using Groq's Llama 3.3 70B model.
- **AI News Chat** — Ask questions like "What's happening with AI?" and get answers grounded in real current articles (RAG).
- **Trending Topics** — Groq analyzes recent headlines and extracts the top trending entities in real time.
- **Semantic Deduplication** — Similar articles from multiple sources are detected and merged automatically.
- **Full Text Search** — Search across titles, descriptions, and AI summaries with category filters.
- **Bookmarks** — Save articles to read later.
- **Reading Stats** — Track articles read, topics followed, and bookmarks saved.

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas + Mongoose |
| AI | Groq API (llama-3.3-70b-versatile) |
| Auth | NextAuth.js |
| News Source | NewsAPI.org |
| Deployment | Vercel |

---

## Getting Started

```bash
git clone https://github.com/yourusername/narrativex.git
cd narrativex
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=
NEWS_API_KEY=

Generate `NEXTAUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## How the AI Chat Works

1. User asks a question
2. App searches MongoDB for the 5 most relevant articles
3. Those articles are injected into the AI prompt as context
4. Groq answers strictly based on real articles — no hallucination
5. Sources are shown below every response

---

## Author

[Your Name](https://github.com/yourusername)
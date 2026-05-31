# NarrativeX — AI News Intelligence Platform

NarrativeX is an AI-powered news platform that aggregates real-time headlines, generates intelligent summaries, and lets you have conversations with your news using natural language.

## 🚀 Live Demo
[narrativex.vercel.app](https://narrativex.vercel.app)

---

## ✨ Features

- **Personalized Feed** — Select your interests on signup, get a feed tailored to you. Read articles are automatically excluded from future feeds.
- **AI Summaries** — Every article is summarized into 2 clear sentences using Groq's Llama 3.3 70B — read more in less time.
- **AI News Chat (RAG)** — Ask questions like "What's happening with AI?" and get answers grounded in real current articles with source citations.
- **Trending Topics** — Groq analyzes recent headlines in real time and extracts the top trending entities and themes.
- **Semantic Deduplication** — Similar articles from multiple sources are detected and merged automatically — no more reading the same story 10 times.
- **Full Text Search** — Search across titles, descriptions, and AI summaries with category filters.
- **Bookmarks** — Save articles to read later.
- **Reading Stats** — Track articles read, topics followed, and bookmarks saved.

---

## 🛠️ Tech Stack

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

## 🏗️ Architecture Highlights

- **RAG Implementation** — AI chat fetches the 5 most relevant articles from MongoDB and injects them as context into Groq — answers are grounded in real news, not model training data
- **Semantic Deduplication** — Text similarity detection across articles from multiple sources, keeping the best-written version of each story
- **Personalization Engine** — Interest graph built on signup, updated with reading history to evolve the feed over time
- **AI Summarization Pipeline** — Every ingested article is processed through Groq before storage, summaries persist in MongoDB
- **Next.js App Router** — Server components for data fetching, client components for interactivity, API routes for backend logic — all in one codebase

---

## 💬 How AI Chat Works

1. User asks a question in natural language
2. App searches MongoDB for the 5 most relevant articles matching the query
3. Those articles are injected into the Groq prompt as context
4. Groq answers strictly based on real articles — no hallucination
5. Source citations shown below every response

---

## 👩‍💻 Author
Anshita Shrivastava

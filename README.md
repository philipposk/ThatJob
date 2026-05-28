# ThatJob

ThatJob is a website that helps you apply for jobs faster. You upload your CV and other materials once, paste in a job advert, and it writes a tailored CV and cover letter for that specific role. It is built for job seekers who are tired of rewriting the same documents over and over for every application.

## What it does
- Learns from your existing CV, cover letters, LinkedIn and other materials
- Reads a job advert and writes a CV and cover letter aimed at that exact job
- Lets you chat with it to tweak the wording or make new versions
- Looks up basic facts about the company so your application feels relevant
- Gives each job a "match score" so you can see how well you fit before applying
- Can prepare applications for several jobs at once
- Exports finished documents as polished PDF files
- Sticks to the truth — it won't invent qualifications or experience you don't have

## Status
Working web app (you open it in a browser). It needs some setup and accounts before it can run.

---
### For developers
Built with Next.js 14 (App Router) and TypeScript. Uses Supabase for the database, login, and file storage; OpenAI (GPT-4) for the AI writing, with Groq as a backup. Styled with Tailwind CSS and hosted on Vercel. PDF/DOCX generation via `@react-pdf/renderer` and `docx`.

Key folders: `app/` (pages and API routes), `components/` (UI), `lib/` (Supabase, OpenAI, PDF and AI logic), `types/`, `supabase/` (database migrations), `public/templates/` (default CV/cover templates).

Setup: `npm install`, create `.env.local` with Supabase + OpenAI/Groq keys, run the SQL in `supabase/`, then `npm run dev`. See `SETUP_GUIDE.md`, `DEPLOYMENT.md`, `SUPABASE_SETUP.md`, and `VERCEL_SETUP.md` for full instructions. Note: the repo root also holds many personal job-application PDFs/letters that are unrelated to the app code.

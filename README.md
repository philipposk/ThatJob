# ThatJob - AI CV & Cover Letter Generator

AI-powered web application that generates tailored CVs and cover letters by learning from your uploaded materials and matching them to job requirements.

The ThatJob app streamlines the entire job application process through intelligent automation and transparency. It analyzes job postings, user-provided materials (CVs, cover letters, LinkedIn, GitHub, etc.), and company data to generate personalized, verifiable applications.

## Five-Phase Workflow

1. **Intake:** Gathers job ads, user files, and goals; ensures clarity before drafting.
2. **Research:** Collects company and user info with documented sources.
3. **Drafting:** Tailors CVs and cover letters for each position — truthful, concise, and job-relevant.
4. **Presentation:** Explains reasoning, cites all sources, and allows user control over company-alignment tone.
5. **Delivery:** Exports polished PDFs for both documents and automatically fills Joblog or country-specific forms.

## Features

- **Phase 1: Material Upload** - Upload CVs, cover letters, degrees, LinkedIn, GitHub, portfolio
- **Phase 2: AI Generation** - Generate tailored CVs and cover letters for any job posting
- **AI Chat** - Chat with AI about documents, request edits, create similar documents
- **Company Research** - Automatic company research using OpenAI with web browsing
- **Alignment Scoring** - Adjustable company ethics/values alignment (10/30/50/70/90%)
- **Job Matching** - Pre-generation matching score calculator
- **Batch Generation** - Generate documents for multiple jobs at once
- **Platform Formats** - LinkedIn, Indeed, ATS-friendly, and generic formats
- **Guest Mode** - Try without signing up (localStorage caching)
- **Document Sharing** - Share documents via read-only links
- **Tone Principles:** Direct, honest, specific, and professional — never artificial or exaggerated
- **Factual Integrity:** Maintains strict factual integrity — no hallucination or unverifiable claims

## Tech Stack

- **Frontend/Backend**: Next.js 14+ (App Router) with TypeScript
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI API (GPT-4) with Groq backup
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_MODEL=gpt-4-turbo-preview
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run database migrations in Supabase:
   - Execute `supabase/complete_setup.sql` in Supabase SQL Editor
   - Or run individual migration files in order

4. Run the development server:
```bash
npm run dev
```

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/` - Core libraries (Supabase, OpenAI, PDF, AI logic)
- `types/` - TypeScript type definitions
- `supabase/migrations/` - Database migration scripts
- `public/templates/` - Default CV/cover templates

## Documentation

- `SETUP_GUIDE.md` - Complete setup instructions
- `DEPLOYMENT.md` - Deployment guide
- `SUPABASE_SETUP.md` - Supabase configuration
- `VERCEL_SETUP.md` - Vercel configuration
- `DNS_SETUP.md` - Custom domain setup
- `COMPLETE_SETUP_CHECKLIST.md` - Setup checklist

## License

MIT

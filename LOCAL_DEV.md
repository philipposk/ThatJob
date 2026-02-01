# Local Development Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` (if it doesn't exist)
   - Fill in your Supabase and OpenAI credentials

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:3000`

## Build for Production (Local)

```bash
npm run build
npm start
```

## Notes

- **Local development works fine** - Node.js has native `__dirname` support
- The `__dirname` polyfill is only needed for serverless environments (Vercel)
- If you see any errors, check that your `.env.local` file has all required variables

## Troubleshooting

### Port already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

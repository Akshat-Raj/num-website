# Numerano Team Registration - AI Coding Agent Instructions

## Project Overview
Next.js 14 app for team registration with ID card verification, human check (reCAPTCHA), and automated email confirmation. Generates unique Team IDs stored in MongoDB.

## Architecture & Data Flow
1. **Client**: [components/RegistrationForm.tsx](../components/RegistrationForm.tsx) collects team data, ID cards as multipart/form-data
2. **API**: [app/api/register/route.ts](../app/api/register/route.ts) validates with Zod, verifies ID cards, generates Team ID, saves to MongoDB, sends email
3. **Database**: [models/Team.ts](../models/Team.ts) stores team info (2-4 members) with unique Team ID index
4. **Email**: [lib/email.ts](../lib/email.ts) sends confirmation via Nodemailer (gracefully skips if SMTP not configured)
5. **Chatbot**: [components/ChatBot.tsx](../components/ChatBot.tsx) provides AI assistance via Gemini API ([app/api/chat/route.ts](../app/api/chat/route.ts))

## Critical Patterns

### Form Data Structure
- Dynamic array-based naming: `members[0][name]`, `members[1][email]`, `idCards[0]`
- Server parses FormData entries into arrays by regex matching indices
- Team size (2-4) must match number of members and ID cards provided

### Environment Configuration
- **Required for production**: `MONGODB_URI`, `SMTP_*` vars (see [config/env.example](../config/env.example))
- **Optional**: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (falls back to checkbox if missing), `GEMINI_API_KEY` (chatbot disabled if missing)
- [lib/mongodb.ts](../lib/mongodb.ts) uses global caching pattern to prevent connection leaks in dev

### ID Verification
[lib/verifyId.ts](../lib/verifyId.ts) validates client-side: file type (PDF/images), size (max 5MB), minimum image buffer size. No external API calls.

### Human Check Component
[components/human-check.tsx](../components/human-check.tsx) conditionally renders reCAPTCHA v2 or fallback checkbox based on `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` availability.

### ChatBot Widget
[components/ChatBot.tsx](../components/ChatBot.tsx) fixed floating button (bottom-right) with chat interface. Uses [app/api/chat/route.ts](../app/api/chat/route.ts) for Gemini AI responses with built-in context about registration process. Gracefully disables if `GEMINI_API_KEY` not set.

### Mongoose Model Pattern
```typescript
const Team: Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);
```
Prevents Next.js dev mode re-compilation errors. Use this pattern for all models.

### Team ID Generation
`TEAM-${crypto.randomUUID().split("-")[0].toUpperCase()}` with collision check loop before save.

## Development Workflow

### Run Development Server
```bash
npm run dev       # Next.js dev server on :3000
npm run build     # Production build
npm run lint      # ESLint check
```

### Testing Changes
- Set `.env.local` with MongoDB URI (can skip SMTP for local testing)
- API continues on DB save failures to allow email testing
- Check browser console for client errors, terminal for server logs

### Vercel Deployment
- Auto-detects Next.js 14, uses default build settings
- Configure environment variables in Vercel dashboard (match [config/env.example](../config/env.example))
- MongoDB connection uses global caching (serverless-optimized in [lib/mongodb.ts](../lib/mongodb.ts))
- Prefix client-side env vars with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`)

## Styling Conventions
- CSS variables in [app/globals.css](../app/globals.css): `--bg`, `--panel`, `--glow-primary`, etc.
- Utility classes: `.glass` (frosted background), `.pill`, `.chip`, `.button`
- Framer Motion for page transitions and form animations
- Custom font variables: `--font-inter`, `--font-grotesk` (defined in layout)

## Key Dependencies
- **zod**: Schema validation for API requests
- **mongoose**: MongoDB ODM with TypeScript support
- **nodemailer**: SMTP email delivery
- **framer-motion**: Declarative animations
- **react-google-recaptcha**: reCAPTCHA v2 integration (dynamic import, SSR disabled)
- **@google/generative-ai**: Gemini AI for chatbot assistance

## TypeScript Configuration
- **Strict mode enabled**: Handle all type errors
- **Next.js typed routes**: `experimental.typedRoutes = true` in config
- **No JS files allowed**: `allowJs: false` in tsconfig

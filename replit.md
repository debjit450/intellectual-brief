# The Intellectual Brief

## Overview
A React-based news aggregation and AI briefing application that curates technology, AI, business, and policy news. The app uses Google Gemini AI to generate intelligent news briefs and summaries.

## Project Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via CDN)
- **Authentication**: Clerk
- **AI Service**: Google Gemini AI
- **Analytics**: Vercel Analytics

## Key Files
- `index.tsx` - App entry point with Clerk provider
- `App.tsx` - Main routing configuration
- `services/geminiService.ts` - AI briefing generation service
- `services/newsService.ts` - News fetching service
- `vite.config.ts` - Vite configuration (port 5000, all hosts allowed)

## Required Environment Variables
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication public key
- `GEMINI_API_KEY` - Google Gemini AI API key
- `PERSPECTIVE_API_KEY` (optional) - Google Perspective API for content moderation

## Development
- Run `npm run dev` to start the development server on port 5000
- The app is configured to accept all hosts for Replit's proxy environment

## Deployment
- Static site deployment configured
- Build command: `npm run build`
- Output directory: `dist`

## Recent Changes
- December 2024: Imported from GitHub and configured for Replit environment
- Updated Vite config to use port 5000 and allow all hosts

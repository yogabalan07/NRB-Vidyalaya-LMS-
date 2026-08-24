# Deployment Guide

## Prerequisites

- Node.js >= 18
- pnpm >= 9
- Supabase project
- Domain name (for production)
- SSL certificate (via reverse proxy)

## Environment Setup

### 1. Supabase Project
1. Create a new Supabase project
2. Run migrations from `supabase/migrations/`
3. Configure storage buckets
4. Set up RLS policies

### 2. Frontend Deployment
```bash
cd frontend
pnpm install
pnpm build
# Deploy dist/ to CDN or static hosting
```

### 3. Backend Deployment
```bash
cd backend
pnpm install
pnpm build
# Deploy dist/ to your server
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured
- [ ] CORS origins set correctly
- [ ] SSL/HTTPS enabled
- [ ] Error monitoring set up
- [ ] Database backups configured
- [ ] AI API keys secured

## Recommended Hosting

- **Frontend:** Vercel, Netlify, or Cloudflare Pages
- **Backend:** Railway, Render, or DigitalOcean
- **Database:** Supabase (managed PostgreSQL)

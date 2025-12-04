# 🚀 Deployment Checklist for Soular Next

Use this checklist to ensure your application is production-ready before deploying.

## 📋 Pre-Deployment Checklist

### 1. Supabase Setup ✓

- [ ] Supabase project created
- [ ] Database schema applied (`supabase/schema.sql`)
- [ ] Storage buckets created:
  - [ ] `avatars`
  - [ ] `posters`
  - [ ] `thumbnails`
  - [ ] `films`
  - [ ] `events`
- [ ] Storage policies configured
- [ ] RLS policies verified on all tables
- [ ] Database indexes created
- [ ] Seed data loaded (optional, `supabase/seed.sql`)

### 2. Authentication Configuration ✓

- [ ] Email provider enabled in Supabase Auth
- [ ] Email templates customized (optional)
- [ ] Site URL configured for production domain
- [ ] Redirect URLs added:
  - [ ] `https://your-domain.com/api/auth/callback`
- [ ] Email confirmation settings configured
- [ ] Password requirements reviewed

### 3. Environment Variables ✓

**Local (.env.local)**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `NEXT_PUBLIC_SITE_URL` set to localhost

**Production (Vercel)**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added (encrypted)
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain

### 4. Code Quality ✓

- [ ] TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Console.log statements removed or wrapped in dev checks
- [ ] Unused imports removed
- [ ] Code formatted consistently
- [ ] Comments added for complex logic

### 5. Security Review ✓

- [ ] Service role key never exposed to client
- [ ] RLS policies tested for all tables
- [ ] User input validated on server-side
- [ ] File upload size limits configured
- [ ] CORS settings reviewed
- [ ] SQL injection prevention verified
- [ ] XSS protection implemented

### 6. Performance Optimization ✓

- [ ] Images optimized (using Next.js Image component)
- [ ] Code splitting implemented
- [ ] Lazy loading for heavy components
- [ ] Database queries optimized
- [ ] Proper indexes on frequently queried columns
- [ ] Pagination implemented for large datasets
- [ ] React Query caching configured

### 7. Testing ✓

- [ ] User registration flow tested
- [ ] Login/logout flow tested
- [ ] Film upload tested (if curator/admin)
- [ ] Event creation tested
- [ ] Forum posting tested
- [ ] File upload tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked

### 8. Error Handling ✓

- [ ] API routes have proper error handling
- [ ] User-friendly error messages displayed
- [ ] 404 page customized
- [ ] 500 error page customized
- [ ] Loading states implemented
- [ ] Toast notifications for user actions

## 🔧 Deployment Steps

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
5. Add environment variables (see section 3 above)
6. Click "Deploy"

### Step 3: Post-Deployment Configuration

- [ ] Verify deployment URL
- [ ] Update Supabase authentication URLs
- [ ] Test production site thoroughly
- [ ] Configure custom domain (if applicable)
- [ ] Set up SSL certificate (automatic with Vercel)
- [ ] Configure DNS records

### Step 4: Monitor and Maintain

- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure analytics (Google Analytics, Plausible, etc.)
- [ ] Set up uptime monitoring
- [ ] Schedule regular database backups
- [ ] Review Supabase usage metrics
- [ ] Monitor Vercel function execution times

## 📊 Post-Launch Checklist

### Week 1

- [ ] Monitor error logs daily
- [ ] Check server response times
- [ ] Review user feedback
- [ ] Fix critical bugs immediately
- [ ] Monitor database performance
- [ ] Check storage usage

### Month 1

- [ ] Review analytics data
- [ ] Optimize slow queries
- [ ] Update documentation
- [ ] Plan feature improvements
- [ ] Review security logs
- [ ] Backup database

## 🔄 Supabase-Specific Checks

### Database

- [ ] Verify all triggers working correctly
- [ ] Test database functions (increment_film_views, etc.)
- [ ] Check automated backups are enabled
- [ ] Review connection pooling settings
- [ ] Monitor database size vs. plan limits

### Storage

- [ ] Verify bucket policies working
- [ ] Test file upload limits
- [ ] Check CDN distribution
- [ ] Monitor bandwidth usage
- [ ] Review storage size vs. plan limits

### Authentication

- [ ] Test email delivery
- [ ] Verify password reset flow
- [ ] Check session management
- [ ] Test social auth (if configured)
- [ ] Review authentication logs

## 🎯 Production Best Practices

### API Routes

```typescript
// Always validate input
// Always handle errors
// Always use proper HTTP status codes
// Always log errors (but not sensitive data)

export async function POST(request: Request) {
  try {
    // Input validation
    const body = await request.json()
    // ... validation logic
    
    // Business logic
    // ...
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Client Components

```typescript
// Always handle loading states
// Always handle error states
// Always provide user feedback
// Always clean up subscriptions

'use client'

export default function MyComponent() {
  const { data, isLoading, error } = useQuery(...)
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!data) return <EmptyState />
  
  return <div>{/* Your content */}</div>
}
```

## 🚨 Common Issues and Solutions

### Issue: "Invalid API key" in production

**Solution:**
- Verify environment variables in Vercel dashboard
- Redeploy after adding variables
- Check that keys match your Supabase project

### Issue: Authentication callback not working

**Solution:**
- Add production URL to Supabase redirect URLs
- Ensure callback route exists at `/api/auth/callback`
- Check middleware is not blocking the route

### Issue: Images not loading

**Solution:**
- Add Supabase domain to Next.js image domains
- Verify storage bucket is public
- Check file paths are correct

### Issue: Database queries failing

**Solution:**
- Check RLS policies
- Verify user authentication
- Review query syntax
- Check table/column names

## 📝 Environment Variables Reference

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Error Tracking
SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 🎉 Launch Day!

- [ ] Final smoke test on production
- [ ] Prepare rollback plan
- [ ] Monitor error logs actively
- [ ] Be ready to fix critical issues
- [ ] Announce launch to users
- [ ] Celebrate! 🎊

---

**Remember:** Always test thoroughly before deploying to production!
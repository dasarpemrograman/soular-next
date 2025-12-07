# 🚀 Subscription System Setup Instructions

## Step 1: Apply Database Changes

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/lupifkngrekxysyjzaed

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste SQL**
   - Open the file: `supabase/APPLY_THIS.sql`
   - Copy the ENTIRE content
   - Paste it into the Supabase SQL Editor

4. **Run the Query**
   - Click "Run" or press `Ctrl+Enter`
   - Wait for completion (should take 5-10 seconds)
   - You should see success messages at the bottom

## Step 2: Verify Installation

After running the SQL, verify everything is set up correctly:

### Check Tables Created
Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'user_subscriptions', 'payment_transactions', 'premium_content')
ORDER BY table_name;
```

You should see 4 tables.

### Check Subscription Plans
```sql
SELECT name, display_name, price_monthly, price_yearly 
FROM subscription_plans 
ORDER BY sort_order;
```

You should see: Free, Basic, Premium, Pro

### Check Premium Film
```sql
SELECT f.title, f.slug, f.is_premium, pc.required_plan, pc.preview_duration
FROM films f
LEFT JOIN premium_content pc ON pc.content_type = 'film' AND pc.content_id = f.id
WHERE f.slug = 'sang-pencari-cahaya';
```

You should see "Sang Pencari Cahaya" requiring "premium" plan.

## Step 3: Test the Application

### A. Visit Subscription Page
1. Make sure dev server is running: `npm run dev`
2. Open: http://localhost:3000/subscription (or :3001 if port 3000 is in use)
3. You should see the subscription management page
4. Click "Upgrade to Premium" to see the paywall modal

### B. Test Premium Film
1. Go to: http://localhost:3000/films
2. Look for "Sang Pencari Cahaya" 
3. Click on it
4. As a free user, you should see a premium paywall
5. The film should show as requiring Premium plan

### C. Test Subscription Flow
1. Click "Upgrade to Premium" or "Subscribe"
2. Select a plan (Basic, Premium, or Pro)
3. Choose billing cycle (Monthly or Yearly)
4. Click subscribe
5. You should get a success message
6. Refresh the page - your profile should now show the selected plan

### D. Verify Access
1. After subscribing to Premium or Pro
2. Go back to "Sang Pencari Cahaya" film
3. You should now have full access (no paywall)

## Step 4: Check API Endpoints

Test these API endpoints:

### Get Subscription Plans
```bash
curl http://localhost:3000/api/subscription?action=plans
```

### Get User Subscription (requires auth)
```bash
# Login first, then:
curl http://localhost:3000/api/subscription
```

## Troubleshooting

### Issue: "Table already exists" error
- This is OK! It means some tables were already created
- The SQL uses `CREATE TABLE IF NOT EXISTS` so it won't fail
- Continue with the rest of the installation

### Issue: Paywall doesn't show
1. Check browser console for errors (F12)
2. Make sure you're logged in
3. Clear browser cache and reload
4. Check that the film has `is_premium = true`

### Issue: "Function does not exist"
- Re-run the APPLY_THIS.sql file completely
- Make sure all functions are created

### Issue: Subscription doesn't save
1. Check browser console for API errors
2. Verify you're logged in
3. Check that `profiles` table has subscription columns:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name LIKE 'subscription%';
   ```

## What Was Installed

### 📊 Database Tables
- `subscription_plans` - Available subscription tiers
- `user_subscriptions` - User subscription records
- `payment_transactions` - Payment history (demo mode)
- `premium_content` - Premium content access rules

### 🔒 Security (RLS)
- Row Level Security enabled on all tables
- Users can only see their own subscriptions
- Admins can manage all data
- Public can view available plans

### ⚡ Functions
- `has_premium_access()` - Check user access level
- `get_user_subscription()` - Get user's current subscription
- `is_premium_content()` - Check if content is premium
- `cancel_subscription()` - Cancel user subscription
- `reactivate_subscription()` - Reactivate cancelled subscription
- `get_subscription_stats()` - Admin stats

### 🎬 Premium Content
- **Sang Pencari Cahaya** - Premium documentary film
  - Director: Rendra Mahardika
  - Duration: 147 minutes
  - Required Plan: Premium or Pro
  - Preview: 3 minutes (180 seconds) for free users
  - Rating: 4.85/5

### 💎 Subscription Plans

| Plan | Price/Month | Price/Year | Features |
|------|-------------|------------|----------|
| Free | $0 | $0 | Basic browsing, favorites, standard quality |
| Basic | $9.99 | $99.99 | HD quality, ad-free, 5 downloads |
| Premium | $19.99 | $199.99 | 4K quality, 20 downloads, exclusive content |
| Pro | $49.99 | $499.99 | Unlimited, behind-the-scenes, networking |

## Next Steps

### For Production
1. **Integrate Real Payment Provider**
   - Add Stripe/PayPal integration
   - Replace demo payment logic in `/api/subscription` POST
   - Set up webhooks for subscription events

2. **Add Email Notifications**
   - Welcome email on subscription
   - Payment confirmation
   - Subscription expiry warnings
   - Cancellation confirmation

3. **Implement Paywall Enforcement**
   - Add premium checks in film player
   - Limit preview duration for free users
   - Show upgrade prompts at appropriate times

4. **Add Admin Dashboard**
   - View subscription statistics
   - Manage premium content
   - Handle refunds/cancellations
   - Monitor revenue

### Add More Premium Content
```sql
-- Example: Make another film premium
INSERT INTO premium_content (content_type, content_id, required_plan, preview_duration)
SELECT 'film', id, 'basic', 120
FROM films
WHERE slug = 'your-film-slug';
```

## Support

If you encounter any issues:
1. Check browser console (F12 → Console)
2. Check Supabase logs (Dashboard → Logs)
3. Verify database schema matches expected structure
4. Check API routes are responding correctly

---

✅ **Installation Complete!** Your subscription system is ready to use.
# Fix: Moderation Logs Action Type Errors

## Problems Fixed

### 1. Wrong Parameter Names
The API was calling `log_moderation_action()` with incorrect parameter names:
- ❌ Used: `p_moderator_id`, `p_action`
- ✅ Expected: `p_action_type` (no `p_moderator_id` - it uses `auth.uid()` automatically)

### 2. Wrong Action Type Values
The API used action types not allowed by the CHECK constraint:
- ❌ `user_banned` → ✅ `ban_user`
- ❌ `user_unbanned` → ✅ `unban_user`
- ❌ `role_changed` → Not in constraint (needs to be added)

## Solutions Applied

### Code Changes (Already Fixed)

✅ **Fixed `app/api/admin/users/[userId]/ban/route.ts`:**
- Changed `p_action: 'user_banned'` → `p_action_type: 'ban_user'`
- Changed `p_action: 'user_unbanned'` → `p_action_type: 'unban_user'`
- Removed `p_moderator_id` parameter (function uses `auth.uid()` automatically)

✅ **Fixed `app/api/admin/users/[userId]/role/route.ts`:**
- Changed `p_action: 'role_changed'` → `p_action_type: 'role_changed'`
- Removed `p_moderator_id` parameter

✅ **Verified correct in:**
- `app/api/admin/discussions/[id]/lock/route.ts` ✓
- `app/api/admin/discussions/[id]/pin/route.ts` ✓

### Database Changes (Required)

You need to add `'role_changed'` to the allowed action types in the database.

## Quick Fix (Run Now)

**Option 1: Supabase SQL Editor** (Fastest - 30 seconds)

1. Go to https://app.supabase.com → Your Project
2. Click **SQL Editor** → **New Query**
3. Paste and run this:

```sql
-- Add 'role_changed' to allowed action types
ALTER TABLE public.moderation_logs
DROP CONSTRAINT IF EXISTS moderation_logs_action_type_check;

ALTER TABLE public.moderation_logs
ADD CONSTRAINT moderation_logs_action_type_check
CHECK (action_type IN (
    'pin',
    'unpin',
    'lock',
    'unlock',
    'delete_discussion',
    'delete_post',
    'ban_user',
    'unban_user',
    'role_changed'
));
```

4. Click **Run** or press Ctrl+Enter
5. You should see: "Success. No rows returned"

**Option 2: Supabase CLI**

```bash
supabase db execute < supabase/add_role_changed_action.sql
```

**Option 3: Full Database Reset** (if starting fresh)

```bash
supabase db reset
```

## Verification

After applying the fix, verify it worked:

```sql
-- Check the constraint includes role_changed
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'moderation_logs_action_type_check';
```

Expected output should include `'role_changed'` in the list.

## Test the Fix

1. **Restart your Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **Test role change:**
   - Navigate to http://localhost:3000/admin/users
   - Click "Change Role" on any user
   - Change from "user" to "moderator"
   - Submit
   - Should succeed WITHOUT the constraint violation error

3. **Verify moderation log was created:**
   ```sql
   SELECT * FROM public.moderation_logs 
   WHERE action_type = 'role_changed' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

4. **Test ban/unban:**
   - Ban a user → should log as `ban_user`
   - Unban a user → should log as `unban_user`
   - No errors should appear

## What the Function Does

The `log_moderation_action()` function signature:

```sql
log_moderation_action(
    p_action_type TEXT,      -- Action: 'ban_user', 'role_changed', etc.
    p_target_type TEXT,      -- Target: 'user', 'discussion', 'post'
    p_target_id UUID,        -- ID of the target
    p_reason TEXT,           -- Reason for action (optional)
    p_metadata JSONB         -- Additional data (optional)
)
```

**Note:** `moderator_id` is automatically set to `auth.uid()` inside the function, so you don't pass it.

## Allowed Action Types (After Fix)

| Action Type | Description | Target Type |
|-------------|-------------|-------------|
| `pin` | Pin a discussion | discussion |
| `unpin` | Unpin a discussion | discussion |
| `lock` | Lock a discussion | discussion |
| `unlock` | Unlock a discussion | discussion |
| `delete_discussion` | Delete a discussion | discussion |
| `delete_post` | Delete a post | post |
| `ban_user` | Ban a user | user |
| `unban_user` | Unban a user | user |
| `role_changed` | Change user role | user |

## Files Modified

### Code (Already Fixed)
- ✅ `app/api/admin/users/[userId]/ban/route.ts`
- ✅ `app/api/admin/users/[userId]/role/route.ts`

### Database Migrations (Created)
- ✅ `supabase/migrations/015_add_role_changed_action.sql`
- ✅ `supabase/add_role_changed_action.sql` (quick-fix)
- ✅ `supabase/migrations/100_complete_schema.sql` (updated)

## Before vs After

### Before (Broken)
```typescript
await supabase.rpc('log_moderation_action', {
  p_moderator_id: user.id,        // ❌ Wrong - function doesn't accept this
  p_action: 'user_banned',        // ❌ Wrong parameter name
  p_target_type: 'user',
  p_target_id: userId,
  p_reason: reason,
});
```

Error:
```
Could not find the function log_moderation_action(p_action, p_moderator_id, ...)
```

### After (Fixed)
```typescript
await supabase.rpc('log_moderation_action', {
  p_action_type: 'ban_user',      // ✅ Correct parameter & value
  p_target_type: 'user',
  p_target_id: userId,
  p_reason: reason,
  p_metadata: { duration_days, ban_expires_at },
});
```

Success! ✅

## Common Errors & Solutions

### Error: "function log_moderation_action(p_action, ...) not found"
**Cause:** Using wrong parameter name `p_action` instead of `p_action_type`  
**Fix:** Already fixed in code ✅

### Error: "violates check constraint moderation_logs_action_type_check"
**Cause:** Using action type not in the allowed list (like `role_changed`)  
**Fix:** Run the SQL above to add `role_changed` to constraint

### Error: "column moderator_id violates not-null constraint"
**Cause:** The function is trying to insert NULL for moderator_id  
**Fix:** Make sure user is authenticated (`auth.uid()` returns a valid UUID)

## View Moderation Logs

To see all moderation logs:

```sql
SELECT 
    ml.id,
    ml.action_type,
    ml.target_type,
    p.username as moderator,
    ml.reason,
    ml.metadata,
    ml.created_at
FROM public.moderation_logs ml
JOIN public.profiles p ON ml.moderator_id = p.id
ORDER BY ml.created_at DESC
LIMIT 20;
```

---

**Status:** 🟢 Code Fixed, Database Update Required  
**Priority:** High (blocks role changes)  
**Time to Fix:** < 1 minute (run the SQL)  
**Next Step:** Run the Quick Fix SQL above in Supabase SQL Editor
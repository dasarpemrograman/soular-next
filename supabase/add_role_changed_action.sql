-- Quick fix: Add 'role_changed' to moderation_logs action_type CHECK constraint
-- Run this in Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE public.moderation_logs
DROP CONSTRAINT IF EXISTS moderation_logs_action_type_check;

-- Add the new constraint with 'role_changed' included
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

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.moderation_logs'::regclass
  AND conname = 'moderation_logs_action_type_check';

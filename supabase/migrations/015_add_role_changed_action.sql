-- Migration: Add 'role_changed' to moderation_logs action_type CHECK constraint
-- This allows logging when admin changes user roles

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

-- Add comment
COMMENT ON CONSTRAINT moderation_logs_action_type_check ON public.moderation_logs
IS 'Allowed moderation action types including role changes';

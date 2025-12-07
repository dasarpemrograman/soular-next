-- Migration: Premium Subscriptions and Paywall System
-- Adds subscription plans, payment tracking, and premium content features

-- =====================================================
-- 1. CREATE SUBSCRIPTION_PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  max_downloads INTEGER,
  max_offline_films INTEGER,
  ad_free BOOLEAN DEFAULT true,
  early_access BOOLEAN DEFAULT false,
  exclusive_content BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, features, max_downloads, max_offline_films, ad_free, early_access, exclusive_content, priority_support, sort_order)
VALUES
  ('free', 'Free', 'Basic access to public films', 0, 0,
   '["Browse films", "Create favorites", "Community forums", "Standard quality"]'::jsonb,
   0, 0, false, false, false, false, 0),
  ('basic', 'Basic', 'Enhanced viewing experience', 9.99, 99.99,
   '["All Free features", "HD quality", "Ad-free viewing", "5 offline downloads", "Priority streaming"]'::jsonb,
   5, 5, true, false, false, false, 1),
  ('premium', 'Premium', 'Full platform access', 19.99, 199.99,
   '["All Basic features", "4K quality", "20 offline downloads", "Early access to new films", "Exclusive content", "Priority support"]'::jsonb,
   20, 20, true, true, true, true, 2),
  ('pro', 'Pro', 'For film professionals', 49.99, 499.99,
   '["All Premium features", "Unlimited downloads", "Director commentaries", "Behind-the-scenes content", "Industry networking", "Advanced analytics"]'::jsonb,
   999, 999, true, true, true, true, 3);

-- =====================================================
-- 2. CREATE USER_SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 3. CREATE PAYMENT_TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  payment_provider TEXT,
  transaction_reference TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS payment_transactions_user_id_idx ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS payment_transactions_status_idx ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS payment_transactions_created_at_idx ON public.payment_transactions(created_at DESC);

-- =====================================================
-- 4. CREATE PREMIUM_CONTENT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.premium_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('film', 'collection', 'event', 'article')),
  content_id UUID NOT NULL,
  required_plan TEXT NOT NULL CHECK (required_plan IN ('free', 'basic', 'premium', 'pro')),
  preview_duration INTEGER, -- seconds of preview allowed for free users
  is_early_access BOOLEAN DEFAULT false,
  early_access_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type, content_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS premium_content_content_idx ON public.premium_content(content_type, content_id);
CREATE INDEX IF NOT EXISTS premium_content_required_plan_idx ON public.premium_content(required_plan);

-- =====================================================
-- 5. ADD SUBSCRIPTION FIELDS TO PROFILES
-- =====================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'pro')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Update existing users to have free plan
UPDATE public.profiles
SET subscription_plan = 'free', subscription_status = 'active'
WHERE subscription_plan IS NULL;

-- =====================================================
-- 6. CREATE TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Update subscription in profiles when user_subscriptions changes
CREATE OR REPLACE FUNCTION update_profile_subscription()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    subscription_plan = (SELECT name FROM public.subscription_plans WHERE id = NEW.plan_id),
    subscription_status = NEW.status,
    subscription_ends_at = NEW.current_period_end,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_subscription_changed
AFTER INSERT OR UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_profile_subscription();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_updated_at();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;

-- subscription_plans policies (public read)
CREATE POLICY "Anyone can view subscription plans"
ON public.subscription_plans FOR SELECT USING (is_active = true);

-- Only admins can modify plans
CREATE POLICY "Admins can manage subscription plans"
ON public.subscription_plans FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- user_subscriptions policies
CREATE POLICY "Users can view own subscription"
ON public.user_subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id OR is_admin());

-- Only service role can insert/update subscriptions (done via API)
CREATE POLICY "Service role can manage subscriptions"
ON public.user_subscriptions FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- payment_transactions policies
CREATE POLICY "Users can view own transactions"
ON public.payment_transactions FOR SELECT TO authenticated
USING (auth.uid() = user_id OR is_admin());

-- Only service role can insert transactions
CREATE POLICY "Service role can create transactions"
ON public.payment_transactions FOR INSERT TO authenticated
WITH CHECK (is_admin());

-- premium_content policies
CREATE POLICY "Anyone can view premium content settings"
ON public.premium_content FOR SELECT USING (true);

-- Only admins can manage premium content
CREATE POLICY "Admins can manage premium content"
ON public.premium_content FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Check if user has access to premium content
CREATE OR REPLACE FUNCTION has_premium_access(
  p_user_id UUID,
  p_required_plan TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  plan_hierarchy INTEGER;
  required_hierarchy INTEGER;
BEGIN
  -- Get user's current plan
  SELECT subscription_plan INTO user_plan
  FROM public.profiles
  WHERE id = p_user_id;

  -- Plan hierarchy: free=0, basic=1, premium=2, pro=3
  plan_hierarchy := CASE user_plan
    WHEN 'pro' THEN 3
    WHEN 'premium' THEN 2
    WHEN 'basic' THEN 1
    ELSE 0
  END;

  required_hierarchy := CASE p_required_plan
    WHEN 'pro' THEN 3
    WHEN 'premium' THEN 2
    WHEN 'basic' THEN 1
    ELSE 0
  END;

  RETURN plan_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's subscription details
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  plan_name TEXT,
  plan_display_name TEXT,
  status TEXT,
  billing_cycle TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  features JSONB,
  is_trial BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.name,
    sp.display_name,
    us.status,
    us.billing_cycle,
    us.current_period_end,
    us.cancel_at_period_end,
    sp.features,
    (us.trial_ends_at IS NOT NULL AND us.trial_ends_at > NOW()) as is_trial
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if content is premium
CREATE OR REPLACE FUNCTION is_premium_content(
  p_content_type TEXT,
  p_content_id UUID
)
RETURNS TABLE (
  is_premium BOOLEAN,
  required_plan TEXT,
  preview_duration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    true as is_premium,
    pc.required_plan,
    pc.preview_duration
  FROM public.premium_content pc
  WHERE pc.content_type = p_content_type
    AND pc.content_id = p_content_id
  LIMIT 1;

  -- If no record found, content is free
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'free'::TEXT, NULL::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel subscription at period end
CREATE OR REPLACE FUNCTION cancel_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET
    cancel_at_period_end = true,
    cancelled_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reactivate cancelled subscription
CREATE OR REPLACE FUNCTION reactivate_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET
    cancel_at_period_end = false,
    cancelled_at = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get subscription stats (for admin dashboard)
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE (
  plan_name TEXT,
  active_subscribers BIGINT,
  monthly_revenue DECIMAL,
  yearly_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.name,
    COUNT(us.id) as active_subscribers,
    SUM(CASE WHEN us.billing_cycle = 'monthly' THEN sp.price_monthly ELSE 0 END) as monthly_revenue,
    SUM(CASE WHEN us.billing_cycle = 'yearly' THEN sp.price_yearly ELSE 0 END) as yearly_revenue
  FROM public.subscription_plans sp
  LEFT JOIN public.user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
  GROUP BY sp.id, sp.name
  ORDER BY sp.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION has_premium_access(UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_premium_content(TEXT, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cancel_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_stats() TO authenticated;

-- =====================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS user_subscriptions_period_end_idx ON public.user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS profiles_subscription_plan_idx ON public.profiles(subscription_plan);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Premium subscription system created successfully!';
  RAISE NOTICE '📊 Tables: subscription_plans, user_subscriptions, payment_transactions, premium_content';
  RAISE NOTICE '🔒 RLS policies: enabled';
  RAISE NOTICE '⚡ Triggers: auto-update profiles';
  RAISE NOTICE '💎 Plans: Free, Basic, Premium, Pro';
  RAISE NOTICE '🎯 Ready to use!';
END $$;

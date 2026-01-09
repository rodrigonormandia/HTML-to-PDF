-- ============================================
-- PDF Leaf - Initial Database Schema
-- ============================================

-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    monthly_limit INTEGER NOT NULL DEFAULT 100,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- 2. API KEYS TABLE
-- ============================================
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Default',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash) WHERE is_active = TRUE;
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);

-- 3. SUBSCRIPTIONS TABLE (Stripe)
-- ============================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);

-- 4. CONVERSIONS TABLE (usage tracking)
-- ============================================
CREATE TABLE public.conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    job_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    page_count INTEGER,
    file_size_bytes INTEGER,
    processing_time_ms INTEGER,
    source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'api')),
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversions_user_month ON public.conversions(user_id, created_at DESC);
CREATE INDEX idx_conversions_api_key ON public.conversions(api_key_id);
CREATE INDEX idx_conversions_job ON public.conversions(job_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own API keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversions" ON public.conversions
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.check_usage_quota(p_user_id UUID)
RETURNS TABLE(
    monthly_limit INTEGER,
    used_this_month BIGINT,
    remaining INTEGER,
    can_convert BOOLEAN
) AS $$
DECLARE
    v_limit INTEGER;
    v_used BIGINT;
BEGIN
    SELECT p.monthly_limit INTO v_limit
    FROM public.profiles p
    WHERE p.id = p_user_id;

    SELECT COUNT(*) INTO v_used
    FROM public.conversions c
    WHERE c.user_id = p_user_id
      AND c.status = 'completed'
      AND c.created_at >= DATE_TRUNC('month', NOW());

    RETURN QUERY SELECT
        v_limit,
        v_used,
        GREATEST(0, v_limit - v_used)::INTEGER,
        v_used < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.validate_api_key(p_key_hash TEXT)
RETURNS TABLE(
    api_key_id UUID,
    user_id UUID,
    plan TEXT,
    monthly_limit INTEGER,
    used_this_month BIGINT,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ak.id AS api_key_id,
        ak.user_id,
        p.plan,
        p.monthly_limit,
        COALESCE(
            (SELECT COUNT(*) FROM public.conversions c
             WHERE c.user_id = ak.user_id
               AND c.status = 'completed'
               AND c.created_at >= DATE_TRUNC('month', NOW())),
            0
        ) AS used_this_month,
        (ak.is_active = TRUE AND (ak.expires_at IS NULL OR ak.expires_at > NOW())) AS is_valid
    FROM public.api_keys ak
    JOIN public.profiles p ON p.id = ak.user_id
    WHERE ak.key_hash = p_key_hash;

    UPDATE public.api_keys SET last_used_at = NOW() WHERE key_hash = p_key_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

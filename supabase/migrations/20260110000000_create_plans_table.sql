-- Create plans table to store plan definitions
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_monthly INTEGER NOT NULL DEFAULT 0, -- Price in cents (e.g., 1500 = $15.00)
    pdfs_per_month INTEGER NOT NULL DEFAULT 100,
    api_keys_limit INTEGER NOT NULL DEFAULT 3,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    stripe_price_id TEXT, -- Stripe price ID for checkout
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO plans (id, name, price_monthly, pdfs_per_month, api_keys_limit, features, display_order) VALUES
    ('free', 'Free', 0, 100, 3, '["noWatermark", "noExpiration", "apiAccess"]'::jsonb, 1),
    ('starter', 'Starter', 1500, 2000, 10, '["noWatermark", "noExpiration", "apiAccess", "webhooks", "emailSupport"]'::jsonb, 2),
    ('pro', 'Pro', 4900, 10000, 25, '["noWatermark", "noExpiration", "apiAccess", "webhooks", "prioritySupport", "customDomain", "analytics"]'::jsonb, 3),
    ('enterprise', 'Enterprise', 9900, 50000, 100, '["noWatermark", "noExpiration", "apiAccess", "webhooks", "dedicatedSupport", "customDomain", "analytics", "sla", "sso"]'::jsonb, 4)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    pdfs_per_month = EXCLUDED.pdfs_per_month,
    api_keys_limit = EXCLUDED.api_keys_limit,
    features = EXCLUDED.features,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- Create index for active plans query
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active, display_order);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Plans are readable by everyone (public data)
CREATE POLICY "Plans are viewable by everyone"
    ON plans FOR SELECT
    USING (is_active = true);

-- Update profiles to reference plans table
-- Add foreign key constraint (profiles.plan -> plans.id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_plan_fkey'
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles
        ADD CONSTRAINT profiles_plan_fkey
        FOREIGN KEY (plan) REFERENCES plans(id) ON UPDATE CASCADE;
    END IF;
END $$;

-- Update check_usage_quota function to use plans table
CREATE OR REPLACE FUNCTION check_usage_quota(user_uuid UUID)
RETURNS TABLE (
    can_convert BOOLEAN,
    conversions_used INTEGER,
    conversions_limit INTEGER,
    plan_name TEXT
) AS $$
DECLARE
    v_plan TEXT;
    v_limit INTEGER;
    v_used INTEGER;
BEGIN
    -- Get user's plan
    SELECT p.plan INTO v_plan
    FROM profiles p
    WHERE p.id = user_uuid;

    -- Get plan limit from plans table
    SELECT pdfs_per_month INTO v_limit
    FROM plans
    WHERE id = COALESCE(v_plan, 'free');

    -- Default to free plan limit if not found
    IF v_limit IS NULL THEN
        v_limit := 100;
    END IF;

    -- Count conversions this month
    SELECT COUNT(*) INTO v_used
    FROM conversions c
    WHERE c.user_id = user_uuid
    AND c.created_at >= date_trunc('month', CURRENT_TIMESTAMP);

    RETURN QUERY SELECT
        v_used < v_limit AS can_convert,
        v_used AS conversions_used,
        v_limit AS conversions_limit,
        v_plan AS plan_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add rate limiting columns to plans table
-- This allows dynamic configuration of rate limits per plan

-- Add columns with default values (free tier defaults)
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS rate_limit_per_minute INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS rate_limit_per_hour INTEGER NOT NULL DEFAULT 100;

-- Update rate limits for each plan
UPDATE plans SET rate_limit_per_minute = 10, rate_limit_per_hour = 100 WHERE id = 'free';
UPDATE plans SET rate_limit_per_minute = 30, rate_limit_per_hour = 500 WHERE id = 'starter';
UPDATE plans SET rate_limit_per_minute = 60, rate_limit_per_hour = 1000 WHERE id = 'pro';
UPDATE plans SET rate_limit_per_minute = 120, rate_limit_per_hour = 2000 WHERE id = 'enterprise';

-- Add comment for documentation
COMMENT ON COLUMN plans.rate_limit_per_minute IS 'Maximum API requests allowed per minute for this plan';
COMMENT ON COLUMN plans.rate_limit_per_hour IS 'Maximum API requests allowed per hour for this plan';

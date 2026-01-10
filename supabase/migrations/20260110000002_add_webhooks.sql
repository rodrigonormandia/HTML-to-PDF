-- Migration: Add webhooks support
-- Date: 2026-01-10
-- Description: Creates tables for webhook configuration and delivery logging

-- Webhook configurations table
CREATE TABLE IF NOT EXISTS public.webhook_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT ARRAY['job.completed', 'job.failed'],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for webhook_configs
CREATE INDEX IF NOT EXISTS idx_webhook_configs_user ON public.webhook_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_active ON public.webhook_configs(user_id, is_active) WHERE is_active = TRUE;

-- Webhook delivery log table (for debugging and retry logic)
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_config_id UUID REFERENCES public.webhook_configs(id) ON DELETE SET NULL,
    job_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for webhook_deliveries
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_job ON public.webhook_deliveries(job_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_config ON public.webhook_deliveries(webhook_config_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON public.webhook_deliveries(created_at DESC);

-- Enable RLS
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_configs
CREATE POLICY "Users can view own webhooks"
    ON public.webhook_configs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own webhooks"
    ON public.webhook_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhooks"
    ON public.webhook_configs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhooks"
    ON public.webhook_configs FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for webhook_deliveries (read-only for users)
CREATE POLICY "Users can view own webhook deliveries"
    ON public.webhook_deliveries FOR SELECT
    USING (
        webhook_config_id IN (
            SELECT id FROM public.webhook_configs WHERE user_id = auth.uid()
        )
    );

-- Service role policy for backend to insert deliveries
CREATE POLICY "Service role can manage webhook deliveries"
    ON public.webhook_deliveries FOR ALL
    USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_webhook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for webhook_configs updated_at
DROP TRIGGER IF EXISTS trigger_webhook_configs_updated_at ON public.webhook_configs;
CREATE TRIGGER trigger_webhook_configs_updated_at
    BEFORE UPDATE ON public.webhook_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_webhook_updated_at();

-- Grant permissions
GRANT ALL ON public.webhook_configs TO authenticated;
GRANT ALL ON public.webhook_deliveries TO authenticated;
GRANT ALL ON public.webhook_configs TO service_role;
GRANT ALL ON public.webhook_deliveries TO service_role;

-- Add role column to profiles table
-- Supports 'user' (default) and 'admin' roles

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Add display_name and preferred_language for user settings
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS display_name TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Create index for faster role-based lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add action and html_size to conversions for tracking
ALTER TABLE conversions
ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'download' CHECK (action IN ('preview', 'download'));

ALTER TABLE conversions
ADD COLUMN IF NOT EXISTS html_size INTEGER;

-- Comment on columns
COMMENT ON COLUMN profiles.role IS 'User role: user (default) or admin';
COMMENT ON COLUMN profiles.display_name IS 'User display name for UI';
COMMENT ON COLUMN profiles.preferred_language IS 'Preferred language code (en, pt-BR)';

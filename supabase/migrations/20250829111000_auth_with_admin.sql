-- Location: supabase/migrations/20250829111000_auth_with_admin.sql
-- Schema Analysis: No existing schema - creating from scratch
-- Integration Type: Authentication with admin features
-- Dependencies: auth schema (built-in Supabase)

-- 1. Types and Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'member');
CREATE TYPE public.theme_mode AS ENUM ('light', 'dark');

-- 2. Core User Profiles Table (intermediary for auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'member'::public.user_role,
    theme_preference public.theme_mode DEFAULT 'light'::public.theme_mode,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Admin Activity Logs Table
CREATE TABLE public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. System Settings Table (for admin configuration)
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at);
CREATE INDEX idx_system_settings_key ON public.system_settings(setting_key);

-- 6. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 7. Helper Functions (must be created BEFORE policies)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
)
$$;

-- 8. RLS Policies

-- Pattern 1: Core user table - Simple direct comparison
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin can view all profiles
CREATE POLICY "admin_view_all_user_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_from_auth());

-- Pattern 6: Role-based access for admin activity logs
CREATE POLICY "admin_manage_activity_logs"
ON public.admin_activity_logs
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Pattern 6: Role-based access for system settings
CREATE POLICY "admin_manage_system_settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- 9. Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, theme_preference)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'member'::public.user_role),
    COALESCE((NEW.raw_user_meta_data->>'theme')::public.theme_mode, 'light'::public.theme_mode)
  );
  RETURN NEW;
END;
$$;

-- 10. Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Update function for user profiles
CREATE OR REPLACE FUNCTION public.update_user_profile_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_user_profile_timestamp();

-- 12. Complete Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@example.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "System Administrator", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@example.com', crypt('user123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Regular User", "role": "member"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Insert some default system settings
    INSERT INTO public.system_settings (setting_key, setting_value, description, updated_by)
    VALUES
        ('app_name', '"Financial Management App"'::jsonb, 'Application name displayed in UI', admin_uuid),
        ('maintenance_mode', 'false'::jsonb, 'Enable/disable maintenance mode', admin_uuid),
        ('max_users', '1000'::jsonb, 'Maximum number of users allowed', admin_uuid),
        ('default_theme', '"light"'::jsonb, 'Default theme for new users', admin_uuid);

    -- Insert admin activity log
    INSERT INTO public.admin_activity_logs (admin_id, action, details)
    VALUES
        (admin_uuid, 'SYSTEM_INITIALIZATION', '{"message": "Initial system setup completed"}'::jsonb);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;
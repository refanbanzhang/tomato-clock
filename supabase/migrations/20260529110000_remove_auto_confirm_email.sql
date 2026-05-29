-- Restore email verification: remove auto-confirm on signup

DROP TRIGGER IF EXISTS auto_confirm_user_on_signup ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_auth_user();

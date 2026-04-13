
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  notification_enabled BOOLEAN DEFAULT false,
  whatsapp_number TEXT,
  tts_voice_name TEXT DEFAULT NULL,
  tts_rate NUMERIC DEFAULT 1.0,
  tts_pitch NUMERIC DEFAULT 1.0,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_plan TEXT,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrata', 'uscita')),
  icon TEXT DEFAULT 'circle',
  color TEXT DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT false,
  custom_icon_url TEXT DEFAULT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own categories and defaults" ON public.categories FOR SELECT USING (auth.uid() = user_id OR is_default = true);
CREATE POLICY "Users can insert their own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- 4. Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'credit-card',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payment methods" ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment methods" ON public.payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment methods" ON public.payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payment methods" ON public.payment_methods FOR DELETE USING (auth.uid() = user_id);

-- 5. Create plans table
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  installments INTEGER NOT NULL CHECK (installments >= 1 AND installments <= 12),
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own plans" ON public.plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plans" ON public.plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plans" ON public.plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plans" ON public.plans FOR DELETE USING (auth.uid() = user_id);

-- 6. Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrata', 'uscita')),
  amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_date DATE,
  end_date DATE,
  is_partial BOOLEAN DEFAULT false,
  recurring TEXT DEFAULT 'none' CHECK (recurring IN ('none', 'weekly', 'monthly')),
  attachment_url TEXT,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  installment_index INTEGER,
  installment_total INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- 7. Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view payments for their transactions" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM public.transactions WHERE transactions.id = payments.transaction_id AND transactions.user_id = auth.uid()));
CREATE POLICY "Users can insert payments for their transactions" ON public.payments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.transactions WHERE transactions.id = payments.transaction_id AND transactions.user_id = auth.uid()));
CREATE POLICY "Users can update payments for their transactions" ON public.payments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.transactions WHERE transactions.id = payments.transaction_id AND transactions.user_id = auth.uid()));
CREATE POLICY "Users can delete payments for their transactions" ON public.payments FOR DELETE USING (EXISTS (SELECT 1 FROM public.transactions WHERE transactions.id = payments.transaction_id AND transactions.user_id = auth.uid()));

-- 8. Create reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2),
  paid_amount NUMERIC DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT false,
  notify_days_before INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);

-- 9. Create attachments table
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('transaction', 'reminder')),
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own attachments" ON public.attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own attachments" ON public.attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own attachments" ON public.attachments FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_attachments_entity ON public.attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_user ON public.attachments(user_id);

-- 10. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 11. Create app_settings table
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.app_settings (key, value) VALUES ('guest_mode', '{"enabled": false}'::jsonb);

-- 12. Functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE user_email TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) THEN RETURN TRUE; END IF;
  IF _role = 'admin' THEN
    SELECT email INTO user_email FROM auth.users WHERE id = _user_id;
    RETURN user_email = 'acdigital.app@gmail.com';
  END IF;
  RETURN FALSE;
END; $$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.get_guest_mode()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((value->>'enabled')::boolean, false) FROM public.app_settings WHERE key = 'guest_mode'
$$;

CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (id uuid, full_name text, avatar_url text, notification_enabled boolean, whatsapp_number text, created_at timestamptz, updated_at timestamptz, role app_role)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Access denied: Admin role required'; END IF;
  RETURN QUERY SELECT p.id, p.full_name, p.avatar_url, p.notification_enabled, p.whatsapp_number, p.created_at, p.updated_at, COALESCE(ur.role, 'user'::app_role) as role FROM public.profiles p LEFT JOIN public.user_roles ur ON p.id = ur.user_id;
END; $$;

CREATE OR REPLACE FUNCTION public.update_user_role(_target_user_id uuid, _new_role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Access denied: Admin role required'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_target_user_id, _new_role) ON CONFLICT (user_id, role) DO NOTHING;
  DELETE FROM public.user_roles WHERE user_id = _target_user_id AND role != _new_role;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_update_profile(_target_user_id uuid, _whatsapp_number text DEFAULT NULL, _notification_enabled boolean DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Access denied: Admin role required'; END IF;
  UPDATE public.profiles SET whatsapp_number = COALESCE(_whatsapp_number, whatsapp_number), notification_enabled = COALESCE(_notification_enabled, notification_enabled), updated_at = now() WHERE id = _target_user_id;
END; $$;

-- 13. RLS for user_roles and app_settings
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Anyone can read app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update app settings" ON public.app_settings FOR UPDATE USING (public.is_admin(auth.uid()));

-- 14. New user trigger (with 7-day trial)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, trial_end_date) VALUES (new.id, new.raw_user_meta_data ->> 'full_name', NOW() + INTERVAL '7 days');
  RETURN new;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Auto-assign admin role trigger
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'acdigital.app@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created_assign_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.auto_assign_admin_role();

-- 16. Default categories
INSERT INTO public.categories (user_id, name, type, icon, color, is_default) VALUES
  (NULL, 'Stipendio', 'entrata', 'wallet', '#22c55e', true),
  (NULL, 'Freelance', 'entrata', 'briefcase', '#3b82f6', true),
  (NULL, 'Investimenti', 'entrata', 'trending-up', '#8b5cf6', true),
  (NULL, 'Altri Incassi', 'entrata', 'plus-circle', '#06b6d4', true),
  (NULL, 'Affitto', 'uscita', 'home', '#ef4444', true),
  (NULL, 'Bollette', 'uscita', 'zap', '#f97316', true),
  (NULL, 'Spesa', 'uscita', 'shopping-cart', '#eab308', true),
  (NULL, 'Trasporti', 'uscita', 'car', '#14b8a6', true),
  (NULL, 'Salute', 'uscita', 'heart', '#ec4899', true),
  (NULL, 'Svago', 'uscita', 'gamepad-2', '#a855f7', true),
  (NULL, 'Abbonamenti', 'uscita', 'repeat', '#6366f1', true),
  (NULL, 'Altro', 'uscita', 'more-horizontal', '#64748b', true);

-- 17. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-avatars', 'profile-avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('category-icons', 'category-icons', true);

-- 18. Storage policies - attachments
CREATE POLICY "Users can view their own attachments storage" ON storage.objects FOR SELECT USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own attachments storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own attachments storage" ON storage.objects FOR UPDATE USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own attachments storage" ON storage.objects FOR DELETE USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 19. Storage policies - profile-avatars
CREATE POLICY "Anyone can view profile avatars" ON storage.objects FOR SELECT USING (bucket_id = 'profile-avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 20. Storage policies - category-icons
CREATE POLICY "Category icons are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'category-icons');
CREATE POLICY "Users can upload their own category icons" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'category-icons' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own category icons" ON storage.objects FOR UPDATE USING (bucket_id = 'category-icons' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own category icons" ON storage.objects FOR DELETE USING (bucket_id = 'category-icons' AND auth.uid()::text = (storage.foldername(name))[1]);

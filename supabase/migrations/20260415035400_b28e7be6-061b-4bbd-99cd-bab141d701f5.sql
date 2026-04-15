
-- Admin profiles table
CREATE TABLE public.admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','manager','support')),
  app_name text,
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('active','inactive','trial','expired','suspended','cancelled')),
  subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free','trial','monthly','yearly','lifetime')),
  subscription_provider text CHECK (subscription_provider IN ('stripe','sumup','manual','apple','google')),
  subscription_start timestamptz,
  subscription_end timestamptz,
  total_paid numeric(10,2) DEFAULT 0,
  balance numeric(10,2) DEFAULT 0,
  whatsapp_number text,
  notifications_enabled boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin_profiles" ON public.admin_profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert admin_profiles" ON public.admin_profiles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update admin_profiles" ON public.admin_profiles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete admin_profiles" ON public.admin_profiles FOR DELETE USING (public.is_admin(auth.uid()));

CREATE INDEX idx_admin_profiles_email ON public.admin_profiles(email);
CREATE INDEX idx_admin_profiles_role ON public.admin_profiles(role);
CREATE INDEX idx_admin_profiles_subscription_status ON public.admin_profiles(subscription_status);
CREATE INDEX idx_admin_profiles_app_name ON public.admin_profiles(app_name);

CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin transactions table
CREATE TABLE public.admin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  app_name text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'EUR',
  provider text,
  transaction_type text NOT NULL CHECK (transaction_type IN ('payment','refund','adjustment')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('succeeded','pending','failed','refunded')),
  stripe_payment_intent_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin_transactions" ON public.admin_transactions FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert admin_transactions" ON public.admin_transactions FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update admin_transactions" ON public.admin_transactions FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete admin_transactions" ON public.admin_transactions FOR DELETE USING (public.is_admin(auth.uid()));

CREATE INDEX idx_admin_transactions_user_id ON public.admin_transactions(user_id);
CREATE INDEX idx_admin_transactions_app_name ON public.admin_transactions(app_name);
CREATE INDEX idx_admin_transactions_status ON public.admin_transactions(status);

-- Admin bank accounts table
CREATE TABLE public.admin_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_holder text,
  bank_name text,
  iban text,
  bic_swift text,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin_bank_accounts" ON public.admin_bank_accounts FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert admin_bank_accounts" ON public.admin_bank_accounts FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update admin_bank_accounts" ON public.admin_bank_accounts FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete admin_bank_accounts" ON public.admin_bank_accounts FOR DELETE USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_admin_bank_accounts_updated_at BEFORE UPDATE ON public.admin_bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin activity logs table
CREATE TABLE public.admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin_activity_logs" ON public.admin_activity_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert admin_activity_logs" ON public.admin_activity_logs FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_admin_activity_logs_admin_user_id ON public.admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_logs_action ON public.admin_activity_logs(action);
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at);

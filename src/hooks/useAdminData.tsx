import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  app_name: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_provider: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
  total_paid: number | null;
  balance: number | null;
  whatsapp_number: string | null;
  notifications_enabled: boolean | null;
  last_login: string | null;
  created_at: string | null;
  updated_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface AdminTransaction {
  id: string;
  user_id: string | null;
  app_name: string | null;
  amount: number;
  currency: string | null;
  provider: string | null;
  transaction_type: string;
  status: string;
  stripe_payment_intent_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

export interface AdminBankAccount {
  id: string;
  account_holder: string | null;
  bank_name: string | null;
  iban: string | null;
  bic_swift: string | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminActivityLog {
  id: string;
  admin_user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string | null;
}

export const APP_NAMES = ["DJ's Engine", "Librifree", "Gestione Scadenze", "Gestione Password", "Speak & Translate"] as const;

export function useAdminProfiles() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProfiles(data as unknown as AdminProfile[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { profiles, loading, refetch: fetch };
}

export function useAdminTransactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_transactions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setTransactions(data as unknown as AdminTransaction[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { transactions, loading, refetch: fetch };
}

export function useAdminBankAccounts() {
  const [accounts, setAccounts] = useState<AdminBankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_bank_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setAccounts(data as unknown as AdminBankAccount[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { accounts, loading, refetch: fetch };
}

export function useAdminActivityLogs() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setLogs(data as unknown as AdminActivityLog[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { logs, loading, refetch: fetch };
}

export function getAppRevenue(transactions: AdminTransaction[], appName: string) {
  const txs = transactions.filter(t => t.app_name === appName && t.status === "succeeded" && t.transaction_type === "payment");
  const total = txs.reduce((sum, t) => sum + t.amount, 0);
  const payingUsers = new Set(txs.map(t => t.user_id)).size;
  return { total, payingUsers };
}

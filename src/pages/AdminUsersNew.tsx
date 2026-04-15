import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminKPICards } from "@/components/admin/AdminKPICards";
import { AdminAppRevenue } from "@/components/admin/AdminAppRevenue";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { useAdminProfiles, useAdminTransactions } from "@/hooks/useAdminData";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersNew() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { profiles, loading: profilesLoading, refetch: refetchProfiles } = useAdminProfiles();
  const { transactions, loading: txLoading, refetch: refetchTx } = useAdminTransactions();

  if (adminLoading) return <div className="flex items-center justify-center min-h-screen">Caricamento...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const loading = profilesLoading || txLoading;

  const handleRefresh = () => {
    refetchProfiles();
    refetchTx();
  };

  const payingUsers = profiles.filter(u => (u.total_paid ?? 0) > 0).length;
  const trials = profiles.filter(u => u.subscription_status === "trial").length;
  const expired = profiles.filter(u => u.subscription_status === "expired").length;
  const totalRevenue = transactions
    .filter(t => t.status === "succeeded" && t.transaction_type === "payment")
    .reduce((s, t) => s + t.amount, 0);
  const totalBalance = profiles.reduce((s, u) => s + (u.balance ?? 0), 0);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last30 = transactions
    .filter(t => t.status === "succeeded" && t.transaction_type === "payment" && t.created_at && new Date(t.created_at) >= thirtyDaysAgo)
    .reduce((s, t) => s + t.amount, 0);

  const usersForTable = profiles.map(p => ({
    id: p.id,
    email: p.email ?? "",
    full_name: p.full_name ?? "",
    role: p.role,
    app_name: p.app_name ?? "",
    subscription_status: p.subscription_status ?? "inactive",
    subscription_plan: p.subscription_plan ?? "free",
    subscription_provider: p.subscription_provider,
    subscription_end: p.subscription_end,
    total_paid: p.total_paid ?? 0,
    balance: p.balance ?? 0,
    whatsapp_number: p.whatsapp_number,
    notifications_enabled: p.notifications_enabled ?? false,
    last_login: p.last_login ?? "",
    created_at: p.created_at ?? "",
  }));

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestione Utenti</h1>
            <p className="text-sm text-muted-foreground">Amministra utenti, piani e incassi</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />Aggiorna
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <UserPlus className="h-4 w-4 mr-1" />Nuovo Utente
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : (
          <>
            <AdminKPICards data={{ totalRevenue, totalBalance, payingUsers, last30Days: last30, activeTrials: trials, expired }} />
            <AdminAppRevenue transactions={transactions} />
            <AdminUsersTable users={usersForTable} />
          </>
        )}
      </main>
    </div>
  );
}

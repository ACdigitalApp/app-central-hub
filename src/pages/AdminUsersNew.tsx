import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminKPICards } from "@/components/admin/AdminKPICards";
import { AdminAppRevenue } from "@/components/admin/AdminAppRevenue";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { mockAdminUsers, mockAdminTransactions } from "@/data/adminMockData";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from "react-router-dom";

export default function AdminUsersNew() {
  const { isAdmin, loading } = useAdmin();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Caricamento...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const users = mockAdminUsers;
  const payingUsers = users.filter(u => u.total_paid > 0).length;
  const trials = users.filter(u => u.subscription_status === "trial").length;
  const expired = users.filter(u => u.subscription_status === "expired").length;
  const totalRevenue = mockAdminTransactions.filter(t => t.status === "succeeded" && t.transaction_type === "payment").reduce((s, t) => s + t.amount, 0);
  const totalBalance = users.reduce((s, u) => s + u.balance, 0);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last30 = mockAdminTransactions.filter(t => t.status === "succeeded" && t.transaction_type === "payment" && new Date(t.created_at) >= thirtyDaysAgo).reduce((s, t) => s + t.amount, 0);

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
            <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)}>
              <RefreshCw className="h-4 w-4 mr-1" />Aggiorna
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <UserPlus className="h-4 w-4 mr-1" />Nuovo Utente
            </Button>
          </div>
        </div>

        <AdminKPICards data={{ totalRevenue, totalBalance, payingUsers, last30Days: last30, activeTrials: trials, expired }} />
        <AdminAppRevenue />
        <AdminUsersTable users={users as any} />
      </main>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Pencil, Shield } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { mockBankAccount, mockAdminTransactions, mockActivityLogs } from "@/data/adminMockData";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

function CopyField({ label, value }: { label: string; value: string }) {
  const copy = () => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copiato!", description: `${label} copiato negli appunti` });
  };
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm font-medium">{value}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={copy}><Copy className="h-4 w-4" /></Button>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const statusColors: Record<string, string> = {
  succeeded: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

export default function AdminBankDetails() {
  const { isAdmin, loading } = useAdmin();
  const [editing, setEditing] = useState(false);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Caricamento...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const bank = mockBankAccount;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">I Miei Dati Bancari</h1>
            <p className="text-sm text-muted-foreground">Gestione coordinate bancarie e transazioni — Solo Admin</p>
          </div>
          <Badge className="bg-green-100 text-green-800 gap-1 self-start">
            <Shield className="h-3 w-3" />Area Protetta Admin
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Coordinate Bancarie</CardTitle>
            <CardDescription>IBAN e dati per ricezione pagamenti</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="coordinate">
              <TabsList>
                <TabsTrigger value="coordinate">Coordinate</TabsTrigger>
                <TabsTrigger value="transactions">Transazioni</TabsTrigger>
                <TabsTrigger value="logs">Log</TabsTrigger>
              </TabsList>

              <TabsContent value="coordinate" className="mt-4">
                <div className="max-w-lg space-y-0">
                  <CopyField label="Intestatario" value={bank.account_holder} />
                  <CopyField label="Banca" value={bank.bank_name} />
                  <CopyField label="IBAN" value={bank.iban} />
                  <CopyField label="BIC/SWIFT" value={bank.bic_swift} />
                </div>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setEditing(!editing)}>
                  <Pencil className="h-4 w-4 mr-1" />{editing ? "Salva" : "Modifica"}
                </Button>
              </TabsContent>

              <TabsContent value="transactions" className="mt-4">
                <div className="rounded-lg border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>App</TableHead>
                        <TableHead className="text-right">Importo</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>ID Transazione</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAdminTransactions.map(t => (
                        <TableRow key={t.id}>
                          <TableCell className="text-xs">{formatDate(t.created_at)}</TableCell>
                          <TableCell className="capitalize text-sm">{t.transaction_type}</TableCell>
                          <TableCell className="text-sm">{t.app_name}</TableCell>
                          <TableCell className="text-right font-medium">€{t.amount.toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{t.provider}</TableCell>
                          <TableCell><Badge className={`text-xs ${statusColors[t.status] || ""}`} variant="secondary">{t.status}</Badge></TableCell>
                          <TableCell className="text-xs font-mono">{t.stripe_payment_intent_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="mt-4">
                <div className="rounded-lg border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Azione</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Dettagli</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockActivityLogs.map(l => (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs">{formatDate(l.created_at)}</TableCell>
                          <TableCell className="text-sm font-medium">{l.action}</TableCell>
                          <TableCell className="text-sm capitalize">{l.target_type}</TableCell>
                          <TableCell className="text-xs font-mono max-w-[200px] truncate">
                            {l.new_values ? JSON.stringify(l.new_values) : "—"}
                          </TableCell>
                          <TableCell className="text-xs">{l.ip_address}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

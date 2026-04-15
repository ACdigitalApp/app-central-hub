import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Ban, Trash2 } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  app_name: string;
  subscription_status: string;
  subscription_plan: string;
  subscription_provider: string | null;
  subscription_end: string | null;
  total_paid: number;
  balance: number;
  whatsapp_number: string | null;
  notifications_enabled: boolean;
  last_login: string;
  created_at: string;
}

const roleBadge: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  manager: "bg-blue-100 text-blue-800",
  support: "bg-yellow-100 text-yellow-800",
  user: "bg-gray-100 text-gray-800",
};

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-600",
  trial: "bg-blue-100 text-blue-800",
  expired: "bg-red-100 text-red-800",
  suspended: "bg-orange-100 text-orange-800",
  cancelled: "bg-red-100 text-red-700",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AdminUsersTable({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || u.subscription_plan === planFilter;
    const matchStatus = statusFilter === "all" || u.subscription_status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Cerca nome o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tutti i piani" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i piani</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="monthly">Mensile</SelectItem>
            <SelectItem value="yearly">Annuale</SelectItem>
            <SelectItem value="lifetime">Lifetime</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tutti gli stati" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Piano</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Stato Abb.</TableHead>
              <TableHead>Scadenza</TableHead>
              <TableHead className="text-right">Tot. Pagato</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Notifiche</TableHead>
              <TableHead>Data Reg.</TableHead>
              <TableHead>Ultimo Accesso</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                      {u.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="font-medium text-sm">{u.full_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{u.email}</TableCell>
                <TableCell><Badge className={`text-xs ${roleBadge[u.role] || ""}`} variant="secondary">{u.role}</Badge></TableCell>
                <TableCell className="capitalize text-sm">{u.subscription_plan}</TableCell>
                <TableCell className="text-sm">{u.subscription_provider || "—"}</TableCell>
                <TableCell><Badge className={`text-xs ${statusBadge[u.subscription_status] || ""}`} variant="secondary">{u.subscription_status}</Badge></TableCell>
                <TableCell className="text-xs">{formatDate(u.subscription_end)}</TableCell>
                <TableCell className="text-right text-sm">€{u.total_paid.toFixed(2)}</TableCell>
                <TableCell className="text-right text-sm">€{u.balance.toFixed(2)}</TableCell>
                <TableCell className="text-xs">{u.whatsapp_number || "—"}</TableCell>
                <TableCell><Switch checked={u.notifications_enabled} /></TableCell>
                <TableCell className="text-xs">{formatDate(u.created_at)}</TableCell>
                <TableCell className="text-xs">{formatDate(u.last_login)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Modifica</DropdownMenuItem>
                      <DropdownMenuItem><Ban className="h-4 w-4 mr-2" />Sospendi</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Elimina</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={14} className="text-center py-8 text-muted-foreground">Nessun utente trovato</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

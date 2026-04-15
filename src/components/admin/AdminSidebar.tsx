import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, DollarSign, CreditCard, Bell,
  Landmark, Trash2, Settings, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Gestione Utenti" },
  { to: "/admin/revenue", icon: DollarSign, label: "Incassi" },
  { to: "/admin/plans", icon: CreditCard, label: "Piani" },
  { to: "/admin/notifications", icon: Bell, label: "Notifiche" },
  { to: "/admin/bank-details", icon: Landmark, label: "Dati Bancari" },
  { to: "/admin/trash", icon: Trash2, label: "Cestino" },
  { to: "/settings", icon: Settings, label: "Impostazioni" },
  { to: "/admin/export", icon: Download, label: "Export" },
];

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-16 bg-card border-r min-h-screen py-4 items-center gap-1">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) =>
            cn(
              "flex items-center justify-center w-11 h-11 rounded-xl transition-all group relative",
              isActive
                ? "bg-green-100 text-green-700 shadow-sm"
                : "text-muted-foreground hover:bg-muted"
            )
          }
        >
          <link.icon className="h-5 w-5" />
          <span className="absolute left-14 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border">
            {link.label}
          </span>
        </NavLink>
      ))}
    </aside>
  );
}

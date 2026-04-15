import { TrendingUp, CreditCard, Users, Calendar, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPIData {
  totalRevenue: number;
  totalBalance: number;
  payingUsers: number;
  last30Days: number;
  activeTrials: number;
  expired: number;
}

const kpiConfig = [
  { key: "totalRevenue" as const, label: "Incasso Totale", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", format: (v: number) => `€${v.toFixed(2)}` },
  { key: "totalBalance" as const, label: "Saldo Totale", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50", format: (v: number) => `€${v.toFixed(2)}` },
  { key: "payingUsers" as const, label: "Utenti Paganti", icon: Users, color: "text-purple-600", bg: "bg-purple-50", format: (v: number) => String(v) },
  { key: "last30Days" as const, label: "Ultimi 30gg", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50", format: (v: number) => `€${v.toFixed(2)}` },
  { key: "activeTrials" as const, label: "Trial Attive", icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50", format: (v: number) => String(v) },
  { key: "expired" as const, label: "Scaduti", icon: XCircle, color: "text-red-600", bg: "bg-red-50", format: (v: number) => String(v) },
];

export function AdminKPICards({ data }: { data: KPIData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpiConfig.map(({ key, label, icon: Icon, color, bg, format }) => (
        <Card key={key}>
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{format(data[key])}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

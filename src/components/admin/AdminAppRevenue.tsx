import { Card, CardContent } from "@/components/ui/card";
import { APP_NAMES, getAppRevenue } from "@/data/adminMockData";

export function AdminAppRevenue() {
  const revenues = APP_NAMES.map(name => ({ name, ...getAppRevenue(name) }));
  const grandTotal = revenues.reduce((s, r) => s + r.total, 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Incassi Tutte le App</h3>
          <span className="text-sm font-bold text-green-700">Totale: €{grandTotal.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {revenues.map(r => (
            <div key={r.name} className="border rounded-lg p-3 text-center">
              <p className="text-xs font-medium text-muted-foreground truncate">{r.name}</p>
              <p className="text-lg font-bold text-green-700">€{r.total.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{r.payingUsers} paganti</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

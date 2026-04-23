import { MOCK_TRANSACTIONS } from "@/data/inventory";
import { StatCard } from "@/components/owner/StatCard";

const Staff = () => {
  const total = MOCK_TRANSACTIONS.reduce((a, b) => a + b.price, 0);
  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-display text-3xl sm:text-5xl tracking-wide">STAFF ACTIVITY</h1>
        <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">SUMMIT BRANCH — TODAY</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="STAFF: MIKI" value={`${MOCK_TRANSACTIONS.length}`} sub={<span className="text-muted-foreground">sales today</span>} />
        <StatCard label="TOTAL REVENUE" value={`ETB ${total.toLocaleString()}`} accent="primary" />
        <StatCard label="AVG SALE" value={`ETB ${Math.round(total / MOCK_TRANSACTIONS.length).toLocaleString()}`} />
      </div>

      <div className="border border-border bg-card p-4 sm:p-6">
        <h2 className="font-display text-2xl mb-4">SHIFT LOG</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
                <th className="p-2 text-left">TIME</th>
                <th className="p-2 text-left">STAFF</th>
                <th className="p-2 text-left">ITEM</th>
                <th className="p-2 text-left">BRAND</th>
                <th className="p-2 text-left">SIZE</th>
                <th className="p-2 text-left">COLOR</th>
                <th className="p-2 text-left">PRICE</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((t, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="p-2 text-xs text-muted-foreground">{t.time}</td>
                  <td className="p-2">{t.staff}</td>
                  <td className="p-2">{t.item}</td>
                  <td className="p-2 text-[10px] tracking-widest text-primary">{t.brand.toUpperCase()}</td>
                  <td className="p-2">{t.size}</td>
                  <td className="p-2 text-xs">{t.color}</td>
                  <td className="p-2 font-display text-lg">ETB {t.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Staff;

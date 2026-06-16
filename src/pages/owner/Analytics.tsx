import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/owner/StatCard";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const fallbackCatData = [
  { name: "Shoes", value: 38, fill: "hsl(81 100% 67%)" },
  { name: "Tops", value: 30, fill: "hsl(40 22% 92%)" },
  { name: "Bottoms", value: 22, fill: "hsl(38 95% 55%)" },
  { name: "Accessories", value: 10, fill: "hsl(0 0% 40%)" },
];

const Analytics = () => {
  const [date, setDate] = useState(new Date());
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const { data, isLoading } = useQuery({
    queryKey: ['monthly-report', year, month],
    queryFn: () => api.owner.reports.monthly(year, month)
  });

  const { data: recentSales = [] } = useQuery({
    queryKey: ['sales-recent', year, month],
    queryFn: () => api.owner.sales({ limit: 10 })
  });

  const reportData = data || {
    total_revenue: 0,
    daily_breakdown: []
  };

  const monthTrend = useMemo(() => {
    return reportData.daily_breakdown.map((d: any) => ({
      d: d.day,
      v: d.revenue
    }));
  }, [reportData]);

  const weekRev = useMemo(() => {
    const last7 = reportData.daily_breakdown.slice(-7);
    return last7.map((d: any) => ({
      d: `Day ${d.day}`,
      r: d.revenue
    }));
  }, [reportData]);

  const totalTransactions = reportData.daily_breakdown.reduce((sum: number, d: any) => sum + (d.transactions || 0), 0);
  const avgSale = totalTransactions > 0 ? reportData.total_revenue / totalTransactions : 0;

  const bestDayData = reportData.daily_breakdown.reduce((best: any, current: any) => {
    return (current.revenue > (best?.revenue || 0)) ? current : best;
  }, null);

  const bestDayLabel = bestDayData ? `DAY ${bestDayData.day}` : "-";
  const bestDayRev = bestDayData ? bestDayData.revenue : 0;

  const filteredSales = useMemo(() => {
    if (paymentFilter === "ALL") return recentSales;
    return recentSales.filter((s: any) => s.sale_channel?.toLowerCase() === paymentFilter.toLowerCase());
  }, [recentSales, paymentFilter]);

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const parseNotes = (notes: string) => {
    if (!notes) return { size: '-', color: '-' };
    const sizeMatch = notes.match(/Size:\s*([^,]+)/);
    const colorMatch = notes.match(/Color:\s*([^,\n]+)/);
    return {
      size: sizeMatch ? sizeMatch[1].trim() : '-',
      color: colorMatch ? colorMatch[1].trim() : '-'
    };
  };
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-5xl tracking-wide">SALES ANALYTICS</h1>
          <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">PERFORMANCE OVERVIEW</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"

            value={`${year}-${month.toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-');
              if (y && m) {
                const d = new Date();
                d.setFullYear(parseInt(y), parseInt(m) - 1, 1);
                setDate(d);
              }
            }}
            className="border border-border bg-card px-4 py-2 text-xs tracking-widest outline-none"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL REVENUE" value={`ETB ${reportData.total_revenue.toLocaleString()}`} delay={0} />
        <StatCard label="TRANSACTIONS" value={totalTransactions.toString()} delay={0.05} />
        <StatCard label="AVG SALE" value={`ETB ${Math.round(avgSale).toLocaleString()}`} delay={0.1} />
        <StatCard label="BEST DAY" value={bestDayLabel} sub={<span className="text-muted-foreground">ETB {bestDayRev.toLocaleString()}</span>} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border bg-card p-6">
          <h2 className="font-display text-2xl mb-4">REVENUE BY DAY</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekRev}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" vertical={false} />
              <XAxis dataKey="d" stroke="hsl(0 0% 55%)" fontSize={10} />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 15%)", fontSize: 11 }} />
              <Bar dataKey="r" fill="hsl(81 100% 67%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-border bg-card p-6">
          <h2 className="font-display text-2xl mb-4">SALES BY CATEGORY</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={fallbackCatData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {fallbackCatData.map((c, i) => <Cell key={i} fill={c.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 15%)", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2 text-[10px] tracking-widest">
            {fallbackCatData.map((c) => (
              <span key={c.name} className="flex items-center gap-2">
                <span className="h-2 w-2" style={{ background: c.fill }} />
                {c.name.toUpperCase()} {c.value}%
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-border bg-card p-6">
        <h2 className="font-display text-2xl mb-4">DAILY TREND — THIS MONTH</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" vertical={false} />
            <XAxis dataKey="d" stroke="hsl(0 0% 55%)" fontSize={10} />
            <YAxis stroke="hsl(0 0% 55%)" fontSize={10} />
            <Tooltip contentStyle={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 15%)", fontSize: 11 }} />
            <Line type="monotone" dataKey="v" stroke="hsl(81 100% 67%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="font-display text-2xl">RECENT TRANSACTIONS</h2>
          <select 
            value={paymentFilter} 
            onChange={e => setPaymentFilter(e.target.value)}
            className="border border-border bg-background px-3 py-1.5 text-[10px] tracking-widest uppercase outline-none focus:border-primary"
          >
            <option value="ALL">ALL PAYMENTS</option>
            <option value="CASH">CASH</option>
            <option value="TELEBIRR">TELEBIRR</option>
            <option value="CBE">CBE</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
                <th className="p-2 text-left">TIME</th>
                <th className="p-2 text-left">ITEM</th>
                <th className="p-2 text-left">SIZE</th>
                <th className="p-2 text-left">COLOR</th>
                <th className="p-2 text-left">PRICE</th>
                <th className="p-2 text-left">STAFF</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.slice(0, 5).map((t: any, i: number) => {
                const item = t.items?.[0] || {};
                const parsed = parseNotes(t.notes);
                
                const dateObj = new Date(t.sold_at || Date.now());
                const today = new Date();
                const isToday = dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
                const timeStr = isToday ? `Today, ${dateObj.toLocaleTimeString()}` : `${dateObj.toLocaleDateString()}, ${dateObj.toLocaleTimeString()}`;

                return (
                  <tr key={t.id || i} className="border-b border-border/50">
                    <td className="p-2 text-muted-foreground text-xs">{timeStr}</td>
                    <td className="p-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] tracking-widest text-primary">{(item.brand || '').toUpperCase()}</span>
                        <span className="font-medium text-off-white">
                          {item.quantity > 1 ? <span className="text-primary">{item.quantity}x </span> : null}
                          {item.product_name_snap || 'Unknown Item'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-xs">{parsed.size}</td>
                    <td className="p-2 text-xs">{parsed.color}</td>
                    <td className="p-2 font-display text-lg">ETB {(t.total_amount || 0).toLocaleString()}</td>
                    <td className="p-2 text-xs">{t.sold_by}</td>
                  </tr>
                );
              })}
              {filteredSales.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No recent transactions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

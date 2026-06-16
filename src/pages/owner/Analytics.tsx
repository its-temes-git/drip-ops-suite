import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
  Cell
} from "recharts";
import { StatCard } from "@/components/owner/StatCard";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, TrendingUp, TrendingDown, DollarSign, BarChart2, Calendar } from "lucide-react";

type Period = "week" | "month" | "custom";

const fmt = (n: number) => `ETB ${Math.round(n).toLocaleString()}`;
const fmtShort = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(0 0% 5%)",
    border: "1px solid hsl(0 0% 15%)",
    fontSize: 11,
    borderRadius: 0,
  },
  labelStyle: { color: "#b8ff57", fontWeight: 700 },
};

const Analytics = () => {
  const [period, setPeriod] = useState<Period>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Legacy monthly report (for transactions table)
  const [legacyDate, setLegacyDate] = useState(new Date());
  const year = legacyDate.getFullYear();
  const month = legacyDate.getMonth() + 1;
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");

  const { data: recentSales = [] } = useQuery({
    queryKey: ['sales-recent'],
    queryFn: () => api.owner.sales({ limit: 10 })
  });

  // Profit analytics query
  const profitParams = useMemo(() => {
    if (period === "custom" && startDate && endDate) {
      return { startDate, endDate };
    }
    return { period };
  }, [period, startDate, endDate]);

  const { data: profitData, isLoading: profitLoading } = useQuery({
    queryKey: ['profit-analytics', profitParams],
    queryFn: () => api.owner.profitAnalytics(profitParams),
    staleTime: 30_000,
  });

  const totals = profitData?.totals ?? { revenue: 0, cogs: 0, profit: 0, margin: 0 };
  const daily = profitData?.daily ?? [];
  const topProducts = profitData?.top_products ?? [];

  const maxProfit = topProducts.length > 0 ? Math.max(...topProducts.map((p: any) => p.profit)) : 1;

  const filteredSales = useMemo(() => {
    if (paymentFilter === "ALL") return recentSales;
    return recentSales.filter((s: any) => s.sale_channel?.toLowerCase() === paymentFilter.toLowerCase());
  }, [recentSales, paymentFilter]);

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
      {/* ── Header ── */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-5xl tracking-wide">PROFIT ANALYTICS</h1>
          <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">REVENUE · COST · PROFIT · MARGIN</p>
        </div>

        {/* Period selector */}
        <div className="flex flex-wrap items-center gap-2">
          {(["week", "month", "custom"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-[10px] tracking-[0.3em] uppercase border transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/60"
              }`}
            >
              {p === "week" ? "THIS WEEK" : p === "month" ? "THIS MONTH" : "CUSTOM"}
            </button>
          ))}
          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
              />
              <span className="text-muted-foreground text-xs">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-border bg-card px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
          )}
        </div>
      </header>

      {profitLoading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="TOTAL REVENUE"
              value={fmt(totals.revenue)}
              delay={0}
              sub={<span className="text-muted-foreground text-[10px]">What customers paid</span>}
            />
            <StatCard
              label="COST OF GOODS"
              value={fmt(totals.cogs)}
              delay={0.05}
              sub={<span className="text-muted-foreground text-[10px]">What you paid</span>}
            />
            <StatCard
              label="GROSS PROFIT"
              value={fmt(totals.profit)}
              delay={0.1}
              sub={
                <span className={totals.profit >= 0 ? "text-primary text-[10px]" : "text-destructive text-[10px]"}>
                  {totals.profit >= 0 ? "▲" : "▼"} Profit
                </span>
              }
            />
            <StatCard
              label="PROFIT MARGIN"
              value={`${totals.margin}%`}
              delay={0.15}
              sub={
                <span className={totals.margin >= 30 ? "text-primary text-[10px]" : "text-amber-400 text-[10px]"}>
                  {totals.margin >= 30 ? "● Healthy" : "● Needs attention"}
                </span>
              }
            />
          </div>

          {/* ── Revenue vs Profit Chart ── */}
          {daily.length > 0 && (
            <div className="border border-border bg-card p-6">
              <h2 className="font-display text-2xl mb-1">REVENUE vs PROFIT</h2>
              <p className="text-[10px] tracking-widest text-muted-foreground mb-4">
                Daily comparison — white line = revenue, green line = profit
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(0 0% 45%)" fontSize={10} tickLine={false} />
                  <YAxis stroke="hsl(0 0% 45%)" fontSize={10} tickFormatter={fmtShort} tickLine={false} />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    formatter={(val: number, name: string) => [
                      fmt(val),
                      name === "revenue" ? "Revenue" : name === "profit" ? "Profit" : "COGS"
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 10, letterSpacing: "0.2em" }}
                    formatter={(val) => val === "revenue" ? "REVENUE" : val === "profit" ? "PROFIT" : "COGS"}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(0 0% 85%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cogs" stroke="hsl(38 95% 55%)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                  <Line type="monotone" dataKey="profit" stroke="hsl(81 100% 67%)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Daily Profit Bar + Top Products ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily profit bars */}
            {daily.length > 0 && (
              <div className="border border-border bg-card p-6">
                <h2 className="font-display text-2xl mb-4">DAILY PROFIT</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={daily} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" vertical={false} />
                    <XAxis dataKey="day" stroke="hsl(0 0% 45%)" fontSize={9} tickLine={false} />
                    <YAxis stroke="hsl(0 0% 45%)" fontSize={10} tickFormatter={fmtShort} tickLine={false} />
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(val: number) => [fmt(val), "Profit"]}
                    />
                    <Bar dataKey="profit" radius={[2, 2, 0, 0]}>
                      {daily.map((d: any, i: number) => (
                        <Cell key={i} fill={d.profit >= 0 ? "hsl(81 100% 67%)" : "hsl(0 75% 55%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top products by profit */}
            <div className="border border-border bg-card p-6">
              <h2 className="font-display text-2xl mb-4">TOP ITEMS BY PROFIT</h2>
              {topProducts.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No sales data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p: any, i: number) => {
                    const pct = maxProfit > 0 ? (p.profit / maxProfit) * 100 : 0;
                    const margin = p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(0) : 0;
                    return (
                      <div key={p.id || i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-off-white truncate max-w-[55%]">
                            <span className="text-primary font-mono mr-1">{p.brand}</span>
                            {p.name}
                          </span>
                          <div className="flex items-center gap-3 text-right">
                            <span className="text-muted-foreground">{margin}% margin</span>
                            <span className="text-primary font-display">{fmt(p.profit)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-muted-foreground tracking-wider">
                          {p.units_sold} units · ETB {p.revenue.toLocaleString()} revenue · ETB {p.cogs.toLocaleString()} cost
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Recent Transactions ── */}
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
                  {filteredSales.slice(0, 8).map((t: any, i: number) => {
                    const item = t.items?.[0] || {};
                    const parsed = parseNotes(t.notes);
                    const dateObj = new Date(t.sold_at || Date.now());
                    const today = new Date();
                    const isToday = dateObj.toDateString() === today.toDateString();
                    const timeStr = isToday
                      ? `Today, ${dateObj.toLocaleTimeString()}`
                      : `${dateObj.toLocaleDateString()}, ${dateObj.toLocaleTimeString()}`;

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

          {daily.length === 0 && !profitLoading && (
            <div className="border border-border bg-card p-12 text-center">
              <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-display text-2xl text-muted-foreground">NO SALES DATA</p>
              <p className="text-xs text-muted-foreground/60 mt-2 tracking-widest">
                Record some sales and check back. Charts will appear here.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;

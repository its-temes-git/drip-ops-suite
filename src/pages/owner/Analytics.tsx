import {
  Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
  Cell
} from "recharts";
import { StatCard } from "@/components/owner/StatCard";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, BarChart2, Trash2, AlertCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

const INVALIDATE_KEYS = ['sales-recent', 'dashboard', 'profit-analytics', 'owner-dashboard-stats', 'recent-activities', 'all-transactions'];

const Analytics = () => {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<Period>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Transactions state
  const [txPage, setTxPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Fetch ALL transactions with pagination
  const txParams = useMemo(() => {
    const p: Record<string, any> = { page: txPage, limit: 10 };
    if (paymentFilter !== "ALL") p.channel = paymentFilter;
    return p;
  }, [txPage, paymentFilter]);

  const { data: txData, isLoading: txLoading, refetch: refetchTx } = useQuery({
    queryKey: ['all-transactions', txParams],
    queryFn: () => api.owner.sales(txParams),
    staleTime: 10_000,
  });

  const txRows: any[] = txData?.rows ?? (Array.isArray(txData) ? txData : []);
  const txTotal: number = txData?.total ?? txRows.length;
  const txTotalPages: number = txData?.totalPages ?? Math.ceil(txTotal / 10);

  // Profit analytics query
  const profitParams = useMemo(() => {
    if (period === "custom" && startDate && endDate) return { startDate, endDate };
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

  const parseNotes = (notes: string) => {
    if (!notes) return { size: '-', color: '-' };
    const sizeMatch = notes.match(/Size:\s*([^,]+)/);
    const colorMatch = notes.match(/Color:\s*([^,\n]+)/);
    return {
      size: sizeMatch ? sizeMatch[1].trim() : '-',
      color: colorMatch ? colorMatch[1].trim() : '-'
    };
  };

  const invalidateAll = () => {
    INVALIDATE_KEYS.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  const handleDeleteOne = async (id: string) => {
    setDeletingId(id);
    try {
      await api.owner.deleteSale(id);
      toast.success("Transaction deleted");
      invalidateAll();
      // Reset to page 1 if current page becomes empty
      if (txRows.length === 1 && txPage > 1) setTxPage(p => p - 1);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await api.owner.deleteAllSales();
      toast.success("All transactions deleted");
      setShowDeleteAllConfirm(false);
      setTxPage(1);
      invalidateAll();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete all transactions");
    } finally {
      setIsDeletingAll(false);
    }
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
              accent={totals.profit >= 0 ? "primary" : "warning"}
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
            {daily.length > 0 && (
              <div className="border border-border bg-card p-6">
                <h2 className="font-display text-2xl mb-4">DAILY PROFIT</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={daily} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" vertical={false} />
                    <XAxis dataKey="day" stroke="hsl(0 0% 45%)" fontSize={9} tickLine={false} />
                    <YAxis stroke="hsl(0 0% 45%)" fontSize={10} tickFormatter={fmtShort} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(val: number) => [fmt(val), "Profit"]} />
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

          {/* ── ALL TRANSACTIONS ── */}
          <div className="border border-border bg-card p-4 sm:p-6">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-display text-2xl tracking-wide">ALL TRANSACTIONS</h2>
                <p className="text-[10px] tracking-widest text-muted-foreground mt-0.5">
                  {txTotal} total records · page {txPage} of {txTotalPages || 1}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={paymentFilter}
                  onChange={e => { setPaymentFilter(e.target.value); setTxPage(1); }}
                  className="border border-border bg-background px-3 py-1.5 text-[10px] tracking-widest uppercase outline-none focus:border-primary"
                >
                  <option value="ALL">ALL PAYMENTS</option>
                  <option value="CASH">CASH</option>
                  <option value="TELEBIRR">TELEBIRR</option>
                  <option value="CBE">CBE</option>
                  <option value="BOA">BOA</option>
                  <option value="Awash Bank">AWASH BANK</option>
                </select>
                {txTotal > 0 && (
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    DELETE ALL
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            {txLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
                      <th className="p-2 text-left">TIME</th>
                      <th className="p-2 text-left">ITEM</th>
                      <th className="p-2 text-left">SIZE</th>
                      <th className="p-2 text-left">COLOR</th>
                      <th className="p-2 text-left">CHANNEL</th>
                      <th className="p-2 text-right">AMOUNT</th>
                      <th className="p-2 text-left">STAFF</th>
                      <th className="p-2 text-center">DEL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-10 text-center text-muted-foreground text-sm">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      txRows.map((t: any, i: number) => {
                        const item = t.items?.[0] || {};
                        const parsed = parseNotes(t.notes);
                        const dateObj = new Date(t.sold_at || Date.now());
                        const today = new Date();
                        const isToday = dateObj.toDateString() === today.toDateString();
                        const timeStr = isToday
                          ? `Today, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : `${dateObj.toLocaleDateString()}, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        const isDeleting = deletingId === t.id;

                        return (
                          <motion.tr
                            key={t.id || i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isDeleting ? 0.4 : 1 }}
                            className={`border-b border-border/40 group transition-colors hover:bg-primary/5 ${t.status === 'refunded' ? 'opacity-40' : ''}`}
                          >
                            <td className="p-2 text-muted-foreground text-[10px] whitespace-nowrap">{timeStr}</td>
                            <td className="p-2">
                              <div className="flex flex-col">
                                <span className="text-[10px] tracking-widest text-primary">{(item.brand || '').toUpperCase()}</span>
                                <span className="font-medium text-off-white text-xs">
                                  {(item.quantity ?? 1) > 1 ? <span className="text-primary">{item.quantity}x </span> : null}
                                  {item.product_name_snap || 'Unknown Item'}
                                </span>
                              </div>
                            </td>
                            <td className="p-2 text-xs text-muted-foreground">{parsed.size}</td>
                            <td className="p-2 text-xs text-muted-foreground">{parsed.color}</td>
                            <td className="p-2">
                              <span className="text-[9px] tracking-widest px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                                {t.sale_channel || 'In-store'}
                              </span>
                            </td>
                            <td className="p-2 font-display text-base text-right whitespace-nowrap">
                              ETB {(t.total_amount || 0).toLocaleString()}
                            </td>
                            <td className="p-2 text-[10px] text-muted-foreground">{t.sold_by}</td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteOne(t.id)}
                                disabled={isDeleting || isDeletingAll}
                                title="Delete this transaction"
                                className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all mx-auto disabled:opacity-30"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {txTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground tracking-widest">
                  SHOWING {((txPage - 1) * 10) + 1}–{Math.min(txPage * 10, txTotal)} OF {txTotal}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTxPage(p => Math.max(1, p - 1))}
                    disabled={txPage === 1}
                    className="h-8 w-8 flex items-center justify-center border border-border hover:border-primary/50 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, txTotalPages) }, (_, i) => {
                    const page = txPage <= 3
                      ? i + 1
                      : txPage >= txTotalPages - 2
                        ? txTotalPages - 4 + i
                        : txPage - 2 + i;
                    if (page < 1 || page > txTotalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setTxPage(page)}
                        className={`h-8 w-8 text-xs font-mono border transition-colors ${
                          page === txPage
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                    disabled={txPage === txTotalPages}
                    className="h-8 w-8 flex items-center justify-center border border-border hover:border-primary/50 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
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

      {/* ── Delete All Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowDeleteAllConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="border border-destructive/40 bg-card p-6 mx-4 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 flex items-center justify-center bg-destructive/10 border border-destructive/30">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <h3 className="font-display text-lg tracking-widest text-destructive">DELETE ALL?</h3>
                </div>
                <button onClick={() => setShowDeleteAllConfirm(false)} className="text-muted-foreground hover:text-off-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[11px] tracking-wide text-muted-foreground leading-relaxed mb-2">
                This will <span className="text-destructive font-bold">permanently delete all {txTotal} transaction records</span>.
              </p>
              <p className="text-[10px] tracking-wide text-muted-foreground/70 leading-relaxed mb-6">
                ⚠ Stock will NOT be restored. All revenue, profit, and chart data will reset to zero. This cannot be undone.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="flex-1 border border-border px-3 py-2.5 text-[10px] tracking-widest text-muted-foreground hover:text-off-white hover:border-off-white/30 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeletingAll}
                  className="flex-1 bg-destructive hover:bg-destructive/90 px-3 py-2.5 text-[10px] tracking-widest text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isDeletingAll ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <><Trash2 className="h-3.5 w-3.5" /> DELETE ALL</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analytics;

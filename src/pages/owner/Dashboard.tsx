import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, ArrowUpRight, AlertCircle, Loader2, Package, PackagePlus, RefreshCw, Tag, ShoppingBag, Undo2, Trash2, X } from "lucide-react";
import { StatCard } from "@/components/owner/StatCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const weekData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({ t: d, v: [4200, 3800, 5100, 4900, 6800, 8200, 5600][i] }));
const monthData = Array.from({ length: 30 }, (_, i) => ({ t: `${i + 1}`, v: 2000 + Math.round(Math.random() * 6000) }));
const tabs = { "THIS WEEK": weekData, "THIS MONTH": monthData };
import InventoryOverview from "@/components/owner/InventoryOverview";

const activityConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  sale: { icon: ShoppingBag, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "SALE" },
  restock: { icon: PackagePlus, color: "text-blue-400", bg: "bg-blue-400/10", label: "RESTOCK" },
  adjustment: { icon: RefreshCw, color: "text-amber-400", bg: "bg-amber-400/10", label: "ADJUSTED" },
  return: { icon: Undo2, color: "text-orange-400", bg: "bg-orange-400/10", label: "RETURN" },
  new_product: { icon: Package, color: "text-violet-400", bg: "bg-violet-400/10", label: "NEW ITEM" },
  price_update: { icon: Tag, color: "text-rose-400", bg: "bg-rose-400/10", label: "PRICE CHANGE" },
};

function formatActivityTime(time: string) {
  const d = new Date(time);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const Dashboard = () => {
  const [tab, setTab] = useState<keyof typeof tabs>("THIS WEEK");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.owner.dashboard(),
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => api.owner.recentActivities(15),
    refetchInterval: 30000,
  });

  const clearMutation = useMutation({
    mutationFn: () => api.owner.clearActivities(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
      setShowClearConfirm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="font-display tracking-widest text-sm">LOADING DATA...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex max-w-md flex-col items-center text-center gap-4 border border-red-500/30 bg-red-500/10 p-8 rounded-sm">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h2 className="font-display text-xl tracking-wider text-red-500">ERROR LOADING DASHBOARD</h2>
          <p className="text-sm text-red-500/80">{(error as Error)?.message || "An unknown error occurred"}</p>
        </div>
      </div>
    );
  }

  const dashboardData = data || {
    today: 0,
    today_cogs: 0,
    today_profit: 0,
    week: 0,
    month: 0,
    top_products: [],
    low_stock_alerts: [],
    chart: []
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      <header>
        <h1 className="font-display text-3xl sm:text-5xl tracking-wide">DASHBOARD</h1>
        <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">SAWKEM FASHION — {new Date().toLocaleDateString()}</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="TODAY'S REVENUE"
          value={`ETB ${dashboardData.today.toLocaleString()}`}
          delay={0}
          sub={<span className="text-muted-foreground text-[10px]">What customers paid</span>}
        />
        <StatCard
          label="WHAT I PAID"
          value={`ETB ${(dashboardData.today_cogs || 0).toLocaleString()}`}
          delay={0.05}
          sub={<span className="text-muted-foreground text-[10px]">Cost of goods sold today</span>}
        />
        <StatCard
          label="TODAY'S PROFIT"
          value={`ETB ${(dashboardData.today_profit || 0).toLocaleString()}`}
          delay={0.1}
          accent={dashboardData.today_profit >= 0 ? "primary" : "warning"}
          sub={
            <span className={(dashboardData.today_profit || 0) >= 0 ? "text-primary text-[10px]" : "text-destructive text-[10px]"}>
              {(dashboardData.today_profit || 0) >= 0 ? "▲ In profit" : "▼ In loss"}
            </span>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2 border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl sm:text-2xl tracking-wide">REVENUE</h2>
            <div className="flex gap-3 sm:gap-6 text-[10px] tracking-widest">
              {(Object.keys(tabs) as (keyof typeof tabs)[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`pb-1 transition-colors ${tab === k ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-off-white"}`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={tab === "THIS WEEK" ? dashboardData.chart.slice(-7) : dashboardData.chart}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={10} fontFamily="DM Mono" />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} fontFamily="DM Mono" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", fontFamily: "DM Mono", fontSize: 11 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activities */}
        <div className="relative overflow-hidden border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="pulse-dot h-2 w-2 rounded-full bg-primary" />
              <h2 className="font-display text-xl sm:text-2xl tracking-wide">RECENT ACTIVITY</h2>
            </div>
            {recentActivities.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-[9px] tracking-widest text-muted-foreground hover:text-red-400 transition-colors px-2 py-1 border border-transparent hover:border-red-400/30 rounded-sm"
              >
                <Trash2 className="h-3 w-3" />
                CLEAR
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-muted-foreground tracking-widest py-4 text-center">NO ACTIVITY RECORDED YET.</p>
            ) : (
              recentActivities.map((activity: any, i: number) => {
                const config = activityConfig[activity.type] || activityConfig.sale;
                const IconComponent = config.icon;

                return (
                  <motion.div
                    key={activity.id || i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative flex items-start gap-3 overflow-hidden border border-border bg-background/40 p-3 transition-all hover:border-primary/30"
                  >
                    {/* Icon */}
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm ${config.bg} ${config.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-display text-xs tracking-wide text-off-white leading-tight">
                          {activity.title}
                        </p>
                        <span className="flex-shrink-0 text-[9px] font-mono text-muted-foreground whitespace-nowrap">
                          {formatActivityTime(activity.time)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate leading-tight">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] tracking-widest font-medium px-1.5 py-0.5 rounded-sm ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-[9px] text-muted-foreground/70">
                          by {activity.actor}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Clear Confirmation Modal */}
          <AnimatePresence>
            {showClearConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                onClick={() => setShowClearConfirm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="border border-red-500/30 bg-card p-5 mx-4 w-full max-w-xs shadow-2xl shadow-red-500/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-red-500/10">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      </div>
                      <h3 className="font-display text-sm tracking-wider text-red-400">CLEAR ALL?</h3>
                    </div>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="text-muted-foreground hover:text-off-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-[10px] tracking-wide text-muted-foreground leading-relaxed mb-5">
                    This will permanently remove all restock logs, inventory adjustments, and price change history. Sales records will not be affected.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 border border-border px-3 py-2 text-[10px] tracking-widest text-muted-foreground hover:text-off-white hover:border-off-white/30 transition-colors"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => clearMutation.mutate()}
                      disabled={clearMutation.isPending}
                      className="flex-1 bg-red-500/90 hover:bg-red-500 px-3 py-2 text-[10px] tracking-widest text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {clearMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-3 w-3" />
                          CLEAR ALL
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Best Sellers */}
      <section>
        <h2 className="font-display text-2xl sm:text-3xl tracking-wide mb-4 sm:mb-6">TOP MOVERS THIS MONTH</h2>
        <div className="space-y-3">
          {dashboardData.top_products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No top products yet.</p>
          ) : (
            dashboardData.top_products.map((b: any, i: number) => (
              <motion.div
                key={b.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 6 }}
                className="flex items-center gap-3 sm:gap-6 border border-border bg-card p-3 sm:p-4 hover:border-primary/40"
              >
                <span className="font-display text-3xl sm:text-6xl text-muted-foreground/30 w-8 sm:w-16 text-center">#{i + 1}</span>
                <div className="h-10 w-10 sm:h-14 sm:w-14 bg-muted flex items-center justify-center font-display text-base sm:text-xl text-primary flex-shrink-0">
                  {b.brand?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-widest text-primary truncate">{b.brand?.toUpperCase()}</p>
                  <p className="font-display text-base sm:text-xl truncate">{b.name}</p>
                </div>
                <span className="hidden sm:inline text-xs text-muted-foreground border border-border px-2 py-1">{b.category || "General"}</span>
                <span className="bg-primary px-2 sm:px-3 py-1 text-[10px] sm:text-xs text-primary-foreground font-medium whitespace-nowrap">{(b.total_sold || b.sold || 0)} SOLD</span>
              </motion.div>
            ))
          )}
        </div>
      </section>

      <section className="pt-10 border-t border-border">
        <InventoryOverview />
      </section>
    </div>
  );
};

export default Dashboard;

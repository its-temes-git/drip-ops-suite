import { useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/owner/StatCard";
import { ACTIVITY_FEED, inventory } from "@/data/inventory";

const weekData = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => ({ t: d, v: [4200,3800,5100,4900,6800,8200,5600][i] }));
const monthData = Array.from({ length: 30 }, (_, i) => ({ t: `${i+1}`, v: 2000 + Math.round(Math.random() * 6000) }));

const tabs = { "THIS WEEK": weekData, "THIS MONTH": monthData };

const bestSellers = [
  { rank: 1, name: "Air Force 1", brand: "NOCTA", category: "Shoes", sold: 22 },
  { rank: 2, name: "Tracksuit", brand: "SP5DER", category: "Tops", sold: 17 },
  { rank: 3, name: "Derby", brand: "Balenciaga", category: "Shoes", sold: 14 },
  { rank: 4, name: "Tee Washed", brand: "Hellstar", category: "Tops", sold: 12 },
  { rank: 5, name: "1 Retro High Chicago", brand: "Jordan", category: "Shoes", sold: 10 },
  { rank: 6, name: "3XL Hoodie", brand: "Balenciaga", category: "Tops", sold: 9 },
];

const Dashboard = () => {
  const [tab, setTab] = useState<keyof typeof tabs>("THIS WEEK");
  const totalItems = inventory.reduce((a, b) => a + b.qty, 0);

  // Only sales — drop low/restock entries
  const recentSales = ACTIVITY_FEED.filter((a) => a.type === "sale");

  const catSummary: Record<string, { styles: number; pieces: number }> = {};
  inventory.forEach((i) => {
    catSummary[i.category] = catSummary[i.category] || { styles: 0, pieces: 0 };
    catSummary[i.category].styles++;
    catSummary[i.category].pieces += i.qty;
  });

  return (
    <div className="space-y-6 sm:space-y-10">
      <header>
        <h1 className="font-display text-3xl sm:text-5xl tracking-wide">DASHBOARD</h1>
        <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">SUMMIT BRANCH — {new Date().toLocaleDateString()}</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="TODAY'S REVENUE" value="ETB 4,850" sub={<span className="rounded-sm bg-primary/20 px-2 py-0.5 text-[10px] text-primary">+12% vs yesterday</span>} delay={0} />
        <StatCard label="ITEMS IN STOCK" value={`${totalItems}`} sub={<span className="text-muted-foreground">across all categories</span>} delay={0.05} />
        <StatCard label="SALES TODAY" value="14" sub={<span className="text-muted-foreground">transactions</span>} delay={0.1} />
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
            <AreaChart data={tabs[tab]}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(81 100% 67%)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(81 100% 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" vertical={false} />
              <XAxis dataKey="t" stroke="hsl(0 0% 55%)" fontSize={10} fontFamily="DM Mono" />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={10} fontFamily="DM Mono" />
              <Tooltip
                contentStyle={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 15%)", fontFamily: "DM Mono", fontSize: 11 }}
                labelStyle={{ color: "hsl(40 22% 92%)" }}
              />
              <Area type="monotone" dataKey="v" stroke="hsl(81 100% 67%)" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Sales — redesigned */}
        <div className="relative overflow-hidden border border-border bg-card p-4 sm:p-6">
          {/* glow accent */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="pulse-dot h-2 w-2 rounded-full bg-primary" />
              <h2 className="font-display text-xl sm:text-2xl tracking-wide">RECENT SALES</h2>
            </div>
            <span className="rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] tracking-widest text-primary">
              LIVE
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {recentSales.map((a, i) => {
              // Parse a bit of structure from text
              const [label, ...rest] = a.text.split("—").map((s) => s.trim());
              const detail = rest.slice(0, -1).join(" • ");
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ x: 4 }}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-sm border border-border bg-background/40 p-3 transition-colors hover:border-primary/40"
                >
                  {/* left accent bar */}
                  <span className="absolute left-0 top-0 h-full w-0.5 bg-primary" />

                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <TrendingUp className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm tracking-wide text-off-white">
                      {label}
                    </p>
                    {detail && (
                      <p className="truncate text-[10px] tracking-wider text-muted-foreground">
                        {detail}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono text-muted-foreground">{a.time}</span>
                    <ArrowUpRight className="h-3 w-3 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      <section>
        <h2 className="font-display text-2xl sm:text-3xl tracking-wide mb-4 sm:mb-6">TOP MOVERS THIS MONTH</h2>
        <div className="space-y-3">
          {bestSellers.map((b, i) => (
            <motion.div
              key={b.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 6 }}
              className="flex items-center gap-3 sm:gap-6 border border-border bg-card p-3 sm:p-4 hover:border-primary/40"
            >
              <span className="font-display text-3xl sm:text-6xl text-muted-foreground/30 w-8 sm:w-16 text-center">#{b.rank}</span>
              <div className="h-10 w-10 sm:h-14 sm:w-14 bg-muted flex items-center justify-center font-display text-base sm:text-xl text-primary flex-shrink-0">
                {b.brand[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-widest text-primary truncate">{b.brand.toUpperCase()}</p>
                <p className="font-display text-base sm:text-xl truncate">{b.name}</p>
              </div>
              <span className="hidden sm:inline text-xs text-muted-foreground border border-border px-2 py-1">{b.category}</span>
              <span className="bg-primary px-2 sm:px-3 py-1 text-[10px] sm:text-xs text-primary-foreground font-medium whitespace-nowrap">{b.sold} SOLD</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Inventory Overview */}
      <section>
        <h2 className="font-display text-2xl sm:text-3xl tracking-wide mb-4 sm:mb-6">INVENTORY OVERVIEW</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {Object.entries(catSummary).map(([cat, d]) => (
            <div key={cat} className="border border-border bg-card p-4 sm:p-5">
              <p className="text-[10px] tracking-widest text-muted-foreground">{cat.toUpperCase()}</p>
              <p className="font-display text-3xl sm:text-4xl mt-2">{d.pieces}</p>
              <p className="text-xs text-muted-foreground">{d.styles} styles</p>
              <div className="mt-3 h-1 bg-muted">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (d.pieces/120)*100)}%` }} />
              </div>
            </div>
          ))}
          <div className="border-2 border-primary bg-card p-4 sm:p-5 col-span-2 lg:col-span-1">
            <p className="text-[10px] tracking-widest text-primary">SUMMIT TOTAL</p>
            <p className="font-display text-3xl sm:text-4xl mt-2 text-primary">{totalItems}</p>
            <p className="text-xs text-muted-foreground">items in stock</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

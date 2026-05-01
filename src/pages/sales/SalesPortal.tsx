import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search, X, Plus, Minus, Check, LogOut, LayoutGrid, ListOrdered,
  TrendingUp, Calendar, Package, Menu, AlertTriangle, DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { InventoryItem } from "@/data/inventory";
import { ThemeToggle } from "@/components/ThemeToggle";

const cats = ["ALL", "Shoes", "Tops", "Bottoms", "Accessories"] as const;

type View = "catalog" | "log" | "week" | "lowstock";

const SalesPortal = () => {
  const { inventory, recordSale, sales, staffName, setStaffName } = useApp();
  const nav = useNavigate();
  const [now, setNow] = useState(new Date());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("ALL");
  const [sel, setSel] = useState<InventoryItem | null>(null);
  const [view, setView] = useState<View>("catalog");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!staffName) nav("/login/sales");
  }, [staffName, nav]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [view]);

  const filtered = useMemo(
    () =>
      inventory.filter((i) => {
        if (cat !== "ALL" && i.category !== cat) return false;
        if (q && !`${i.brand} ${i.name}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [inventory, q, cat],
  );

  // ---- Stats ----
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday

  const todaySales = sales.filter((s) => s.time >= startOfToday);
  const weekSales = sales.filter((s) => s.time >= startOfWeek);

  const todayItemCount = todaySales.reduce((a, b) => a + b.qty, 0);
  const weekItemCount = weekSales.reduce((a, b) => a + b.qty, 0);
  const todayRevenue = todaySales.reduce((a, b) => a + b.price * b.qty, 0);
  const weekRevenue = weekSales.reduce((a, b) => a + b.price * b.qty, 0);

  const lowStock = inventory.filter((i) => i.qty > 0 && i.qty <= 3);
  const outStock = inventory.filter((i) => i.qty === 0);

  const logout = () => {
    setStaffName("");
    nav("/");
  };

  const navItems: { id: View; label: string; icon: typeof LayoutGrid; badge?: number }[] = [
    { id: "catalog", label: "CATALOG", icon: LayoutGrid },
    { id: "log", label: "TODAY'S LOG", icon: ListOrdered, badge: todaySales.length },
    { id: "week", label: "WEEK STATS", icon: TrendingUp },
    { id: "lowstock", label: "LOW STOCK", icon: AlertTriangle, badge: lowStock.length + outStock.length },
  ];

  const Sidebar = () => (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="border-b border-border p-5">
        <p className="font-display text-2xl tracking-wider text-primary">SAWKEM</p>
        <p className="text-[10px] tracking-widest text-muted-foreground">SALES PORTAL</p>
        <p className="mt-3 text-xs tracking-widest text-off-white">{staffName?.toUpperCase()}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] tracking-widest text-primary">ON SHIFT</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="space-y-2 border-b border-border p-4">
        <div className="rounded-sm border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-muted-foreground">
            <Calendar className="h-3 w-3" /> TODAY
          </div>
          <p className="mt-1 font-display text-2xl text-primary">{todayItemCount} <span className="text-xs text-muted-foreground">items</span></p>
          <p className="text-[11px] text-off-white">ETB {todayRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> THIS WEEK
          </div>
          <p className="mt-1 font-display text-2xl text-primary">{weekItemCount} <span className="text-xs text-muted-foreground">items</span></p>
          <p className="text-[11px] text-off-white">ETB {weekRevenue.toLocaleString()}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`relative flex w-full items-center gap-3 px-5 py-3 text-xs tracking-widest transition-colors ${
                active
                  ? "border-l-2 border-primary bg-primary/5 text-primary"
                  : "border-l-2 border-transparent text-muted-foreground hover:text-off-white"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className={`min-w-[20px] rounded-sm px-1.5 py-0.5 text-center text-[10px] ${active ? "bg-primary text-primary-foreground" : "bg-muted text-off-white"}`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-widest text-muted-foreground">THEME</span>
          <ThemeToggle />
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 border border-border bg-card py-2.5 text-xs tracking-widest text-off-white transition-colors hover:border-primary hover:text-primary"
        >
          <LogOut className="h-4 w-4" /> LOGOUT
        </button>
      </div>
    </aside>
  );

  return (
    <div className="grain min-h-screen bg-charcoal text-off-white">
      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:block sticky top-0 h-screen">
          <Sidebar />
        </div>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed left-0 top-0 z-50 h-full md:hidden"
              >
                <Sidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MAIN */}
        <div className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center border border-border"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg tracking-wider md:text-xl">SAWKEM FASHION</p>
              <p className="text-[10px] tracking-widest text-muted-foreground">SUMMIT BRANCH</p>
            </div>
            <div className="text-right">
              <p className="font-display text-base md:text-xl">{now.toLocaleTimeString()}</p>
              <p className="text-[10px] text-muted-foreground">{now.toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-6 px-4 py-6 md:px-6">
            {view === "catalog" && (
              <>
                <div className="flex items-center gap-2 border border-border bg-card px-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent py-3 outline-none" />
                </div>

                <div className="flex gap-2 overflow-x-auto">
                  {cats.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`whitespace-nowrap border px-4 py-2 text-xs tracking-widest ${
                        cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      }`}
                    >
                      {c.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {filtered.map((it, i) => {
                    const low = it.qty <= 3;
                    const out = it.qty === 0;
                    return (
                      <motion.div
                        key={it.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        whileHover={{ scale: 1.02 }}
                        className="relative overflow-hidden border border-border bg-card hover:border-primary/60 hover:shadow-[0_0_20px_hsl(81_100%_67%/0.15)]"
                      >
                        <div className="aspect-square overflow-hidden bg-muted">
                          {it.image ? (
                            <img src={it.image} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-display text-7xl text-primary/60">
                              {it.brand[0]}
                            </div>
                          )}
                        </div>
                        <span
                          className={`absolute right-2 top-2 px-2 py-1 text-[10px] tracking-widest ${
                            out ? "bg-destructive text-destructive-foreground" : low ? "bg-warning text-warning-foreground" : "bg-background/80 text-off-white"
                          }`}
                        >
                          {out ? "OUT" : low ? `LOW (${it.qty})` : `${it.qty} LEFT`}
                        </span>
                        <div className="space-y-2 p-3">
                          <p className="text-[10px] tracking-widest text-primary">{it.brand.toUpperCase()}</p>
                          <p className="font-display text-xl leading-tight">{it.name}</p>
                          <p className="text-[11px] text-muted-foreground">List: ETB {(it.price || 0).toLocaleString()}</p>
                          <button
                            disabled={out}
                            onClick={() => setSel(it)}
                            className="w-full bg-off-white py-2 text-xs font-medium tracking-widest text-background disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            RECORD SALE
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {view === "log" && (
              <div className="border border-border bg-card p-4 md:p-6">
                <div className="mb-4 flex flex-wrap justify-between gap-2">
                  <h2 className="font-display text-2xl">TODAY'S LOG</h2>
                  <p className="font-display text-xl">
                    {todaySales.length} SALES — <span className="text-primary">ETB {todayRevenue.toLocaleString()}</span>
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
                        <th className="p-2 text-left">TIME</th>
                        <th className="p-2 text-left">ITEM</th>
                        <th className="p-2 text-left">BRAND</th>
                        <th className="p-2 text-left">SIZE</th>
                        <th className="p-2 text-left">QTY</th>
                        <th className="p-2 text-left">SOLD AT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySales.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No sales yet today.</td></tr>
                      )}
                      {todaySales.map((s) => (
                        <tr key={s.id} className="border-b border-border/50">
                          <td className="p-2 text-xs">{s.time.toLocaleTimeString()}</td>
                          <td className="p-2">{s.itemName}</td>
                          <td className="p-2 text-[10px] tracking-widest text-primary">{s.brand.toUpperCase()}</td>
                          <td className="p-2">{s.size}</td>
                          <td className="p-2">{s.qty}</td>
                          <td className="p-2 font-display text-lg">ETB {(s.price * s.qty).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {view === "week" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatBox label="ITEMS TODAY" value={todayItemCount} icon={Package} />
                  <StatBox label="REVENUE TODAY" value={`ETB ${todayRevenue.toLocaleString()}`} icon={DollarSign} />
                  <StatBox label="ITEMS THIS WEEK" value={weekItemCount} icon={Package} />
                  <StatBox label="REVENUE THIS WEEK" value={`ETB ${weekRevenue.toLocaleString()}`} icon={TrendingUp} />
                </div>

                <div className="border border-border bg-card p-4 md:p-6">
                  <h2 className="mb-4 font-display text-2xl">THIS WEEK — ITEMS SOLD</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
                          <th className="p-2 text-left">DATE</th>
                          <th className="p-2 text-left">TIME</th>
                          <th className="p-2 text-left">ITEM</th>
                          <th className="p-2 text-left">SIZE</th>
                          <th className="p-2 text-left">QTY</th>
                          <th className="p-2 text-left">SOLD AT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekSales.length === 0 && (
                          <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No sales this week yet.</td></tr>
                        )}
                        {weekSales.map((s) => (
                          <tr key={s.id} className="border-b border-border/50">
                            <td className="p-2 text-xs">{s.time.toLocaleDateString()}</td>
                            <td className="p-2 text-xs">{s.time.toLocaleTimeString()}</td>
                            <td className="p-2">
                              <span className="text-[10px] tracking-widest text-primary">{s.brand.toUpperCase()}</span> · {s.itemName}
                            </td>
                            <td className="p-2">{s.size}</td>
                            <td className="p-2">{s.qty}</td>
                            <td className="p-2 font-display text-lg">ETB {(s.price * s.qty).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {view === "lowstock" && (
              <div className="border border-border bg-card p-4 md:p-6">
                <h2 className="mb-4 font-display text-2xl">LOW STOCK ALERTS</h2>
                {[...outStock, ...lowStock].length === 0 ? (
                  <p className="text-muted-foreground">All items healthy. ✓</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {[...outStock, ...lowStock].map((it) => (
                      <div key={it.id} className="flex items-center gap-3 border border-border bg-background p-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden bg-muted">
                          {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] tracking-widest text-primary">{it.brand.toUpperCase()}</p>
                          <p className="truncate font-display text-base">{it.name}</p>
                        </div>
                        <span className={`px-2 py-1 text-[10px] tracking-widest ${it.qty === 0 ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}`}>
                          {it.qty === 0 ? "OUT" : `${it.qty} LEFT`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {sel && (
          <RecordSaleModal
            item={sel}
            onClose={() => setSel(null)}
            onConfirm={(args) => {
              recordSale({
                itemId: sel.id,
                itemName: sel.name,
                brand: sel.brand,
                size: args.size,
                color: args.color,
                qty: args.qty,
                price: args.soldPrice,
                staff: staffName,
              });
              toast.success(`✓ SALE RECORDED — ${sel.name.toUpperCase()} ${args.size} @ ETB ${args.soldPrice.toLocaleString()}`);
              setSel(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatBox = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Package }) => (
  <div className="border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-[10px] tracking-widest text-muted-foreground">
      <Icon className="h-3 w-3" /> {label}
    </div>
    <p className="mt-2 font-display text-3xl text-primary">{value}</p>
  </div>
);

const RecordSaleModal = ({
  item,
  onClose,
  onConfirm,
}: {
  item: InventoryItem;
  onClose: () => void;
  onConfirm: (a: { color: string; size: string; qty: number; soldPrice: number }) => void;
}) => {
  const colors = item.color.split("/").map((c) => c.trim());
  const original = item.price || 0;
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(item.sizes[0]);
  const [qty, setQty] = useState(1);
  const [soldPriceStr, setSoldPriceStr] = useState(String(original));
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const soldPrice = Number(soldPriceStr) || 0;
  const diff = soldPrice - original;
  const total = soldPrice * qty;

  const confirm = () => {
    if (soldPrice <= 0) {
      toast.error("Enter a valid sold price");
      return;
    }
    setSuccess(true);
    setTimeout(() => onConfirm({ color, size, qty, soldPrice }), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-3 backdrop-blur"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md flex-col overflow-hidden border border-border bg-card shadow-2xl"
        style={{ maxHeight: "calc(100vh - 1.5rem)" }}
      >
        <div className="relative flex items-start justify-between gap-3 border-b border-border bg-gradient-to-br from-primary/10 via-card to-card px-5 py-5">
          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-[10px] tracking-[0.25em] text-primary">{item.brand.toUpperCase()}</p>
            </div>
            <h2 className="font-display text-3xl leading-tight">{item.name}</h2>
            <p className="mt-2 text-[10px] tracking-widest text-muted-foreground">ORIGINAL PRICE</p>
            <p className="font-display text-2xl text-primary">ETB {original.toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-border bg-background/60 text-muted-foreground transition-colors hover:border-primary hover:text-off-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-col">
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-card/95"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="flex flex-col items-center gap-3">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15">
                  <Check className="h-14 w-14 text-primary" strokeWidth={3} />
                </div>
                <p className="font-display text-xl tracking-widest text-primary">SALE RECORDED</p>
              </motion.div>
            </motion.div>
          )}

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {colors.length > 1 && (
              <div>
                <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">COLOR</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`border px-3 py-1.5 text-xs transition-colors ${
                        color === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">SIZE</p>
              <div className="flex flex-wrap gap-2">
                {item.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[40px] border px-3 py-1.5 text-xs transition-colors ${
                      size === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">QUANTITY</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-10 w-10 items-center justify-center border border-border hover:border-primary/50">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-display text-2xl">{qty}</span>
                <button onClick={() => setQty(Math.min(item.qty, qty + 1))} className="flex h-10 w-10 items-center justify-center border border-border hover:border-primary/50">
                  <Plus className="h-4 w-4" />
                </button>
                <span className="ml-auto text-[10px] tracking-widest text-muted-foreground">{item.qty} IN STOCK</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] tracking-widest text-muted-foreground">SOLD AT (ETB)</p>
                <button
                  type="button"
                  onClick={() => setSoldPriceStr(String(original))}
                  className="text-[10px] tracking-widest text-primary hover:underline"
                >
                  USE LIST PRICE
                </button>
              </div>
              <div className="flex items-center gap-2 border border-border bg-background px-3">
                <span className="text-xs tracking-widest text-muted-foreground">ETB</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={soldPriceStr}
                  onChange={(e) => setSoldPriceStr(e.target.value)}
                  className="flex-1 bg-transparent py-3 font-display text-xl outline-none"
                  placeholder="Enter actual sold price"
                />
              </div>
              {soldPrice > 0 && diff !== 0 && (
                <p className={`mt-1.5 text-[11px] tracking-widest ${diff < 0 ? "text-destructive" : "text-primary"}`}>
                  {diff < 0 ? "DISCOUNT" : "MARKUP"}: {diff < 0 ? "-" : "+"}ETB {Math.abs(diff).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 border-t border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-muted-foreground">TOTAL</span>
              <span className="font-display text-2xl text-primary">ETB {total.toLocaleString()}</span>
            </div>
            <button
              onClick={confirm}
              className="w-full bg-primary py-3 font-display text-lg tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
              CONFIRM SALE
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SalesPortal;

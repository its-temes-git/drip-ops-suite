import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search, X, Plus, Minus, Check, LogOut, LayoutGrid, ListOrdered,
  TrendingUp, Calendar, Package, Menu, AlertTriangle, DollarSign,
  Pencil, Trash2, History, Banknote, Smartphone, Building2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { SalesCardSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useApp, PaymentMethod, Sale } from "@/context/AppContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const cats = ["ALL", "Shoes", "Bag", "Accessories", "Complete", "Shirt", "T-Shirt", "Hoodie", "Jacket", "Jeans", "Jogger", "Short"] as const;
const PAYMENTS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: "Cash", label: "CASH", icon: Banknote },
  { id: "Telebirr", label: "TELEBIRR", icon: Smartphone },
  { id: "CBE", label: "CBE", icon: Building2 },
  { id: "BOA", label: "BOA", icon: Building2 },
  { id: "Awash Bank", label: "AWASH BANK", icon: Building2 },
];

const COLOR_HEX: Record<string, string> = {
  Black: "#000000", White: "#FFFFFF", Navy: "#1B2A4A", Grey: "#808080",
  Beige: "#C8AD8F", Brown: "#7B4F2E", Red: "#CC2200", Burgundy: "#800020",
  Forest: "#2D5A27", Olive: "#6B7C35", Blue: "#2255CC", Sky: "#87CEEB",
  Yellow: "#F5C400", Orange: "#E8621A", Pink: "#F4A0B0", Purple: "#6A0DAD",
  Camel: "#C19A6B", Cream: "#F5F0E8",
};

type View = "catalog" | "log" | "week" | "lowstock";

interface InventoryItem {
  id: string | number;
  brand: string;
  name: string;
  price: number;
  qty: number;
  category: string;
  image?: string;
  sizes: string[];
  color: string;
  variants?: any[];
}


const SalesPortal = () => {
  const { editSale, deleteSale, user, logout } = useApp();
  const staffName = user?.full_name || "Staff";
  const [editing, setEditing] = useState<Sale | null>(null);
  const [auditFor, setAuditFor] = useState<Sale | null>(null);
  const nav = useNavigate();
  const [now, setNow] = useState(new Date());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<InventoryItem | null>(null);
  const [view, setView] = useState<View>("catalog");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: rawInventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ['sales-products'],
    queryFn: () => api.sales.products(),
  });

  const inventory = useMemo(() => {
    if (!rawInventory) return [];
    return rawInventory.map((i: any) => {
      const variants = i.variants || [];
      const extractedSizes = variants.length > 0 ? [...new Set(variants.map((v: any) => v.size))] : (i.sizes || ['-']);
      const extractedColor = variants.length > 0 ? [...new Set(variants.map((v: any) => v.color))].join(', ') : (i.color || '-');

      return {
        ...i,
        sizes: extractedSizes,
        color: extractedColor
      };
    });
  }, [rawInventory]);

  const { data: realSales = [] } = useQuery({
    queryKey: ['sales-history'],
    queryFn: () => api.sales.mySales(),
  });

  const recordSaleMutation = useMutation({
    mutationFn: (data: any) => api.sales.recordTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-products'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
    }
  });
  
  const deleteSaleMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => api.sales.deleteTransaction(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-products'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
    }
  });

  const editSaleMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string, changes: any }) => api.sales.editTransaction(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-products'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
    }
  });

  const sales = useMemo(() => {
    return Array.isArray(realSales) ? realSales.map((s: any) => {
      const items = s.items || [];
      const firstItem = items[0] || {};
      const totalQty = items.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
      
      // Improved regex to extract size and color from notes
      const sizeMatch = s.notes?.match(/Size:\s*([^,]+)/);
      const colorMatch = s.notes?.match(/Color:\s*([^,]+)/);

      // Look up the brand from the backend join, then fall back to the already-loaded inventory list
      const inventoryMatch = inventory.find((i: any) => String(i.id) === String(firstItem.product_id));
      const brand = firstItem.brand || inventoryMatch?.brand || "SAWKEM";
      
      return {
        id: s.id || Math.random().toString(),
        itemId: firstItem.product_id,
        itemName: firstItem.product_name_snap || "Item",
        brand,
        size: sizeMatch ? sizeMatch[1].trim() : "-",
        color: colorMatch ? colorMatch[1].trim() : "-",
        qty: totalQty || 1,
        price: Number(s.total_amount) / (totalQty || 1), 
        payment: s.sale_channel || "Cash",
        staff: staffName,
        time: new Date(s.sold_at || s.created_at || Date.now()),
        deleted: s.status === 'refunded',
        audit: []
      };
    }) : [];
  }, [realSales, staffName, inventory]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  useEffect(() => {
    setPage(1);
  }, [q, cat]);

  const itemsPerPage = 12;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page]);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ---- Stats ----
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); 

  const todaySales = sales.filter((s) => s.time >= startOfToday);
  const weekSales = sales.filter((s) => s.time >= startOfWeek);
  const todayActive = todaySales.filter((s) => !s.deleted);
  const weekActive = weekSales.filter((s) => !s.deleted);

  const todayItemCount = todayActive.reduce((a, b) => a + b.qty, 0);
  const weekItemCount = weekActive.reduce((a, b) => a + b.qty, 0);
  const todayRevenue = todayActive.reduce((a, b) => a + Number(b.price) * b.qty, 0);
  const weekRevenue = weekActive.reduce((a, b) => a + Number(b.price) * b.qty, 0);

  const lowStock = inventory.filter((i) => i.qty > 0 && i.qty <= 3);
  const outStock = inventory.filter((i) => i.qty === 0);

  const navItems: { id: View; label: string; icon: typeof LayoutGrid; badge?: number }[] = [
    { id: "catalog", label: "CATALOG", icon: LayoutGrid },
    { id: "log", label: "TODAY'S LOG", icon: ListOrdered, badge: todayActive.length },
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

      <div className="space-y-2 border-b border-border p-4">
        <div className="rounded-sm border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-muted-foreground">
            <Calendar className="h-3 w-3" /> TODAY
          </div>
          <p className="mt-1 font-display text-2xl text-primary">{todayItemCount} <span className="text-xs text-muted-foreground">items</span></p>
          <p className="text-[11px] text-off-white">ETB {todayRevenue.toLocaleString()}</p>
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

                {inventoryLoading ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <SalesCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {paginatedItems.map((it, i) => {
                      const qty = it.qty || 0;
                      const low = qty <= 3;
                      const out = qty === 0;
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
                            {out ? "OUT" : low ? `LOW (${qty})` : `${qty} LEFT`}
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

                  {/* PAGINATION CONTROLS */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                        SHOWING {((page - 1) * itemsPerPage) + 1}–{Math.min(page * itemsPerPage, filtered.length)} OF {filtered.length} ITEMS
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="h-8 w-8 flex items-center justify-center border border-border hover:border-primary/50 disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                          const p = page <= 3
                            ? idx + 1
                            : page >= totalPages - 2
                              ? totalPages - 4 + idx
                              : page - 2 + idx;
                          if (p < 1 || p > totalPages) return null;
                          return (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`h-8 w-8 text-xs font-mono border transition-colors ${
                                p === page
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border text-muted-foreground hover:border-primary/50"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="h-8 w-8 flex items-center justify-center border border-border hover:border-primary/50 disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                )}
              </>
            )}

            {view === "log" && (
              <div className="border border-border bg-card p-4 md:p-6">
                <div className="mb-4 flex flex-wrap justify-between gap-2">
                  <h2 className="font-display text-2xl">TODAY'S LOG</h2>
                  <p className="font-display text-xl">
                    {todayActive.length} SALES — <span className="text-primary">ETB {todayRevenue.toLocaleString()}</span>
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
                        <th className="p-2 text-left">TIME</th>
                        <th className="p-2 text-left">PRODUCT</th>
                        <th className="p-2 text-left">SIZE / COLOR</th>
                        <th className="p-2 text-left">QTY</th>
                        <th className="p-2 text-left">PAYMENT</th>
                        <th className="p-2 text-left">SOLD AT</th>
                        <th className="p-2 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySales.length === 0 && (
                        <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No sales yet today.</td></tr>
                      )}
                      {todaySales.map((s) => (
                        <tr key={s.id} className={`border-b border-border/50 ${s.deleted ? "opacity-40" : ""}`}>
                          <td className="p-2 text-xs">{s.time.toLocaleTimeString()}</td>
                          <td className={`p-2 ${s.deleted ? "line-through" : ""}`}>
                            <div className="flex flex-col">
                              <span className="text-[10px] tracking-widest text-primary font-bold">{s.brand.toUpperCase()}</span>
                              <span className="font-medium">{s.itemName}</span>
                            </div>
                          </td>
                          <td className="p-2 text-xs">
                            <span className="text-muted-foreground">{s.size}</span>
                            <span className="mx-1">/</span>
                            <span className="text-muted-foreground">{s.color}</span>
                          </td>
                          <td className="p-2 font-display text-xl text-primary">{s.qty}</td>
                          <td className="p-2 text-[10px] tracking-widest">{s.payment.toUpperCase()}</td>
                          <td className="p-2 font-display text-lg">ETB {(s.price * s.qty).toLocaleString()}</td>
                          <td className="p-2">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setAuditFor(s)}
                                title="View audit trail"
                                className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-primary"
                              >
                                <History className="h-3.5 w-3.5" />
                              </button>
                              {!s.deleted && (
                                <>
                                  <button
                                    onClick={() => setEditing(s)}
                                    title="Edit"
                                    className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-primary"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = window.prompt(`Reason for deleting sale of ${s.itemName}? (Required for restocking)`);
                                      if (reason) {
                                        deleteSaleMutation.mutate({ id: s.id, reason }, {
                                          onSuccess: () => {
                                            toast.success(`Sale deleted/restocked: ${reason}`);
                                          },
                                          onError: (err: any) => {
                                            toast.error(`Error: ${err.message}`);
                                          }
                                        });
                                      } else if (reason === "") {
                                        toast.error("You must provide a reason to delete");
                                      }
                                    }}
                                    title="Delete"
                                    className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                              {s.deleted && (
                                <span className="px-2 py-1 text-[9px] tracking-widest bg-destructive/20 text-destructive">DELETED</span>
                              )}
                            </div>
                          </td>
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
              recordSaleMutation.mutate({
                items: [{ product_id: sel.id, quantity: args.qty, price_override: args.soldPrice, size: args.size, color: args.color }],
                sale_channel: args.payment,
                notes: `Size: ${args.size}, Color: ${args.color}, SoldPrice: ${args.soldPrice}`
              }, {
                onSuccess: () => {
                  toast.success(`✓ SALE RECORDED — ${args.payment.toUpperCase()} — ETB ${args.soldPrice.toLocaleString()}`);
                  setSel(null);
                },
                onError: (err: any) => {
                  toast.error(`Sale Failed: ${err.message}`);
                }
              });
            }}
          />
        )}
        {editing && (
          <EditSaleModal
            sale={editing}
            editor={staffName}
            inventory={inventory}
            onClose={() => setEditing(null)}
            onSave={(changes) => {
              editSaleMutation.mutate({ id: editing.id, changes }, {
                onSuccess: () => {
                  toast.success(`Sale updated by ${staffName}`);
                  setEditing(null);
                },
                onError: (err: any) => {
                  toast.error(`Edit Failed: ${err.message}`);
                }
              });
            }}
          />
        )}
        {auditFor && <AuditModal sale={auditFor} onClose={() => setAuditFor(null)} />}
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
  item: any;
  onClose: () => void;
  onConfirm: (a: { color: string; size: string; qty: number; soldPrice: number; payment: PaymentMethod }) => void;
}) => {
  // Handle both comma and slash separators for colors
  const variants = useMemo(() => {
    return (item.variants || []).filter((v: any) => Number(v.qty ?? v.quantity) > 0);
  }, [item.variants]);
  
  const colors = useMemo(() => {
    if (variants.length > 0) {
      return [...new Set(variants.map((v: any) => v.color))].filter(Boolean);
    }
    if (!item.color || item.color === "-") return ["-"];
    return item.color.split(/[,\/]/).map((c: string) => c.trim()).filter(Boolean);
  }, [variants, item.color]);

  const [color, setColor] = useState(colors[0]);

  // Filter available sizes based on selected color
  const availableSizes = useMemo(() => {
    if (variants.length > 0) {
      const raw = variants
        .filter((v: any) => v.color === color)
        .map((v: any) => v.size || "-");
      const unique = [...new Set(raw)] as string[];
      return unique.length > 0 ? unique : ["-"];
    }
    const fromItem = (item.sizes || []).map((s: any) => s || "-");
    const unique = [...new Set(fromItem)] as string[];
    return unique.length > 0 ? unique : ["-"];
  }, [variants, color, item.sizes]);

  const [size, setSize] = useState(availableSizes[0]);

  // Reset size if it's no longer available when color changes
  useEffect(() => {
    if (!availableSizes.includes(size)) {
      setSize(availableSizes[0]);
    }
  }, [color, availableSizes, size]);

  const original = item.price || 0;
  
  // Calculate variant-specific stock quantity
  const variantQty = useMemo(() => {
    if (variants.length > 0 && color) {
      if (availableSizes.length > 0) {
        if (!size) return 0;
        const v = variants.find((v: any) => v.color === color && (v.size === size || (!v.size && size === "-")));
        if (v) return (Number(v.qty ?? v.quantity) || 0);
        
        // Fallback: sum all with matching color if no exact match found
        const colorVariants = variants.filter((v: any) => v.color === color);
        return colorVariants.reduce((acc: number, v: any) => acc + (Number(v.qty ?? v.quantity) || 0), 0);
      }
    }
    return item.qty || 0;
  }, [variants, color, size, availableSizes, item.qty]);

  const [qty, setQty] = useState(1);

  // Enforce max quantity limit whenever variant or variantQty changes
  useEffect(() => {
    if (qty > variantQty && variantQty > 0) {
      setQty(variantQty);
    } else if (variantQty === 0) {
      setQty(0);
    }
  }, [variantQty, qty]);

  const [soldPriceStr, setSoldPriceStr] = useState(String(original));
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
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
    setTimeout(() => onConfirm({ color, size, qty, soldPrice, payment }), 600);
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
            {colors.some(c => c && c !== "-") && (
              <div>
                <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">COLOR</p>
                <div className="flex flex-wrap gap-2">
                  {colors.filter(c => c && c !== "-").map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`flex items-center gap-2 border px-3 py-1.5 text-xs transition-all ${
                        color === c ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: COLOR_HEX[c] || "#555" }}
                      />
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">SIZE</p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => (
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
                <button onClick={() => setQty(Math.min(variantQty, qty + 1))} className="flex h-10 w-10 items-center justify-center border border-border hover:border-primary/50">
                  <Plus className="h-4 w-4" />
                </button>
                <span className="ml-auto text-[10px] tracking-widest text-muted-foreground">{variantQty} IN STOCK</span>
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

            <div>
              <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">PAYMENT METHOD</p>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENTS.map((p) => {
                  const active = payment === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPayment(p.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 border px-2 py-3 text-[10px] tracking-widest transition-colors ${
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p.icon className="h-5 w-5" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-muted-foreground">TOTAL</span>
              <span className="font-display text-2xl text-primary">ETB {total.toLocaleString()}</span>
            </div>
            <button
              onClick={confirm}
              disabled={qty <= 0 || qty > variantQty || success}
              className="w-full bg-primary py-3 font-display text-lg tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {success ? "RECORDING..." : qty > variantQty ? "INSUFFICIENT STOCK" : "CONFIRM SALE"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ----- Edit Sale Modal -----
const EditSaleModal = ({
  sale,
  editor,
  inventory,
  onClose,
  onSave,
}: {
  sale: Sale;
  editor: string;
  inventory: any[];
  onClose: () => void;
  onSave: (changes: { qty: number; price: number; size: string; color: string; payment: PaymentMethod }) => void;
}) => {
  // Find matching inventory item to get variants
  const inventoryItem = useMemo(() =>
    inventory.find((i: any) => String(i.id) === String(sale.itemId)),
    [inventory, sale.itemId]
  );

  const variants = useMemo(() => {
    return (inventoryItem?.variants || []).filter((v: any) => Number(v.qty ?? v.quantity) > 0);
  }, [inventoryItem]);

  const allColors = useMemo(() => {
    if (variants.length > 0) {
      return [...new Set(variants.map((v: any) => v.color))].filter(Boolean) as string[];
    }
    return [];
  }, [variants]);

  const [qty, setQty] = useState(sale.qty);
  const [priceStr, setPriceStr] = useState(String(sale.price));
  const [size, setSize] = useState(sale.size);
  const [color, setColor] = useState(sale.color);
  const [payment, setPayment] = useState<PaymentMethod>(sale.payment);

  const availableSizes = useMemo(() => {
    if (variants.length > 0) {
      const raw = variants
        .filter((v: any) => !color || color === "-" || v.color === color)
        .map((v: any) => v.size || "-");
      return [...new Set(raw)] as string[];
    }
    return [];
  }, [variants, color]);

  // Cycle to next color
  const cycleColor = () => {
    if (allColors.length < 2) return;
    const idx = allColors.indexOf(color);
    const next = allColors[(idx + 1) % allColors.length];
    setColor(next);
    // Reset size if it doesn't exist for new color
    const newSizes = variants
      .filter((v: any) => v.color === next)
      .map((v: any) => v.size || "-");
    const uniqueSizes = [...new Set(newSizes)] as string[];
    if (uniqueSizes.length > 0 && !uniqueSizes.includes(size)) {
      setSize(uniqueSizes[0]);
    }
  };

  // Cycle to next size
  const cycleSize = () => {
    if (availableSizes.length < 2) return;
    const idx = availableSizes.indexOf(size);
    setSize(availableSizes[(idx + 1) % availableSizes.length]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const price = Number(priceStr) || 0;

  const save = () => {
    if (price <= 0) { toast.error("Enter a valid price"); return; }
    if (qty <= 0) { toast.error("Quantity must be at least 1"); return; }
    onSave({ qty, price, size, color, payment });
  };

  const hasColorOptions = allColors.length > 0;
  const hasSizeOptions = availableSizes.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-3 backdrop-blur"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-md flex-col overflow-hidden border border-border bg-card shadow-2xl"
        style={{ maxHeight: "calc(100vh - 1.5rem)" }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-primary">EDIT SALE</p>
            <h2 className="font-display text-2xl">{sale.itemName}</h2>
            <p className="text-[10px] text-muted-foreground">Editor: {editor}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:text-off-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">QUANTITY</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-10 w-10 items-center justify-center border border-border">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-display text-2xl">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="flex h-10 w-10 items-center justify-center border border-border">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">SOLD AT (ETB)</p>
            <div className="flex items-center gap-2 border border-border bg-background px-3">
              <span className="text-xs tracking-widest text-muted-foreground">ETB</span>
              <input
                type="number" min={0} value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                className="flex-1 bg-transparent py-3 font-display text-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* SIZE */}
            <div>
              <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">SIZE</p>
              {hasSizeOptions ? (
                <button
                  onClick={cycleSize}
                  className="group relative w-full flex items-center justify-between border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm font-medium tracking-wider transition-all hover:border-primary hover:bg-primary/10"
                >
                  <span className="font-display text-lg">{size}</span>
                  <span className="flex flex-col items-center">
                    <ChevronLeft className="h-3 w-3 -rotate-90 text-primary/60" />
                    <ChevronRight className="h-3 w-3 -rotate-90 text-primary/60" />
                  </span>
                  {availableSizes.length > 1 && (
                    <span className="absolute -top-1.5 right-2 text-[8px] tracking-widest text-primary/60 bg-card px-1">
                      {availableSizes.indexOf(size) + 1}/{availableSizes.length}
                    </span>
                  )}
                </button>
              ) : (
                <input value={size} onChange={(e) => setSize(e.target.value)} className="w-full border border-border bg-background px-3 py-2 outline-none" />
              )}
            </div>
            {/* COLOR */}
            <div>
              <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">COLOR</p>
              {hasColorOptions ? (
                <button
                  onClick={cycleColor}
                  className="group relative w-full flex items-center justify-between border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm font-medium tracking-wider transition-all hover:border-primary hover:bg-primary/10"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 flex-shrink-0 rounded-full border border-white/20"
                      style={{ backgroundColor:
                        color === 'Black' ? '#000' : color === 'White' ? '#FFF' :
                        color === 'Navy' ? '#1B2A4A' : color === 'Grey' ? '#808080' :
                        color === 'Beige' ? '#C8AD8F' : color === 'Brown' ? '#7B4F2E' :
                        color === 'Red' ? '#CC2200' : color === 'Burgundy' ? '#800020' :
                        color === 'Forest' ? '#2D5A27' : color === 'Olive' ? '#6B7C35' :
                        color === 'Blue' ? '#2255CC' : color === 'Sky' ? '#87CEEB' :
                        color === 'Yellow' ? '#F5C400' : color === 'Orange' ? '#E8621A' :
                        color === 'Pink' ? '#F4A0B0' : color === 'Purple' ? '#6A0DAD' :
                        color === 'Camel' ? '#C19A6B' : color === 'Cream' ? '#F5F0E8' : '#555'
                      }}
                    />
                    <span className="font-display text-sm truncate">{color}</span>
                  </div>
                  <span className="flex flex-col items-center">
                    <ChevronLeft className="h-3 w-3 -rotate-90 text-primary/60" />
                    <ChevronRight className="h-3 w-3 -rotate-90 text-primary/60" />
                  </span>
                  {allColors.length > 1 && (
                    <span className="absolute -top-1.5 right-2 text-[8px] tracking-widest text-primary/60 bg-card px-1">
                      {allColors.indexOf(color) + 1}/{allColors.length}
                    </span>
                  )}
                </button>
              ) : (
                <input value={color} onChange={(e) => setColor(e.target.value)} className="w-full border border-border bg-background px-3 py-2 outline-none" />
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] tracking-widest text-muted-foreground">PAYMENT METHOD</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENTS.map((p) => {
                const active = payment === p.id;
                return (
                  <button
                    key={p.id} type="button" onClick={() => setPayment(p.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 border px-2 py-3 text-[10px] tracking-widest ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}
                  >
                    <p.icon className="h-5 w-5" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <button onClick={save} className="w-full bg-primary py-3 font-display text-lg tracking-widest text-primary-foreground hover:opacity-90">
            SAVE CHANGES
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ----- Audit Trail Modal -----
const AuditModal = ({ sale, onClose }: { sale: Sale; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const actionColor = (a: string) =>
    a === "created" ? "text-primary" : a === "deleted" ? "text-destructive" : "text-warning";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-3 backdrop-blur"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden border border-border bg-card shadow-2xl"
        style={{ maxHeight: "calc(100vh - 1.5rem)" }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-primary">AUDIT TRAIL</p>
            <h2 className="font-display text-xl">{sale.itemName}</h2>
            <p className="text-[10px] text-muted-foreground">Sale ID: {sale.id.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:text-off-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <ol className="relative space-y-4 border-l border-border pl-5">
            {sale.audit.map((entry, i) => (
              <li key={i} className="relative">
                <span className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background ${entry.action === "created" ? "bg-primary" : entry.action === "deleted" ? "bg-destructive" : "bg-warning"}`} />
                <p className={`text-xs tracking-widest uppercase ${actionColor(entry.action)}`}>{entry.action}</p>
                <p className="mt-0.5 text-sm">By <span className="text-primary">{entry.by || "Unknown"}</span></p>
                <p className="text-[10px] text-muted-foreground">{entry.at.toLocaleString()}</p>
                {entry.changes && (
                  <p className="mt-1 text-xs text-off-white">{entry.changes}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SalesPortal;

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, X, Plus, Minus, Check, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { InventoryItem } from "@/data/inventory";

const cats = ["ALL","Shoes","Tops","Bottoms","Accessories"] as const;

const SalesPortal = () => {
  const { inventory, recordSale, sales, staffName, setStaffName } = useApp();
  const nav = useNavigate();
  const [now, setNow] = useState(new Date());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("ALL");
  const [sel, setSel] = useState<InventoryItem | null>(null);
  const [view, setView] = useState<"catalog" | "log">("catalog");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!staffName) nav("/login/sales");
  }, [staffName, nav]);

  const filtered = useMemo(() => inventory.filter((i) => {
    if (cat !== "ALL" && i.category !== cat) return false;
    if (q && !`${i.brand} ${i.name}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [inventory, q, cat]);

  const totalToday = sales.reduce((a, b) => a + (b.price * b.qty), 0);

  return (
    <div className="grain min-h-screen bg-charcoal text-off-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur px-6 py-3">
        <div>
          <p className="font-display text-xl tracking-wider">SAWKEM FASHION</p>
          <p className="text-[10px] tracking-widest text-muted-foreground">SUMMIT BRANCH</p>
        </div>
        <p className="text-xs tracking-widest text-primary">{staffName?.toUpperCase()}</p>
        <div className="text-right">
          <p className="font-display text-xl">{now.toLocaleTimeString()}</p>
          <p className="text-[10px] text-muted-foreground">{now.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-3">
            <button onClick={() => setView("catalog")} className={`px-4 py-2 text-xs tracking-widest border ${view === "catalog" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>CATALOG</button>
            <button onClick={() => setView("log")} className={`px-4 py-2 text-xs tracking-widest border ${view === "log" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>TODAY'S LOG ({sales.length})</button>
          </div>
          <button onClick={() => { setStaffName(""); nav("/"); }} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-off-white">
            <LogOut className="h-4 w-4" /> END SHIFT
          </button>
        </div>

        {view === "catalog" ? (
          <>
            <div className="flex items-center gap-2 border border-border bg-card px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent py-3 outline-none" />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {cats.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 text-xs tracking-widest border whitespace-nowrap ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                  {c.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    className="relative border border-border bg-card overflow-hidden hover:border-primary/60 hover:shadow-[0_0_20px_hsl(81_100%_67%/0.15)]"
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center font-display text-7xl text-primary/60">
                      {it.brand[0]}
                    </div>
                    <span className={`absolute top-2 right-2 px-2 py-1 text-[10px] tracking-widest ${out ? "bg-destructive text-destructive-foreground" : low ? "bg-warning text-warning-foreground" : "bg-background/80 text-off-white"}`}>
                      {out ? "OUT" : low ? `LOW (${it.qty})` : `${it.qty} LEFT`}
                    </span>
                    <div className="p-3 space-y-2">
                      <p className="text-[10px] tracking-widest text-primary">{it.brand.toUpperCase()}</p>
                      <p className="font-display text-xl leading-tight">{it.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {it.sizes.slice(0, 5).map((s) => (
                          <span key={s} className={`text-[10px] px-1.5 py-0.5 border ${out ? "border-border text-muted-foreground line-through" : "border-border"}`}>{s}</span>
                        ))}
                      </div>
                      <button
                        disabled={out}
                        onClick={() => setSel(it)}
                        className="w-full bg-off-white text-background py-2 text-xs tracking-widest font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        RECORD SALE
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="border border-border bg-card p-6">
            <div className="flex justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-display text-2xl">TODAY'S LOG — SUMMIT</h2>
              <p className="font-display text-xl">
                {sales.length} SALES — <span className="text-primary">ETB {totalToday.toLocaleString()}</span>
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
                    <th className="p-2 text-left">COLOR</th>
                    <th className="p-2 text-left">QTY</th>
                    <th className="p-2 text-left">PRICE</th>
                    <th className="p-2 text-left">STAFF</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No sales recorded yet today.</td></tr>
                  )}
                  {sales.map((s) => (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="p-2 text-xs">{s.time.toLocaleTimeString()}</td>
                      <td className="p-2">{s.itemName}</td>
                      <td className="p-2 text-[10px] tracking-widest text-primary">{s.brand.toUpperCase()}</td>
                      <td className="p-2">{s.size}</td>
                      <td className="p-2 text-xs">{s.color}</td>
                      <td className="p-2">{s.qty}</td>
                      <td className="p-2 font-display text-lg">ETB {(s.price * s.qty).toLocaleString()}</td>
                      <td className="p-2 text-xs">{s.staff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {sel && <RecordSaleModal item={sel} onClose={() => setSel(null)} onConfirm={(args) => {
          recordSale({ itemId: sel.id, itemName: sel.name, brand: sel.brand, size: args.size, color: args.color, qty: args.qty, price: sel.price || 0, staff: staffName });
          toast.success(`✓ SALE RECORDED — ${sel.name.toUpperCase()} ${args.size}`);
          setSel(null);
        }} />}
      </AnimatePresence>
    </div>
  );
};

const RecordSaleModal = ({ item, onClose, onConfirm }: {
  item: InventoryItem;
  onClose: () => void;
  onConfirm: (a: { color: string; size: string; qty: number }) => void;
}) => {
  const colors = item.color.split("/").map((c) => c.trim());
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(item.sizes[0]);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState("");
  const [success, setSuccess] = useState(false);

  const press = (n: string) => {
    if (n === "C") return setPin("");
    if (n === "<") return setPin((p) => p.slice(0, -1));
    if (pin.length < 4) setPin((p) => p + n);
  };

  const confirm = () => {
    if (pin !== "1234") return toast.error("INVALID PIN");
    setSuccess(true);
    setTimeout(() => onConfirm({ color, size, qty }), 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9 }}
        className="relative w-full max-w-2xl bg-card border border-border my-8"
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-off-white">
          <X className="h-5 w-5" />
        </button>

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-primary/20"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <Check className="h-32 w-32 text-primary" strokeWidth={3} />
            </motion.div>
          </motion.div>
        )}

        <div className="p-6 space-y-5">
          <div className="aspect-[3/1] bg-muted flex items-center justify-center font-display text-7xl text-primary">
            {item.brand[0]}
          </div>
          <div>
            <p className="text-[10px] tracking-widest text-primary">{item.brand.toUpperCase()}</p>
            <h2 className="font-display text-3xl">{item.name}</h2>
          </div>

          <div>
            <p className="text-[10px] tracking-widest text-muted-foreground mb-2">COLOR</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`px-3 py-1 text-xs border ${color === c ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{c}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest text-muted-foreground mb-2">SIZE</p>
            <div className="flex flex-wrap gap-2">
              {item.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 text-xs border ${size === s ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest text-muted-foreground mb-2">QUANTITY</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="border border-border w-10 h-10 flex items-center justify-center"><Minus className="h-4 w-4" /></button>
              <span className="font-display text-3xl w-12 text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(item.qty, qty + 1))} className="border border-border w-10 h-10 flex items-center justify-center"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest text-muted-foreground mb-2">STAFF PIN</p>
            <div className="flex gap-2 mb-3">
              {[0,1,2,3].map((i) => (
                <div key={i} className={`w-12 h-12 border ${pin.length > i ? "border-primary bg-primary/10" : "border-border"} flex items-center justify-center text-2xl`}>
                  {pin.length > i ? "•" : ""}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9","C","0","<"].map((n) => (
                <button key={n} onClick={() => press(n)} className="border border-border py-3 font-display text-xl hover:bg-muted">{n}</button>
              ))}
            </div>
          </div>

          <button onClick={confirm} className="w-full bg-primary py-4 font-display text-xl tracking-widest text-primary-foreground">
            CONFIRM SALE
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SalesPortal;

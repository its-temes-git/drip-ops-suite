import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const statusOf = (qty: number) =>
  qty === 0 ? "OUT" : qty <= 3 ? "LOW" : "IN";

const InventoryPage = () => {
  const { inventory } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");
  const [brand, setBrand] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [open, setOpen] = useState<number | null>(null);

  const brands = Array.from(new Set(inventory.map((i) => i.brand))).sort();
  const cats = Array.from(new Set(inventory.map((i) => i.category)));

  const filtered = useMemo(() => {
    return inventory.filter((i) => {
      if (q && !`${i.brand} ${i.name}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "ALL" && i.category !== cat) return false;
      if (brand !== "ALL" && i.brand !== brand) return false;
      const s = statusOf(i.qty);
      if (status === "IN" && s !== "IN") return false;
      if (status === "LOW" && s !== "LOW") return false;
      if (status === "OUT" && s !== "OUT") return false;
      return true;
    });
  }, [inventory, q, cat, brand, status]);

  const selected = inventory.find((i) => i.id === open);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl tracking-wide">FULL INVENTORY</h1>
        <p className="text-xs tracking-widest text-muted-foreground">SUMMIT BRANCH — {filtered.length} ITEMS</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 border border-border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search inventory..."
            className="flex-1 bg-transparent py-3 text-sm outline-none"
          />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="border border-border bg-card px-3 py-3 text-xs tracking-widest">
          <option value="ALL">CATEGORY</option>
          {cats.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
        </select>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="border border-border bg-card px-3 py-3 text-xs tracking-widest">
          <option value="ALL">BRAND</option>
          {brands.map((b) => <option key={b} value={b}>{b.toUpperCase()}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-border bg-card px-3 py-3 text-xs tracking-widest">
          <option value="ALL">ALL STATUS</option>
          <option value="IN">IN STOCK</option>
          <option value="LOW">LOW STOCK</option>
          <option value="OUT">OUT</option>
        </select>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">IMG</th>
              <th className="p-3 text-left">BRAND</th>
              <th className="p-3 text-left">ITEM</th>
              <th className="p-3 text-left">CAT</th>
              <th className="p-3 text-left">SIZES</th>
              <th className="p-3 text-left">COLOR</th>
              <th className="p-3 text-left">QTY</th>
              <th className="p-3 text-left">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i, idx) => {
              const s = statusOf(i.qty);
              return (
                <motion.tr
                  key={i.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                  onClick={() => setOpen(i.id)}
                  className="border-b border-border/50 cursor-pointer hover:bg-off-white/[0.04]"
                >
                  <td className="p-3 text-muted-foreground">{i.id}</td>
                  <td className="p-3">
                    <div className="h-10 w-10 bg-muted flex items-center justify-center font-display text-sm text-primary">
                      {i.brand[0]}
                    </div>
                  </td>
                  <td className="p-3 text-[10px] tracking-widest text-primary">{i.brand.toUpperCase()}</td>
                  <td className="p-3 font-medium">{i.name}</td>
                  <td className="p-3 text-muted-foreground text-xs">{i.category}</td>
                  <td className="p-3 text-xs text-muted-foreground">{i.sizes.join(", ")}</td>
                  <td className="p-3 text-xs">{i.color}</td>
                  <td className="p-3 font-display text-lg">{i.qty}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-1 text-[10px] tracking-widest ${
                      s === "IN" ? "bg-primary text-primary-foreground" :
                      s === "LOW" ? "bg-warning text-warning-foreground" :
                      "bg-destructive text-destructive-foreground"
                    }`}>
                      {s === "IN" ? "IN STOCK" : s === "LOW" ? "LOW STOCK" : "OUT"}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="bg-card border-border text-off-white">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-3xl text-off-white">{selected.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="aspect-square w-full bg-muted flex items-center justify-center font-display text-7xl text-primary">
                  {selected.brand[0]}
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-[10px] tracking-widest text-primary">{selected.brand.toUpperCase()}</p>
                  <p><span className="text-muted-foreground">Category:</span> {selected.category}</p>
                  <p><span className="text-muted-foreground">Color:</span> {selected.color}</p>
                  <p><span className="text-muted-foreground">Sizes:</span> {selected.sizes.join(", ")}</p>
                  <p><span className="text-muted-foreground">Quantity:</span> <span className="font-display text-2xl">{selected.qty}</span></p>
                  {selected.price && <p><span className="text-muted-foreground">Price:</span> ETB {selected.price.toLocaleString()}</p>}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default InventoryPage;

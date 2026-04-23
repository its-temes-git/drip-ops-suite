import { motion } from "framer-motion";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

const LowStock = () => {
  const { inventory, restock } = useApp();
  const items = inventory.filter((i) => i.qty <= 4);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <span className="pulse-dot h-3 w-3 rounded-full bg-warning" />
          <h1 className="font-display text-3xl sm:text-5xl tracking-wide">LOW STOCK ALERTS</h1>
        </div>
        <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground mt-1">ITEMS WITH 4 OR FEWER UNITS</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="border border-warning/40 bg-card p-5"
          >
            <p className="text-[10px] tracking-widest text-primary">{it.brand.toUpperCase()}</p>
            <p className="font-display text-2xl mt-1">{it.name}</p>
            <p className="text-xs text-muted-foreground">{it.category} • {it.sizes.join(", ")}</p>
            <p className="font-display text-7xl text-warning mt-4">{it.qty}</p>
            <p className="text-[10px] tracking-widest text-muted-foreground">UNITS LEFT</p>
            <button
              onClick={() => { restock(it.id, 5); toast.success(`+5 ${it.name.toUpperCase()} RESTOCKED`); }}
              className="mt-4 w-full border border-border py-2 text-xs tracking-widest hover:border-primary hover:text-primary"
            >
              MARK AS RESTOCKED
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LowStock;

import { motion } from "framer-motion";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const LowStock = () => {
  const { user } = useApp();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.owner.dashboard()
  });

  const restockMutation = useMutation({
    mutationFn: (args: { product_id: string, quantity: number }) => 
      api.owner.restock({ product_id: args.product_id, branch_id: user?.branch_id || '1', quantity: args.quantity, note: "Restocked from alerts" }),
    onSuccess: (_, args) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`+${args.quantity} RESTOCKED`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to restock");
    }
  });

  const items = data?.low_stock_alerts || [];

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
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">No low stock items. All good!</p>
        ) : items.map((it: any, i: number) => (
          <motion.div
            key={it.id || i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="border border-warning/40 bg-card p-5"
          >
            <p className="text-[10px] tracking-widest text-primary">{it.brand?.toUpperCase() || "SAWKEM"}</p>
            <p className="font-display text-2xl mt-1">{it.name}</p>
            <p className="text-xs text-muted-foreground">{it.category || "General"} • {(it.sizes || []).join(", ")}</p>
            <p className="font-display text-7xl text-warning mt-4">{it.qty || it.quantity || 0}</p>
            <p className="text-[10px] tracking-widest text-muted-foreground">UNITS LEFT</p>
            <button
              onClick={() => restockMutation.mutate({ product_id: it.id || it.product_id, quantity: 5 })}
              disabled={restockMutation.isPending}
              className="mt-4 w-full border border-border py-2 text-xs tracking-widest hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {restockMutation.isPending ? "RESTOCKING..." : "MARK AS RESTOCKED"}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LowStock;

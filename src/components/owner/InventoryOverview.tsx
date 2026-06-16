import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CategorySummary {
  category: string;
  quantity: number;
  styles: number;
}

const InventoryOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: () => api.owner.inventorySummary()
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const categories: CategorySummary[] = data?.categories || [];
  const totalItems = data?.totalItems || 0;

  // Calculate max quantity for progress bar scaling
  const maxQty = Math.max(...categories.map(c => c.quantity), 1);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl tracking-wide uppercase">INVENTORY OVERVIEW</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((c, i) => (
          <motion.div
            key={c.category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-border bg-card p-5 relative overflow-hidden group hover:border-primary/40 transition-colors"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase mb-2">{c.category}</p>
                <h3 className="font-display text-4xl text-off-white">{c.quantity}</h3>
                <p className="text-[10px] tracking-widest text-muted-foreground mt-1">{c.styles} styles</p>
              </div>
              
              <div className="mt-6 w-full bg-border/30 h-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.quantity / maxQty) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        ))}

        {/* Total Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categories.length * 0.05 }}
          className="border-2 border-primary bg-primary/5 p-5 relative overflow-hidden"
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="text-[10px] tracking-widest text-primary font-bold uppercase mb-2">SUMMIT TOTAL</p>
              <h3 className="font-display text-4xl text-primary">{totalItems}</h3>
              <p className="text-[10px] tracking-widest text-muted-foreground mt-1">items in stock</p>
            </div>
            
            <div className="mt-6 w-full bg-primary/20 h-1" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InventoryOverview;

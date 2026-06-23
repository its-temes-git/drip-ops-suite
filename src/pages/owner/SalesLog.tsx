import { useState, useMemo } from "react";
import { format, isSameDay, addDays, subDays, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatCard } from "@/components/owner/StatCard";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SalesLog = () => {
  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const today = startOfDay(new Date());
  const isToday = isSameDay(date, today);

  const dateStr = format(date, "yyyy-MM-dd");
  const startDate = dateStr;
  const endDate = dateStr;

  const { data: rawSalesData, isLoading } = useQuery({
    queryKey: ['sales-log', startDate, endDate],
    queryFn: () => api.owner.sales({ startDate, endDate, limit: 100 })
  });

  // Guard: API may return paginated object with rows or an array directly
  const daySales: any[] = Array.isArray(rawSalesData) 
    ? rawSalesData 
    : (rawSalesData?.rows || []);

  const [viewingReason, setViewingReason] = useState<string | null>(null);

  const activeSales = daySales.filter((s: any) => s.status !== 'refunded');
  const totalRevenue = activeSales.reduce((sum: number, s: any) => sum + Number(s.total_amount || 0), 0);
  const totalItems = activeSales.reduce((sum: number, s: any) => {
    const items = s.items || [];
    return sum + items.reduce((iSum: number, i: any) => iSum + (i.quantity || 0), 0);
  }, 0);

  const totalProfit = activeSales.reduce((sum: number, s: any) => {
    const items = s.items || [];
    const saleCost = items.reduce((iSum: number, i: any) => iSum + (Number(i.cost_price) || 0) * (Number(i.quantity) || 0), 0);
    return sum + (Number(s.total_amount || 0) - saleCost);
  }, 0);

  const getReason = (notes: string) => {
    const match = notes?.match(/\[REFUND REASON\]:\s*(.*)/);
    return match ? match[1] : "No reason provided";
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-5xl tracking-wide">SALES LOG</h1>
          <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">
            {isToday ? "TODAY" : format(date, "EEEE").toUpperCase()} — {format(date, "MMM d, yyyy")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate((d) => subDays(d, 1))}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> PREV
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(date, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(startOfDay(d))}
                disabled={(d) => d > today}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="sm"
            disabled={isToday}
            onClick={() => setDate((d) => (isSameDay(addDays(d, 1), today) ? today : addDays(d, 1)))}
            className="gap-1"
          >
            NEXT <ChevronRight className="h-4 w-4" />
          </Button>
          {!isToday && (
            <Button size="sm" onClick={() => setDate(today)}>
              TODAY
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="ITEMS SOLD" value={`${totalItems}`} sub={<span className="text-muted-foreground">{activeSales.length} active sales</span>} />
        <StatCard label="REVENUE" value={`ETB ${totalRevenue.toLocaleString()}`} accent="primary" />
        <StatCard
          label="PROFIT"
          value={`ETB ${totalProfit.toLocaleString()}`}
        />
      </div>

      <div className="border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">
            {isToday ? "TODAY'S ITEMS" : `ITEMS SOLD — ${format(date, "MMM d")}`}
          </h2>
          <div className="flex gap-4 text-[10px] tracking-widest text-muted-foreground">
             <span>TOTAL: {daySales.length}</span>
             <span className="text-destructive">REFUNDED: {daySales.length - activeSales.length}</span>
          </div>
        </div>
        {isLoading ? (
          <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : daySales.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No sales recorded on this day.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
                  <th className="p-2 text-left">TIME</th>
                  <th className="p-2 text-left">PRODUCT</th>
                  <th className="p-2 text-left">SIZE / COLOR</th>
                  <th className="p-2 text-left">QTY</th>
                  <th className="p-2 text-left">PAYMENT</th>
                  <th className="p-2 text-left">STAFF / STATUS</th>
                  <th className="p-2 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {daySales.map((s: any, i: number) => {
                  const items = s.items || [];
                  const firstItem = items[0] || {};
                  const totalQty = items.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
                  const isRefunded = s.status === 'refunded';
                  
                  // Extract size and color from notes
                  const sizeMatch = s.notes?.match(/Size:\s*([^,]+)/);
                  const colorMatch = s.notes?.match(/Color:\s*([^,]+)/);
                  const size = sizeMatch ? sizeMatch[1].trim() : "-";
                  const color = colorMatch ? colorMatch[1].trim() : "-";

                  return (
                    <tr key={s.id || i} className={cn(
                      "border-b border-border/50 transition-colors",
                      isRefunded ? "bg-destructive/5 opacity-50" : "hover:bg-muted/30"
                    )}>
                      <td className="p-2 text-xs text-muted-foreground">
                        {format(new Date(s.sold_at || Date.now()), "HH:mm")}
                      </td>
                      <td className={cn("p-2", isRefunded && "line-through")}>
                        <div className="flex flex-col">
                          <span className="text-[10px] tracking-widest text-primary font-bold">{(firstItem.brand || "SAWKEM").toUpperCase()}</span>
                          <span className="font-medium">{firstItem.product_name_snap || "Item"}</span>
                        </div>
                      </td>
                      <td className={cn("p-2 text-xs", isRefunded && "line-through")}>
                        <span className="text-muted-foreground">{size}</span>
                        <span className="mx-1">/</span>
                        <span className="text-muted-foreground">{color}</span>
                      </td>
                      <td className={cn("p-2 font-display text-xl", isRefunded ? "text-muted-foreground" : "text-primary")}>
                        {totalQty}
                      </td>
                      <td className="p-2 text-[10px] tracking-widest">{s.sale_channel?.toUpperCase()}</td>
                      <td className="p-2">
                        {isRefunded ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-[9px] font-bold tracking-widest rounded-sm">REFUNDED</span>
                            <button 
                              onClick={() => setViewingReason(getReason(s.notes))}
                              className="px-2 py-0.5 border border-destructive/30 text-[8px] font-bold tracking-widest hover:bg-destructive hover:text-white transition-colors uppercase"
                            >
                              REASON
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs">{s.sold_by}</span>
                        )}
                      </td>
                      <td className={cn("p-2 text-right font-display text-lg", isRefunded && "line-through text-muted-foreground")}>
                        ETB {(s.total_amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewingReason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingReason(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden border border-border bg-card shadow-2xl"
            >
              <div className="border-b border-border bg-primary/10 px-5 py-4">
                <h3 className="font-display text-xl tracking-wider text-primary">REFUND REASON</h3>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-off-white italic">
                  "{viewingReason}"
                </p>
                <Button 
                  onClick={() => setViewingReason(null)}
                  className="mt-6 w-full tracking-[0.2em] font-bold"
                >
                  CLOSE
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalesLog;

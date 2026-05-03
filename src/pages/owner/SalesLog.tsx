import { useState, useMemo } from "react";
import { format, isSameDay, addDays, subDays, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatCard } from "@/components/owner/StatCard";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const SalesLog = () => {
  const { sales } = useApp();
  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const today = startOfDay(new Date());
  const isToday = isSameDay(date, today);

  const daySales = useMemo(
    () => sales.filter((s) => !s.deleted && isSameDay(s.time, date)),
    [sales, date]
  );

  const totalRevenue = daySales.reduce((sum, s) => sum + s.price * s.qty, 0);
  const totalItems = daySales.reduce((sum, s) => sum + s.qty, 0);

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
        <StatCard label="ITEMS SOLD" value={`${totalItems}`} sub={<span className="text-muted-foreground">{daySales.length} transactions</span>} />
        <StatCard label="REVENUE" value={`ETB ${totalRevenue.toLocaleString()}`} accent="primary" />
        <StatCard
          label="AVG SALE"
          value={`ETB ${daySales.length ? Math.round(totalRevenue / daySales.length).toLocaleString() : 0}`}
        />
      </div>

      <div className="border border-border bg-card p-4 sm:p-6">
        <h2 className="font-display text-2xl mb-4">
          {isToday ? "TODAY'S ITEMS" : `ITEMS SOLD — ${format(date, "MMM d")}`}
        </h2>
        {daySales.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No sales recorded on this day.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
                  <th className="p-2 text-left">TIME</th>
                  <th className="p-2 text-left">ITEM</th>
                  <th className="p-2 text-left">BRAND</th>
                  <th className="p-2 text-left">SIZE</th>
                  <th className="p-2 text-left">QTY</th>
                  <th className="p-2 text-left">PAYMENT</th>
                  <th className="p-2 text-left">STAFF</th>
                  <th className="p-2 text-right">PRICE</th>
                </tr>
              </thead>
              <tbody>
                {daySales.map((s) => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="p-2 text-xs text-muted-foreground">{format(s.time, "HH:mm")}</td>
                    <td className="p-2">{s.itemName}</td>
                    <td className="p-2 text-[10px] tracking-widest text-primary">{s.brand.toUpperCase()}</td>
                    <td className="p-2">{s.size}</td>
                    <td className="p-2">{s.qty}</td>
                    <td className="p-2 text-xs">{s.payment}</td>
                    <td className="p-2 text-xs">{s.staff}</td>
                    <td className="p-2 text-right font-display text-lg">
                      ETB {(s.price * s.qty).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesLog;

import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Box, BarChart3, Zap, User, Settings, LogOut, ShoppingBag, Receipt } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MOCK_TRANSACTIONS } from "@/data/inventory";
import { toast } from "sonner";

const navItems = [
  { to: "/owner", label: "DASHBOARD", icon: LayoutGrid, end: true },
  { to: "/owner/inventory", label: "INVENTORY", icon: Box },
  { to: "/owner/sales-log", label: "SALES LOG", icon: Receipt },
  { to: "/owner/analytics", label: "ANALYTICS", icon: BarChart3 },
  { to: "/owner/drop", label: "NEW DROP", icon: Zap },
  { to: "/owner/staff", label: "STAFF", icon: User },
  { to: "/owner/settings", label: "SETTINGS", icon: Settings },
];

const Hamburger = ({ open }: { open: boolean }) => (
  <div className="relative h-5 w-6">
    <motion.span
      className="absolute left-0 block h-0.5 w-6 bg-current"
      animate={open ? { top: 9, rotate: 45 } : { top: 2, rotate: 0 }}
      transition={{ duration: 0.25 }}
    />
    <motion.span
      className="absolute left-0 top-[9px] block h-0.5 w-6 bg-current"
      animate={open ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.2 }}
    />
    <motion.span
      className="absolute left-0 block h-0.5 w-6 bg-current"
      animate={open ? { top: 9, rotate: -45 } : { top: 16, rotate: 0 }}
      transition={{ duration: 0.25 }}
    />
  </div>
);

export const OwnerLayout = () => {
  const { setOwnerLoggedIn } = useApp();
  // Items sold today = transactions whose time string doesn't start with "Yesterday"
  const soldToday = MOCK_TRANSACTIONS.filter((t) => !t.time.toLowerCase().startsWith("yesterday")).length;
  const revenueToday = MOCK_TRANSACTIONS
    .filter((t) => !t.time.toLowerCase().startsWith("yesterday"))
    .reduce((sum, t) => sum + t.price, 0);

  const showSalesToday = () => {
    toast.success(`${soldToday} items sold today`, {
      description: `Total revenue: ETB ${revenueToday.toLocaleString()}`,
    });
  };

  const nav = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 overflow-y-auto py-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `relative flex h-12 items-center gap-4 px-5 text-xs tracking-widest transition-colors ${
              isActive
                ? "border-l-2 border-primary bg-primary/5 text-primary"
                : "border-l-2 border-transparent text-muted-foreground hover:text-off-white"
            }`
          }
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="overflow-hidden whitespace-nowrap md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
            {item.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="grain min-h-screen bg-background text-off-white">
      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-sidebar px-4">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center text-off-white"
        >
          <Hamburger open={mobileOpen} />
        </button>
        <span className="font-display text-2xl text-primary">SAWKEM</span>
        <div className="flex items-center gap-2">
          <button
            onClick={showSalesToday}
            aria-label="Items sold today"
            className="flex items-center gap-1.5 rounded-sm bg-primary/15 px-2 py-1 text-[10px] font-medium tracking-widest text-primary transition-colors hover:bg-primary/25"
          >
            <ShoppingBag className="h-3 w-3" />
            {soldToday}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="group fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col border-r border-border bg-sidebar transition-all duration-300 hover:w-60 md:flex">
        <div className="flex h-16 items-center justify-center border-b border-border">
          <span className="font-display text-3xl text-primary">S</span>
        </div>
        <NavList />
        <div className="space-y-3 border-t border-border p-4">
          <button
            onClick={() => { setOwnerLoggedIn(false); nav("/"); }}
            className="flex items-center gap-3 text-xs text-muted-foreground hover:text-off-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="opacity-0 transition-opacity group-hover:opacity-100">LOGOUT</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="pulse-dot h-2 w-2 rounded-full bg-primary" />
            <span className="text-[10px] tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100">
              LIVE
            </span>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 top-14 z-40 bg-black/60 md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              className="fixed left-0 top-14 z-50 flex h-[calc(100vh-3.5rem)] w-72 max-w-[80vw] flex-col border-r border-border bg-sidebar md:hidden"
            >
              <NavList onNavigate={() => setMobileOpen(false)} />
              <div className="space-y-3 border-t border-border p-4">
                <button
                  onClick={() => { setOwnerLoggedIn(false); nav("/"); }}
                  className="flex items-center gap-3 text-xs text-muted-foreground hover:text-off-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span>LOGOUT</span>
                </button>
                <div className="flex items-center gap-3">
                  <span className="pulse-dot h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] tracking-widest text-primary">LIVE</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 px-4 py-6 md:ml-16 md:p-10"
      >
        <div className="fixed right-6 top-6 z-30 hidden md:flex items-center gap-3">
          <button
            onClick={showSalesToday}
            className="flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-medium tracking-widest text-primary transition-colors hover:bg-primary/20"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {soldToday} SOLD TODAY
          </button>
          <ThemeToggle />
        </div>
        <Outlet />
      </motion.main>
    </div>
  );
};

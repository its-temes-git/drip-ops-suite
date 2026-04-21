import { ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, Box, BarChart3, Zap, AlertTriangle, User, Settings, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { to: "/owner", label: "DASHBOARD", icon: LayoutGrid, end: true },
  { to: "/owner/inventory", label: "INVENTORY", icon: Box },
  { to: "/owner/analytics", label: "ANALYTICS", icon: BarChart3 },
  { to: "/owner/drop", label: "NEW DROP", icon: Zap },
  { to: "/owner/alerts", label: "LOW STOCK", icon: AlertTriangle },
  { to: "/owner/staff", label: "STAFF", icon: User },
  { to: "/owner/settings", label: "SETTINGS", icon: Settings },
];

export const OwnerLayout = () => {
  const { inventory, setOwnerLoggedIn } = useApp();
  const lowCount = inventory.filter((i) => i.qty <= 3).length;
  const nav = useNavigate();

  return (
    <div className="grain flex min-h-screen bg-background text-off-white">
      <aside className="group fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r border-border bg-sidebar transition-all duration-300 hover:w-60">
        <div className="flex h-16 items-center justify-center border-b border-border">
          <span className="font-display text-3xl text-primary">S</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex h-12 items-center gap-4 px-5 text-xs tracking-widest transition-colors ${
                  isActive
                    ? "border-l-2 border-primary bg-primary/5 text-primary"
                    : "border-l-2 border-transparent text-muted-foreground hover:text-off-white"
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
              {item.to === "/owner/alerts" && lowCount > 0 && (
                <span className="ml-auto rounded-sm bg-warning px-1.5 py-0.5 text-[10px] text-warning-foreground opacity-100 group-hover:opacity-100">
                  {lowCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4 space-y-3">
          <button
            onClick={() => { setOwnerLoggedIn(false); nav("/"); }}
            className="flex items-center gap-3 text-xs text-muted-foreground hover:text-off-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">LOGOUT</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="pulse-dot h-2 w-2 rounded-full bg-primary" />
            <span className="text-[10px] tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              LIVE
            </span>
          </div>
        </div>
      </aside>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="ml-16 flex-1 p-6 md:p-10"
      >
        <div className="fixed right-6 top-6 z-30">
          <ThemeToggle />
        </div>
        <Outlet />
      </motion.main>
    </div>
  );
};

import { motion } from "framer-motion";
import { ReactNode } from "react";

export const StatCard = ({
  label,
  value,
  sub,
  accent,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  accent?: "primary" | "warning";
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4 }}
    className="border border-border bg-card p-5 transition-colors hover:border-primary/40"
  >
    <p className="text-[10px] tracking-widest text-muted-foreground">{label}</p>
    <p
      className={`mt-3 font-display text-5xl ${
        accent === "warning" ? "text-warning" : accent === "primary" ? "text-primary" : "text-off-white"
      }`}
    >
      {value}
    </p>
    {sub && <div className="mt-2 text-xs">{sub}</div>}
  </motion.div>
);

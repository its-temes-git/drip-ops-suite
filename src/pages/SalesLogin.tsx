import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

const SalesLogin = () => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const nav = useNavigate();
  const { setStaffName } = useApp();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("ENTER STAFF NAME");
    if (pin === "1234") {
      setStaffName(name.trim());
      toast.success(`SHIFT STARTED — ${name.toUpperCase()}`);
      setTimeout(() => nav("/sales"), 400);
    } else {
      toast.error("INVALID PIN");
    }
  };

  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-charcoal px-6">
      <Link
        to="/login"
        className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary md:left-10 md:top-8"
      >
        <ArrowLeft className="h-3 w-3" /> BACK
      </Link>
      <Link
        to="/"
        className="absolute right-6 top-6 z-20 text-[10px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary md:right-10 md:top-8"
      >
        HOME →
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="text-center font-display text-5xl tracking-wider text-off-white">SAWKEM</h1>
        <p className="mb-12 text-center text-xs tracking-[0.3em] text-muted-foreground">
          SALES ACCESS — SUMMIT BRANCH
        </p>

        <form onSubmit={submit} className="space-y-8">
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">STAFF NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 text-off-white outline-none focus:border-primary"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">4-DIGIT PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 text-2xl tracking-[1em] text-off-white outline-none focus:border-primary"
              placeholder="••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-off-white py-4 font-display text-xl tracking-widest text-background"
          >
            START SHIFT
          </motion.button>
        </form>

        <p className="mt-8 text-center text-[10px] text-muted-foreground">PIN: 1234</p>
      </motion.div>
    </div>
  );
};

export default SalesLogin;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

const SalesLogin = () => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useApp();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("ENTER STAFF EMAIL");
    setIsLoading(true);
    try {
      const response = await api.auth.login({ email, password: pin });
      login(response.token, response.user);
      toast.success(`SHIFT STARTED — ${response.user.full_name.toUpperCase()}`);
      setTimeout(() => nav("/sales"), 400);
    } catch (error: any) {
      toast.error(error.message || "INVALID CREDENTIALS");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-charcoal px-6">
      <Link
        to="/login"
        aria-label="Back"
        className="absolute left-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-off-white backdrop-blur transition-colors hover:border-primary hover:text-primary md:left-10 md:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
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
            <label className="text-[10px] tracking-widest text-muted-foreground">STAFF EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 text-off-white outline-none focus:border-primary"
              placeholder="Your email"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">4-DIGIT PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 text-2xl tracking-[1em] text-off-white outline-none focus:border-primary"
              placeholder="••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-off-white py-4 font-display text-xl tracking-widest text-background disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "START SHIFT"}
          </motion.button>
        </form>

      </motion.div>
    </div>
  );
};

export default SalesLogin;

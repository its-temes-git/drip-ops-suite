import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { BrandMarquee } from "@/components/BrandMarquee";
import { api } from "@/lib/api";

const OwnerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useApp();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.auth.login({ email, password });
      login(response.token, response.user);
      toast.success("ACCESS GRANTED");
      setTimeout(() => nav("/owner"), 400);
    } catch (error: any) {
      toast.error(error.message || "INVALID CREDENTIALS");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <BrandMarquee />
      </div>
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
        className="relative z-10 w-full max-w-md"
      >
        <h1 className="text-center font-display text-6xl tracking-wider">SAWKEM</h1>
        <p className="mb-12 text-center text-xs tracking-[0.4em] text-muted-foreground">OWNER ACCESS</p>

        <form onSubmit={submit} className="space-y-8">
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 text-off-white outline-none focus:border-primary"
              placeholder="owner@sawkem.com"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 text-off-white outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-primary py-4 font-display text-xl tracking-widest text-primary-foreground disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "ENTER DASHBOARD"}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-[10px] text-muted-foreground">
          owner@sawkem.com / sawkem2024
        </p>
      </motion.div>
    </div>
  );
};

export default OwnerLogin;

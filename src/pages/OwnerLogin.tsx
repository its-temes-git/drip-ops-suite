import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { BrandMarquee } from "@/components/BrandMarquee";

const OwnerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const { setOwnerLoggedIn } = useApp();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "owner@sawkem.com" && password === "sawkem2024") {
      setOwnerLoggedIn(true);
      toast.success("ACCESS GRANTED");
      setTimeout(() => nav("/owner"), 400);
    } else {
      toast.error("INVALID CREDENTIALS");
    }
  };

  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <BrandMarquee />
      </div>
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
            className="w-full bg-primary py-4 font-display text-xl tracking-widest text-primary-foreground"
          >
            ENTER DASHBOARD
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

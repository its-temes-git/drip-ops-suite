import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Lock, ShoppingBag, ArrowLeft } from "lucide-react";
import { BrandMarquee } from "@/components/BrandMarquee";

const Landing = () => {
  return (
    <div className="grain diagonal-lines relative min-h-screen overflow-hidden bg-background text-off-white">
      <Link
        to="/"
        className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary md:left-10 md:top-8"
      >
        <ArrowLeft className="h-3 w-3" /> BACK TO SITE
      </Link>
      <div className="relative z-10 flex min-h-screen flex-col px-6 py-10 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="font-display text-[18vw] leading-none md:text-[14vw] tracking-tight">SAWKEM</h1>
          <p className="mt-2 text-xs tracking-[0.5em] text-muted-foreground md:text-sm">
            COLLECTION — ADDIS ABABA
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="my-12"
        >
          <BrandMarquee />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Link to="/login/owner" className="group">
            <motion.div
              whileHover={{ y: -8 }}
              className="relative h-full border-t-2 border-primary bg-card p-8 transition-colors hover:bg-card/80"
            >
              <Lock className="mb-6 h-8 w-8 text-primary" />
              <h2 className="font-display text-4xl">OWNER PORTAL</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Full dashboard access. Analytics. Control.
              </p>
              <div className="mt-8 text-xs tracking-widest text-primary group-hover:translate-x-2 transition-transform">
                ENTER →
              </div>
            </motion.div>
          </Link>

          <Link to="/login/sales" className="group">
            <motion.div
              whileHover={{ y: -8 }}
              className="relative h-full border-t-2 border-off-white bg-charcoal p-8 transition-colors hover:bg-charcoal/80"
            >
              <ShoppingBag className="mb-6 h-8 w-8 text-off-white" />
              <h2 className="font-display text-4xl">SALES PORTAL</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Summit Branch. Log sales. View inventory.
              </p>
              <div className="mt-8 text-xs tracking-widest text-off-white group-hover:translate-x-2 transition-transform">
                ENTER →
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <div className="mt-auto pt-10 text-center text-xs tracking-widest text-muted-foreground">
          © 2024 SAWKEM FASHION — SUMMIT BRANCH
        </div>
      </div>
    </div>
  );
};

export default Landing;

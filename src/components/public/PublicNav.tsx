import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Send, Instagram } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { to: "/", label: "HOME" },
  { to: "/shop", label: "SHOP" },
  { to: "/about", label: "ABOUT" },
  { to: "/contact", label: "CONTACT" },
];

const TikTokIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
  </svg>
);

export const PublicNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [loc.pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 z-50 w-full backdrop-blur-md bg-background/80 transition-all ${
          scrolled ? "border-b border-primary/60" : "border-b border-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 md:px-10">
          <Link to="/" className="font-display text-3xl tracking-wide text-off-white">
            SAWKEM FASHION
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `relative text-xs tracking-[0.25em] transition-colors ${
                    isActive ? "text-primary" : "text-off-white hover:text-primary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-2 left-0 right-0 h-px bg-primary"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <ThemeToggle />
            <a
              href="https://t.me/sawkemcollection"
              target="_blank"
              rel="noreferrer"
              className="text-off-white transition-colors hover:text-primary"
              aria-label="Telegram"
            >
              <Send className="h-4 w-4" />
            </a>
            <a
              href="https://www.tiktok.com/@sawkem_fashion"
              target="_blank"
              rel="noreferrer"
              className="text-off-white transition-colors hover:text-primary"
              aria-label="TikTok"
            >
              <TikTokIcon className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/sawkem_fashion"
              target="_blank"
              rel="noreferrer"
              className="text-off-white transition-colors hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <Link
              to="/login"
              className="text-[10px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary"
            >
              STAFF LOGIN
            </Link>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              className="text-foreground"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col p-8"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-3xl">SAWKEM FASHION</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-16 flex flex-col gap-8">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="font-display text-5xl tracking-wide text-off-white hover:text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-6">
              <a href="https://t.me/sawkemcollection" target="_blank" rel="noreferrer">
                <Send className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@sawkem_fashion" target="_blank" rel="noreferrer" aria-label="TikTok">
                <TikTokIcon className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/sawkem_fashion" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <Link to="/login" className="ml-auto text-xs tracking-[0.3em] text-muted-foreground">
                STAFF LOGIN
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { TikTokIcon };

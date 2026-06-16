import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Instagram } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/lib/api";
import logoNew from "@/assets/images/Logo/transpa.png";

const links = [
  { to: "/", label: "HOME" },
  { to: "/shop", label: "SHOP" },
  { to: "/about", label: "ABOUT" },
  { to: "/contact", label: "CONTACT" },
];

export const TikTokIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
  </svg>
);

export const PublicNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [loc.pathname]);

  const handleTrack = (id: string) => {
    api.public.trackClick(id, "Navbar").catch(() => {});
  };

  const isHomePage = loc.pathname === "/";
  const showDarkHeroNavbar = isHomePage && !scrolled;

  // Readability configurations based on dark background overlay vs light/dark mode scrolled states
  const isTransparentBg = (showDarkHeroNavbar || mobileOpen);
  const headerBgClass = isTransparentBg
    ? "bg-transparent border-b border-transparent"
    : "bg-white/90 dark:bg-black/85 backdrop-blur-xl border-b border-black/5 dark:border-white/5 shadow-2xl";

  const logoTextClass = (showDarkHeroNavbar && !mobileOpen)
    ? "text-white"
    : "text-black dark:text-white";

  const linkTextClass = (isActive: boolean) => {
    if (showDarkHeroNavbar && !mobileOpen) {
      return isActive ? "text-[#b8ff57]" : "text-white/60 hover:text-white";
    }
    // Contrast-safe for both light and dark modes after scroll
    return isActive
      ? "text-black dark:text-[#b8ff57] font-semibold"
      : "text-black/70 dark:text-white/60 hover:text-black dark:hover:text-white";
  };

  const socialIconClass = (showDarkHeroNavbar && !mobileOpen)
    ? "text-white/40 hover:text-[#b8ff57] hover:scale-110"
    : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-[#b8ff57] hover:scale-110";

  const hoverPillClass = (showDarkHeroNavbar && !mobileOpen)
    ? "absolute inset-0 z-0 rounded bg-white/[0.05] border border-white/5 shadow-[0_0_12px_rgba(255,255,255,0.01)]"
    : "absolute inset-0 z-0 rounded bg-black/[0.04] dark:bg-white/[0.05] border border-black/5 dark:border-white/5 shadow-[0_0_12px_rgba(0,0,0,0.01)]";

  const hamburgerColorClass = (showDarkHeroNavbar && !mobileOpen)
    ? "bg-white"
    : "bg-black dark:bg-white";

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 z-[110] w-full transition-all duration-500 ${headerBgClass}`}
      >
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-6 md:px-12">

          {/* LEFT — Logo */}
          <div className="flex-1">
            <Link
              to="/"
              onClick={() => handleTrack("nav-logo-link")}
              className="group inline-flex items-center outline-none"
            >
              <img 
                src={logoNew} 
                alt="Sawkem Fashion" 
                className={`h-8 sm:h-10 w-auto object-contain transition-all duration-300 ${(!showDarkHeroNavbar || mobileOpen) ? "invert dark:invert-0" : ""}`} 
              />
            </Link>
          </div>

          {/* CENTER — Nav links with premium capsule highlight slider */}
          <motion.nav
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
            }}
            className="hidden items-center gap-1 md:flex"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {links.map((l, i) => (
              <div key={l.to} className="flex items-center">
                {i > 0 && <span className="mx-2 h-1 w-1 rounded-full bg-white/10 dark:bg-white/10" />}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: -8 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
                  }}
                  className="relative px-4 py-2"
                  onMouseEnter={() => setHoveredIndex(i)}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => handleTrack(`nav-link-${l.label.toLowerCase()}`)}
                    className={({ isActive }) =>
                      `relative z-10 font-mono text-[10.5px] tracking-[0.38em] transition-colors duration-300 ${linkTextClass(isActive)}`
                    }
                  >
                    {l.label}
                  </NavLink>

                  {hoveredIndex === i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={hoverPillClass}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </motion.div>
              </div>
            ))}
          </motion.nav>

          {/* RIGHT — Actions */}
          <div className="flex flex-1 items-center justify-end gap-5">
            {/* Sparsely seated social media icons */}
            <div className="hidden items-center gap-8 lg:flex mr-4">
              <a 
                href="https://t.me/sawkemcollection" 
                target="_blank" 
                rel="noreferrer" 
                onClick={() => handleTrack("nav-social-telegram")}
                className={`transition-all duration-300 ${socialIconClass}`}
              >
                <Send className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
              <a 
                href="https://www.tiktok.com/@sawkem_fashion" 
                target="_blank" 
                rel="noreferrer" 
                onClick={() => handleTrack("nav-social-tiktok")}
                className={`transition-all duration-300 ${socialIconClass}`}
              >
                <TikTokIcon className="h-3.5 w-3.5" />
              </a>
              <a 
                href="https://www.instagram.com/sawkem_fashion" 
                target="_blank" 
                rel="noreferrer" 
                onClick={() => handleTrack("nav-social-instagram")}
                className={`transition-all duration-300 ${socialIconClass}`}
              >
                <Instagram className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </div>

            <div className="h-4 w-px bg-black/10 dark:bg-white/10 hidden md:block" />
            
            <div onClick={() => handleTrack("nav-theme-toggle")} className="inline-flex">
              <ThemeToggle />
            </div>

            {/* Hamburger */}
            <button
              onClick={() => {
                setMobileOpen(!mobileOpen);
                handleTrack(mobileOpen ? "nav-mobile-close" : "nav-mobile-hamburger");
              }}
              className="flex flex-col gap-1.5 p-2 md:hidden relative z-[110]"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className={`h-0.5 w-6 transition-colors duration-300 ${hamburgerColorClass}`}
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className={`h-0.5 w-6 transition-colors duration-300 ${hamburgerColorClass}`}
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className={`h-0.5 w-6 transition-colors duration-300 ${hamburgerColorClass}`}
              />
            </button>
          </div>
        </div>

        {/* MOBILE FULL-SCREEN EXPANDABLE MENU */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ clipPath: "circle(0% at 100% 0)" }}
              animate={{ clipPath: "circle(150% at 100% 0)" }}
              exit={{ clipPath: "circle(0% at 100% 0)" }}
              transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 z-[105] flex flex-col bg-white dark:bg-[#080808] md:hidden"
            >
              {/* Padding to account for the fixed header */}
              <div className="flex flex-1 flex-col justify-center px-10 gap-6 mt-16">
                {links.map((l, i) => (
                  <div key={l.to} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                    >
                      <NavLink
                        to={l.to}
                        end={l.to === "/"}
                        onClick={() => {
                          setMobileOpen(false);
                          handleTrack(`nav-mobile-link-${l.label.toLowerCase()}`);
                        }}
                        className={({ isActive }) =>
                          `font-display text-5xl uppercase tracking-widest block transition-colors ${
                            isActive ? "text-[#b8ff57]" : "text-black dark:text-white"
                          }`
                        }
                      >
                        {l.label}
                      </NavLink>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Social media icons at bottom */}
              <div className="px-10 pb-12">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="h-px w-full bg-black/10 dark:bg-white/10 mb-8" 
                />
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center gap-10"
                >
                  <a href="https://t.me/sawkemcollection" target="_blank" rel="noreferrer" onClick={() => handleTrack("nav-mobile-social-telegram")} className="text-black/60 dark:text-white/60 hover:text-[#b8ff57] transition-colors">
                    <Send className="h-6 w-6" strokeWidth={1.5} />
                  </a>
                  <a href="https://www.tiktok.com/@sawkem_fashion" target="_blank" rel="noreferrer" onClick={() => handleTrack("nav-mobile-social-tiktok")} className="text-black/60 dark:text-white/60 hover:text-[#b8ff57] transition-colors">
                    <TikTokIcon className="h-6 w-6" />
                  </a>
                  <a href="https://www.instagram.com/sawkem_fashion" target="_blank" rel="noreferrer" onClick={() => handleTrack("nav-mobile-social-instagram")} className="text-black/60 dark:text-white/60 hover:text-[#b8ff57] transition-colors">
                    <Instagram className="h-6 w-6" strokeWidth={1.5} />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

import { motion, type Variants, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, MapPin, Send } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { BrandMarquee } from "@/components/BrandMarquee";
import { TikTokCard, TIKTOK_PLACEHOLDERS } from "@/components/public/TikTokCard";
import ourStoryImg from "@/assets/our-story.jpg";

// Reusable scroll-reveal variants — modern, simple, distinct per section
const revealRise: Variants = {
  hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};
const revealClip: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  show: { opacity: 1, clipPath: "inset(0 0% 0 0)", transition: { duration: 1.1, ease: [0.77, 0, 0.18, 1] } },
};
const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};
const revealLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const revealRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const viewportOnce = { once: true, amount: 0.2 } as const;

const FEATURED = [
  { id: 1, brand: "Rick Owens", name: "Geobasket", price: 12500, sizes: ["40","41","42","43","44"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop" },
  { id: 11, brand: "SP5DER", name: "Hoodie", price: 5500, sizes: ["S","M","L","XL"], image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop" },
  { id: 19, brand: "Nike", name: "Tech Reflective Set", price: 3200, sizes: ["M","L","XL"], image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=600&fit=crop" },
  { id: 23, brand: "Gallery Dept", name: "Flared Jeans", price: 4800, sizes: ["28","30","32","34","36"], image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop" },
  { id: 14, brand: "Balenciaga", name: "3XL Hoodie", price: 9800, sizes: ["S","M","L","XL"], image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop" },
  { id: 40, brand: "Chrome Hearts", name: "Tie", price: 2100, sizes: ["OS"], image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=600&fit=crop" },
];

const HomePage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (n: number) => scrollRef.current?.scrollBy({ left: n, behavior: "smooth" });
  const [openMap, setOpenMap] = useState<"summit" | "saris" | null>(null);

  // Hero parallax — background image drifts up + scales as you scroll
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Kinetic type — letters drift toward the mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 80, damping: 18, mass: 0.6 });

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const py = (e.clientY - r.top) / r.height - 0.5;
      mx.set(px);
      my.set(py);
    };
    const onLeave = () => { mx.set(0); my.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  // Per-letter offsets — outer letters drift more (kinetic feel)
  const renderKineticWord = (word: string, intensity = 24) => {
    const letters = word.split("");
    const mid = (letters.length - 1) / 2;
    return letters.map((ch, i) => {
      const dist = (i - mid) / mid; // -1..1
      const lx = useTransform(sx, (v) => v * intensity * dist * 1.6);
      const ly = useTransform(sy, (v) => v * intensity * 0.6);
      return (
        <motion.span key={`${word}-${i}`} style={{ x: lx, y: ly, display: "inline-block" }}>
          {ch}
        </motion.span>
      );
    });
  };

  return (
    <>
      {/* HERO — full-bleed image background */}
      <section ref={heroRef} className="relative grain overflow-hidden min-h-[calc(100vh-4rem)] bg-[#f0ede8] dark:bg-[#080808]">
        {/* Background image — covers entire hero at low opacity, with scroll parallax */}
        <motion.img
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          style={{ y: bgY, scale: bgScale }}
          src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&h=2000&fit=crop"
          alt="Sawkem streetwear editorial"
          className="absolute inset-0 h-full w-full object-cover opacity-30 dark:opacity-25 will-change-transform"
        />
        {/* Theme-aware overlay tint to keep text readable */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f0ede8]/85 via-[#f0ede8]/40 to-[#f0ede8]/10 dark:from-[#080808]/90 dark:via-[#080808]/50 dark:to-[#080808]/20" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f0ede8] to-transparent dark:from-[#080808]" />

        {/* Mesh orbs on top */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-orb hero-orb-4" />

        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center px-6 py-12 md:px-12 lg:pl-[8%]"
        >
          <div className="w-full text-center lg:max-w-3xl lg:text-left">
            <div className="inline-block rounded-xl bg-black/15 p-6 dark:bg-black/40 md:p-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display leading-[0.85] text-[64px] md:text-[100px] lg:text-[140px] text-[#080808] dark:text-white"
              style={{ letterSpacing: "-2px", fontWeight: 900 }}
            >
              {renderKineticWord("SAWKEM", 28)}
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-display leading-[0.85] text-[64px] md:text-[100px] lg:text-[140px] text-[#080808] dark:text-white lg:ml-6"
              style={{ letterSpacing: "-2px", fontWeight: 900 }}
            >
              {renderKineticWord("FASHION", 22)}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-4 font-mono text-[13px] uppercase text-[#b8ff57]"
              style={{ letterSpacing: "6px", textShadow: "0 0 20px rgba(0,0,0,0.5)" }}
            >
              ADDIS ABABA
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mx-auto mt-5 max-w-[420px] font-mono text-[15px] leading-[1.7] text-black/75 dark:text-white/80 lg:mx-0"
            >
              Premium streetwear. Serious quality. Ethiopia's dopest fits.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-9 flex flex-wrap justify-center gap-4 lg:justify-start"
            >
              <Link
                to="/shop"
                className="group bg-[#b8ff57] px-9 py-4 font-mono text-[13px] uppercase text-[#080808] transition-all duration-[250ms] hover:bg-[#080808] hover:text-[#b8ff57] dark:hover:bg-white dark:hover:text-[#b8ff57]"
                style={{ letterSpacing: "3px" }}
              >
                SHOP NOW
              </Link>
              <a
                href="https://www.tiktok.com/@sawkem_fashion"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 border-[1.5px] border-current px-9 py-4 font-mono text-[13px] uppercase text-[#080808] transition-all duration-[250ms] hover:bg-[#080808] hover:text-[#f0ede8] dark:text-white dark:hover:bg-white dark:hover:text-[#080808]"
                style={{ letterSpacing: "3px" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[14px] w-[14px]">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
                </svg>
                WATCH US ON TIKTOK
              </a>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="mt-5 font-mono text-[11px] uppercase text-black/45 dark:text-white/45"
              style={{ letterSpacing: "2px" }}
            >
              6,874 followers • 51K+ likes on TikTok
            </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        >
          <span
            className="font-mono text-[10px] uppercase text-black/40 dark:text-white/40"
            style={{ letterSpacing: "4px" }}
          >
            SCROLL
          </span>
          <span className="block h-10 w-px bg-black/40 scroll-line dark:bg-white/40" />
        </motion.div>
      </section>

      {/* MARQUEE */}
      <motion.section
        variants={revealClip}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="dark-band py-10"
      >
        <BrandMarquee />
      </motion.section>

      {/* NEW DROPS */}
      <section className="px-6 py-20 md:px-12">
        <motion.div
          variants={revealRise}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex items-end justify-between"
        >
          <div>
            <h2 className="font-display text-6xl md:text-7xl">NEW DROPS</h2>
            <p className="mt-2 text-xs tracking-[0.3em] text-primary">
              FRESH INVENTORY — SUMMIT BRANCH — ADDIS ABABA
            </p>
          </div>
          <div className="hidden gap-2 md:flex">
            <button onClick={() => scrollBy(-400)} className="border border-border p-3 hover:border-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scrollBy(400)} className="border border-border p-3 hover:border-primary transition-colors">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          ref={scrollRef}
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-10 flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
        >
          {FEATURED.map((p) => (
            <motion.div
              key={p.id}
              variants={staggerChild}
              whileHover={{ y: -6 }}
              className="group min-w-[280px] md:min-w-[340px] snap-start border border-border bg-card transition-colors hover:border-primary"
            >
              <div className="aspect-square overflow-hidden">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-5">
                <p className="text-[10px] tracking-[0.3em] text-primary uppercase">{p.brand}</p>
                <h3 className="mt-1 font-display text-2xl">{p.name}</h3>
                <p className="mt-1 font-mono text-sm text-off-white/80">ETB {p.price.toLocaleString()}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.sizes.map((s) => (
                    <span key={s} className="border border-border px-2 py-0.5 text-[10px]">{s}</span>
                  ))}
                </div>
                <Link
                  to={`/shop?item=${p.id}`}
                  className="mt-4 block border border-off-white px-4 py-2 text-center text-[10px] tracking-[0.3em] text-off-white transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  VIEW ITEM
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TIKTOK */}
      <section className="dark-band px-6 py-20 md:px-12">
        <motion.div variants={revealRise} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <h2 className="font-display text-6xl md:text-7xl">AS SEEN ON TIKTOK</h2>
          <p className="mt-2 text-xs tracking-[0.3em] text-primary">
            @SAWKEM_FASHION • 51K+ LIKES • ADDIS ABABA
          </p>
        </motion.div>
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-10 grid gap-6 md:grid-cols-3"
        >
          {TIKTOK_PLACEHOLDERS.map((t, i) => (
            <motion.div key={i} variants={staggerChild}>
              <TikTokCard {...t} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          variants={revealScale}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 text-center"
        >
          <a
            href="https://www.tiktok.com/@sawkem_fashion"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-primary px-8 py-4 text-xs tracking-[0.3em] text-primary-foreground hover:bg-off-white transition-colors"
          >
            FOLLOW US FOR NEW DROPS
          </a>
        </motion.div>
      </section>

      {/* ABOUT TEASER */}
      <section className="px-6 py-24 md:px-12">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <motion.div variants={revealLeft} initial="hidden" whileInView="show" viewport={viewportOnce}>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9]">
              ETHIOPIA'S DOPEST FITS. SINCE DAY ONE.
            </h2>
            <p className="mt-6 max-w-md text-sm text-off-white/80 leading-relaxed">
              Sawkem Fashion brings the world's most coveted streetwear brands directly
              to Addis Ababa. From Rick Owens to SP5DER — we don't do average.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-block border border-off-white px-6 py-3 text-xs tracking-[0.25em] hover:bg-off-white hover:text-background transition-all"
            >
              OUR STORY
            </Link>
          </motion.div>
          <motion.div
            variants={revealRight}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="relative mx-auto h-[520px] w-full max-w-md overflow-hidden"
          >
            <img
              src={ourStoryImg}
              alt="Sawkem streetwear editorial"
              width={800}
              height={1024}
              loading="lazy"
              className="h-full w-full object-cover grayscale"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to left, hsl(0 0% 0%) 40%, transparent 100%)",
                maskImage:
                  "linear-gradient(to left, hsl(0 0% 0%) 40%, transparent 100%)",
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* FIND US */}
      <section className="dark-band px-6 py-20 md:px-12">
        <motion.h2
          variants={revealClip}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="font-display text-6xl md:text-7xl"
        >
          FIND US
        </motion.h2>
        <p className="mt-3 text-xs tracking-[0.3em] text-primary">TWO LOCATIONS — ADDIS ABABA</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {[
            {
              key: "summit" as const,
              title: "SUMMIT BRANCH",
              address: "Summit Area, in front of Deborah School, Addis Ababa",
              hours: "Mon–Sat: 9:00 AM – 8:00 PM | Sun: 11:00 AM – 6:00 PM",
              mapQuery: "Summit,Addis+Ababa,Ethiopia",
              variant: revealLeft,
            },
            {
              key: "saris" as const,
              title: "SARIS BRANCH",
              address: "Saris, Yekality Taxi Meyaza, Addis Ababa",
              hours: "Mon–Sat: 9:00 AM – 8:00 PM | Sun: 11:00 AM – 6:00 PM",
              mapQuery: "Saris+Yekality+Taxi+Meyaza,Addis+Ababa,Ethiopia",
              variant: revealRight,
            },
          ].map((b) => (
            <motion.div
              key={b.key}
              variants={b.variant}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="border-l-4 border-primary bg-card p-8 flex flex-col"
            >
              <h3 className="font-display text-4xl md:text-5xl">{b.title}</h3>
              <p className="mt-3 text-sm text-off-white/80">{b.address}</p>
              <p className="mt-2 text-xs text-muted-foreground">{b.hours}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p>📞 <a href="tel:+251951077634" className="hover:text-primary">0951 077 634</a></p>
                <p>💬 <a href="https://t.me/sawkemcollection" target="_blank" rel="noreferrer" className="hover:text-primary">@sawkemcollection</a></p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setOpenMap(openMap === b.key ? null : b.key)}
                  className="flex items-center gap-2 bg-primary px-5 py-3 text-xs tracking-[0.25em] text-primary-foreground hover:bg-off-white transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  {openMap === b.key ? "HIDE MAP" : "SHOW MAP"}
                </button>
                <a
                  href={`https://www.google.com/maps/search/${b.mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 border border-off-white px-5 py-3 text-xs tracking-[0.25em] hover:bg-off-white hover:text-background transition-all"
                >
                  <Send className="h-4 w-4" /> DIRECTIONS
                </a>
              </div>

              <motion.div
                initial={false}
                animate={{
                  height: openMap === b.key ? 360 : 0,
                  opacity: openMap === b.key ? 1 : 0,
                  marginTop: openMap === b.key ? 24 : 0,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden border border-border"
              >
                {openMap === b.key && (
                  <>
                    <iframe
                      title={`${b.title} Map`}
                      src={`https://www.google.com/maps?q=${b.mapQuery}&output=embed`}
                      className="absolute inset-0 h-full w-full"
                      style={{ filter: "grayscale(100%) invert(90%) contrast(85%)" }}
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="block h-4 w-4 rounded-full bg-primary pulse-dot" />
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;

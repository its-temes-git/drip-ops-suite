import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, MapPin, Send } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { PerspectiveMarquee } from "@/components/ui/perspective-marquee";
import { TikTokEmbed, TIKTOK_VIDEOS } from "@/components/public/TikTokCard";
import { TikTokIcon } from "@/components/public/PublicNav";
import ourStoryImg from "@/assets/our-story.jpg";
import heroImg3 from "@/assets/images/hero 3.png";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ParticleCanvas } from "@/components/public/ParticleCanvas";
import { Skeleton } from "@/components/ui/skeleton";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import logoStory from "@/assets/images/Logo/transpa.png";

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

const FALLBACK_FEATURED = [
  { id: 1, brand: "Rick Owens", name: "Geobasket", price: 12500, sizes: ["40", "41", "42", "43", "44"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop" },
  { id: 11, brand: "SP5DER", name: "Hoodie", price: 5500, sizes: ["S", "M", "L", "XL"], image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop" },
  { id: 19, brand: "Nike", name: "Tech Reflective Set", price: 3200, sizes: ["M", "L", "XL"], image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=600&fit=crop" },
  { id: 23, brand: "Gallery Dept", name: "Flared Jeans", price: 4800, sizes: ["28", "30", "32", "34", "36"], image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop" },
  { id: 14, brand: "Balenciaga", name: "3XL Hoodie", price: 9800, sizes: ["S", "M", "L", "XL"], image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop" },
  { id: 40, brand: "Chrome Hearts", name: "Tie", price: 2100, sizes: ["OS"], image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=600&fit=crop" },
];

const BRAND_ITEMS = [
  "RICK OWENS", "BALENCIAGA", "SP5DER", "CHROME HEARTS", "GALLERY DEPT",
  "DENIM TEARS", "HELLSTAR", "BROKEN PLANET", "NIKE TECH", "BAPE"
];

const GlowingEdgeLogo = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(".glow-gradient", {
      rotation: 360,
      duration: 4,
      repeat: -1,
      ease: "linear",
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative mx-auto h-[480px] w-full max-w-sm overflow-hidden rounded-xl bg-black/40 p-[2px] shadow-[0_0_40px_rgba(184,255,87,0.05)]">
      <div
        className="glow-gradient absolute inset-[-100%] z-0"
        style={{
          background: "conic-gradient(from 0deg, transparent 0%, transparent 45%, rgba(184,255,87,1) 50%, transparent 55%, transparent 100%)"
        }}
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-xl bg-[#080808] p-12">
        <img
          src={logoStory}
          alt="Sawkem Logo"
          className="h-full w-full object-contain transition-all duration-500 hover:scale-105"
        />
      </div>
    </div>
  );
};

const HomePage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading, isFetching } = useQuery({
    queryKey: ['public-products'],
    queryFn: api.public.products,
    staleTime: 30_000, // 30 seconds — prevents instant re-fetch on revisit
  });

  const featuredItems = products.slice(0, 6);
  // Show skeleton while loading OR while fetched but still empty (covers the first-render flash)
  const showSkeleton = isLoading || isFetching || featuredItems.length === 0;

  // Theme detection for marquee
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const scrollBy = (n: number) => {
    scrollRef.current?.scrollBy({ left: n, behavior: "smooth" });
    api.public.trackClick(`home-featured-products-scroll-${n > 0 ? 'right' : 'left'}`, "Home").catch(() => { });
  };

  const [openMap, setOpenMap] = useState<"summit" | "saris" | null>(null);

  // Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const handleTrack = (id: string) => {
    api.public.trackClick(id, "Home").catch(() => { });
  };

  return (
    <>
      {/* ─── HERO — Full Bleed Photo ─────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ height: "100svh", minHeight: 600 }}>

        {/* Photo — full bleed with scroll parallax aligned to show beanie model on the right */}
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: bgY, scale: bgScale }}>
          <motion.img
            src={heroImg3}
            alt="Sawkem Fashion — Addis Ababa"
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-cover object-right-top md:object-right"
          />
        </motion.div>

        {/* Custom vignette layers to mask the image and place focal point on the model */}
        <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(ellipse 130% 110% at 75% 45%, transparent 18%, rgba(0,0,0,0.4) 55%, rgba(8,8,8,0.92) 100%)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 z-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.4) 55%, transparent 100%)" }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]" style={{ background: "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.7) 40%, transparent 100%)" }} />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[45%] z-0" style={{ background: "linear-gradient(to right, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.3) 60%, transparent 100%)" }} />

        {/* Film grain */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.055] z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        {/* Particle Canvas as overlay over the image, behind the text content */}
        <ParticleCanvas isOverlay className="absolute inset-0 z-0 overflow-hidden pointer-events-auto" />

        {/* Content */}
        <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 flex h-full flex-col pointer-events-none">

          {/* Left empty side — main typography */}
          <div className="flex flex-1 flex-col items-start justify-center pb-20 pt-20 px-8 md:px-24 max-w-xl md:max-w-2xl lg:max-w-3xl text-left pointer-events-none">


            {/* Premium Character Reveal — SAWKEM FASHION */}
            <div className="pointer-events-auto flex flex-col">
              {/* SAWKEM */}
              <div className="flex overflow-hidden group/sawkem">
                {"SAWKEM".split("").map((char, i) => (
                  <motion.span
                    key={`s-${i}`}
                    initial={{ y: "110%", rotate: 15, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
                    whileHover={{ y: -15, scale: 1.05, color: "#b8ff57" }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block text-left font-display leading-[0.85] text-white cursor-crosshair"
                    style={{ fontSize: "clamp(110px, 22vw, 300px)", letterSpacing: "-0.02em" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* FASHION */}
              <div className="flex overflow-hidden -mt-4 md:-mt-8 group/fashion">
                {"FASHION".split("").map((char, i) => (
                  <motion.span
                    key={`f-${i}`}
                    initial={{ y: "110%", rotate: 15, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
                    whileHover={{ y: -15, scale: 1.05, color: "#fff" }}
                    transition={{ duration: 0.9, delay: 0.35 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block text-left font-display leading-[0.85] text-[#b8ff57] cursor-crosshair"
                    style={{ fontSize: "clamp(110px, 22vw, 30px)", letterSpacing: "0.1em" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Accent line */}
            <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.9, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
              className="my-5 h-px w-20 bg-[#b8ff57] origin-left pointer-events-auto" />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.68 }}
              className="font-mono text-[9.5px] tracking-[0.42em] text-white/45 text-left pointer-events-auto">PREMIUM STREETWEAR · EST. 2022</motion.p>

            {/* CTAs with Premium Hover Animations */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.82 }}
              className="mt-8 flex flex-wrap items-center gap-4 justify-start pointer-events-auto">
              <Link
                to="/shop"
                onClick={() => handleTrack("hero-shop-cta")}
                className="group relative overflow-hidden px-8 py-3.5 font-mono text-[10px] tracking-[0.38em] text-black transition-all duration-300"
              >
                <span className="absolute inset-0 bg-[#b8ff57] rounded-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_35px_rgba(184,255,87,0.4)]" />
                <span className="absolute inset-0 -translate-x-full rotate-12 bg-white/30 transition-transform duration-700 ease-out group-hover:translate-x-full" />
                <span className="relative z-10 flex items-center gap-2">
                  SHOP COLLECTION <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
              <a
                href="https://www.tiktok.com/@sawkem_fashion"
                target="_blank"
                rel="noreferrer"
                onClick={() => handleTrack("hero-tiktok-cta")}
                className="group relative flex items-center gap-2.5 border border-white/10 bg-white/5 px-7 py-3.5 font-mono text-[10px] tracking-[0.35em] text-white/75 backdrop-blur-sm rounded-sm transition-all duration-300 hover:border-[#b8ff57]/45 hover:text-white"
              >
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#b8ff57] transition-all duration-300 group-hover:w-full" />
                <TikTokIcon className="h-[13px] w-[13px] transition-transform duration-300 group-hover:rotate-12" />
                @SAWKEM_FASHION
              </a>
            </motion.div>
          </div>

        </motion.div>
      </section>

      {/* 3D PERSPECTIVE MARQUEE */}
      <section className="relative w-full overflow-hidden" style={{ height: "clamp(200px, 20vw, 260px)" }}>
        <PerspectiveMarquee
          items={BRAND_ITEMS}
          rotateY={-28}
          rotateX={8}
          perspective={1200}
          pixelsPerFrame={2}
          fontSize={72}
          background={isDark ? "#080808" : "#f0ede8"}
          fadeColor={isDark ? "#080808" : "#f0ede8"}
          color={isDark ? "#fafafa" : "#171717"}
        />
      </section>

      {/* NEW DROPS */}
      <section className="px-6 py-0 md:px-12">
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
              FRESH INVENTORY
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
          key={showSkeleton ? "skeleton" : "products"}
          ref={scrollRef}
          variants={staggerParent}
          initial="hidden"
          animate="show"
          className="mt-10 flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
        >
          {showSkeleton ? (
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={`skel-${i}`}
                variants={staggerChild}
                className="group w-[280px] md:w-[340px] flex-shrink-0 snap-start border border-border bg-card"
              >
                <div className="aspect-square overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-5">
                  <Skeleton className="h-3 w-1/4 mb-1.5" />
                  <Skeleton className="h-6 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="mt-3 flex gap-1.5">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-8" />
                  </div>
                  <Skeleton className="mt-4 h-9 w-full" />
                </div>
              </motion.div>
            ))
          ) : (
            featuredItems.map((p) => (
              <motion.div
                key={p.id}
                variants={staggerChild}
                whileHover={{ y: -6 }}
                className="group w-[280px] md:w-[340px] flex-shrink-0 snap-start border border-border bg-card transition-colors hover:border-primary"
              >
                {/* Dark bg behind image so white-background product photos look clean */}
                <div className="aspect-square overflow-hidden bg-[#111] flex items-center justify-center">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-contain transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
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
                    onClick={() => handleTrack(`home-featured-view-item-${p.id}`)}
                    className="mt-4 block border border-off-white px-4 py-2 text-center text-[10px] tracking-[0.3em] text-off-white transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  >
                    VIEW ITEM
                  </Link>
                </div>
              </motion.div>
            ))
          )}
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
        <div
          className="mt-10 grid gap-6 md:grid-cols-3"
        >
          {TIKTOK_VIDEOS.map((t) => (
            <div key={t.id} className="flex justify-center overflow-hidden">
              <div className="w-full max-w-[325px]" style={{ minWidth: "325px" }}>
                <TikTokEmbed videoId={t.id} html={t.html} />
              </div>
            </div>
          ))}
        </div>
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
            onClick={() => handleTrack("home-tiktok-section-follow")}
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
              onClick={() => handleTrack("home-about-teaser-link")}
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
            className="w-full flex justify-center py-10 md:py-0"
          >
            <GlowingEdgeLogo />
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
                <p>📞 <a href="tel:+251951077634" onClick={() => handleTrack(`home-call-${b.key}`)} className="hover:text-primary">0951 077 634</a></p>
                <p>💬 <a href="https://t.me/sawkemcollection" onClick={() => handleTrack(`home-telegram-${b.key}`)} target="_blank" rel="noreferrer" className="hover:text-primary">@sawkemcollection</a></p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMap(openMap === b.key ? null : b.key);
                    handleTrack(`home-map-toggle-${b.key}`);
                  }}
                  className="flex items-center gap-2 bg-primary px-5 py-3 text-xs tracking-[0.25em] text-primary-foreground hover:bg-off-white transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  {openMap === b.key ? "HIDE MAP" : "SHOW MAP"}
                </button>
                <a
                  href={`https://www.google.com/maps/search/${b.mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleTrack(`home-directions-${b.key}`)}
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

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BrandMarquee } from "@/components/BrandMarquee";
import { TikTokCard, TIKTOK_PLACEHOLDERS } from "@/components/public/TikTokCard";

const BLOCKS = [
  {
    title: "HOW IT STARTED",
    body: "What began as a passion for authentic streetwear grew into Addis Ababa's most trusted premium fashion boutique. We noticed a gap — serious drip culture was growing in Ethiopia, but access to authentic pieces was near zero. Sawkem changed that.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    reverse: false,
  },
  {
    title: "WHAT WE STAND FOR",
    body: "Every item in our store is authentic. No replicas, no compromises. From Rick Owens Geobaskets to SP5DER hoodies — if it's on our rack, it's the real thing. That's the Sawkem promise.",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=600&fit=crop",
    reverse: true,
  },
  {
    title: "ADDIS. ALWAYS.",
    body: "We're not just a store. We're part of the Addis streetwear scene. Our TikTok documents the culture as it grows. Our Summit branch is where the community comes to dress.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
    reverse: false,
  },
];

const BRAND_GRID = [
  "RICK OWENS","BALENCIAGA","SP5DER","CHROME HEARTS",
  "GALLERY DEPT","DENIM TEARS","HELLSTAR","BROKEN PLANET",
  "NIKE TECH","BAPE","PURPLE BRAND","AMIRI",
  "BURBERRY","NOCTA","SYNA WORLD","TIMBERLAND",
];

const STATS = [
  { num: 51000, label: "TIKTOK LIKES", suffix: "+" },
  { num: 6874, label: "FOLLOWERS", suffix: "" },
  { num: 40, label: "BRANDS CARRIED", suffix: "+" },
  { num: 300, label: "ITEMS IN STOCK", suffix: "+" },
];

const CountUp = ({ to, suffix }: { to: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1500;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(start + (to - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {n >= 1000 ? n.toLocaleString() : n}
      {suffix}
    </span>
  );
};

const AboutPage = () => {
  return (
    <>
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center diagonal-lines px-6 text-center">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-[0.5em] text-primary"
          >
            EST. ADDIS ABABA
          </motion.p>
          {["WE DON'T", "DO", "AVERAGE."].map((line, i) => (
            <motion.h1
              key={line}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              className="font-display leading-[0.85] text-[18vw] md:text-[16vw]"
            >
              {line}
            </motion.h1>
          ))}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mx-auto mt-8 max-w-2xl text-sm text-off-white/80 leading-relaxed"
          >
            Sawkem Fashion is Addis Ababa's home for premium international streetwear.
            We source the world's most coveted brands and bring them directly to Ethiopia —
            authentic, original, and exclusively available at our Summit branch.
          </motion.p>
        </div>
      </section>

      <section className="px-6 py-24 md:px-12 space-y-24">
        {BLOCKS.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className={`grid gap-10 items-center md:grid-cols-2 ${b.reverse ? "md:[&>div:first-child]:order-2" : ""}`}
          >
            <div className="aspect-[4/3] overflow-hidden border border-border">
              <img src={b.image} alt={b.title} className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" loading="lazy" />
            </div>
            <div>
              <h2 className="font-display text-5xl md:text-6xl leading-[0.9]">{b.title}</h2>
              <p className="mt-6 text-sm text-off-white/80 leading-relaxed">{b.body}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="dark-band px-6 py-20 md:px-12">
        <h2 className="text-center font-display text-6xl md:text-7xl">BRANDS WE CARRY</h2>
        <div className="mt-12">
          <BrandMarquee />
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {BRAND_GRID.map((b) => (
            <motion.div
              key={b}
              whileHover={{ scale: 1.03 }}
              className="border border-border bg-card p-6 text-center font-display text-xl tracking-wider transition-all hover:border-primary hover:text-primary"
            >
              {b}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <h2 className="font-display text-6xl md:text-7xl">JOIN THE COMMUNITY</h2>
        <p className="mt-2 text-xs tracking-[0.3em] text-primary">
          51K+ LIKES — GROWING EVERY DROP
        </p>
        <div className="mt-10 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          {TIKTOK_PLACEHOLDERS.map((t, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[320px] snap-start">
              <TikTokCard {...t} />
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="https://www.tiktok.com/@sawkem_fashion"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-primary px-8 py-4 text-xs tracking-[0.3em] text-primary-foreground hover:bg-off-white transition-colors"
          >
            FOLLOW @SAWKEM_FASHION ON TIKTOK
          </a>
        </div>
      </section>

      <section className="dark-band px-6 py-24 md:px-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="border border-border bg-card p-6 text-center">
              <p className="font-display text-6xl md:text-7xl text-primary leading-none">
                <CountUp to={s.num} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-[10px] tracking-[0.3em] text-off-white">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default AboutPage;

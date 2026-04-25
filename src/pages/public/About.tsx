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

const STATS: { num: number; label: string; suffix: string; liveBumps?: number[] }[] = [
  { num: 51000, label: "TIKTOK LIKES", suffix: "+", liveBumps: [3, 10, 12, 6, 20] },
  { num: 6874, label: "FOLLOWERS", suffix: "" },
  { num: 40, label: "BRANDS CARRIED", suffix: "+" },
];

const CountUp = ({
  to,
  suffix,
  liveBumps,
}: {
  to: number;
  suffix: string;
  liveBumps?: number[];
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [bumpAmt, setBumpAmt] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      // easeOutExpo for a snappy, premium feel
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setN(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);

  // Live "likes coming in" ticker after the initial count-up settles
  useEffect(() => {
    if (!inView || !liveBumps?.length) return;
    let cancelled = false;
    let running = to;
    const start = setTimeout(() => {
      liveBumps.forEach((amt, i) => {
        setTimeout(() => {
          if (cancelled) return;
          running += amt;
          setN(running);
          setBumpAmt(amt);
          setPulse(true);
          setTimeout(() => setPulse(false), 700);
        }, i * 900);
      });
    }, 2000);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [inView, liveBumps, to]);

  return (
    <span ref={ref} className="relative inline-block">
      <span
        className={`inline-block transition-all duration-300 ${
          pulse ? "scale-110 [text-shadow:0_0_24px_hsl(var(--primary)/0.8)]" : "scale-100"
        }`}
      >
        {n >= 1000 ? n.toLocaleString() : n}
        {suffix}
      </span>
      {pulse && bumpAmt > 0 && (
        <span
          key={n}
          className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-sm text-primary animate-[float-up_0.7s_ease-out_forwards]"
        >
          +{bumpAmt}
        </span>
      )}
    </span>
  );
};

const MagneticLine = ({ text }: { text: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    const update = () => setEnabled(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const container = ref.current;
    const letters = Array.from(container.querySelectorAll<HTMLSpanElement>("[data-letter]"));
    let raf = 0;
    let mx = -9999, my = -9999;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      mx = -9999; my = -9999;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const apply = () => {
      raf = 0;
      letters.forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        const radius = 220;
        if (dist < radius) {
          const f = (1 - dist / radius);
          const tx = -(dx / dist) * f * 28;
          const ty = -(dy / dist) * f * 28;
          const rot = (dx / radius) * f * 18;
          el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
          el.style.color = `hsl(var(--primary))`;
          el.style.textShadow = `0 0 ${20 * f}px hsl(var(--primary) / ${0.6 * f})`;
        } else {
          el.style.transform = "";
          el.style.color = "";
          el.style.textShadow = "";
        }
      });
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return <>{text}</>;

  return (
    <span ref={ref} className="inline-block">
      {text.split("").map((ch, i) => (
        <span
          key={i}
          data-letter
          className="inline-block transition-[transform,color,text-shadow] duration-300 ease-out will-change-transform"
          style={{ whiteSpace: ch === " " ? "pre" : undefined }}
        >
          {ch}
        </span>
      ))}
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
              <MagneticLine text={line} />
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="border border-border bg-card p-6 text-center">
              <p className="font-display text-6xl md:text-7xl text-primary leading-none">
                <CountUp to={s.num} suffix={s.suffix} liveBumps={s.liveBumps} />
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

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string | number;
  brand: string;
  name: string;
  price: number;
  sizes: string[];
  image: string;
  category?: string;
}

interface OnRotationProps {
  products: Product[];
  isLoading: boolean;
  onTrack?: (id: string) => void;
}

const AUTOPLAY_INTERVAL = 5000;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
    filter: "blur(12px)",
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    filter: "blur(12px)",
    scale: 0.96,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const infoVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3 } },
};

export const OnRotation = ({ products, isLoading, onTrack }: OnRotationProps) => {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setDir(index > active ? 1 : -1);
    setActive(index);
  }, [active]);

  const next = useCallback(() => {
    const nextIdx = (active + 1) % products.length;
    setDir(1);
    setActive(nextIdx);
  }, [active, products.length]);

  useEffect(() => {
    if (paused || products.length <= 1) return;
    intervalRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next, paused, products.length]);

  if (isLoading) {
    return (
      <section className="px-6 py-16 md:px-12">
        <div className="mb-8">
          <Skeleton className="h-12 w-56 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-7 w-10" />)}
            </div>
            <Skeleton className="h-12 w-40 mt-6" />
          </div>
          <Skeleton className="aspect-square w-full max-w-md mx-auto" />
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  const item = products[active];

  return (
    <section
      className="relative overflow-hidden px-6 py-16 md:px-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background accent glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 70% 50%, #b8ff57 0%, transparent 70%)",
        }}
      />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 flex items-end justify-between"
      >
        <div>
          <h2 className="font-display text-6xl md:text-7xl">ON ROTATION</h2>
          <p className="mt-2 text-xs tracking-[0.3em] text-primary">SPOTLIGHT PICKS · AUTO-CYCLING</p>
        </div>
        {/* Progress dots — desktop only */}
        <div className="hidden md:flex items-center gap-2">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-[3px] rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === active ? 32 : 12, background: i === active ? "#b8ff57" : "rgba(255,255,255,0.2)" }}
              aria-label={`Go to item ${i + 1}`}
            >
              {i === active && !paused && (
                <motion.span
                  key={active}
                  className="absolute inset-y-0 left-0 bg-white/40 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main spotlight */}
      <div className="grid gap-8 md:grid-cols-2 items-center min-h-[420px] md:min-h-[500px]">

        {/* Info panel */}
        <div className="order-2 md:order-1 flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`info-${item.id}`}
              custom={dir}
              variants={infoVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-5"
            >
              {/* Index indicator */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.4em] text-primary">
                  {String(active + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
                </span>
                <div className="h-px flex-1 max-w-[60px] bg-border" />
              </div>

              {/* Brand */}
              <p className="font-mono text-[11px] tracking-[0.45em] text-muted-foreground uppercase">
                {item.brand}
              </p>

              {/* Name */}
              <h3 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.9]">
                {item.name}
              </h3>

              {/* Price */}
              <p className="font-mono text-xl text-off-white/90">
                ETB {item.price.toLocaleString()}
              </p>

              {/* Sizes */}
              {item.sizes?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground self-center mr-1">
                    SIZES
                  </span>
                  {item.sizes.map((s) => (
                    <span
                      key={s}
                      className="border border-border px-2.5 py-1 font-mono text-[10px] text-off-white/70 transition-colors hover:border-primary hover:text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <Link
                to={`/shop?item=${item.id}`}
                onClick={() => onTrack?.(`on-rotation-view-${item.id}`)}
                className="group inline-flex items-center gap-3 bg-primary px-7 py-3.5 font-mono text-[10px] tracking-[0.35em] text-primary-foreground transition-all hover:bg-off-white hover:shadow-[0_0_30px_rgba(184,255,87,0.3)]"
              >
                VIEW ITEM
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Image panel */}
        <div className="order-1 md:order-2 relative flex items-center justify-center">
          {/* Decorative background number */}
          <span
            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 font-display text-[160px] md:text-[220px] leading-none text-white/[0.03] select-none"
            aria-hidden
          >
            {String(active + 1).padStart(2, "0")}
          </span>

          <div className="relative w-full max-w-sm md:max-w-md aspect-square overflow-hidden bg-[#0f0f0f] border border-border">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.img
                key={`img-${item.id}`}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                src={item.image}
                alt={item.name}
                className="absolute inset-0 h-full w-full object-contain p-6"
                loading="lazy"
              />
            </AnimatePresence>

            {/* Corner accent */}
            <div className="pointer-events-none absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-primary" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-primary" />
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-10 flex gap-3 overflow-x-auto pb-2 snap-x">
        {products.map((p, i) => (
          <button
            key={p.id}
            onClick={() => goTo(i)}
            className={`flex-shrink-0 snap-start relative w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 transition-all duration-300 ${
              i === active
                ? "border-primary shadow-[0_0_16px_rgba(184,255,87,0.35)] scale-105"
                : "border-border opacity-50 hover:opacity-80 hover:border-border/80"
            }`}
            aria-label={`Select ${p.name}`}
          >
            <img
              src={p.image}
              alt={p.name}
              className="h-full w-full object-contain bg-[#0f0f0f] p-1.5"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </section>
  );
};

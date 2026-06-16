import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemDrawer } from "@/components/public/ItemDrawer";

interface Product {
  id: string | number;
  brand: string;
  name: string;
  price: number;
  sizes: string[];
  color: string;
  image: string;
  images?: string[];
  variants?: any[];
  qty?: number;
  category?: string;
}

interface OnRotationProps {
  products: Product[];
  isLoading: boolean;
  onTrack?: (id: string) => void;
}

const AUTOPLAY_INTERVAL = 5000;
const MAX_ITEMS = 15;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const COLOR_MAP: Record<string, string> = {
  black: "#0a0a0a", white: "#f0ede8", cream: "#efe6d2", gray: "#8a8a8a",
  grey: "#8a8a8a", silver: "#c8c8cc", red: "#d4341f", pink: "#ff8fb3",
  blue: "#2b6cb0", navy: "#0f1e3d", royal: "#1c3fa8", green: "#2f8f4a",
  camo: "#5a6b3a", brown: "#5a3a25", wheat: "#c9a36b", indigo: "#2b3a7a",
  vintage: "#6b5a48", washed: "#2a2a2a",
};

function getColorHex(colorStr: string): string {
  const key = Object.keys(COLOR_MAP).find((k) => colorStr.toLowerCase().includes(k));
  return key ? COLOR_MAP[key] : "#8a8a8a";
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 100 : -100,
    opacity: 0,
    filter: "blur(14px)",
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -100 : 100,
    opacity: 0,
    filter: "blur(14px)",
    scale: 0.95,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const infoVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.28 } },
};

export const OnRotation = ({ products, isLoading, onTrack }: OnRotationProps) => {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [drawerItem, setDrawerItem] = useState<Product | null>(null);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Randomly shuffle and pick max 15 items — stable until products change
  const hotItems = useMemo(() => {
    if (!products.length) return [];
    return shuffleArray(products).slice(0, MAX_ITEMS);
  }, [products]);

  const goTo = useCallback((index: number) => {
    setDir(index >= active ? 1 : -1);
    setActive(index);
    setTick((t) => t + 1);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [active]);

  const next = useCallback(() => {
    setDir(1);
    setActive((prev) => (prev + 1) % hotItems.length);
  }, [hotItems.length]);

  // Always auto-cycle — restarts when tick changes (dot clicked)
  useEffect(() => {
    if (hotItems.length <= 1) return;
    intervalRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [next, hotItems.length, tick]);

  if (isLoading) {
    return (
      <section className="px-6 py-16 md:px-12">
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-2" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-5 w-28" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-7 w-10" />)}
            </div>
            <Skeleton className="h-12 w-36 mt-4" />
          </div>
          <Skeleton className="aspect-square w-full max-w-md mx-auto" />
        </div>
      </section>
    );
  }

  if (!hotItems.length) return null;

  const item = hotItems[active];

  // Derive color display
  const colorLabel = item.variants?.length
    ? item.variants[0]?.color || item.color
    : item.color;
  const colorHex = getColorHex(colorLabel || "");

  return (
    <>
      <section className="relative overflow-hidden px-6 py-16 md:px-12">
        {/* Subtle background glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ background: "radial-gradient(ellipse 65% 55% at 65% 50%, #b8ff57 0%, transparent 70%)" }}
        />

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-6xl md:text-7xl">HOT SELECTIONS</h2>
              <p className="mt-2 text-xs tracking-[0.3em] text-primary">CURATED PICKS · ALWAYS FRESH</p>
            </div>
            {/* Progress dots */}
            <div className="hidden md:flex items-center gap-2 pb-1">
              {hotItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="relative h-[3px] rounded-full overflow-hidden transition-all duration-300"
                  style={{ width: i === active ? 32 : 12, background: i === active ? '#b8ff57' : 'rgba(255,255,255,0.18)' }}
                  aria-label={`Go to item ${i + 1}`}
                >
                  {i === active && (
                    <motion.span
                      key={`${active}-${tick}`}
                      className="absolute inset-y-0 left-0 bg-white/35 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main spotlight */}
        <div className="grid gap-8 md:grid-cols-2 items-center min-h-[400px] md:min-h-[480px]">

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
                {/* Counter */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-[0.4em] text-primary">
                    {String(active + 1).padStart(2, "0")} / {String(hotItems.length).padStart(2, "0")}
                  </span>
                  <div className="h-px w-12 bg-border" />
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

                {/* CTA */}
                <button
                  onClick={() => {
                    onTrack?.(`hot-selections-view-${item.id}`);
                    setDrawerItem(item);
                  }}
                  className="group inline-flex items-center gap-3 bg-primary px-7 py-3.5 font-mono text-[10px] tracking-[0.35em] text-primary-foreground transition-all hover:bg-off-white hover:shadow-[0_0_30px_rgba(184,255,87,0.25)]"
                >
                  VIEW ITEM
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Image panel */}
          <div className="order-1 md:order-2 flex items-center justify-center">
            <div className="relative w-full max-w-sm md:max-w-md aspect-square overflow-hidden bg-[#0f0f0f] border border-border">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.img
                  key={`img-${item.id}-${active}`}
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

              {/* Corner brackets */}
              <div className="pointer-events-none absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-primary" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Item Drawer */}
      <ItemDrawer item={drawerItem as any} onClose={() => setDrawerItem(null)} />
    </>
  );
};

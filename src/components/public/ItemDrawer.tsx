import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Phone, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { InventoryItem } from "@/data/inventory";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const ALL_SIZES_TOPS = ["XS","S","M","L","XL","XXL"];
const ALL_SIZES_SHOES = ["40","41","42","43","44"];

const COLOR_MAP: Record<string, string> = {
  black: "#0a0a0a",
  white: "#f0ede8",
  cream: "#efe6d2",
  gray: "#8a8a8a",
  grey: "#8a8a8a",
  silver: "#c8c8cc",
  red: "#d4341f",
  pink: "#ff8fb3",
  blue: "#2b6cb0",
  navy: "#0f1e3d",
  royal: "#1c3fa8",
  green: "#2f8f4a",
  camo: "#5a6b3a",
  brown: "#5a3a25",
  wheat: "#c9a36b",
  indigo: "#2b3a7a",
  vintage: "#6b5a48",
  washed: "#2a2a2a",
  cleveland: "#7a1f2b",
  classic: "#b89968",
};

const parseColors = (color: string) => {
  const parts = color.split(/[\/,]/).map((p) => p.trim()).filter(Boolean);
  return parts.map((label) => {
    const key = Object.keys(COLOR_MAP).find((k) => label.toLowerCase().includes(k));
    return { label, hex: key ? COLOR_MAP[key] : "#8a8a8a" };
  });
};

export const ItemDrawer = ({
  item,
  onClose,
}: {
  item: InventoryItem | null;
  onClose: () => void;
}) => {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const isMobile = useIsMobile();

  // Reset image index when item changes
  useEffect(() => {
    setImgIdx(0);
    setSize(null);
    setColor(0);
  }, [item?.name]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [item]);

  // Build images array from item
  const images: string[] = (item as any)?.images?.length > 0
    ? (item as any).images
    : item?.image ? [item.image] : [];

  const isOOS = item && item.qty === 0;

  // Derive colors and sizes from variants if available
  const variants: any[] = (item as any)?.variants || [];

  const parsedColors = variants.length > 0
    ? ([...new Set(variants.map((v: any) => v.color).filter(Boolean))] as string[]).map((label) => {
        const key = Object.keys(COLOR_MAP).find(k => label.toLowerCase().includes(k));
        return { label, hex: key ? COLOR_MAP[key] : '#8a8a8a' };
      })
    : parseColors(item?.color || '');

  const selectedColorLabel = parsedColors[color]?.label;

  const availableSizes: string[] = variants.length > 0
    ? ([...new Set(variants.filter((v: any) => v.color === selectedColorLabel).map((v: any) => v.size).filter(Boolean))] as string[])
    : item?.sizes.includes("OS") ? ["OS"]
    : item?.sizes[0]?.match(/^\d/) ? ALL_SIZES_SHOES
    : ALL_SIZES_TOPS;

  const tgMessage = item
    ? `Hi, I'm interested in ${item.brand} ${item.name}${size ? ` — Size ${size}` : ""} — ${selectedColorLabel || item.color}`
    : "";
  const tgLink = `https://t.me/sawkemcollection?text=${encodeURIComponent(tgMessage)}`;

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />

          <motion.aside
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className={
              isMobile
                ? "fixed inset-x-0 bottom-0 top-[64px] z-[71] flex w-full flex-col overflow-hidden bg-card border-t border-border"
                : "fixed right-0 top-0 z-[71] flex h-full w-full max-w-[460px] flex-col overflow-hidden bg-card border-l border-border"
            }
          >
            {/* Header bar — Back + Close */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
              <button
                onClick={onClose}
                aria-label="Back"
                className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" /> BACK
              </button>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Image gallery with prev/next */}
            <div
              className={
                isMobile
                  ? "relative w-full flex-1 overflow-hidden bg-[#111]"
                  : "relative w-full shrink-0 overflow-hidden bg-[#111]"
              }
              style={isMobile ? undefined : { height: 340 }}
            >
              {/* Fallback brand letter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-6xl text-primary/40">
                  {item.brand.charAt(0)}
                </span>
                <span className="mt-2 text-[10px] tracking-[0.3em] text-muted-foreground">
                  {item.brand.toUpperCase()}
                </span>
              </div>

              {/* Current image */}
              {images.length > 0 && (
                <img
                  key={imgIdx}
                  src={images[imgIdx]}
                  alt={`${item.name} ${imgIdx + 1}`}
                  className={`absolute inset-0 block h-full w-full ${
                    isMobile ? "object-cover" : "object-contain p-3"
                  }`}
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}

              {/* Prev / Next arrows — only when multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-black/60 text-white hover:bg-primary/80 transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-black/60 text-white hover:bg-primary/80 transition-colors z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === imgIdx ? 'bg-primary w-5' : 'bg-white/40 w-1.5'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Details */}
            <div className="shrink-0 px-5 py-3">
              <p className="text-xs tracking-[0.3em] text-primary uppercase">{item.brand}</p>
              <h2 className="mt-0.5 font-display text-2xl tracking-wide">{item.name}</h2>
              {item.price && (
                <p className="mt-0.5 font-mono text-base text-off-white">ETB {item.price.toLocaleString()}</p>
              )}

              {/* Color */}
              <div className="mt-3">
                <p className="mb-1.5 text-[10px] tracking-[0.3em] text-muted-foreground">COLOR</p>
                <div className="flex flex-wrap gap-2">
                  {parsedColors.map((c, i) => (
                    <button
                      key={c.label + i}
                      onClick={() => { setColor(i); setSize(null); }}
                      className="flex items-center gap-2 text-xs text-off-white"
                    >
                      <span
                        className={`h-5 w-5 rounded-full border transition-all ${
                          color === i
                            ? "border-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-card"
                            : "border-border"
                        }`}
                        style={{ background: c.hex }}
                      />
                      <span className={color === i ? "text-primary" : ""}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              {availableSizes.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-[10px] tracking-[0.3em] text-muted-foreground">SIZE</p>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        disabled={!!isOOS}
                        onClick={() => setSize(s)}
                        className={`min-w-[40px] border px-3 py-1.5 text-xs transition-all ${
                          size === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons — side-by-side on desktop, stacked on mobile */}
            <div className="shrink-0 border-t border-border bg-card px-5 py-4">
              {isOOS ? (
                <a
                  href={tgLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-secondary border border-border px-4 py-3 text-center text-xs tracking-[0.25em] text-muted-foreground"
                >
                  OUT OF STOCK — JOIN WAITLIST VIA TELEGRAM
                </a>
              ) : (
                <div className={isMobile ? "space-y-3" : "flex gap-3"}>
                  <a
                    href={tgLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 bg-primary px-4 py-3 text-xs tracking-[0.25em] text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Send className="h-4 w-4" /> ORDER VIA TELEGRAM
                  </a>
                  <a
                    href="tel:+251951077634"
                    className="flex flex-1 items-center justify-center gap-2 border border-off-white px-4 py-3 text-xs tracking-[0.25em] text-off-white hover:bg-off-white hover:text-background transition-colors"
                  >
                    <Phone className="h-4 w-4" /> CALL TO RESERVE
                  </a>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

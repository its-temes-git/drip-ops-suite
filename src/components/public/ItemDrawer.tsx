import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Phone, Share2, MapPin } from "lucide-react";
import { InventoryItem } from "@/data/inventory";
import { useState } from "react";
import { toast } from "sonner";

const ALL_SIZES_TOPS = ["XS","S","M","L","XL","XXL"];
const ALL_SIZES_SHOES = ["38","39","40","41","42","43","44","45"];

const describe = (item: InventoryItem) => {
  return `Authentic ${item.brand} ${item.name}. Original import. Available exclusively at Sawkem Fashion, Summit Branch — Addis Ababa.`;
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

  const isOOS = item && item.qty === 0;
  const isShoes = item?.category === "Shoes";
  const sizePool = item?.sizes[0]?.match(/^\d/) ? ALL_SIZES_SHOES : ALL_SIZES_TOPS;
  const sizes = item?.sizes.includes("OS") ? ["OS"] : sizePool;

  const tgMessage = item
    ? `Hi, I'm interested in ${item.brand} ${item.name}${size ? ` — Size ${size}` : ""} — ${item.color}`
    : "";
  const tgLink = `https://t.me/sawkemcollection?text=${encodeURIComponent(tgMessage)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("LINK COPIED");
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed right-0 top-0 z-[71] flex h-full w-full max-w-[480px] flex-col overflow-y-auto bg-card border-l border-border"
          >
            <div className="flex items-center justify-between p-4">
              <span className="text-xs tracking-[0.3em] text-muted-foreground">ITEM DETAILS</span>
              <button onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-[4/5] w-full overflow-hidden bg-secondary">
              {item.image && (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
              )}
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="text-xs tracking-[0.3em] text-primary uppercase">{item.brand}</p>
              <h2 className="mt-2 font-display text-4xl tracking-wide">{item.name}</h2>
              {item.price && (
                <p className="mt-2 font-mono text-xl text-off-white">ETB {item.price.toLocaleString()}</p>
              )}

              <div className="mt-6">
                <p className="mb-2 text-[10px] tracking-[0.3em] text-muted-foreground">COLOR</p>
                <div className="flex gap-2">
                  {[item.color].map((c, i) => (
                    <button
                      key={c}
                      onClick={() => setColor(i)}
                      className={`flex items-center gap-2 border px-3 py-1.5 text-xs ${
                        color === i ? "border-primary text-primary" : "border-border text-off-white"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-off-white" />
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-[10px] tracking-[0.3em] text-muted-foreground">SIZE</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const available = item.sizes.includes(s);
                    return (
                      <button
                        key={s}
                        disabled={!available || isOOS}
                        onClick={() => setSize(s)}
                        className={`min-w-[42px] border px-3 py-2 text-xs transition-all ${
                          !available
                            ? "border-border text-muted-foreground line-through opacity-40"
                            : size === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                {item.qty} item{item.qty === 1 ? "" : "s"} left at Summit Branch
              </p>

              <p className="mt-6 text-sm leading-relaxed text-off-white/80">{describe(item)}</p>

              <div className="mt-8 space-y-3">
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
                  <>
                    <a
                      href={tgLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 text-xs tracking-[0.25em] text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Send className="h-4 w-4" /> ORDER VIA TELEGRAM
                    </a>
                    <a
                      href="tel:+251951077634"
                      className="flex w-full items-center justify-center gap-2 border border-off-white px-4 py-3 text-xs tracking-[0.25em] text-off-white hover:bg-off-white hover:text-background transition-colors"
                    >
                      <Phone className="h-4 w-4" /> CALL TO RESERVE
                    </a>
                  </>
                )}
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary" /> Pick up at Summit Branch, Addis Ababa
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-[10px] tracking-[0.3em] text-muted-foreground">SHARE</span>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 text-xs text-off-white hover:text-primary"
                >
                  <Share2 className="h-3 w-3" /> COPY LINK
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

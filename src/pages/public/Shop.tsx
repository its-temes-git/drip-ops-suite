import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { InventoryItem } from "@/data/inventory";
import { ItemDrawer } from "@/components/public/ItemDrawer";

const PAGE_SIZE = 12;

type Cat = "ALL" | "Shoes" | "Tops" | "Bottoms" | "Accessories";
const CATS: { key: Cat; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "Shoes", label: "SHOES" },
  { key: "Tops", label: "TOPS & HOODIES" },
  { key: "Bottoms", label: "BOTTOMS" },
  { key: "Accessories", label: "ACCESSORIES & BAGS" },
];

const SORTS = ["NEWEST", "PRICE LOW-HIGH", "PRICE HIGH-LOW", "BRAND A-Z"] as const;

const ShopPage = () => {
  const { inventory } = useApp();
  const [cat, setCat] = useState<Cat>("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("NEWEST");
  const [active, setActive] = useState<InventoryItem | null>(null);
  const [params, setParams] = useSearchParams();
  const [catsOpen, setCatsOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = params.get("item");
    if (id) {
      const found = inventory.find((i) => i.id === Number(id));
      if (found) setActive(found);
    }
  }, [params, inventory]);

  const filtered = useMemo(() => {
    let list = inventory.filter((i) => cat === "ALL" || i.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => `${i.brand} ${i.name}`.toLowerCase().includes(q));
    }
    if (sort === "PRICE LOW-HIGH") list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === "PRICE HIGH-LOW") list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sort === "BRAND A-Z") list = [...list].sort((a, b) => a.brand.localeCompare(b.brand));
    return list;
  }, [inventory, cat, search, sort]);

  useEffect(() => { setPage(1); }, [cat, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <section className="diagonal-lines px-6 py-6 md:px-12 md:py-10 border-b border-border">
        <h1 className="font-display text-5xl md:text-7xl leading-none">EXPLORE COLLECTION</h1>
      </section>

      <div className="sticky top-16 z-30 backdrop-blur-md bg-background/90 border-b border-border">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 md:px-12">
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 border-b border-border px-2">
              <Search className="h-3 w-3 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH ITEMS..."
                className="bg-transparent py-1 text-xs outline-none placeholder:tracking-widest placeholder:text-muted-foreground w-32 md:w-40"
              />
            </div>
            <button
              onClick={() => setCatsOpen((v) => !v)}
              aria-expanded={catsOpen}
              className={`flex items-center gap-2 border px-3 py-1.5 text-[10px] tracking-[0.25em] transition-all ${
                catsOpen || cat !== "ALL"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-off-white hover:border-primary"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              {cat === "ALL" ? "CATEGORIES" : CATS.find((c) => c.key === cat)?.label}
            </button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {catsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="flex flex-wrap gap-2 px-6 py-4 md:px-12">
                {CATS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => { setCat(c.key); setCatsOpen(false); }}
                    className={`border px-3 py-1.5 text-[10px] tracking-[0.25em] transition-all ${
                      cat === c.key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-off-white hover:border-primary"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section className="px-6 py-12 md:px-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {paginated.map((it) => {
            const oos = it.qty === 0;
            const low = it.qty > 0 && it.qty <= 3;
            return (
              <motion.button
                key={it.id}
                whileHover={{ y: -4 }}
                onClick={() => {
                  setActive(it);
                  setParams({ item: String(it.id) }, { replace: true });
                }}
                className={`group relative text-left border border-border bg-card transition-all hover:border-primary hover:shadow-[0_0_24px_-8px_hsl(var(--primary)/0.5)] ${
                  oos ? "opacity-60" : ""
                }`}
              >
                <div className="aspect-square overflow-hidden bg-secondary relative">
                  {it.image && (
                    <img src={it.image} alt={it.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  )}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full bg-primary px-3 py-2 text-center text-[10px] tracking-[0.3em] text-primary-foreground transition-transform group-hover:translate-y-0">
                    QUICK VIEW
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-display text-lg md:text-xl leading-tight">{it.brand} {it.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-off-white" />
                    <span className="text-[10px] text-muted-foreground">{it.color}</span>
                  </div>
                  {it.price && (
                    <p className="mt-2 font-mono text-sm text-off-white">ETB {it.price.toLocaleString()}</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">No items match your filters.</p>
        )}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center border border-border text-off-white transition-colors hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-off-white"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-9 min-w-[36px] border px-2 text-[11px] tracking-[0.2em] transition-all ${
                  p === currentPage
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-off-white hover:border-primary"
                }`}
              >
                {p.toString().padStart(2, "0")}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center border border-border text-off-white transition-colors hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-off-white"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      <ItemDrawer
        item={active}
        onClose={() => {
          setActive(null);
          params.delete("item");
          setParams(params, { replace: true });
        }}
      />
    </>
  );
};

export default ShopPage;

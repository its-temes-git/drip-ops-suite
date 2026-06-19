import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Upload, Check, Loader2, Plus, Minus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { ALL_BRANDS, Category } from "@/data/inventory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const FASHION_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Grey", hex: "#808080" },
  { name: "Beige", hex: "#C8AD8F" },
  { name: "Brown", hex: "#7B4F2E" },
  { name: "Red", hex: "#CC2200" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Forest", hex: "#2D5A27" },
  { name: "Olive", hex: "#6B7C35" },
  { name: "Blue", hex: "#2255CC" },
  { name: "Sky", hex: "#87CEEB" },
  { name: "Yellow", hex: "#F5C400" },
  { name: "Orange", hex: "#E8621A" },
  { name: "Pink", hex: "#F4A0B0" },
  { name: "Purple", hex: "#6A0DAD" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Cream", hex: "#F5F0E8" },
];

const SHOE_SIZES = ["36","37","38","39","40","41","42","43","44","45","46","47"];
const CLOTH_SIZES = ["XS","S","M","L","XL","XXL"];

const getSizesForCategory = (cat: string): string[] => {
  if (cat === "Shoes") return SHOE_SIZES;
  if (cat === "Accessories") return [];
  return CLOTH_SIZES;
};

const cats = ["Shoes", "Tops", "Bottoms", "Accessories", "Complete", "Shirt", "T-Shirt", "Hoodie", "Jacket", "Jeans", "Jogger", "Short"] as const;

const NewDrop = () => {
  const { addItem } = useApp();
  const queryClient = useQueryClient();
  const [brand, setBrand] = useState(ALL_BRANDS[0]);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<Category>("Tops");
  const [newVariants, setNewVariants] = useState<any[]>([]);
  const [newItemSize, setNewItemSize] = useState("");
  const [newItemColor, setNewItemColor] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState<"TG" | "TT">("TG");
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const addNewItemVariant = () => {
    const needsSize = getSizesForCategory(cat).length > 0;
    if (!newItemColor || (needsSize && !newItemSize)) {
      toast.error(needsSize ? "Please select a size and a color" : "Please select a color");
      return;
    }
    setNewVariants([...newVariants, { size: newItemSize || null, color: newItemColor, qty: 1 }]);
    setNewItemSize("");
    setNewItemColor("");
  };

  const removeNewItemVariant = (index: number) => {
    setNewVariants(newVariants.filter((_, i) => i !== index));
  };

  const updateNewItemVariantQty = (index: number, delta: number) => {
    setNewVariants(newVariants.map((v, i) =>
      i === index ? { ...v, qty: Math.max(1, (v.qty || 1) + delta) } : v
    ));
  };

  const [styleIndex, setStyleIndex] = useState(0);

  const tgTemplates = [
    // 1. Classic
    (n: string, b: string, s: string[], c: string) => `🔥 NEW DROP — SAWKEM FASHION\n${n || "[Item Name]"} — ${b}\nSizes: ${s.join(", ") || "[Sizes]"}\nColors: ${c || "[Colors]"}\n📍 Available now at Summit Branch\n💬 DM to order: @sawkemcollection\n📞 0951 077 634`,
    // 2. Hype
    (n: string, b: string, s: string[], c: string) => `💎 DRIP CHECK: ${b} ${n || "NEW ARRIVAL"} 💎\nLevel up your rotation with the latest from ${b}.\n📏 Sizes: ${s.join(", ")}\n🎨 Colors: ${c}\n⚡ Limited stock. First come, first served.\n📲 Secure yours: @sawkemcollection`,
    // 3. Minimalist
    (n: string, b: string, s: string[], c: string) => `${b} // ${n || "Season Essentials"}\n\nSizes: ${s.join(", ")}\nShop in-store at Summit.\n\n@sawkemcollection`,
    // 4. Urgent
    (n: string, b: string, s: string[], c: string) => `🚨 RESTOCK ALERT / NEW DROP 🚨\n${b} ${n} is moving FAST.\n\nOnly a few pieces left in sizes: ${s.join(", ")}\nDon't sleep on this. 💤\n👉 DM NOW: @sawkemcollection`
  ];

  const ttTemplates = [
    // 1. Classic
    (n: string, b: string) => `New ${n || "[item]"} just dropped 🔥 ${b} energy only.\nAvailable now — Summit, Addis.\nLink in bio or DM 👇\n#sawkemfashion #streetwear #${b.replace(/\s+/g, "")} #AddisAbaba #drip`,
    // 2. Hook
    (n: string, b: string) => `Wait for the end... 😤 The ${b} ${n} is finally here.\nRate the fit 1-10? 👇\n📍 Sawkem Fashion, Summit\n#newarrival #streetstyle #ethiopianfashion`,
    // 3. Vibe
    (n: string, b: string) => `Pov: You just found the perfect ${n} 😮‍💨\nQuality is 10/10. Brand: ${b}.\nAvailable in-store now.\n#aesthetic #fashionhacks #sawkem`,
    // 4. Short
    (n: string, b: string) => `The wait is over. ${b} ${n} 🌊\nGet it before it's gone.\n#sawkem #foryou #addis`
  ];

  const derivedSizes = useMemo(() => [...new Set(newVariants.map(v => v.size).filter(Boolean))], [newVariants]);
  const derivedColors = useMemo(() => [...new Set(newVariants.map(v => v.color).filter(Boolean))].join(", "), [newVariants]);

  const tg = useMemo(() => tgTemplates[styleIndex % tgTemplates.length](name, brand, derivedSizes, derivedColors), [brand, name, derivedSizes, derivedColors, styleIndex]);
  const tt = useMemo(() => ttTemplates[styleIndex % ttTemplates.length](name, brand), [brand, name, styleIndex]);

  const addMutation = useMutation({
    mutationFn: (data: any) => api.owner.addProduct(data),
    onSuccess: () => {
      toast.success(`✓ ${name.toUpperCase()} ADDED`);
      setName("");
      setBrand(ALL_BRANDS[0]);
      setCat("Tops");
      setNewVariants([]);
      setNewItemSize("");
      setNewItemColor("");
      setPrice("");
      setCostPrice("");
      setImages([]);
      setImgIdx(0);
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
    onError: (err: any) => {
      toast.error(`Error: ${err.message}`);
    }
  });


  const submit = () => {
    if (!name || newVariants.length === 0) return toast.error("FILL NAME + VARIANTS");
    if (Number(price) <= 0) return toast.error("PRICE MUST BE > 0");

    const catMap: Record<string, string> = {
      "Tops": "44444444-4444-4444-4444-444444444441",
      "Bottoms": "44444444-4444-4444-4444-444444444442",
      "Accessories": "44444444-4444-4444-4444-444444444443",
      "Shoes": "44444444-4444-4444-4444-444444444444",
      "Shirt": "44444444-4444-4444-4444-444444444445",
      "T-Shirt": "44444444-4444-4444-4444-444444444446",
      "Hoodie": "44444444-4444-4444-4444-444444444447",
      "Jacket": "44444444-4444-4444-4444-444444444448",
      "Jeans": "44444444-4444-4444-4444-444444444449",
      "Jogger": "44444444-4444-4444-4444-444444444450",
      "Short": "44444444-4444-4444-4444-444444444451"
    };

    addMutation.mutate({
      name,
      brand,
      description: `Sizes: ${derivedSizes.join(", ")}, Colors: ${derivedColors}`,
      current_price: Number(price),
      cost_price: Number(costPrice) || 0,
      category_id: catMap[cat] || catMap["Tops"],
      images: images.filter(Boolean),
      variants: newVariants.map(v => ({ size: v.size || "OS", color: v.color || "Default", qty: Number(v.qty) })),
      is_visible: true
    });
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    toast.success("COPIED ✓");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-display text-3xl sm:text-5xl tracking-wide">NEW DROP GENERATOR</h1>
        <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">
          ADD INVENTORY + GENERATE TELEGRAM / TIKTOK CAPTIONS
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Form */}
        <div className="border border-border bg-card p-4 sm:p-6 space-y-5">
          <h2 className="font-display text-2xl">ITEM DETAILS</h2>

          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">BRAND</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary" placeholder="e.g. Balenciaga" />
          </div>

          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">ITEM NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">CATEGORY</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as Category)} className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-primary">
              {(["Shoes","Tops","Bottoms","Accessories","Shirt","T-Shirt","Hoodie","Jacket","Jeans","Jogger","Short"] as Category[]).map((c) => <option key={c} className="bg-card">{c}</option>)}
            </select>
          </div>

          {/* VARIANTS */}
          <div className="col-span-2 space-y-4 pt-2 border-t border-border/30">
            <div className="flex items-center justify-between">
              <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Variants</label>
              <span className="text-[9px] text-muted-foreground">{newVariants.length} added</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {newVariants.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-3 border border-dashed border-border/30">No variants yet.</p>}
              {newVariants.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-background border border-border/50 px-2 py-1.5 text-xs">
                  <span className="h-4 w-4 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: FASHION_COLORS.find(c => c.name === v.color)?.hex || '#555' }} />
                  {v.size && <span className="px-2 py-0.5 border border-primary/30 text-primary font-bold">{v.size}</span>}
                  <span className="text-off-white uppercase tracking-wide flex-1 truncate">{v.color}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateNewItemVariantQty(idx, -1)} className="h-6 w-6 flex items-center justify-center border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center font-display text-sm text-primary">{v.qty || 1}</span>
                    <button onClick={() => updateNewItemVariantQty(idx, 1)} className="h-6 w-6 flex items-center justify-center border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button onClick={() => removeNewItemVariant(idx)} className="text-muted-foreground hover:text-destructive ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>

            {getSizesForCategory(cat).length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] tracking-widest text-muted-foreground uppercase">Size</p>
                <div className="flex flex-wrap gap-1.5">
                  {getSizesForCategory(cat).map(sz => (
                    <button key={sz} onClick={() => setNewItemSize(sz)}
                      className={`px-3 py-1.5 text-xs border transition-all ${
                        newItemSize === sz ? "border-primary bg-primary text-black font-bold" : "border-border/50 text-muted-foreground hover:border-primary/50"
                      }`}>{sz}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[9px] tracking-widest text-muted-foreground uppercase">Color</p>
              <div className="flex flex-wrap gap-2">
                {FASHION_COLORS.map(col => (
                  <button key={col.name} title={col.name} onClick={() => setNewItemColor(col.name)}
                    className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 ${
                      newItemColor === col.name ? "border-primary scale-110 shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "border-transparent"
                    }`}
                    style={{ backgroundColor: col.hex }} />
                ))}
              </div>
              {newItemColor && <p className="text-[9px] text-primary tracking-wider">Selected: {newItemColor}</p>}
            </div>

            <button onClick={addNewItemVariant}
              disabled={!newItemColor || (getSizesForCategory(cat).length > 0 && !newItemSize)}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-primary/40 py-2.5 text-[10px] tracking-widest text-primary hover:bg-primary/5 transition-colors font-bold disabled:opacity-40">
              <Plus className="h-4 w-4" /> ADD VARIANT
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase">COST PRICE (ETB) <span className="text-primary/60">— what you paid</span></label>
              <input
                type="text"
                inputMode="numeric"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary font-display text-lg text-muted-foreground"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase">SELLING PRICE (ETB)</label>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary font-display text-lg text-primary"
              />
            </div>
          </div>

          {/* Multi-image upload — up to 5 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Product Photos</label>
              <span className="text-[9px] tracking-widest text-muted-foreground">{images.length}/5</span>
            </div>

            {/* Preview area */}
            <div className="relative aspect-video w-full border border-border bg-muted overflow-hidden">
              {images.length > 0 ? (
                <>
                  <img src={images[imgIdx]} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                  {/* Dots */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-primary w-4' : 'bg-white/40 w-1.5'}`}
                      />
                    ))}
                  </div>
                  {/* Prev/Next */}
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-black/60 text-white hover:bg-primary/80 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-black/60 text-white hover:bg-primary/80 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {/* Delete current */}
                  <button onClick={() => { const n = images.filter((_, i) => i !== imgIdx); setImages(n); setImgIdx(Math.max(0, imgIdx - 1)); }}
                    className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center bg-destructive/90 text-white hover:bg-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                  <Upload className="h-7 w-7" />
                  <span className="text-[10px] tracking-widest uppercase">No photos yet</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 h-12 w-12 border-2 overflow-hidden ${i === imgIdx ? 'border-primary' : 'border-border/50'}`}>
                    <img src={img} className="h-full w-full object-cover" alt={`thumb ${i}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Add controls */}
            {images.length < 5 && (
              <div className="space-y-2">
                <div
                  onClick={() => document.getElementById('drop-file-input')?.click()}
                  className="border border-dashed border-primary/40 py-3 flex items-center justify-center gap-2 text-primary text-[10px] tracking-widest font-bold cursor-pointer hover:bg-primary/5 transition-colors"
                >
                  <Upload className="h-4 w-4" /> {images.length === 0 ? 'UPLOAD ITEM PHOTO' : 'ADD ANOTHER PHOTO'}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Or paste image URL and press Enter..."
                    className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 text-[10px] tracking-widest outline-none focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && images.length < 5) {
                          setImages(prev => { const n = [...prev, val]; setImgIdx(n.length - 1); return n; });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">ENTER ↵</span>
                </div>
              </div>
            )}
            <input
              id="drop-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || images.length >= 5) return;
                if (file.size > 2 * 1024 * 1024) { toast.error('Image too large (max 2MB)'); return; }
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result as string;
                  setImages(prev => { const n = [...prev, result]; setImgIdx(n.length - 1); return n; });
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
          </div>

          <button
            onClick={submit}
            disabled={addMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary py-4 font-display text-lg tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {addMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "ADD TO INVENTORY + GENERATE DROP"}
          </button>
        </div>

        {/* Preview */}
        <div className="border border-border bg-card p-4 sm:p-6 space-y-4">
          <h2 className="font-display text-2xl">READY TO POST</h2>
          <div className="flex gap-6 text-[10px] tracking-widest border-b border-border">
            {(["TG","TT"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2 ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
              >{t === "TG" ? "TELEGRAM" : "TIKTOK"}</button>
            ))}
          </div>

          <pre className="whitespace-pre-wrap bg-background p-4 text-sm leading-relaxed border border-border min-h-[280px] font-mono">
{tab === "TG" ? tg : tt}
          </pre>

          <div className="flex gap-2">
            <button
              onClick={() => copy(tab === "TG" ? tg : tt)}
              className="flex-1 flex items-center justify-center gap-2 border border-border bg-card py-2.5 text-xs tracking-widest hover:border-primary transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              {copied ? "COPIED" : "COPY CAPTION"}
            </button>
            <button
              onClick={() => setStyleIndex(i => i + 1)}
              className="flex items-center justify-center gap-2 border border-border bg-card px-4 py-2.5 text-xs tracking-widest hover:border-primary transition-colors text-primary"
            >
              <Loader2 className={`h-4 w-4 ${isUploading ? "animate-spin" : ""}`} />
              REGENERATE STYLE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDrop;

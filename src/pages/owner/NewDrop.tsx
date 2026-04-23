import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { ALL_BRANDS, Category } from "@/data/inventory";

const SIZE_OPTIONS = ["XS","S","M","L","XL","XXL","38","39","40","41","42","43","44","45"];

const NewDrop = () => {
  const { addItem } = useApp();
  const [brand, setBrand] = useState(ALL_BRANDS[0]);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<Category>("Tops");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [tab, setTab] = useState<"TG" | "TT">("TG");
  const [copied, setCopied] = useState(false);

  const toggleSize = (s: string) =>
    setSizes((arr) => arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]);

  const tg = useMemo(() =>
`🔥 NEW DROP — SAWKEM FASHION
${name || "[Item Name]"} — ${brand}
Sizes: ${sizes.join(", ") || "[Sizes]"}
Colors: ${colors || "[Colors]"}
📍 Available now at Summit Branch
💬 DM to order: @sawkemcollection
📞 0951 077 634`, [brand, name, sizes, colors]);

  const tt = useMemo(() =>
`New ${name || "[item]"} just dropped 🔥 ${brand} energy only.
Available now — Summit, Addis.
Link in bio or DM 👇
#sawkemfashion #streetwear #${brand.replace(/\s+/g, "")} #AddisAbaba #drip`, [brand, name]);

  const submit = () => {
    if (!name || !sizes.length) return toast.error("FILL NAME + SIZES");
    addItem({
      brand, name, category: cat,
      sizes, color: colors || "—", qty, price,
    });
    toast.success(`✓ ${name.toUpperCase()} ADDED`);
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
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-primary">
              {ALL_BRANDS.map((b) => <option key={b} className="bg-card">{b}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">ITEM NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">CATEGORY</label>
            <select value={cat} onChange={(e) => setCat(e.target.value as Category)} className="w-full bg-transparent border-b border-border py-2 text-sm outline-none focus:border-primary">
              {(["Shoes","Tops","Bottoms","Accessories"] as Category[]).map((c) => <option key={c} className="bg-card">{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">SIZES</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1 text-xs border ${sizes.includes(s) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}
                >{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground">COLORS (comma separated)</label>
            <input value={colors} onChange={(e) => setColors(e.target.value)} className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary" placeholder="Black, White" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] tracking-widest text-muted-foreground">QUANTITY</label>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(+e.target.value)} className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-muted-foreground">PRICE (ETB)</label>
              <input type="number" min={0} value={price} onChange={(e) => setPrice(+e.target.value)} className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary" />
            </div>
          </div>

          <div className="border-2 border-dashed border-border p-6 flex flex-col items-center text-muted-foreground text-xs">
            <Upload className="h-6 w-6 mb-2" />
            UPLOAD ITEM PHOTO (UI ONLY)
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={submit}
            className="w-full bg-primary py-4 font-display text-lg tracking-widest text-primary-foreground"
          >
            ADD TO INVENTORY + GENERATE DROP
          </motion.button>
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

          <button
            onClick={() => copy(tab === "TG" ? tg : tt)}
            className="flex items-center gap-2 border border-border px-4 py-2 text-xs tracking-widest hover:border-primary"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            {copied ? "COPIED" : "COPY CAPTION"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDrop;

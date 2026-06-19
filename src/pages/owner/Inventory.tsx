import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, TrendingUp, Sun, Plus, Minus, Trash2, Eye, EyeOff, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

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

const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47"];
const CLOTH_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const WAIST_SIZES = ["28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38"];

const getSizesForCategory = (cat: string): string[] => {
  if (cat === "Shoes") return SHOE_SIZES;
  if (cat === "Accessories") return [];
  if (cat === "Bottoms" || cat === "Jeans" || cat === "Jogger" || cat === "Short") return [...CLOTH_SIZES, ...WAIST_SIZES];
  return CLOTH_SIZES;
};

const statusOf = (qty: number) =>
  qty === 0 ? "OUT" : qty <= 3 ? "LOW" : "IN";

const InventoryPage = () => {
  const { user } = useApp();
  const queryClient = useQueryClient();

  const { data: rawInventory = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.owner.inventory()
  });

  console.log("RAW INVENTORY DATA:", rawInventory);

  const inventory = useMemo(() => {
    return rawInventory.map((i: any) => {
      const variants = i.variants || [];
      const extractedSizes = variants.length > 0 ? [...new Set(variants.map((v: any) => v.size))] : (i.sizes || ['-']);
      const extractedColor = variants.length > 0 ? [...new Set(variants.map((v: any) => v.color))].join(', ') : (i.color || '-');

      return {
        id: i.id,
        brand: i.brand || 'SAWKEM',
        name: i.name,
        category: i.category || 'General',
        sizes: extractedSizes,
        color: extractedColor,
        price: i.current_price || i.price || 0,
        cost_price: Number(i.cost_price) || 0,
        qty: i.quantity || i.qty || 0,
        variants: i.variants || [],
        is_visible: i.is_visible !== false,
        is_visible_sales: i.is_visible_sales !== false,
        images: (() => {
          try {
            if (Array.isArray(i.images) && i.images.length > 0) return i.images;
            if (typeof i.images === 'string') {
              const parsed = JSON.parse(i.images);
              return Array.isArray(parsed) ? parsed : [parsed];
            }
          } catch (e) {
            return typeof i.images === 'string' ? [i.images] : [];
          }
          return [];
        })(),
        image: (() => {
          try {
            if (Array.isArray(i.images) && i.images.length > 0) return i.images[0];
            if (typeof i.images === 'string') {
              const parsed = JSON.parse(i.images);
              return Array.isArray(parsed) ? parsed[0] : parsed;
            }
          } catch (e) {
            return typeof i.images === 'string' ? i.images : null;
          }
          return null;
        })()
      };
    });
  }, [rawInventory]);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");
  const [brand, setBrand] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [open, setOpen] = useState<number | null>(null);
  const [restockItem, setRestockItem] = useState<any | null>(null);
  const [restockQty, setRestockQty] = useState(5);
  const [restockNote, setRestockNote] = useState("");
  const [isRestocking, setIsRestocking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editPrice, setEditPrice] = useState<string>("0");
  const [editCostPrice, setEditCostPrice] = useState<string>("0");
  const [editQty, setEditQty] = useState<string>("0");
  const [editName, setEditName] = useState<string>("");
  const [editBrand, setEditBrand] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editImgIdx, setEditImgIdx] = useState(0);
  const [editVariants, setEditVariants] = useState<any[]>([]);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    brand: "",
    category: "General",
    price: "",
    costPrice: "",
    qty: "",
    image: ""
  });
  const [newVariants, setNewVariants] = useState<any[]>([]);
  const [newItemSize, setNewItemSize] = useState("");
  const [newItemColor, setNewItemColor] = useState("");

  const brands = useMemo(() => Array.from(new Set(inventory.map((i) => i.brand))).sort(), [inventory]);
  const cats = useMemo(() => {
    const found = Array.from(new Set(inventory.map((i) => i.category)));
    const defaults = ["General", "Tops", "Bottoms", "Shoes", "Accessories", "Complete", "Shirt", "T-Shirt", "Hoodie", "Jacket", "Jeans", "Jogger", "Short"];
    return Array.from(new Set([...defaults, ...found]));
  }, [inventory]);

  const filtered = useMemo(() => {
    return inventory.filter((i) => {
      if (q && !`${i.brand} ${i.name}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "ALL" && i.category !== cat) return false;
      if (brand !== "ALL" && i.brand !== brand) return false;
      const s = statusOf(i.qty);
      if (status === "IN" && s !== "IN") return false;
      if (status === "LOW" && s !== "LOW") return false;
      if (status === "OUT" && s !== "OUT") return false;
      return true;
    });
  }, [inventory, q, cat, brand, status]);

  const selected = useMemo(() => inventory.find((i: any) => i.id === open), [inventory, open]);

  useEffect(() => {
    if (selected) {
      setEditPrice(String(selected.price || 0));
      setEditCostPrice(String((selected as any).cost_price || 0));
      const initialVariants = Array.isArray(selected.variants)
        ? selected.variants.filter((v: any) => Number(v.qty ?? v.quantity) > 0)
        : [];
      setEditVariants(initialVariants);
      if (initialVariants.length > 0) {
        setEditQty(String(initialVariants.reduce((acc, v) => acc + (v.qty ?? v.quantity ?? 1), 0)));
      } else {
        setEditQty(String(selected.qty || 0));
      }
      setEditName(selected.name || "");
      setEditBrand(selected.brand || "");
      setEditCategory(selected.category || "");
      const imgs = (selected as any).images || (selected.image ? [selected.image] : []);
      setEditImages(imgs);
      setEditImgIdx(0);
    }
  }, [selected]);

  useEffect(() => {
    const handleOpenAdd = () => setIsAdding(true);
    window.addEventListener('open-add-product', handleOpenAdd);
    return () => window.removeEventListener('open-add-product', handleOpenAdd);
  }, []);

  const handleUpdateProduct = async () => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      await api.owner.updateProduct(selected.id, {
        name: editName,
        brand: editBrand,
        category_id: editCategory,
        current_price: Number(editPrice),
        cost_price: Number(editCostPrice),
        variants: editVariants,
        images: editImages.filter(Boolean)
      });

      const qtyDiff = Number(editQty) - selected.qty;
      if (qtyDiff !== 0) {
        await api.owner.restock({
          product_id: selected.id,
          branch_id: user?.branch_id || '11111111-1111-1111-1111-111111111111',
          quantity: qtyDiff,
          note: "Direct inventory adjustment"
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Product updated successfully");
      setOpen(null);
    } catch (e: any) {
      if (e.message === 'SESSION_EXPIRED') {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(e.message || "Failed to update product");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selected) return;
    if (!confirm("Are you sure you want to completely delete this item? This action cannot be undone.")) return;
    setIsUpdating(true);
    try {
      await api.owner.deleteProduct(selected.id);
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("Product deleted successfully");
      setOpen(null);
    } catch (e: any) {
      if (e.message === 'SESSION_EXPIRED') {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(e.message || "Failed to delete product");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error("Image too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isNew) {
        setNewItem(prev => ({ ...prev, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRestock = async () => {
    if (!restockItem) return;
    setIsRestocking(true);
    try {
      await api.owner.restock({
        product_id: restockItem.id,
        branch_id: user?.branch_id || '11111111-1111-1111-1111-111111111111',
        quantity: restockQty,
        note: restockNote
      });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Restocked ${restockQty} units of ${restockItem.name}`);
      setRestockItem(null);
      setRestockQty(5);
      setRestockNote("");
    } catch (e: any) {
      if (e.message === 'SESSION_EXPIRED') {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(e.message || "Failed to restock");
      }
    } finally {
      setIsRestocking(false);
    }
  };

  const toggleVisibility = async (field: 'is_visible' | 'is_visible_sales', value: boolean) => {
    if (!selected) return;
    try {
      await api.owner.updateProduct(selected.id, { [field]: value });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      const label = field === 'is_visible' ? 'Public Shop' : 'Sales Portal';
      toast.success(value ? `Visible on ${label}` : `Hidden from ${label}`);
    } catch (e: any) {
      toast.error("Failed to update visibility");
    }
  };

  const handleAddProduct = async () => {
    if (!newItem.name || !newItem.brand) {
      toast.error("Name and Brand are required");
      return;
    }
    setIsUpdating(true);
    try {
      if (Number(newItem.price) <= 0) {
        toast.error("Price must be greater than 0");
        return;
      }
      const product = await api.owner.addProduct({
        name: newItem.name,
        brand: newItem.brand,
        category_id: newItem.category,
        current_price: Number(newItem.price),
        cost_price: Number(newItem.costPrice) || 0,
        images: newItem.image ? [newItem.image] : [],
        is_visible: true,
        variants: newVariants
      });
      const initialQty = Number(newItem.qty);
      if (initialQty > 0) {
        await api.owner.restock({
          product_id: product.id,
          branch_id: user?.branch_id || '11111111-1111-1111-1111-111111111111',
          quantity: initialQty,
          note: "Initial stock entry"
        });
      }
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success("New product added to inventory");
      setIsAdding(false);
      setNewItem({ name: "", brand: "", category: "General", price: "", costPrice: "", qty: "", image: "" });
      setNewVariants([]);
      setNewItemSize("");
      setNewItemColor("");
    } catch (e: any) {
      if (e.message === 'SESSION_EXPIRED') {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error(e.message || "Failed to add product");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const addVariant = () => {
    const needsSize = getSizesForCategory(editCategory).length > 0;
    if (!newColor || (needsSize && !newSize)) {
      toast.error(needsSize ? "Please select a size and a color" : "Please select a color");
      return;
    }
    const isDup = editVariants.some(v => v.color === newColor && v.size === (newSize || null));
    if (isDup) {
      toast.error("This size/color combination already exists");
      return;
    }
    const nextVariants = [...editVariants, { size: newSize || null, color: newColor, qty: 1 }];
    setEditVariants(nextVariants);
    setEditQty(String(nextVariants.reduce((acc, v) => acc + (v.qty || 1), 0)));
    setNewSize("");
    setNewColor("");
  };

  const removeVariant = (index: number) => {
    const nextVariants = editVariants.filter((_, i) => i !== index);
    setEditVariants(nextVariants);
    if (nextVariants.length > 0) {
      setEditQty(String(nextVariants.reduce((acc, v) => acc + (v.qty || 1), 0)));
    } else {
      setEditQty("0");
    }
  };

  const updateVariantQty = (index: number, delta: number) => {
    const v = editVariants[index];
    const currentQty = v.qty || 1;
    if (currentQty === 1 && delta === -1) return;
    const nextVariants = editVariants.map((vItem, i) =>
      i === index ? { ...vItem, qty: currentQty + delta } : vItem
    );
    setEditVariants(nextVariants);
    setEditQty(String(nextVariants.reduce((acc, v) => acc + (v.qty || 1), 0)));
  };

  const addNewItemVariant = () => {
    const needsSize = getSizesForCategory(newItem.category).length > 0;
    if (!newItemColor || (needsSize && !newItemSize)) {
      toast.error(needsSize ? "Please select a size and a color" : "Please select a color");
      return;
    }
    const isDup = newVariants.some(v => v.color === newItemColor && v.size === (newItemSize || null));
    if (isDup) {
      toast.error("This size/color combination already exists");
      return;
    }
    const nextVariants = [...newVariants, { size: newItemSize || null, color: newItemColor, qty: 1 }];
    setNewVariants(nextVariants);
    setNewItem(prev => ({ ...prev, qty: String(nextVariants.reduce((acc, v) => acc + (v.qty || 1), 0)) }));
    setNewItemSize("");
    setNewItemColor("");
  };

  const removeNewItemVariant = (index: number) => {
    const nextVariants = newVariants.filter((_, i) => i !== index);
    setNewVariants(nextVariants);
    setNewItem(prev => ({ ...prev, qty: String(nextVariants.reduce((acc, v) => acc + (v.qty || 1), 0)) }));
  };

  const updateNewItemVariantQty = (index: number, delta: number) => {
    const v = newVariants[index];
    const currentQty = v.qty || 1;
    if (currentQty === 1 && delta === -1) return;
    const nextVariants = newVariants.map((vItem, i) =>
      i === index ? { ...vItem, qty: currentQty + delta } : vItem
    );
    setNewVariants(nextVariants);
    setNewItem(prev => ({ ...prev, qty: String(nextVariants.reduce((acc, v) => acc + (v.qty || 1), 0)) }));
  };

  const { data: dailyStats } = useQuery({
    queryKey: ['owner-dashboard-stats'],
    queryFn: () => api.owner.dashboard()
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 border border-border bg-card/40 px-4 focus-within:border-primary/50 transition-colors">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search inventory..."
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground/50 tracking-wide"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="appearance-none border border-border bg-card/40 px-4 py-4 text-[10px] sm:text-xs tracking-widest outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="ALL">CATEGORY</option>
            {cats.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="appearance-none border border-border bg-card/40 px-4 py-4 text-[10px] sm:text-xs tracking-widest outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="ALL">BRAND</option>
            {brands.map((b) => <option key={b} value={b}>{b.toUpperCase()}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none border border-border bg-card/40 px-4 py-4 text-[10px] sm:text-xs tracking-widest outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="ALL">STATUS</option>
            <option value="IN">IN STOCK</option>
            <option value="LOW">LOW STOCK</option>
            <option value="OUT">OUT</option>
          </select>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:hidden">
        {filtered.map((i, idx) => {
          const s = statusOf(i.qty);
          return (
            <motion.button
              key={i.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.01, 0.2) }}
              onClick={() => setOpen(i.id)}
              className={`flex items-center gap-4 border border-border bg-card/40 p-4 text-left hover:border-primary/30 transition-colors ${!i.is_visible ? 'opacity-50' : ''}`}
            >
              <div className="h-12 w-12 flex-shrink-0 bg-muted border border-border overflow-hidden">
                {i.image ? (
                  <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-display text-lg text-primary/40 uppercase">
                    {i.brand[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-widest text-primary truncate uppercase">{i.brand}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate mt-0.5">{i.name}</p>
                  {!i.is_visible && <span className="text-[8px] px-1.5 py-0.5 bg-muted-foreground/20 text-muted-foreground tracking-widest flex-shrink-0">HIDDEN</span>}
                </div>
                <p className="text-[10px] text-muted-foreground truncate uppercase mt-1 tracking-wider">
                  {i.category} • {i.sizes.join(", ")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="font-display text-2xl leading-none">{i.qty}</span>
                <span className="px-2 py-0.5 text-xs font-bold tracking-[0.1em] bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                  ETB {i.price.toLocaleString()}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block overflow-x-auto pb-4 border border-border/50 rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase border-b border-border/50 bg-card/20">
              <th className="px-4 py-4 text-left font-normal border-r border-border/20">#</th>
              <th className="px-4 py-4 text-left font-normal border-r border-border/20">IMG</th>
              <th className="px-4 py-4 text-left font-normal border-r border-border/20">BRAND</th>
              <th className="px-4 py-4 text-left font-normal border-r border-border/20">ITEM</th>
              <th className="px-4 py-4 text-left font-normal border-r border-border/20">CAT</th>
              <th className="px-4 py-4 text-left font-normal border-r border-border/20">SIZES</th>
              <th className="px-4 py-4 text-left font-normal border-r border-border/20">COLOR</th>
              <th className="px-4 py-4 text-left font-normal border-r border-border/20">QTY</th>
              <th className="px-4 py-4 text-right font-normal">PRICE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {filtered.map((i, idx) => {
              const s = statusOf(i.qty);
              return (
                <motion.tr
                  key={i.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                  onClick={() => setOpen(i.id)}
                  className={`group cursor-pointer hover:bg-primary/5 transition-all ${!i.is_visible ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-4 text-muted-foreground/60 text-xs tabular-nums border-r border-border/10">{idx + 1}</td>
                  <td className="px-4 py-4 border-r border-border/10">
                    <div className="h-10 w-10 bg-muted border border-border/30 overflow-hidden group-hover:border-primary/40 transition-colors">
                      {i.image ? (
                        <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-display text-sm text-primary/40 uppercase">
                          {i.brand[0]}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[10px] tracking-widest text-primary uppercase font-bold border-r border-border/10">{i.brand}</td>
                  <td className="px-4 py-4 font-medium tracking-wide border-r border-border/10">
                    <div className="flex items-center gap-2">
                      {i.name}
                      {!i.is_visible && <span className="text-[8px] px-1.5 py-0.5 bg-muted-foreground/20 text-muted-foreground tracking-widest">HIDDEN</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-xs border-r border-border/10">{i.category}</td>
                  <td className="px-4 py-4 text-xs text-muted-foreground/80 tracking-tight border-r border-border/10">{i.sizes.join(", ")}</td>
                  <td className="px-4 py-4 text-xs text-muted-foreground/80 border-r border-border/10">{i.color}</td>
                  <td className="px-4 py-4 font-display text-xl tabular-nums border-r border-border/10">{i.qty}</td>
                  <td className="px-4 py-4 text-right font-display text-lg text-primary font-bold tabular-nums whitespace-nowrap">
                    ETB {i.price.toLocaleString()}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="bg-card border-border text-off-white overflow-y-auto w-full sm:max-w-md custom-scrollbar">
          {selected && (
            <div className="flex flex-col h-full">
              <SheetHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-widest text-primary font-bold">{selected.brand.toUpperCase()}</p>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${selected.is_visible !== false ? "bg-primary" : "bg-muted-foreground"}`} />
                    <span className="text-[9px] tracking-widest uppercase">{selected.is_visible !== false ? "Visible" : "Hidden"}</span>
                  </div>
                </div>
                <SheetTitle className="font-display text-3xl text-off-white text-left">{selected.name}</SheetTitle>
              </SheetHeader>

              <div className="flex-1 space-y-8 pb-20">
                {/* 1. PRODUCT PHOTOS (up to 5) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Product Images</label>
                    <span className="text-[9px] tracking-widest text-muted-foreground">{editImages.length}/5 PHOTOS</span>
                  </div>

                  {/* Main image viewer with prev/next */}
                  <div className="relative aspect-square w-full bg-muted border border-border overflow-hidden">
                    {editImages.length > 0 ? (
                      <>
                        <img
                          src={editImages[editImgIdx]}
                          alt={`Photo ${editImgIdx + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2'; }}
                          onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
                        />
                        {/* Dot indicators */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                          {editImages.map((_, i) => (
                            <button key={i} onClick={() => setEditImgIdx(i)}
                              className={`h-1.5 w-1.5 rounded-full transition-all ${i === editImgIdx ? 'bg-primary w-4' : 'bg-white/40'}`}
                            />
                          ))}
                        </div>
                        {/* Prev/Next arrows */}
                        {editImages.length > 1 && (
                          <>
                            <button onClick={() => setEditImgIdx(i => (i - 1 + editImages.length) % editImages.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-black/60 text-white hover:bg-primary/80 transition-colors rounded-sm">
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditImgIdx(i => (i + 1) % editImages.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-black/60 text-white hover:bg-primary/80 transition-colors rounded-sm">
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {/* Delete current */}
                        <button onClick={() => {
                          const next = editImages.filter((_, i) => i !== editImgIdx);
                          setEditImages(next);
                          setEditImgIdx(Math.max(0, editImgIdx - 1));
                        }}
                          className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center bg-destructive/90 text-white hover:bg-destructive rounded-sm">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/30 gap-2">
                        <Plus className="h-8 w-8" />
                        <span className="text-[10px] tracking-widest uppercase">No photos yet</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {editImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {editImages.map((img, i) => (
                        <button key={i} onClick={() => setEditImgIdx(i)}
                          className={`flex-shrink-0 h-14 w-14 border-2 overflow-hidden transition-all ${i === editImgIdx ? 'border-primary' : 'border-border/50 hover:border-border'}`}>
                          <img src={img} className="h-full w-full object-cover" alt={`thumb ${i}`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Add photo controls — only show if < 5 */}
                  {editImages.length < 5 && (
                    <div className="space-y-2">
                      <button onClick={() => document.getElementById('edit-file-input')?.click()}
                        className="w-full flex items-center justify-center gap-2 border border-dashed border-primary/40 py-2.5 text-[10px] tracking-widest text-primary hover:bg-primary/5 transition-colors font-bold">
                        <Plus className="h-3.5 w-3.5" /> UPLOAD PHOTO
                      </button>
                      <div className="relative">
                        <input
                          placeholder="Or paste Image URL and press Enter..."
                          className="w-full bg-background border border-border px-3 py-2.5 text-xs outline-none focus:border-primary transition-colors"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val && editImages.length < 5) {
                                setEditImages(prev => [...prev, val]);
                                setEditImgIdx(editImages.length);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground tracking-wider">ENTER ↵</span>
                      </div>
                    </div>
                  )}
                  <input
                    id="edit-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || editImages.length >= 5) return;
                      if (file.size > 2 * 1024 * 1024) { toast.error('Image too large (max 2MB)'); return; }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const result = reader.result as string;
                        setEditImages(prev => { const next = [...prev, result]; setEditImgIdx(next.length - 1); return next; });
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />
                </div>

                {/* 2. CORE INFO */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Item Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Brand</label>
                      <input
                        value={editBrand}
                        onChange={(e) => setEditBrand(e.target.value)}
                        className="w-full bg-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-background border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
                      >
                        {cats.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Cost Price (ETB) <span className="text-primary/50 normal-case">— paid</span></label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editCostPrice}
                        onChange={(e) => setEditCostPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full bg-background border border-border px-3 py-2.5 text-lg font-display outline-none focus:border-primary text-muted-foreground"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Selling Price (ETB)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full bg-background border border-border px-3 py-2.5 text-lg font-display outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Stock Qty</label>
                    <input
                      type="text"
                      readOnly
                      value={editQty}
                      className="w-full bg-muted border border-border px-3 py-2.5 text-lg font-display outline-none text-muted-foreground cursor-not-allowed"
                      title="Quantity is updated automatically when adding variants"
                    />
                  </div>
                </div>

                {/* 2. VARIANTS (SIZE & COLOR) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Variants</label>
                    <span className="text-[9px] text-muted-foreground">{editVariants.length} added</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {editVariants.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-3 border border-dashed border-border/30">No variants yet.</p>}
                    {editVariants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-background border border-border/50 px-2 py-1.5 text-xs">
                        <span className="h-4 w-4 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: FASHION_COLORS.find(c => c.name === v.color)?.hex || '#555' }} />
                        {v.size && <span className="px-2 py-0.5 border border-primary/30 text-primary font-bold">{v.size}</span>}
                        <span className="text-off-white uppercase tracking-wide flex-1 truncate">{v.color}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => updateVariantQty(idx, -1)} className="h-6 w-6 flex items-center justify-center border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center font-display text-sm text-primary">{v.qty || 1}</span>
                          <button onClick={() => updateVariantQty(idx, 1)} className="h-6 w-6 flex items-center justify-center border border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeVariant(idx)} className="text-muted-foreground hover:text-destructive ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>

                  {getSizesForCategory(editCategory).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] tracking-widest text-muted-foreground uppercase">Size</p>
                      <div className="flex flex-wrap gap-1.5">
                        {getSizesForCategory(editCategory).map(sz => (
                          <button key={sz} onClick={() => setNewSize(sz)}
                            className={`px-3 py-1.5 text-xs border transition-all ${newSize === sz ? "border-primary bg-primary text-black font-bold" : "border-border/50 text-muted-foreground hover:border-primary/50"
                              }`}>{sz}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-[9px] tracking-widest text-muted-foreground uppercase">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {FASHION_COLORS.map(col => (
                        <button key={col.name} title={col.name} onClick={() => setNewColor(col.name)}
                          className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 ${newColor === col.name ? "border-primary scale-110 shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "border-transparent"
                            }`}
                          style={{ backgroundColor: col.hex }} />
                      ))}
                    </div>
                    {newColor && <p className="text-[9px] text-primary tracking-wider">Selected: {newColor}</p>}
                  </div>

                  <button onClick={addVariant}
                    disabled={!newColor || (getSizesForCategory(editCategory).length > 0 && !newSize)}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-primary/40 py-2.5 text-[10px] tracking-widest text-primary hover:bg-primary/5 transition-colors font-bold disabled:opacity-40">
                    <Plus className="h-4 w-4" /> ADD VARIANT
                  </button>
                </div>

                {/* 3. VISIBILITY TOGGLE */}
                <div className="pt-6 border-t border-border/30">
                  <label className="text-[10px] tracking-widest text-muted-foreground font-bold block mb-3 uppercase">Store Visibility</label>
                  <div className="flex flex-col gap-3">
                    {/* Public Shop toggle */}
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] tracking-widest text-muted-foreground uppercase">Public Shop</p>
                      <button
                        onClick={() => toggleVisibility('is_visible', !selected.is_visible)}
                        className="relative flex-shrink-0 h-6 w-[52px] rounded-full transition-all duration-300 focus:outline-none"
                        style={{
                          background: selected.is_visible !== false ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(255,255,255,0.07)",
                          border: selected.is_visible !== false ? "1.5px solid #22c55e" : "1.5px solid rgba(255,255,255,0.15)",
                          boxShadow: selected.is_visible !== false ? "0 0 10px rgba(34,197,94,0.3)" : "none",
                        }}
                      >
                        <span className="absolute inset-0 flex items-center font-black text-[8px] tracking-wider select-none"
                          style={{ paddingLeft: selected.is_visible !== false ? "7px" : undefined, paddingRight: selected.is_visible !== false ? undefined : "7px", justifyContent: selected.is_visible !== false ? "flex-start" : "flex-end", color: selected.is_visible !== false ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.4)" }}>
                          {selected.is_visible !== false ? "ON" : "OFF"}
                        </span>
                        <span className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-300"
                          style={{ left: selected.is_visible !== false ? "calc(100% - 20px)" : "2px" }} />
                      </button>
                    </div>
                    {/* Sales Portal toggle */}
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] tracking-widest text-muted-foreground uppercase">Sales Portal</p>
                      <button
                        onClick={() => toggleVisibility('is_visible_sales', !(selected as any).is_visible_sales)}
                        className="relative flex-shrink-0 h-6 w-[52px] rounded-full transition-all duration-300 focus:outline-none"
                        style={{
                          background: (selected as any).is_visible_sales !== false ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(255,255,255,0.07)",
                          border: (selected as any).is_visible_sales !== false ? "1.5px solid #22c55e" : "1.5px solid rgba(255,255,255,0.15)",
                          boxShadow: (selected as any).is_visible_sales !== false ? "0 0 10px rgba(34,197,94,0.3)" : "none",
                        }}
                      >
                        <span className="absolute inset-0 flex items-center font-black text-[8px] tracking-wider select-none"
                          style={{ paddingLeft: (selected as any).is_visible_sales !== false ? "7px" : undefined, paddingRight: (selected as any).is_visible_sales !== false ? undefined : "7px", justifyContent: (selected as any).is_visible_sales !== false ? "flex-start" : "flex-end", color: (selected as any).is_visible_sales !== false ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.4)" }}>
                          {(selected as any).is_visible_sales !== false ? "ON" : "OFF"}
                        </span>
                        <span className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-300"
                          style={{ left: (selected as any).is_visible_sales !== false ? "calc(100% - 20px)" : "2px" }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 bg-card sticky bottom-0 left-0 right-0 border-t border-border pb-6 z-10 flex gap-2">
                <button
                  onClick={handleDeleteProduct}
                  disabled={isUpdating}
                  className="w-14 bg-destructive py-4 text-destructive-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center flex-shrink-0"
                  title="Delete Item"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleUpdateProduct}
                  disabled={isUpdating}
                  className="flex-1 bg-primary py-4 font-display text-xl tracking-widest text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                >
                  {isUpdating ? <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" /> : "SAVE ALL CHANGES"}
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="bg-card border-border text-off-white max-w-lg max-h-[95vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl tracking-widest">ADD NEW PRODUCT</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="col-span-2 space-y-4">
              <div
                onClick={() => document.getElementById('new-file-input')?.click()}
                className="aspect-square w-full bg-muted border border-border overflow-hidden relative group cursor-pointer hover:border-primary transition-all"
              >
                {newItem.image ? (
                  <>
                    <img
                      src={newItem.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.display = 'block';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.add('hidden');
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive/80 bg-background/95 hidden px-4 text-center z-10 pointer-events-none">
                      <AlertTriangle className="h-6 w-6 mb-2" />
                      <span className="text-[10px] tracking-widest uppercase font-bold">Invalid Image Link</span>
                      <span className="text-[8px] tracking-wider mt-1 text-muted-foreground">Right-click the image and select "Copy image address". Don't copy the webpage URL.</span>
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/30 gap-2">
                    <Plus className="h-8 w-8" />
                    <span className="text-[10px] tracking-widest uppercase">Click to Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] tracking-widest text-primary-foreground font-bold bg-primary px-3 py-1.5 shadow-xl">CHANGE PHOTO</span>
                </div>
              </div>
              <input
                id="new-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, true)}
              />
              <div className="relative">
                <input
                  placeholder="Or paste Image URL here..."
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value.trim() })}
                  className="w-full bg-background border border-border px-3 py-2.5 text-xs outline-none focus:border-primary transition-colors pr-10"
                />
                {newItem.image && (
                  <button
                    onClick={() => setNewItem({ ...newItem, image: "" })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Brand</label>
              <input
                placeholder="e.g. NIKE"
                value={newItem.brand}
                onChange={(e) => setNewItem({ ...newItem, brand: e.target.value.toUpperCase() })}
                className="w-full bg-background border border-border px-3 py-3 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Item Name</label>
              <input
                placeholder="e.g. TECH WINDBREAKER"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full bg-background border border-border px-3 py-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full bg-background border border-border px-3 py-3 text-xs outline-none focus:border-primary"
              >
                {cats.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Initial Qty</label>
              <input
                type="text"
                readOnly
                value={newItem.qty || "0"}
                className="w-full bg-muted border border-border px-3 py-3 text-xs outline-none text-muted-foreground cursor-not-allowed"
                title="Quantity is updated automatically when adding variants"
              />
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Cost Price (ETB) <span className="text-primary/50">— paid</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newItem.costPrice}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setNewItem(prev => ({ ...prev, costPrice: val }));
                  }}
                  className="w-full bg-background border border-border px-3 py-3 text-2xl font-display outline-none focus:border-primary text-muted-foreground"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] tracking-widest text-muted-foreground uppercase">Selling Price (ETB)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newItem.price}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setNewItem(prev => ({ ...prev, price: val }));
                  }}
                  className="w-full bg-background border border-border px-3 py-3 text-2xl font-display outline-none focus:border-primary text-primary"
                />
              </div>
            </div>

            {/* VARIANTS FOR NEW ITEM */}
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

              {getSizesForCategory(newItem.category).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[9px] tracking-widest text-muted-foreground uppercase">Size</p>
                  <div className="flex flex-wrap gap-1.5">
                    {getSizesForCategory(newItem.category).map(sz => (
                      <button key={sz} onClick={() => setNewItemSize(sz)}
                        className={`px-3 py-1.5 text-xs border transition-all ${newItemSize === sz ? "border-primary bg-primary text-black font-bold" : "border-border/50 text-muted-foreground hover:border-primary/50"
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
                      className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 ${newItemColor === col.name ? "border-primary scale-110 shadow-[0_0_8px_rgba(255,255,255,0.3)]" : "border-transparent"
                        }`}
                      style={{ backgroundColor: col.hex }} />
                  ))}
                </div>
                {newItemColor && <p className="text-[9px] text-primary tracking-wider">Selected: {newItemColor}</p>}
              </div>

              <button onClick={addNewItemVariant}
                disabled={!newItemColor || (getSizesForCategory(newItem.category).length > 0 && !newItemSize)}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-primary/40 py-2.5 text-[10px] tracking-widest text-primary hover:bg-primary/5 transition-colors font-bold disabled:opacity-40">
                <Plus className="h-4 w-4" /> ADD VARIANT
              </button>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={handleAddProduct}
              disabled={isUpdating}
              className="w-full bg-primary py-4 font-display text-xl tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "ADD TO INVENTORY"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restockItem} onOpenChange={(o) => !o && setRestockItem(null)}>
        <DialogContent className="bg-card border-border text-off-white">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">RESTOCK ITEM</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-[10px] tracking-widest text-muted-foreground">QUANTITY</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                className="w-full border border-border bg-background px-3 py-2 outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-muted-foreground">NOTE (OPTIONAL)</label>
              <input
                type="text"
                value={restockNote}
                onChange={(e) => setRestockNote(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 outline-none mt-1"
                placeholder="e.g. New delivery from HQ"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={handleRestock}
              disabled={isRestocking || restockQty <= 0}
              className="w-full flex justify-center items-center bg-primary py-3 font-display text-lg tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isRestocking ? <Loader2 className="h-5 w-5 animate-spin" /> : "CONFIRM RESTOCK"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;

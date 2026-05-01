import { createContext, useContext, useState, ReactNode } from "react";
import { inventory as initialInventory, InventoryItem } from "@/data/inventory";

export type PaymentMethod = "Cash" | "Telebirr" | "CBE";

export interface SaleAuditEntry {
  action: "created" | "edited" | "deleted";
  by: string;
  at: Date;
  changes?: string; // human-readable diff summary
}

export interface Sale {
  id: string;
  itemId: number;
  itemName: string;
  brand: string;
  size: string;
  color: string;
  qty: number;
  price: number;
  payment: PaymentMethod;
  staff: string;
  time: Date;
  deleted?: boolean;
  audit: SaleAuditEntry[];
}

export interface SaleEdit {
  qty?: number;
  price?: number;
  size?: string;
  color?: string;
  payment?: PaymentMethod;
}

interface AppCtx {
  inventory: InventoryItem[];
  recordSale: (s: Omit<Sale, "id" | "time" | "audit" | "deleted">) => void;
  editSale: (id: string, changes: SaleEdit, editor: string) => void;
  deleteSale: (id: string, editor: string) => void;
  restock: (id: number, amount?: number) => void;
  addItem: (item: Omit<InventoryItem, "id">) => InventoryItem;
  sales: Sale[];
  ownerLoggedIn: boolean;
  setOwnerLoggedIn: (v: boolean) => void;
  staffName: string;
  setStaffName: (n: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ownerLoggedIn, setOwnerLoggedIn] = useState(false);
  const [staffName, setStaffName] = useState("");

  const recordSale: AppCtx["recordSale"] = (s) => {
    setInventory((inv) =>
      inv.map((it) => (it.id === s.itemId ? { ...it, qty: Math.max(0, it.qty - s.qty) } : it))
    );
    setSales((prev) => [
      {
        ...s,
        id: crypto.randomUUID(),
        time: new Date(),
        audit: [{ action: "created", by: s.staff, at: new Date() }],
      },
      ...prev,
    ]);
  };

  const editSale: AppCtx["editSale"] = (id, changes, editor) => {
    setSales((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const diffs: string[] = [];
        if (changes.qty !== undefined && changes.qty !== s.qty) diffs.push(`qty ${s.qty}→${changes.qty}`);
        if (changes.price !== undefined && changes.price !== s.price) diffs.push(`price ${s.price}→${changes.price}`);
        if (changes.size !== undefined && changes.size !== s.size) diffs.push(`size ${s.size}→${changes.size}`);
        if (changes.color !== undefined && changes.color !== s.color) diffs.push(`color ${s.color}→${changes.color}`);
        if (changes.payment !== undefined && changes.payment !== s.payment) diffs.push(`payment ${s.payment}→${changes.payment}`);

        // Adjust stock if qty changed
        if (changes.qty !== undefined && changes.qty !== s.qty) {
          const delta = changes.qty - s.qty; // positive = sold more = remove from stock
          setInventory((inv) =>
            inv.map((it) => (it.id === s.itemId ? { ...it, qty: Math.max(0, it.qty - delta) } : it))
          );
        }

        return {
          ...s,
          ...changes,
          audit: [
            ...s.audit,
            { action: "edited", by: editor, at: new Date(), changes: diffs.join(", ") || "no changes" },
          ],
        };
      })
    );
  };

  const deleteSale: AppCtx["deleteSale"] = (id, editor) => {
    setSales((prev) =>
      prev.map((s) => {
        if (s.id !== id || s.deleted) return s;
        // Restore stock
        setInventory((inv) =>
          inv.map((it) => (it.id === s.itemId ? { ...it, qty: it.qty + s.qty } : it))
        );
        return {
          ...s,
          deleted: true,
          audit: [...s.audit, { action: "deleted", by: editor, at: new Date() }],
        };
      })
    );
  };

  const restock: AppCtx["restock"] = (id, amount = 5) => {
    setInventory((inv) => inv.map((it) => (it.id === id ? { ...it, qty: it.qty + amount } : it)));
  };

  const addItem: AppCtx["addItem"] = (item) => {
    const newItem = { ...item, id: Math.max(...inventory.map((i) => i.id)) + 1 };
    setInventory((inv) => [newItem, ...inv]);
    return newItem;
  };

  return (
    <Ctx.Provider
      value={{
        inventory,
        recordSale,
        editSale,
        deleteSale,
        restock,
        addItem,
        sales,
        ownerLoggedIn,
        setOwnerLoggedIn,
        staffName,
        setStaffName,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
};

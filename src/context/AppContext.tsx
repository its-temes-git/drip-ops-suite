import { createContext, useContext, useState, ReactNode } from "react";
import { inventory as initialInventory, InventoryItem } from "@/data/inventory";

export interface Sale {
  id: string;
  itemId: number;
  itemName: string;
  brand: string;
  size: string;
  color: string;
  qty: number;
  price: number;
  staff: string;
  time: Date;
}

interface AppCtx {
  inventory: InventoryItem[];
  recordSale: (s: Omit<Sale, "id" | "time">) => void;
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
      { ...s, id: crypto.randomUUID(), time: new Date() },
      ...prev,
    ]);
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
    <Ctx.Provider value={{ inventory, recordSale, restock, addItem, sales, ownerLoggedIn, setOwnerLoggedIn, staffName, setStaffName }}>
      {children}
    </Ctx.Provider>
  );
};

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
};

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { inventory as initialInventory, InventoryItem } from "@/data/inventory";
import { auth } from "@/lib/auth";
import { User } from "@/lib/api";
import { toast } from "sonner";

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
  // Original mock properties
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
  
  // Real JWT Auth properties
  user: User | null;
  isOwner: boolean;
  isSales: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [sales, setSales] = useState<Sale[]>([]);
  
  // Keep these for backwards compatibility with parts that aren't refactored yet
  const [ownerLoggedIn, setOwnerLoggedIn] = useState(false);
  const [staffName, setStaffName] = useState("");
  
  // New auth state
  const [user, setUser] = useState<User | null>(() => {
    const token = auth.getToken();
    if (token) {
      const decodedUser = auth.decodeToken();
      if (decodedUser) return decodedUser;
      auth.removeToken();
    }
    return null;
  });

  // Sync old state based on initial user
  useEffect(() => {
    if (user) {
      if (user.role === 'owner') setOwnerLoggedIn(true);
      if (user.role === 'sales') setStaffName(user.full_name);
    }
  }, [user]);

  // AUTO-LOGOUT (30 Minute Idle Timeout)
  useEffect(() => {
    if (!user) return;

    let timeoutId: any;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        toast.info("Session expired due to inactivity. Please log in again.");
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => document.addEventListener(name, resetTimer));

    // Initial timer start
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(name => document.removeEventListener(name, resetTimer));
    };
  }, [user]);

  // Handle 401 responses from API (token expired / missing)
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
      toast.error("Your session has expired. Please log in again.", {
        duration: 5000,
      });
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = (token: string, userData: User) => {
    if (!userData) {
      console.error("Login called with missing user data");
      return;
    }
    auth.setToken(token);
    setUser(userData);
    // Sync old state
    if (userData.role === 'owner') setOwnerLoggedIn(true);
    if (userData.role === 'sales') setStaffName(userData.full_name);
  };

  const logout = () => {
    auth.removeToken();
    setUser(null);
    setOwnerLoggedIn(false);
    setStaffName("");
  };

  const isAuthenticated = !!user;
  const isOwner = user?.role === 'owner';
  const isSales = user?.role === 'sales';

  // Old mock functions
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

        if (changes.qty !== undefined && changes.qty !== s.qty) {
          const delta = changes.qty - s.qty; 
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
        user,
        isOwner,
        isSales,
        isAuthenticated,
        login,
        logout,
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

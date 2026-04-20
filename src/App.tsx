import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { CustomCursor } from "@/components/CustomCursor";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OwnerLogin from "./pages/OwnerLogin";
import SalesLogin from "./pages/SalesLogin";
import { OwnerLayout } from "./components/owner/OwnerLayout";
import Dashboard from "./pages/owner/Dashboard";
import Inventory from "./pages/owner/Inventory";
import Analytics from "./pages/owner/Analytics";
import NewDrop from "./pages/owner/NewDrop";
import LowStock from "./pages/owner/LowStock";
import Staff from "./pages/owner/Staff";
import Settings from "./pages/owner/Settings";
import SalesPortal from "./pages/sales/SalesPortal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Sonner
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(0 0% 5%)",
              border: "1px solid hsl(0 0% 15%)",
              color: "hsl(40 22% 92%)",
              fontFamily: "DM Mono, monospace",
              letterSpacing: "0.05em",
            },
          }}
        />
        <CustomCursor />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login/owner" element={<OwnerLogin />} />
            <Route path="/login/sales" element={<SalesLogin />} />
            <Route path="/owner" element={<OwnerLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="drop" element={<NewDrop />} />
              <Route path="alerts" element={<LowStock />} />
              <Route path="staff" element={<Staff />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/sales" element={<SalesPortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;

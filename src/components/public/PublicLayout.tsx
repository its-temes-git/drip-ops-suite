import { Outlet, useLocation } from "react-router-dom";
import { PublicNav } from "./PublicNav";
import { PublicFooter } from "./PublicFooter";
import { useEffect } from "react";

export const PublicLayout = () => {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  return (
    <div className="grain relative min-h-screen bg-background text-off-white">
      <PublicNav />
      <main className={`relative z-[2] ${loc.pathname === "/" ? "" : "pt-16"}`}>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

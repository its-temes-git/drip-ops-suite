import { useEffect, useState } from "react";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";


type Theme = "dark" | "light";

const apply = (t: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(t);
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("sawkem-theme") as Theme) || "dark";
  });

  useEffect(() => {
    apply(theme);
    localStorage.setItem("sawkem-theme", theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
};

export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggle } = useTheme();
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <AnimatedThemeToggler isDark={theme === "dark"} onToggle={toggle} />
    </div>
  );
};


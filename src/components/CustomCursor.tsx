import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      const interactive = target.closest("a, button, [role='button'], input, textarea, select, [data-cursor-hover]");
      setHover(!!interactive);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Hide on touch devices
  if (typeof window !== "undefined" && "ontouchstart" in window) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999] rounded-full bg-off-white mix-blend-difference"
      animate={{
        x: pos.x - (hover ? 16 : 6),
        y: pos.y - (hover ? 16 : 6),
        width: hover ? 32 : 12,
        height: hover ? 32 : 12,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.3 }}
    />
  );
};

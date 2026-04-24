import { MARQUEE_ROW_1, MARQUEE_ROW_2 } from "@/data/inventory";

const Row = ({
  items,
  direction,
  className = "",
}: {
  items: { name: string; style: string }[];
  direction: "left" | "right";
  className?: string;
}) => {
  const doubled = [...items, ...items];
  return (
    <div className={`relative overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className={`inline-flex gap-12 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
      >
        {doubled.map((b, i) => (
          <span
            key={i}
            className={`inline-block text-3xl md:text-5xl font-display text-off-white/80 hover:text-primary hover:scale-110 transition-all duration-200 ${b.style}`}
          >
            {b.name} <span className="text-primary mx-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export const BrandMarquee = ({ className = "" }: { className?: string }) => (
  <div className={`space-y-6 ${className}`}>
    <Row items={MARQUEE_ROW_1} direction="left" />
    <Row items={MARQUEE_ROW_2} direction="right" />
  </div>
);

import React, { useRef, useEffect } from "react";

export interface ParticleCanvasProps {
  className?: string;
  isOverlay?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  baseY: number;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  className = "relative w-full h-[150px] bg-background overflow-hidden border-b border-white/5",
  isOverlay = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = isOverlay ? 60 : 45; // slightly more particles for overlay
    const colors = [
      "rgba(184, 255, 87, 0.45)", // Sawkem Acid Green
      "rgba(184, 255, 87, 0.2)",  // Faded Acid Green
      "rgba(240, 237, 232, 0.25)", // Off-white
      "rgba(255, 255, 255, 0.15)", // Faded white
    ];

    const mouse = {
      x: -9999,
      y: -9999,
      radius: 120,
    };

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 2.5 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push({
          x,
          y,
          size,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: -(Math.random() * 0.5 + 0.3),
          opacity: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          baseY: y,
        });
      }
    };

    initParticles();

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Move particle upward
        p.y += p.speedY;
        p.x += p.speedX;

        // Mouse interaction (repulsion)
        if (mouse.x !== -9999 && mouse.y !== -9999) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const directionX = forceDirectionX * force * 1.5;
            const directionY = forceDirectionY * force * 1.5;

            p.x += directionX;
            p.y += directionY;
          }
        }

        // Reset particle if it leaves the top of canvas or sides
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
          p.opacity = Math.random() * 0.5 + 0.2;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.size > 2 ? 8 : 0;
        ctx.shadowColor = "rgba(184, 255, 87, 0.4)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOverlay]);

  return (
    <div className={className}>
      {/* Dynamic Grid Background Overlay */}
      {!isOverlay && (
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
          style={{
            backgroundImage: "radial-gradient(circle, #b8ff57 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block ${isOverlay ? "" : "cursor-none"}`}
      />
      {/* Decorative gradient overlay */}
      {!isOverlay && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
        </>
      )}
    </div>
  );
};

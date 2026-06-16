import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import heroImg from "@/assets/images/hero.png";

gsap.registerPlugin(ScrollTrigger);

export const NigusReveal = () => {
  const container = useRef<HTMLDivElement>(null);
  const textMask = useRef<HTMLHeadingElement>(null);
  const contentReveal = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    // We want to pin the container for a long scroll duration
    // so the user sees the mask expand slowly and smoothly.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top top",
        end: "+=350%", // Pins for 3.5x screen height
        scrub: 1, // Smooth scrubbing
        pin: true,
      },
    });

    // 1. Scale up the white "NIGUS" text massively so it fills the screen
    // We use mix-blend-multiply: white becomes transparent, black stays black.
    tl.to(
      textMask.current,
      {
        scale: 250, // Massive scale to ensure a letter stroke covers the screen
        transformOrigin: "54% 50%", // Shifted from 48% to 54% to hit the solid stem of the 'K' instead of the gap between 'W' and 'K'
        ease: "power2.inOut",
      },
      0
    );

    // 2. Animate the image slightly for a parallax feel
    tl.fromTo(
      imgRef.current,
      { scale: 1.2 },
      { scale: 1, ease: "power1.out" },
      0
    );

    // 3. Fade in the new text content once the image is mostly revealed
    tl.fromTo(
      contentReveal.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, ease: "power2.out" },
      0.6 // Starts when timeline is 60% done
    );
  }, { scope: container });

  return (
    <div ref={container} className="relative h-screen w-full bg-black overflow-hidden">
      {/* Background Image that will be revealed */}
      <img
        ref={imgRef}
        src={heroImg}
        alt="Streetwear model"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* The Mask Layer using multiply blend mode */}
      <div className="absolute inset-0 flex items-center justify-center bg-black mix-blend-multiply pointer-events-none z-10">
        <h1
          ref={textMask}
          className="font-display text-white leading-none whitespace-nowrap will-change-transform"
          style={{ fontSize: "28vw" }}
        >
          SAWKEM
        </h1>
      </div>

      {/* The Content that appears after the reveal */}
      <div
        ref={contentReveal}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-auto bg-black/40 backdrop-blur-sm"
      >
        <h2 className="font-display text-6xl md:text-8xl text-white">CULTURE IN EVERY THREAD</h2>
        <p className="mt-6 max-w-xl text-sm md:text-base text-white/90 leading-relaxed font-mono uppercase tracking-widest">
          The heart of Addis Ababa's drip. We don't just sell clothes; we curate the most exclusive international streetwear to elevate your identity. Stand out, stay authentic.
        </p>
      </div>
    </div>
  );
};

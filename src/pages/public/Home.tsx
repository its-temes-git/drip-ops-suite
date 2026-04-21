import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, MapPin, Send } from "lucide-react";
import { useRef } from "react";
import { BrandMarquee } from "@/components/BrandMarquee";
import { TikTokCard, TIKTOK_PLACEHOLDERS } from "@/components/public/TikTokCard";

const FEATURED = [
  { id: 1, brand: "Rick Owens", name: "Geobasket", price: 12500, sizes: ["40","41","42","43","44"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop" },
  { id: 11, brand: "SP5DER", name: "Hoodie", price: 5500, sizes: ["S","M","L","XL"], image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop" },
  { id: 19, brand: "Nike", name: "Tech Reflective Set", price: 3200, sizes: ["M","L","XL"], image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=600&fit=crop" },
  { id: 23, brand: "Gallery Dept", name: "Flared Jeans", price: 4800, sizes: ["28","30","32","34","36"], image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop" },
  { id: 14, brand: "Balenciaga", name: "3XL Hoodie", price: 9800, sizes: ["S","M","L","XL"], image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop" },
  { id: 40, brand: "Chrome Hearts", name: "Tie", price: 2100, sizes: ["OS"], image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=600&fit=crop" },
];

const HomePage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (n: number) => scrollRef.current?.scrollBy({ left: n, behavior: "smooth" });

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden diagonal-lines px-6 py-12 md:px-12">
        <div className="grid w-full gap-10 md:grid-cols-5">
          <div className="md:col-span-3 relative z-10">
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display leading-[0.85] text-[18vw] md:text-[12vw] text-off-white"
            >
              SAWKEM
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-display leading-[0.85] text-[18vw] md:text-[12vw] -mt-4 md:-mt-8 ml-4 md:ml-12"
              style={{ WebkitTextStroke: "1.5px hsl(var(--off-white))", color: "transparent" }}
            >
              FASHION
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-xs tracking-[0.4em] text-primary"
            >
              ADDIS ABABA — EST. EVERYDAY DRIP
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-4 max-w-md text-sm text-off-white/80"
            >
              Premium streetwear. Serious quality. Ethiopia's dopest fits.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                to="/shop"
                className="bg-primary px-6 py-3 text-xs tracking-[0.25em] text-primary-foreground transition-all hover:bg-off-white"
              >
                SHOP NOW
              </Link>
              <a
                href="https://www.tiktok.com/@sawkem_fashion"
                target="_blank"
                rel="noreferrer"
                className="border border-off-white px-6 py-3 text-xs tracking-[0.25em] text-off-white transition-all hover:bg-off-white hover:text-background"
              >
                WATCH US ON TIKTOK
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-2 relative h-[60vh] md:h-[80vh] overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=900&fit=crop"
              alt="Streetwear editorial"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 mix-blend-luminosity"
              style={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-[hsl(0_0%_6%)] py-10">
        <BrandMarquee />
      </section>

      {/* NEW DROPS */}
      <section className="px-6 py-20 md:px-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-6xl md:text-7xl">NEW DROPS</h2>
            <p className="mt-2 text-xs tracking-[0.3em] text-primary">
              FRESH INVENTORY — SUMMIT BRANCH — ADDIS ABABA
            </p>
          </div>
          <div className="hidden gap-2 md:flex">
            <button onClick={() => scrollBy(-400)} className="border border-border p-3 hover:border-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scrollBy(400)} className="border border-border p-3 hover:border-primary transition-colors">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mt-10 flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
        >
          {FEATURED.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -6 }}
              className="group min-w-[280px] md:min-w-[340px] snap-start border border-border bg-card transition-colors hover:border-primary"
            >
              <div className="aspect-square overflow-hidden">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-5">
                <p className="text-[10px] tracking-[0.3em] text-primary uppercase">{p.brand}</p>
                <h3 className="mt-1 font-display text-2xl">{p.name}</h3>
                <p className="mt-1 font-mono text-sm text-off-white/80">ETB {p.price.toLocaleString()}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.sizes.map((s) => (
                    <span key={s} className="border border-border px-2 py-0.5 text-[10px]">{s}</span>
                  ))}
                </div>
                <Link
                  to={`/shop?item=${p.id}`}
                  className="mt-4 block border border-off-white px-4 py-2 text-center text-[10px] tracking-[0.3em] text-off-white transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  VIEW ITEM
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TIKTOK */}
      <section className="bg-[hsl(0_0%_5%)] px-6 py-20 md:px-12">
        <h2 className="font-display text-6xl md:text-7xl">AS SEEN ON TIKTOK</h2>
        <p className="mt-2 text-xs tracking-[0.3em] text-primary">
          @SAWKEM_FASHION • 51K+ LIKES • ADDIS ABABA
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TIKTOK_PLACEHOLDERS.map((t, i) => (
            <TikTokCard key={i} {...t} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="https://www.tiktok.com/@sawkem_fashion"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-primary px-8 py-4 text-xs tracking-[0.3em] text-primary-foreground hover:bg-off-white transition-colors"
          >
            FOLLOW US FOR NEW DROPS
          </a>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="px-6 py-24 md:px-12">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.9]">
              ETHIOPIA'S DOPEST FITS. SINCE DAY ONE.
            </h2>
            <p className="mt-6 max-w-md text-sm text-off-white/80 leading-relaxed">
              Sawkem Fashion brings the world's most coveted streetwear brands directly
              to Addis Ababa. From Rick Owens to SP5DER — we don't do average.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-block border border-off-white px-6 py-3 text-xs tracking-[0.25em] hover:bg-off-white hover:text-background transition-all"
            >
              OUR STORY
            </Link>
          </div>
          <div className="relative h-[480px]">
            {[
              { src: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop", style: "top-0 left-0 -rotate-2" },
              { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop", style: "top-12 left-1/3 rotate-1" },
              { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=500&fit=crop", style: "top-24 left-2/3 rotate-3" },
            ].map((img, i) => (
              <motion.img
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                src={img.src}
                alt="Sawkem"
                className={`absolute h-72 w-52 object-cover border border-border ${img.style}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FIND US */}
      <section className="bg-[hsl(0_0%_5%)] px-6 py-20 md:px-12">
        <h2 className="font-display text-6xl md:text-7xl">FIND US</h2>
        <div className="mt-10 mx-auto max-w-3xl border-l-4 border-primary bg-card p-8">
          <h3 className="font-display text-4xl md:text-5xl">SUMMIT BRANCH</h3>
          <p className="mt-3 text-sm text-off-white/80">Summit Area, in front of Deborah School, Addis Ababa</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Mon–Sat: 9:00 AM – 8:00 PM | Sun: 11:00 AM – 6:00 PM
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <p>📞 <a href="tel:+251951077634" className="hover:text-primary">0951 077 634</a></p>
            <p>💬 <a href="https://t.me/sawkemcollection" target="_blank" rel="noreferrer" className="hover:text-primary">@sawkemcollection</a></p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://www.google.com/maps/search/Summit+Addis+Ababa"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-primary px-5 py-3 text-xs tracking-[0.25em] text-primary-foreground hover:bg-off-white transition-colors"
            >
              <MapPin className="h-4 w-4" /> GET DIRECTIONS
            </a>
            <a
              href="https://t.me/sawkemcollection"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 border border-off-white px-5 py-3 text-xs tracking-[0.25em] hover:bg-off-white hover:text-background transition-all"
            >
              <Send className="h-4 w-4" /> DM ON TELEGRAM
            </a>
          </div>
        </div>
        <div className="relative mt-10 mx-auto max-w-5xl aspect-[16/9] overflow-hidden border border-border">
          <iframe
            title="Summit Map"
            src="https://www.google.com/maps?q=Summit,Addis+Ababa,Ethiopia&output=embed"
            className="h-full w-full"
            style={{ filter: "grayscale(100%) invert(90%) contrast(85%)" }}
            loading="lazy"
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="block h-4 w-4 rounded-full bg-primary pulse-dot" />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;

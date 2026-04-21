import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Phone, Check, MapPin, ChevronDown } from "lucide-react";
import { TikTokIcon } from "@/components/public/PublicNav";

const FAQS = [
  { q: "Are all your items authentic?", a: "Yes. Every single item at Sawkem Fashion is 100% authentic. We do not sell replicas. Our reputation is built on this." },
  { q: "How do I order if I'm not near Summit?", a: "DM us on Telegram @sawkemcollection. We can arrange pickup or discuss delivery options within Addis Ababa." },
  { q: "Do you announce new arrivals?", a: "Yes — follow our TikTok @sawkem_fashion and join our Telegram channel for first access to every new drop." },
  { q: "Can I reserve an item?", a: "Yes. Message us on Telegram with the item name and size. We'll hold it for you for 24 hours." },
  { q: "What payment methods do you accept?", a: "Cash, Telebirr, and bank transfer. Details provided on Telegram." },
];

const ContactPage = () => {
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <section className="px-6 py-16 md:px-12 md:py-24 border-b border-border">
        <h1 className="font-display text-6xl md:text-[8rem] leading-none">GET IN TOUCH</h1>
        <p className="mt-3 text-xs tracking-[0.3em] text-primary">
          WE'RE AT SUMMIT — WE'RE ON TELEGRAM — WE'RE ALWAYS ONLINE
        </p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-6 h-px origin-left bg-primary"
        />
      </section>

      <section className="grid gap-12 px-6 py-20 md:grid-cols-2 md:px-12">
        <div>
          <h2 className="font-display text-4xl md:text-5xl">SEND US A MESSAGE</h2>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10 flex flex-col items-center gap-4 border border-primary bg-card p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary"
              >
                <Check className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              <p className="font-display text-3xl">MESSAGE SENT</p>
              <p className="text-xs tracking-[0.2em] text-muted-foreground">
                WE'LL HIT YOU BACK ON TELEGRAM
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="mt-8 space-y-6"
            >
              {[
                { label: "FULL NAME", type: "text", name: "name" },
                { label: "PHONE NUMBER", type: "tel", name: "phone" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-[10px] tracking-[0.3em] text-muted-foreground">{f.label}</label>
                  <input
                    type={f.type}
                    required
                    className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-primary focus:acid-glow transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] tracking-[0.3em] text-muted-foreground">WHAT ARE YOU LOOKING FOR?</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Rick Owens size 43, SP5DER hoodie L..."
                  className="mt-2 w-full resize-none border-b border-border bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.3em] text-muted-foreground">HOW DID YOU FIND US?</label>
                <select className="mt-2 w-full border-b border-border bg-transparent py-2 text-sm outline-none focus:border-primary">
                  {["TikTok","Telegram","Friend","Google","Other"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-primary px-6 py-4 text-xs tracking-[0.3em] text-primary-foreground transition-colors hover:bg-off-white"
              >
                SEND MESSAGE
              </button>
            </form>
          )}
        </div>

        <div>
          <h2 className="font-display text-4xl md:text-5xl">REACH US DIRECTLY</h2>
          <div className="mt-8 space-y-5">
            <ContactCard
              icon={<Send className="h-7 w-7 text-primary" />}
              eyebrow="ORDER & INQUIRIES"
              title="@sawkemcollection"
              body="The fastest way to reach us. DM for availability, reservations, and new drop alerts."
              cta="OPEN TELEGRAM"
              href="https://t.me/sawkemcollection"
              primary
            />
            <ContactCard
              icon={<Phone className="h-7 w-7 text-off-white" />}
              eyebrow="CALL US"
              title="0951 077 634"
              body="Call or WhatsApp during store hours."
              cta="CALL NOW"
              href="tel:+251951077634"
            />
            <ContactCard
              icon={<TikTokIcon className="h-7 w-7 text-off-white" />}
              eyebrow="FOLLOW FOR DROPS"
              title="@sawkem_fashion"
              body="New arrivals, fit checks, and restocks announced first on TikTok."
              cta="FOLLOW US"
              href="https://www.tiktok.com/@sawkem_fashion"
            />
          </div>
        </div>
      </section>

      <section className="bg-[hsl(0_0%_5%)] px-6 py-20 md:px-12">
        <h2 className="font-display text-6xl md:text-7xl">VISIT THE STORE</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2 border border-border bg-card p-6 md:p-10">
          <div>
            <h3 className="font-display text-4xl md:text-5xl">SUMMIT BRANCH</h3>
            <div className="mt-3 h-px w-16 bg-primary" />
            <p className="mt-4 text-sm">Summit Area, in front of Deborah School</p>
            <p className="text-sm text-muted-foreground">Addis Ababa, Ethiopia</p>
            <table className="mt-6 text-xs">
              <tbody>
                {[
                  ["Mon – Fri", "9:00 AM – 8:00 PM"],
                  ["Saturday", "9:00 AM – 8:00 PM"],
                  ["Sunday", "11:00 AM – 6:00 PM"],
                ].map(([d, h]) => (
                  <tr key={d}>
                    <td className="py-1 pr-6 tracking-widest text-muted-foreground">{d}</td>
                    <td className="py-1">{h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm">📞 0951 077 634</p>
            <p className="text-sm">💬 @sawkemcollection</p>
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
          <div className="relative aspect-square md:aspect-auto overflow-hidden border border-border">
            <iframe
              title="Summit Map"
              src="https://www.google.com/maps?q=Summit,Addis+Ababa,Ethiopia&output=embed"
              className="h-full w-full"
              style={{ filter: "grayscale(100%) invert(85%) contrast(90%)" }}
              loading="lazy"
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="block h-4 w-4 rounded-full bg-primary pulse-dot" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 max-w-4xl mx-auto">
        <h2 className="font-display text-5xl md:text-6xl">COMMON QUESTIONS</h2>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {FAQS.map((f, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-sm md:text-base">{f.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 180 : 0 }}
                  className="text-primary"
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm text-off-white/70 leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

const ContactCard = ({
  icon, eyebrow, title, body, cta, href, primary,
}: {
  icon: React.ReactNode; eyebrow: string; title: string; body: string;
  cta: string; href: string; primary?: boolean;
}) => (
  <motion.div
    whileHover={{ y: -3 }}
    className={`border bg-card p-6 transition-colors ${primary ? "border-primary" : "border-border hover:border-primary"}`}
  >
    <div className="flex items-start gap-4">
      <div>{icon}</div>
      <div className="flex-1">
        <p className="text-[10px] tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <p className="font-display text-3xl mt-1">{title}</p>
        <p className="mt-2 text-xs text-off-white/70">{body}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={`mt-4 inline-block px-5 py-2.5 text-[10px] tracking-[0.3em] transition-colors ${
            primary
              ? "bg-primary text-primary-foreground hover:bg-off-white"
              : "border border-off-white hover:bg-off-white hover:text-background"
          }`}
        >
          {cta}
        </a>
      </div>
    </div>
  </motion.div>
);

export default ContactPage;

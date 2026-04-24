import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { TikTokIcon } from "./PublicNav";

const FOOTER_BRANDS = [
  "RICK OWENS","BALENCIAGA","SP5DER","CHROME HEARTS","GALLERY DEPT",
  "DENIM TEARS","HELLSTAR","BROKEN PLANET","NIKE TECH","BAPE",
];

export const PublicFooter = () => {
  const doubled = [...FOOTER_BRANDS, ...FOOTER_BRANDS];
  return (
    <footer className="relative border-t border-primary/40 dark-band text-off-white">
      <div className="grid gap-12 px-6 py-16 md:grid-cols-3 md:px-12">
        <div>
          <h3 className="font-display text-5xl tracking-wide">SAWKEM</h3>
          <p className="mt-2 text-xs tracking-[0.2em] text-muted-foreground">
            PREMIUM STREETWEAR. ADDIS ABABA.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs tracking-[0.3em] text-primary">QUICK LINKS</p>
          <ul className="space-y-2 text-sm">
            {[
              ["/", "Home"],
              ["/shop", "Shop"],
              ["/about", "About"],
              ["/contact", "Contact"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs tracking-[0.3em] text-primary">FIND US</p>
          <p className="text-sm leading-relaxed">
            Summit Area, in front of Deborah School<br />
            Addis Ababa, Ethiopia
          </p>
          <p className="mt-3 text-sm">
            <a href="tel:+251951077634" className="hover:text-primary">0951 077 634</a>
          </p>
          <p className="text-sm">
            <a href="https://t.me/sawkemcollection" target="_blank" rel="noreferrer" className="hover:text-primary">
              @sawkemcollection
            </a>
          </p>
          <p className="text-sm">
            <a href="https://www.tiktok.com/@sawkem_fashion" target="_blank" rel="noreferrer" className="hover:text-primary">
              @sawkem_fashion
            </a>
          </p>
          <div className="mt-4 flex items-center gap-4">
            <a
              href="https://www.tiktok.com/@sawkem_fashion"
              target="_blank"
              rel="noreferrer"
              className="text-off-white transition-colors hover:text-primary"
              aria-label="TikTok"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/sawkemcollection"
              target="_blank"
              rel="noreferrer"
              className="text-off-white transition-colors hover:text-primary"
              aria-label="Telegram"
            >
              <Send className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-6 py-6 text-center text-[10px] tracking-[0.3em] text-muted-foreground md:px-12">
        © 2024 SAWKEM FASHION. ALL RIGHTS RESERVED. ADDIS ABABA, ETHIOPIA.
      </div>

      <div className="overflow-hidden border-t border-border py-4">
        <div className="inline-flex animate-marquee-left gap-10 whitespace-nowrap">
          {doubled.map((b, i) => (
            <span
              key={i}
              className="font-display text-2xl tracking-wider text-off-white/50 hover:text-primary transition-colors"
            >
              {b} <span className="text-primary mx-2">•</span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};

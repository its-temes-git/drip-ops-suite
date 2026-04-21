import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { TikTokIcon } from "./PublicNav";

// NOTE: Replace these placeholder cards with real TikTok embeds using video IDs
// from @sawkem_fashion when deploying. Use the official oEmbed format:
// <blockquote class="tiktok-embed" cite="https://www.tiktok.com/@sawkem_fashion/video/[ID]">
// and load <script async src="https://www.tiktok.com/embed.js"></script>

export const TikTokCard = ({
  caption,
  views,
  image,
}: {
  caption: string;
  views: string;
  image: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="group relative aspect-[9/16] overflow-hidden border border-border bg-card transition-colors hover:border-primary"
  >
    <img
      src={image}
      alt="TikTok"
      className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale transition-all group-hover:opacity-70 group-hover:grayscale-0"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
    <TikTokIcon className="absolute right-3 top-3 h-5 w-5 text-white" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 transition-transform group-hover:scale-110">
        <Play className="h-7 w-7 fill-black text-black ml-1" />
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <p className="text-xs text-white">@sawkem_fashion</p>
      <p className="mt-1 text-sm text-white/90 line-clamp-2">{caption}</p>
      <p className="mt-1 text-[10px] text-white/60">{views} views</p>
    </div>
  </motion.div>
);

export const TIKTOK_PLACEHOLDERS = [
  {
    caption: "Rick Owens Geobasket energy 🔥 #sawkemfashion #rickowens",
    views: "32.4K",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=900&fit=crop",
  },
  {
    caption: "Nike Tech Reflective fit check ✨ #niketch #streetwear #addis",
    views: "18.7K",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=900&fit=crop",
  },
  {
    caption: "New SP5DER drop just landed 🕷️ #sp5der #sawkemfashion #drip",
    views: "47.1K",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=900&fit=crop",
  },
];

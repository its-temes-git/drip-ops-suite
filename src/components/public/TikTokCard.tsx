import { useEffect } from "react";
import { motion } from "framer-motion";

export const TikTokEmbed = ({ videoId, html }: { videoId: string, html: string }) => {
  useEffect(() => {
    // Load TikTok embed script dynamically if it doesn't exist
    if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // If script exists, tell TikTok to re-parse the new blockquotes
      // @ts-ignore
      if (window.tiktokEmbed && typeof window.tiktokEmbed.load === 'function') {
        // @ts-ignore
        window.tiktokEmbed.load();
      }
    }
  }, [html]);

  // Inject dark theme to get rid of white borders!
  const darkHtml = html.replace('class="tiktok-embed"', 'class="tiktok-embed" data-theme="dark"');

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="tiktok-embed-wrapper w-full flex justify-center overflow-hidden rounded-xl bg-transparent"
      style={{ minWidth: '325px' }}
      dangerouslySetInnerHTML={{ __html: darkHtml }}
    />
  );
};

export const TIKTOK_VIDEOS = [
  {
    id: "7621553985295535380",
    html: `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@sawkem_fashion/video/7621553985295535380" data-video-id="7621553985295535380" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@sawkem_fashion" href="https://www.tiktok.com/@sawkem_fashion?refer=embed">@sawkem_fashion</a> Big move 🚀 New branch officially  📍 Saris Kality Taxi 📍 Semit Feyel Bet (in front of Deborah School) 📞 0951077634 Don’t miss out—first come, first served 💯 <a title="addisababa" target="_blank" href="https://www.tiktok.com/tag/addisababa?refer=embed">#AddisAbaba</a> <a title="streetwearaddis" target="_blank" href="https://www.tiktok.com/tag/streetwearaddis?refer=embed">#StreetwearAddis</a> <a title="sawkemcollection" target="_blank" href="https://www.tiktok.com/tag/sawkemcollection?refer=embed">#SawkemCollection</a> <a title="newdrop" target="_blank" href="https://www.tiktok.com/tag/newdrop?refer=embed">#NewDrop</a> <a title="staydrippy" target="_blank" href="https://www.tiktok.com/tag/staydrippy?refer=embed">#StayDrippy</a> <a target="_blank" title="♬ original sound - Sawkem Fashion" href="https://www.tiktok.com/music/original-sound-7621554162643290898?refer=embed">♬ original sound - Sawkem Fashion</a> </section> </blockquote>`
  },
  {
    id: "7624540792165649685",
    html: `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@sawkem_fashion/video/7624540792165649685" data-video-id="7624540792165649685" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@sawkem_fashion" href="https://www.tiktok.com/@sawkem_fashion?refer=embed">@sawkem_fashion</a> Chrome Hearts tie  Available now 📍Saris | Semit 📞 0951077634 @SawkemCollection <a title="chromehearts" target="_blank" href="https://www.tiktok.com/tag/chromehearts?refer=embed">#chromehearts</a> <a title="streetwearaddis" target="_blank" href="https://www.tiktok.com/tag/streetwearaddis?refer=embed">#streetwearaddis</a> <a title="luxurystreetwear" target="_blank" href="https://www.tiktok.com/tag/luxurystreetwear?refer=embed">#luxurystreetwear</a> <a title="addisfashion" target="_blank" href="https://www.tiktok.com/tag/addisfashion?refer=embed">#addisfashion</a> <a title="sawkemcollection" target="_blank" href="https://www.tiktok.com/tag/sawkemcollection?refer=embed">#sawkemcollection</a> <a target="_blank" title="♬ original sound - Sawkem Fashion" href="https://www.tiktok.com/music/original-sound-7624540823165635345?refer=embed">♬ original sound - Sawkem Fashion</a> </section> </blockquote>`
  },
  {
    id: "7634214627693399317",
    html: `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@sawkem_fashion/video/7634214627693399317" data-video-id="7634214627693399317" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@sawkem_fashion" href="https://www.tiktok.com/@sawkem_fashion?refer=embed">@sawkem_fashion</a> Shoulder Vest | Sawkem Fashion 📲0951077634 📍Summit infront of Deborah School <a title="sawkem" target="_blank" href="https://www.tiktok.com/tag/sawkem?refer=embed">#sawkem</a> <a title="sawkemfashion" target="_blank" href="https://www.tiktok.com/tag/sawkemfashion?refer=embed">#sawkemfashion</a> <a title="vest" target="_blank" href="https://www.tiktok.com/tag/vest?refer=embed">#vest</a> <a title="shouldervest" target="_blank" href="https://www.tiktok.com/tag/shouldervest?refer=embed">#shouldervest</a> <a target="_blank" title="♬ original sound - Sawkem Fashion" href="https://www.tiktok.com/music/original-sound-7634214666190031624?refer=embed">♬ original sound - Sawkem Fashion</a> </section> </blockquote>`
  }
];

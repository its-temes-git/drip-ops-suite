import rickOwensGeobasket from "@/assets/sales/rick-owens-geobasket.jpg";
import sp5derHoodieBlack from "@/assets/sales/sp5der-hoodie-black.jpg";
import noctaAf1 from "@/assets/sales/nocta-af1.jpg";
import galleryDeptJeans from "@/assets/sales/gallery-dept-jeans.jpg";
import jordan1Chicago from "@/assets/sales/jordan-1-chicago.jpg";

export type Category = "Shoes" | "Tops" | "Bottoms" | "Accessories";

export interface InventoryItem {
  id: number;
  brand: string;
  name: string;
  variant?: string;
  category: Category;
  sizes: string[];
  color: string;
  qty: number;
  price?: number;
  image?: string;
}

const img = (q: string, seed: number) =>
  `https://images.unsplash.com/photo-${seed}?w=400&h=400&fit=crop&q=80`;

// Curated unsplash IDs that exist
const SHOE_IMG = "1542291026-7eec264c27ff";
const SHOE2 = "1600185365926-3a2ce3cdb9eb";
const HOODIE_IMG = "1556821840-3a63f95609a7";
const HOODIE2 = "1620799140408-edc6dcb6d633";
const JEAN_IMG = "1542272604-787c3835535d";
const ACC_IMG = "1591561954557-26941169b49e";
const BAG_IMG = "1553062407-98eeb64c6a62";

export const inventory: InventoryItem[] = [
  // SHOES
  { id: 1, brand: "Rick Owens", name: "Geobasket Jumbo Laces", variant: "Jumbo Laces", category: "Shoes", sizes: ["40","41","42","43","44"], color: "Black/White", qty: 6, price: 12500, image: rickOwensGeobasket },
  { id: 2, brand: "Rick Owens", name: "Geobasket Big Sole", variant: "Big Sole", category: "Shoes", sizes: ["41","42","43"], color: "Cement Gray", qty: 3, price: 13200, image: `https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop&q=85` },
  { id: 3, brand: "Balenciaga", name: "Derby", category: "Shoes", sizes: ["40","41","42","43","44","45"], color: "Black", qty: 8, price: 18900, image: `https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop&q=85` },
  { id: 4, brand: "Jordan", name: "5 Retro", category: "Shoes", sizes: ["40","41","42","43","44"], color: "Red Suede", qty: 5, price: 8900, image: `https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=600&fit=crop&q=85` },
  { id: 5, brand: "Nike", name: "Shox R4", category: "Shoes", sizes: ["40","41","42","43","44","45"], color: "White/Silver", qty: 7, price: 6500, image: `https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop&q=85` },
  { id: 6, brand: "ASICS", name: "Gel-Kayano", category: "Shoes", sizes: ["40","41","42","43"], color: "White/Blue", qty: 4, price: 5800, image: `https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop&q=85` },
  { id: 7, brand: "NOCTA", name: "Air Force 1", category: "Shoes", sizes: ["40","41","42","43","44","45"], color: "White", qty: 9, price: 7200, image: noctaAf1 },
  { id: 8, brand: "Timberland", name: "6-Inch Boot", category: "Shoes", sizes: ["40","41","42","43","44"], color: "Wheat", qty: 5, price: 6900, image: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop&q=85` },
  { id: 9, brand: "Jordan", name: "1 Retro High Chicago", category: "Shoes", sizes: ["40","41","42","43","44"], color: "Red/White", qty: 4, price: 9500, image: jordan1Chicago },
  { id: 10, brand: "Jordan", name: "1 Retro High Royal", category: "Shoes", sizes: ["41","42","43","44"], color: "Royal Blue", qty: 3, price: 9500, image: `https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&h=600&fit=crop&q=85` },

  // TOPS
  { id: 11, brand: "SP5DER", name: "Hoodie", category: "Tops", sizes: ["S","M","L","XL"], color: "Black", qty: 12, price: 5500, image: sp5derHoodieBlack },
  { id: 12, brand: "SP5DER", name: "Hoodie Pink Web", category: "Tops", sizes: ["S","M","L","XL","XXL"], color: "Pink", qty: 8, price: 5800, image: `https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop` },
  { id: 13, brand: "SP5DER", name: "Tracksuit", category: "Tops", sizes: ["M","L","XL"], color: "Red", qty: 5, price: 9200, image: `https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop` },
  { id: 14, brand: "Balenciaga", name: "3XL Hoodie", category: "Tops", sizes: ["S","M","L","XL"], color: "Black", qty: 6, price: 14500, image: `https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop` },
  { id: 15, brand: "Balenciaga", name: "Track Top", category: "Tops", sizes: ["M","L","XL"], color: "Navy", qty: 4, price: 11200, image: `https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop` },
  { id: 16, brand: "Broken Planet", name: "Hoodie", category: "Tops", sizes: ["S","M","L","XL"], color: "Brown", qty: 7, price: 6800, image: `https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&h=400&fit=crop` },
  { id: 17, brand: "Hellstar", name: "Tee Washed", category: "Tops", sizes: ["S","M","L","XL","XXL"], color: "Black", qty: 10, price: 3800, image: `https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop` },
  { id: 18, brand: "Nike", name: "Tech Fleece Set", category: "Tops", sizes: ["S","M","L","XL"], color: "Black", qty: 9, price: 7500, image: `https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop` },
  { id: 19, brand: "Nike", name: "Tech Reflective Set", category: "Tops", sizes: ["M","L","XL"], color: "Silver", qty: 6, price: 8200, image: `https://images.unsplash.com/photo-1556906903-7b3d6c8d4c2e?w=400&h=400&fit=crop` },
  { id: 20, brand: "Nike", name: "Tech Fleece Cleveland", category: "Tops", sizes: ["S","M","L","XL"], color: "Brown", qty: 5, price: 7800, image: `https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400&h=400&fit=crop` },
  { id: 21, brand: "NOCTA", name: "Full Suit", category: "Tops", sizes: ["S","M","L","XL"], color: "Black", qty: 4, price: 12500, image: `https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=400&fit=crop` },
  { id: 22, brand: "Sawkem", name: "Zip-Up Oversized Jacket", category: "Tops", sizes: ["M","L","XL","XXL"], color: "Cream", qty: 8, price: 4500, image: `https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop` },

  // BOTTOMS
  { id: 23, brand: "Gallery Dept", name: "Flared Jeans Vintage", category: "Bottoms", sizes: ["28","30","32","34","36"], color: "Vintage Wash", qty: 7, price: 4800, image: galleryDeptJeans },
  { id: 24, brand: "Gallery Dept", name: "Flared Jeans Distressed", category: "Bottoms", sizes: ["28","30","32","34"], color: "Black", qty: 4, price: 5200, image: `https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=400&fit=crop` },
  { id: 25, brand: "Denim Tears", name: "Jogger Pants", category: "Bottoms", sizes: ["S","M","L","XL"], color: "Classic", qty: 8, price: 4500, image: `https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop` },
  { id: 26, brand: "Denim Tears", name: "Shorts Old Design", category: "Bottoms", sizes: ["S","M","L","XL"], color: "Blue", qty: 5, price: 3800, image: `https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop` },
  { id: 27, brand: "Denim Tears", name: "Shorts Pink", category: "Bottoms", sizes: ["S","M","L"], color: "Pink", qty: 2, price: 4200, image: `https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop` },
  { id: 28, brand: "Denim Tears", name: "Shorts Red", category: "Bottoms", sizes: ["M","L","XL"], color: "Red", qty: 3, price: 4200, image: `https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop` },
  { id: 29, brand: "Denim Tears", name: "Jorts Luxury Drip", category: "Bottoms", sizes: ["S","M","L","XL"], color: "Blue", qty: 6, price: 4500, image: `https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&h=400&fit=crop` },
  { id: 30, brand: "Purple Brand", name: "Jeans Black", category: "Bottoms", sizes: ["28","30","32","34","36"], color: "Black", qty: 7, price: 6500, image: `https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&h=400&fit=crop` },
  { id: 31, brand: "Purple Brand", name: "Jeans Indigo", category: "Bottoms", sizes: ["30","32","34"], color: "Indigo", qty: 4, price: 6800, image: `https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=400&fit=crop` },
  { id: 32, brand: "Syna World", name: "Shorts", category: "Bottoms", sizes: ["S","M","L","XL"], color: "Black", qty: 9, price: 3500, image: `https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop` },
  { id: 33, brand: "Sawkem", name: "Baggy Joggers", category: "Bottoms", sizes: ["S","M","L","XL","XXL"], color: "Gray", qty: 11, price: 2800, image: `https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop` },
  { id: 34, brand: "Sawkem", name: "Gym Shorts Streetwear", category: "Bottoms", sizes: ["S","M","L","XL","XXL"], color: "Black", qty: 14, price: 1800, image: `https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop` },

  // ACCESSORIES
  { id: 35, brand: "Denim Tears", name: "Backpack", category: "Accessories", sizes: ["OS"], color: "Black", qty: 4, price: 5500, image: `https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop` },
  { id: 36, brand: "BAPE", name: "Shark Bag", category: "Accessories", sizes: ["OS"], color: "Camo Green", qty: 3, price: 7200, image: `https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop` },
  { id: 37, brand: "Chrome Hearts", name: "Belt Leather", category: "Accessories", sizes: ["OS"], color: "Silver/Black", qty: 5, price: 6800, image: `https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=400&fit=crop` },
  { id: 38, brand: "Amiri", name: "Belt", category: "Accessories", sizes: ["OS"], color: "Black", qty: 4, price: 5500, image: `https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=400&fit=crop` },
  { id: 39, brand: "Burberry", name: "Belt Classic Check", category: "Accessories", sizes: ["OS"], color: "Check", qty: 3, price: 7800, image: `https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=400&fit=crop` },
  { id: 40, brand: "Chrome Hearts", name: "Tie", category: "Accessories", sizes: ["OS"], color: "Silver", qty: 6, price: 2100, image: `https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=400&fit=crop` },
  { id: 41, brand: "Syna World", name: "Skull Cap", category: "Accessories", sizes: ["OS"], color: "Black", qty: 7, price: 1500, image: `https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop` },
  { id: 42, brand: "Rick Owens", name: "Jumbo Laces", category: "Accessories", sizes: ["OS"], color: "White", qty: 10, price: 1200, image: `https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop` },
  { id: 43, brand: "Sawkem", name: "Streetwear Cap", category: "Accessories", sizes: ["OS"], color: "Black", qty: 15, price: 1200, image: `https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop` },
  { id: 44, brand: "Sawkem", name: "Ski Mask", category: "Accessories", sizes: ["OS"], color: "Black", qty: 8, price: 800, image: `https://images.unsplash.com/photo-1611042553365-9b101441c135?w=400&h=400&fit=crop` },
];

export const ALL_BRANDS = [
  "Rick Owens","Balenciaga","SP5DER","Chrome Hearts","Gallery Dept",
  "Denim Tears","Hellstar","Broken Planet","Nike","BAPE",
  "Purple Brand","Amiri","Burberry","NOCTA","Syna World","Timberland",
  "Jordan","ASICS","Sawkem"
];

export const MARQUEE_ROW_1 = [
  { name: "RICK OWENS", style: "tracking-[0.4em] font-light" },
  { name: "BALENCIAGA", style: "tracking-tight font-black" },
  { name: "SP5DER", style: "italic font-black tracking-wide" },
  { name: "CHROME HEARTS", style: "font-black tracking-wider" },
  { name: "GALLERY DEPT", style: "tracking-[0.2em] font-medium" },
  { name: "DENIM TEARS", style: "tracking-wide font-bold" },
  { name: "HELLSTAR", style: "italic tracking-widest font-bold" },
  { name: "BROKEN PLANET", style: "tracking-[0.3em] font-light" },
];

export const MARQUEE_ROW_2 = [
  { name: "NIKE TECH", style: "font-black tracking-tight" },
  { name: "BAPE", style: "font-black tracking-wider" },
  { name: "PURPLE BRAND", style: "tracking-[0.25em] font-medium" },
  { name: "AMIRI", style: "tracking-[0.3em] font-light" },
  { name: "BURBERRY", style: "tracking-wider font-semibold" },
  { name: "NOCTA", style: "tracking-[0.4em] font-light" },
  { name: "SYNA WORLD", style: "italic font-bold tracking-wide" },
  { name: "TIMBERLAND", style: "font-black tracking-tight" },
];

export const MOCK_TRANSACTIONS = [
  { time: "11:42 AM", item: "Rick Owens Geobasket", brand: "Rick Owens", size: "43", color: "Black", price: 12500, staff: "Miki" },
  { time: "10:58 AM", item: "Nike Tech Reflective", brand: "Nike", size: "M", color: "Silver", price: 3200, staff: "Miki" },
  { time: "10:21 AM", item: "Gallery Dept Flared Jeans", brand: "Gallery Dept", size: "32", color: "Vintage Wash", price: 4800, staff: "Miki" },
  { time: "09:55 AM", item: "Chrome Hearts Tie", brand: "Chrome Hearts", size: "OS", color: "Silver", price: 2100, staff: "Miki" },
  { time: "09:30 AM", item: "SP5DER Hoodie", brand: "SP5DER", size: "L", color: "Black", price: 5500, staff: "Miki" },
  { time: "Yesterday 6:15 PM", item: "Jordan 5 Retro", brand: "Jordan", size: "42", color: "Red Suede", price: 8900, staff: "Miki" },
];

export const ACTIVITY_FEED = [
  { type: "sale" as const, text: "Rick Owens Geobasket — Size 43 — 1 sold", time: "11:42 AM" },
  { type: "low" as const, text: "SP5DER Hoodie Black — Size L — LOW STOCK (2 left)", time: "11:30 AM" },
  { type: "sale" as const, text: "Nike Tech Reflective — Size M — 1 sold", time: "10:58 AM" },
  { type: "low" as const, text: "Denim Tears Shorts Pink — Size S — LOW STOCK (1 left)", time: "10:44 AM" },
  { type: "sale" as const, text: "Gallery Dept Flared Jeans — Size 32 — 1 sold", time: "10:21 AM" },
  { type: "sale" as const, text: "Chrome Hearts Tie — 1 sold", time: "09:55 AM" },
  { type: "restock" as const, text: "Hellstar Tee — Restocked +5 units", time: "09:10 AM" },
];

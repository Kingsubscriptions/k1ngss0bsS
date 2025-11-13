// src/data/products.ts

// Helper to create durations with auto-calculated prices
const createDurations = (
  monthlyPrice: number,
  monthlyOriginal: number,
  customPrices?: { [key: string]: number } // optional custom prices for special discounts
) => {
  const durations = [
    {
      duration: "1 Month",
      price: monthlyPrice,
      original: monthlyOriginal,
    },
    {
      duration: "3 Months",
      price: customPrices?.["3m"] || monthlyPrice * 3,
      original: monthlyOriginal * 3,
    },
    {
      duration: "6 Months",
      price: customPrices?.["6m"] || monthlyPrice * 6,
      original: monthlyOriginal * 6,
    },
    {
      duration: "1 Year",
      price: customPrices?.["12m"] || monthlyPrice * 12,
      original: monthlyOriginal * 12,
    },
  ];
  return durations;
};

// Product interfaces and types
export interface PlanDuration {
  duration: string;
  price: number;
  original?: number;
}

export interface PlanOption {
  type: string;
  description?: string;
  durations: PlanDuration[];
}

export type StockType = boolean | number | "unlimited";

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  images?: string[]; // Image gallery
  features: string[];
  price: {
    monthly?: number;
    yearly?: number;
    original?: number;
  };
  plans?: PlanOption[];
  description?: string;
  longDescription?: string;
  badge?: string;
  stock: StockType;
  stockHistory?: Array<{ date: string; stock: StockType }>; // Track stock changes
  rating?: number;
  popular?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Utility: Get default image if missing
export function getProductImage(image?: string): string {
  return image && image.length > 5 ? image : "/assets/default.jpg";
}

// Utility: Get stock label
export function getStockLabel(stock: StockType): string {
  if (stock === false || stock === 0) return "Out of Stock";
  if (stock === true || stock === "unlimited") return "In Stock";
  if (typeof stock === "number" && stock > 0) return `${stock} left`;
  return "Unknown";
}

// Utility: Is product in stock
export function isProductInStock(stock: StockType): boolean {
  if (stock === false || stock === 0) return false;
  if (stock === true || stock === "unlimited") return true;
  if (typeof stock === "number" && stock > 0) return true;
  return false;
}

// Runtime validation (example using Zod)
// import { z } from "zod";
// export const ProductSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   category: z.string(),
//   image: z.string(),
//   features: z.array(z.string()),
//   price: z.object({ monthly: z.number().optional(), yearly: z.number().optional(), original: z.number().optional() }),
//   stock: z.union([z.boolean(), z.number(), z.literal("unlimited")]),
// });

export const products: Product[] = [
  {
    id: "netflix",
    name: "Netflix Premium",
    category: "Entertainment, Streaming",
    price: { monthly: 440, original: 1100 },
    description: "Watch your favorite shows and movies in 4K UHD. Plans available for every need.",
    longDescription: "Get uninterrupted access to Netflix's vast library. Choose between a cost-effective shared plan or a fully private plan. Shared plan has strict rules: do not change profile name/PIN and use on one device only.",
    features: ["Ultra HD 4K Streaming", "Officially Paid & Renewable", "Works on All Devices", "Shared Plan Rules Apply"],
    image: "/assets/Netflix.jpg",
    images: ["/assets/Netflix.jpg", "https://images.unsplash.com/photo-1599507593369-63f1812816b5?auto=format&fit=crop&w=400&h=240"],
    popular: true,
    plans: [
      { type: "Premium (Shared Screen)", description: "Profile on a shared account. No downloads. Use on 1 device only. Do not change name/PIN.", durations: createDurations(440, 1100).filter(d => ["1 Month"].includes(d.duration)) },
      { type: "Platinum (Private Screen)", description: "Your own private, PIN-protected profile with unlimited downloads.", durations: createDurations(500, 1100, { "6m": 2800, "12m": 6000 }) },
    ],
    stock: true,
    stockHistory: [ { date: "2025-08-01", stock: true }, { date: "2025-08-15", stock: "unlimited" } ],
    rating: 4.9,
    tags: ["streaming", "premium", "4k"],
    createdAt: "2025-07-01T10:00:00Z",
    updatedAt: "2025-08-26T12:00:00Z"
  },
  {
    id: "prime-video",
    name: "Amazon Prime Video",
    category: "Entertainment, Streaming",
    price: { monthly: 120, original: 599 },
    description: "Enjoy thousands of movies, TV shows, and Amazon Originals in Ultra HD.",
    longDescription: "An official Prime Video subscription that provides access to a huge library of content with Ultra HD streaming and unlimited downloads on a single screen.",
    features: ["Ultra HD Streaming", "Officially Paid", "Unlimited Downloads", "Single Screen Access"],
    image: "https://images.unsplash.com/photo-1599507593369-63f1812816b5?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Individual Screen", description: "Access for one user with unlimited downloads.", durations: createDurations(120, 599, { "6m": 450, "12m": 900 }).filter(d => ["1 Month", "6 Months", "1 Year"].includes(d.duration)) }],
    stock: true,
  },
  {
    id: "spotify-premium",
    name: "Spotify Premium",
    category: "Music, Entertainment",
    price: { monthly: 350, original: 520 },
    description: "Ad-free music streaming with high-quality audio, activated on your own email.",
    longDescription: "Listen to your favorite music without interruptions. With Spotify Premium, you get high-fidelity audio, can download tracks for offline listening, and enjoy your tunes across all your devices. The subscription is activated on your personal email.",
    features: ["Activated on Your Personal Email", "Ad-free Music Streaming", "Offline Downloads", "High Quality Audio"],
    image: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?auto=format&fit=crop&w=400&h=240",
    popular: true,
    plans: [{ type: "Individual", description: "Premium access for one person on their own email.", durations: createDurations(350, 520, { "3m": 900, "6m": 1800 }).filter(d => ["1 Month", "3 Months", "6 Months"].includes(d.duration)) }],
    stock: true,
  },
  {
    id: "youtube-premium",
    name: "YouTube Premium",
    category: "Entertainment, Streaming",
    price: { monthly: 300, original: 479 },
    description: "Ad-free videos, background play, and offline downloads, activated on your personal email.",
    longDescription: "Upgrade your YouTube experience. Watch videos without ads, keep them playing in the background, and download content for offline viewing. This subscription is activated on your personal email.",
    features: ["Activated on Your Personal Email", "Ad-free Video & Music", "Background Play", "Offline Downloads"],
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Individual", description: "Premium access for one person on their own email.", durations: [
      { duration: "1 Month", price: 300, original: 479 }, { duration: "4 Months", price: 1200, original: 1916 }, { duration: "6 Months", price: 1800, original: 2874 }, { duration: "1 Year", price: 3200, original: 5748 },
    ]}],
    stock: true,
  },
  {
    id: "disney-plus",
    name: "Disney+",
    category: "Entertainment, Streaming",
    price: { monthly: 450, original: 2200 },
    description: "The home of Disney, Pixar, Marvel, Star Wars. Requires VPN for access.",
    longDescription: "Stream all your favorites from Disney, Pixar, Marvel, Star Wars, and National Geographic. Note: This service requires a VPN connected to USA/Canada for access. Instructions will be provided.",
    features: ["Endless Entertainment", "Originals & Exclusives", "4K UHD Quality", "Requires VPN (Instructions Provided)"],
    image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Single Screen", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 450, original: 2200 }] }],
    stock: true,
  },
  {
    id: "hbo-max",
    name: "HBO Max",
    category: "Entertainment, Streaming",
    price: { monthly: 500, original: 2800 },
    description: "Stream all of HBO, plus hit movies, originals, and fan favorites. Requires VPN.",
    longDescription: "Watch iconic series like Game of Thrones, new Max Originals, and blockbuster movies from Warner Bros. Note: This service requires a VPN for access.",
    features: ["HBO Originals (Game of Thrones, etc.)", "Warner Bros. Movie Premieres", "Max Originals", "Requires VPN (Instructions Provided)"],
    image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Single Screen", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 500, original: 2800 }] }],
    stock: true,
  },
  {
    id: "hulu",
    name: "Hulu",
    category: "Entertainment, Streaming",
    price: { monthly: 450, original: 2200 },
    description: "Access a huge streaming library of current-season episodes and hit movies.",
    features: ["Current-Season TV Shows", "Award-Winning Hulu Originals", "Huge Movie Library", "Requires VPN (Instructions Provided)"],
    image: "https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Single Screen", description: "Monthly access for a single user (ad-supported).", durations: [{ duration: "1 Month", price: 450, original: 2200 }] }],
    stock: true,
  },
  // --- Study, Writing & SEO Tools ---
  {
    id: "quillbot-premium",
    name: "Quillbot Premium",
    category: "Writer Tools, Study Tools",
    price: { monthly: 400, original: 2800 },
    description: "Advanced AI writing assistant for paraphrasing, grammar checking, and summarizing.",
    longDescription: "Enhance your writing with Quillbot Premium. Get unlimited words in the Paraphraser, advanced grammar checks, plagiarism detection, and faster processing speeds.",
    features: ["Unlimited Paraphrasing", "Advanced Grammar & Tone Checks", "Plagiarism Checker", "Faster Processing Speed"],
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Access for one device for one month.", durations: [{ duration: "1 Month", price: 400, original: 2800 }] }],
    stock: true,
  },
  {
    id: "grammarly-premium",
    name: "Grammarly Premium",
    category: "Writer Tools, Study Tools",
    price: { monthly: 500, original: 3500 },
    description: "Go beyond grammar and spelling to improve your writing's style and clarity.",
    longDescription: "Grammarly Premium helps you write with confidence by providing suggestions on clarity, engagement, and delivery. It includes a plagiarism checker and advanced formatting tools.",
    features: ["Advanced Grammar & Punctuation", "Clarity & Conciseness Suggestions", "Plagiarism Detector", "Tone Adjustment"],
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Access for one device for one month.", durations: [{ duration: "1 Month", price: 500, original: 3500 }] }],
    stock: true,
  },
  {
    id: "turnitin-instructor",
    name: "Turnitin Instructor",
    category: "Study Tools, Writer Tools",
    price: { monthly: 350, original: 1000 },
    description: "Check for plagiarism and AI-generated content with a professional instructor account.",
    longDescription: "Get access to Turnitin, the industry standard for academic integrity. We offer various plans, from basic plagiarism checks to advanced AI detection reports, on shared or private accounts.",
    features: ["Plagiarism Reports", "AI Content Detection", "100 Files Daily Limit (on Pro plans)", "Personal or Shared Access"],
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&h=240",
    plans: [
        { type: "Student (Plagiarism Only)", description: "Personal account on your email for plagiarism checks.", durations: [{ duration: "1 Month", price: 350, original: 1000 }] },
        { type: "Pro AI (Shared)", description: "Shared account with AI & Plagiarism reports. Shared with 3 people.", durations: [{ duration: "1 Month", price: 1900, original: 4000 }] },
        { type: "Pro AI (Private)", description: "Private account on your email with AI & Plagiarism reports.", durations: [{ duration: "1 Month", price: 4200, original: 6000 }] },
    ],
    stock: true,
  },
  {
    id: "chegg-account",
    name: "Chegg Study Account",
    category: "Study Tools",
    price: { monthly: 500, original: 4200 },
    description: "Get expert Q&A, textbook solutions, and homework help.",
    longDescription: "Chegg is a must-have for students. Get step-by-step solutions for your toughest assignments, ask experts questions 24/7, and access a vast library of study materials.",
    features: ["Expert Q&A", "Textbook Solutions", "Homework Help", "24/7 Study Support"],
    image: "/assets/Chegg.jpg",
    plans: [{ type: "Shared Account", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 500, original: 4200 }] }],
    stock: true,
  },
  {
    id: "coursera-plus",
    name: "Coursera Plus",
    category: "Study Tools, Courses",
    price: { yearly: 4500, original: 111000 },
    description: "Get unlimited access to thousands of world-class courses and certifications.",
    longDescription: "Learn from experts at top universities and companies. Coursera Plus ($399/year official price) gives you unlimited access to over 7,000 courses, Specializations, and Professional Certificates.",
    features: ["Unlimited access to 7,000+ courses", "Certificates for completed courses", "Learn from top universities", "Activated on your personal email"],
    image: "/assets/Coursera.jpg",
    plans: [{ type: "Personal Email", description: "Full year of Coursera Plus on your own account.", durations: [{ duration: "1 Year", price: 4500, original: 111000 }] }],
    stock: true,
  },
  {
    id: "udemy-premium",
    name: "Udemy Premium",
    category: "Study Tools, Courses",
    price: { monthly: 1600, original: 8400 },
    description: "Access a collection of top-rated courses on business, tech, and personal development.",
    longDescription: "Udemy Business (Personal Plan) gives you access to thousands of top-rated courses to help you learn new skills and advance your career.",
    features: ["Access to 8,000+ top courses", "Certificates of Completion", "Top-rated instructors", "For 1 Device"],
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Premium Account", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 1600, original: 8400 }] }],
    stock: true,
  },
  {
    id: "semrush-pro",
    name: "Semrush Pro",
    category: "SEO Tools, Business",
    price: { monthly: 1500, original: 36000 },
    description: "All-in-one suite for SEO, content marketing, and competitor research.",
    longDescription: "Get shared access to the powerful Semrush Pro toolkit. Perform keyword research, track your competition, run technical SEO audits, and optimize your content for higher rankings.",
    features: ["Keyword Research Tools", "Competitor Analysis", "Site Audit", "Content Marketing Toolkit"],
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 1500, original: 36000 }] }],
    stock: true,
  },
  {
    id: "helium-10",
    name: "Helium 10",
    category: "SEO Tools, Business",
    price: { monthly: 1500, original: 10000 },
    description: "Powerful software suite for Amazon sellers and e-commerce entrepreneurs.",
    longDescription: "Dominate Amazon with Helium 10. This toolkit provides everything you need for product research, keyword research, listing optimization, and managing your FBA business.",
    features: ["Amazon Product Research", "Keyword Research & Tracking", "Listing Optimization", "For FBA Sellers"],
    image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 1500, original: 10000 }] }],
    stock: true,
  },
  {
    id: "jasper-ai",
    name: "Jasper AI",
    category: "AI Tools, Writer Tools",
    price: { monthly: 1200, original: 13700 },
    description: "AI Content Platform that helps your team create amazing content 10x faster.",
    longDescription: "Break through writer's block and create high-quality, original content with Jasper. It's trained by expert copywriters and can write blog posts, social media updates, and marketing copy.",
    features: ["AI Copywriting", "Blog & Article Writer", "Multiple Content Templates", "Brand Voice & Tone"],
    image: "https://images.unsplash.com/photo-1677756223233-5290b8f04c64?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 1200, original: 13700 }] }],
    stock: true,
  },
  {
    id: "copy-ai",
    name: "Copy.ai",
    category: "AI Tools, Writer Tools",
    price: { monthly: 800, original: 13700 },
    description: "AI-powered copywriter that generates high-quality marketing copy in seconds.",
    longDescription: "From blog posts to social media captions, Copy.ai uses advanced AI to craft compelling copy that resonates with your audience, saving you time and effort.",
    features: ["Automated Copywriting", "90+ Content Types", "Freestyle Text Generation", "Ideal for Marketers"],
    image: "https://images.unsplash.com/photo-1516132006923-6cf348e5c24e?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 800, original: 13700 }] }],
    stock: true,
  },
  // --- More AI, Design & Video Tools ---
  {
    id: "surfer-seo",
    name: "Surfer SEO",
    category: "SEO Tools, Writer Tools",
    price: { monthly: 1500, original: 17800 },
    description: "Content intelligence tool that helps you write perfectly optimized articles.",
    longDescription: "Surfer analyzes top-ranking pages in your niche and provides a data-driven blueprint for your content. It helps you write articles that are guaranteed to rank higher in search results.",
    features: ["Data-Driven Content Editor", "SERP Analysis", "SEO Audit Tool", "Keyword Research"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 1500, original: 17800 }] }],
    stock: true,
  },
  {
    id: "rytr",
    name: "Rytr AI",
    category: "AI Tools, Writer Tools",
    price: { monthly: 700, original: 8100 },
    description: "An AI writing assistant that helps you create high-quality content, in just a few seconds.",
    longDescription: "Rytr is perfect for generating creative and engaging copy for blogs, emails, social media ads, and more. It supports over 30 languages and has more than 40 use cases.",
    features: ["40+ Use Cases", "30+ Languages Supported", "Built-in Plagiarism Checker", "Fast & Responsive"],
    image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 700, original: 8100 }] }],
    stock: true,
  },
  {
    id: "pictory-ai",
    name: "Pictory.ai",
    category: "AI Tools, Video",
    price: { monthly: 1200, original: 6700 },
    description: "Create stunning videos from your scripts or blog posts using AI.",
    longDescription: "Pictory.ai uses artificial intelligence to automatically create short, highly-shareable branded videos from your long-form content. Perfect for marketers and content creators.",
    features: ["AI-Powered Video Creation", "Script-to-Video", "Blog-to-Video", "Huge Stock Media Library"],
    image: "https://images.unsplash.com/photo-1574717024632-11b3b7872998?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Monthly access for a single user.", durations: [{ duration: "1 Month", price: 1200, original: 6700 }] }],
    stock: true,
  },
  {
    id: "shutterstock",
    name: "Shutterstock",
    category: "Graphics/Creative, Design",
    price: { monthly: 1000, original: 8000 },
    description: "Download high-quality stock photos, vectors, videos, and music.",
    longDescription: "Access the vast Shutterstock library to find the perfect asset for your creative projects. This plan provides shared access for downloading royalty-free images and more.",
    features: ["Millions of Stock Photos", "Royalty-Free Vectors & Illustrations", "Stock Video Footage", "Shared Access"],
    image: "https://images.unsplash.com/photo-1554188248-986adbb73373?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Monthly access with download limits.", durations: [{ duration: "1 Month", price: 1000, original: 8000 }] }],
    stock: true,
  },
  {
    id: "envato-elements",
    name: "Envato Elements",
    category: "Graphics/Creative, Design",
    price: { monthly: 899, original: 4600 },
    description: "Unlimited downloads of millions of creative assets: templates, stock videos, photos, and more.",
    longDescription: "Envato Elements is the ultimate creative subscription ($16.50/month official price). Get unlimited downloads from a massive library of high-quality assets.",
    features: ["Unlimited Downloads", "Millions of Creative Assets", "Stock Videos & Photos", "Templates & Fonts"],
    image: "https://images.unsplash.com/photo-1596593545365-17c2b530d9b4?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "Login access for one month. Download limits may apply.", durations: [{ duration: "1 Month", price: 899, original: 4600 }] }],
    stock: true,
  },
  {
    id: "midjourney",
    name: "Midjourney",
    category: "AI Tools, Graphics/Creative",
    price: { monthly: 3500, original: 8400 },
    description: "Advanced AI image generation tool that turns text prompts into stunning visuals.",
    longDescription: "Midjourney is a leading AI art generator that creates beautiful, high-quality images from simple text descriptions. Perfect for concept art, branding, and creative projects.",
    features: ["AI Image Generation from Text", "High-Resolution & Stylistic Outputs", "Ideal for Concept Art & Design", "Private Account Access"],
    image: "https://images.unsplash.com/photo-1679083216922-225389a191a6?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Basic Plan", description: "Monthly private access with a set number of image generations.", durations: [{ duration: "1 Month", price: 3500, original: 8400 }] }],
    stock: true,
  },
  
  // --- VPN Services ---
  {
    id: "nord-vpn",
    name: "NordVPN",
    category: "VPN, Software",
    price: { monthly: 400, original: 3600 },
    description: "Secure, high-speed VPN for safe and private internet access on one device.",
    features: ["High-Speed Servers", "Strict No-Logs Policy", "Secure Encryption", "For 1 Device"],
    image: "https://images.unsplash.com/photo-1621253026601-5b723f113794?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "One month access for a single device.", durations: [{ duration: "1 Month", price: 400, original: 3600 }] }],
    stock: true,
  },
  {
    id: "express-vpn",
    name: "ExpressVPN",
    category: "VPN, Software",
    price: { monthly: 600, original: 3600 },
    description: "Premium VPN service known for its blazing-fast speeds and robust security.",
    features: ["Blazing-Fast Speeds", "Best-in-Class Encryption", "99.9% Uptime", "For 1 Device"],
    image: "https://images.unsplash.com/photo-1614036750348-add95a9f4544?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "One month access for a single device.", durations: [{ duration: "1 Month", price: 600, original: 3600 }] }],
    stock: true,
  },
  {
    id: "surfshark-vpn",
    name: "Surfshark VPN",
    category: "VPN, Software",
    price: { monthly: 350, original: 3600 },
    description: "Affordable VPN with premium features for secure and private browsing.",
    features: ["Strong Encryption", "CleanWeb Ad-blocker", "Strict No-Logs Policy", "For 1 Device"],
    image: "https://images.unsplash.com/photo-1550751827-413375b4269d?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "One month access for a single device.", durations: [{ duration: "1 Month", price: 350, original: 3600 }] }],
    stock: true,
  },
  {
    id: "cyberghost-vpn",
    name: "CyberGhost VPN",
    category: "VPN, Software",
    price: { monthly: 500, original: 3600 },
    description: "User-friendly VPN with servers optimized for streaming and torrenting.",
    features: ["Optimized Streaming Servers", "User-Friendly Apps", "Strong No-Logs Policy", "For 1 Device"],
    image: "https://images.unsplash.com/photo-1558008439-d96a090f9a2d?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "One month access for a single device.", durations: [{ duration: "1 Month", price: 500, original: 3600 }] }],
    stock: true,
  },
  {
    id: "ip-vanish-vpn",
    name: "IP Vanish VPN",
    category: "VPN, Software",
    price: { monthly: 350, original: 3000 },
    description: "Fast and secure VPN with a strong focus on privacy and anonymity.",
    features: ["Anonymous Torrenting Support", "Zero Traffic Logs", "Advanced Encryption", "For 1 Device"],
    image: "https://images.unsplash.com/photo-1605810230464-47c1b6271295?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "One month access for a single device.", durations: [{ duration: "1 Month", price: 350, original: 3000 }] }],
    stock: true,
  },
  {
    id: "hotspot-shield-vpn",
    name: "Hotspot Shield VPN",
    category: "VPN, Software",
    price: { monthly: 400, original: 2200 },
    description: "Popular VPN for fast streaming and secure browsing.",
    features: ["Patented Hydra Protocol for Speed", "Military-Grade Encryption", "4K Streaming Support", "For 1 Device"],
    image: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "One month access for a single device.", durations: [{ duration: "1 Month", price: 400, original: 2200 }] }],
    stock: true,
  },
  {
    id: "pure-vpn",
    name: "Pure VPN",
    category: "VPN, Software",
    price: { monthly: 400, original: 3000 },
    description: "A feature-rich VPN with a massive global server network.",
    features: ["256-bit Encryption", "Always-On Audit", "Port Forwarding Support", "For 1 Device"],
    image: "https://images.unsplash.com/photo-1526374965328-5f61d48c093c?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Shared Account", description: "One month access for a single device.", durations: [{ duration: "1 Month", price: 400, original: 3000 }] }],
    stock: true,
  },
  // --- Gaming & Other Services ---
  {
    id: "playstation-plus",
    name: "Playstation Plus (PS+)",
    category: "Gaming, Entertainment",
    price: { monthly: 2750, original: 3500 },
    description: "Online multiplayer, free monthly games, and exclusive discounts on PlayStation.",
    longDescription: "Take your PlayStation experience to the next level. PS Plus is required for online multiplayer and provides you with a library of free games each month, plus exclusive member discounts.",
    features: ["Online Multiplayer Access", "Free Monthly Games", "Exclusive Discounts", "Cloud Storage"],
    image: "https://images.unsplash.com/photo-1585857242562-85a203f9b09a?auto=format&fit=crop&w=400&h=240",
    plans: [
      { type: "Essential", description: "Core plan with online multiplayer and monthly games.", durations: [
        { duration: "1 Month", price: 2750, original: 3500 }, { duration: "3 Months", price: 7400, original: 10500 }, { duration: "12 Months", price: 18400, original: 42000 },
      ]},
      { type: "Extra", description: "Includes Essential benefits plus a catalog of PS4 & PS5 games.", durations: [
        { duration: "1 Month", price: 3850, original: 5000 }, { duration: "3 Months", price: 9500, original: 15000 }, { duration: "12 Months", price: 27800, original: 60000 },
      ]},
      { type: "Deluxe", description: "All benefits plus classic games and game trials.", durations: [
        { duration: "1 Month", price: 4750, original: 6000 }, { duration: "3 Months", price: 10700, original: 18000 }, { duration: "12 Months", price: 32300, original: 72000 },
      ]},
    ],
    stock: true,
  },
  {
    id: "rdp-service",
    name: "RDP (Remote Desktop)",
    category: "Software, Productivity",
    price: { monthly: 1800, original: 2500 },
    description: "High-performance Remote Desktop Protocol for various tasks.",
    longDescription: "Access a powerful remote Windows computer from anywhere. Our RDPs come in various configurations to suit your needs, whether for general use or for running emulators.",
    features: ["High-Speed Connection", "Multiple Configurations", "25-Day Replacement Warranty", "Emulator Support Available"],
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=400&h=240",
    plans: [
      { type: "2 Core / 4GB RAM", description: "Balanced performance for general tasks.", durations: [{ duration: "1 Month", price: 2000, original: 3000 }] },
      { type: "4 Core / 8GB RAM", description: "More power for demanding applications.", durations: [{ duration: "1 Month", price: 2700, original: 4000 }] },
      { type: "8 Core / 16GB RAM", description: "High-end performance for heavy workloads.", durations: [{ duration: "1 Month", price: 3500, original: 5000 }] },
    ],
    stock: true,
  },
  {
    id: "uk-physical-sim",
    name: "UK Physical SIM Card",
    category: "Services",
    price: { monthly: 4500, original: 6000 },
    description: "Get a physical UK SIM card for international calls, SMS, and account verification.",
    longDescription: "A physical SIM card from the UK, delivered to you. Perfect for unlocking TikTok Live, creating a UK WhatsApp number, receiving international OTPs, and registering your business.",
    features: ["Unlock TikTok Live", "Create UK WhatsApp", "Receive International Calls & SMS", "Business Verification"],
    image: "https://images.unsplash.com/photo-1614332287897-f3743ff00219?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Physical SIM", description: "One-time purchase for a UK SIM card.", durations: [{ duration: "One-Time", price: 4500, original: 6000 }] }],
    stock: false,
  },

  // --- Business & Productivity Software ---
  {
    id: "linkedin-premium",
    name: "LinkedIn Premium",
    category: "Business, Productivity",
    price: { monthly: 6000, original: 22000 },
    description: "Unlock advanced features for job seeking, networking, and sales prospecting.",
    longDescription: "Supercharge your professional networking and career growth with LinkedIn Premium. Choose the Business plan for company insights or the Sales Navigator for advanced lead generation.",
    features: ["Advanced Search Filters", "InMail Credits", "See Who Viewed Your Profile", "Access to LinkedIn Learning"],
    image: "https://images.unsplash.com/photo-1611944212129-29955ae40213?auto=format&fit=crop&w=400&h=240",
    plans: [
        { type: "Sales Navigator Advance", description: "Advanced tools for sales professionals to find leads.", durations: [{ duration: "1 Month", price: 7500, original: 28000 }] },
        { type: "Business Plan (Yearly)", description: "Grow your presence and build your brand.", durations: [{ duration: "1 Year", price: 8999, original: 71000 }] },
    ],
    stock: true,
  },
  {
    id: "ms-office-365",
    name: "Microsoft Office 365",
    category: "Software, Productivity",
    price: { yearly: 2500, original: 21000 },
    description: "Lifetime access to the essential Microsoft productivity suite: Word, Excel, PowerPoint.",
    longDescription: "A one-time purchase for a lifetime Microsoft Office 365 subscription. Includes Word, Excel, PowerPoint, and 5TB of OneDrive storage. Can be used on up to 5 devices under your name.",
    features: ["One-Time Payment (Lifetime)", "Word, Excel, PowerPoint", "5TB OneDrive Storage", "Use on 5 Devices"],
    image: "https://images.unsplash.com/photo-1603969238814-716395b0e852?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "Lifetime Account", description: "One-time payment for lifetime access on your name.", durations: [{ duration: "Lifetime", price: 2500, original: 21000 }] }],
    stock: true,
  },
  {
    id: "windows-pro",
    name: "Microsoft Windows 10/11 Pro",
    category: "Software, Productivity",
    price: { yearly: 1499, original: 40000 },
    description: "Official OEM license key for Windows 10 Pro or Windows 11 Pro.",
    longDescription: "Activate your copy of Windows with a genuine OEM license key. This is a one-time purchase for a lifetime activation on a single PC.",
    features: ["Official OEM License Key", "Lifetime Activation", "For 1 PC", "Windows 10 Pro or 11 Pro"],
    image: "https://images.unsplash.com/photo-1618335438217-7a2b0a1d85a0?auto=format&fit=crop&w=400&h=240",
    plans: [{ type: "OEM License Key", description: "One-time purchase for a single PC activation.", durations: [{ duration: "Lifetime", price: 1499, original: 40000 }] }],
    stock: true,
  },

  // --- Social Media Services ---
  {
    id: "social-media-services",
    name: "Social Media Services",
    category: "Business, Social Media Services",
    price: { monthly: 50, original: 100 },
    description: "Grow your social media presence with authentic followers, likes, views, and more.",
    longDescription: "Boost your profiles on TikTok, Instagram, YouTube, and Facebook. We provide a variety of services to increase your engagement and visibility, helping you reach a wider audience.",
    features: ["Authentic Followers, Likes & Views", "Supports TikTok, Instagram, Facebook, YouTube", "Fast Delivery", "Non-Drop Guarantees Available"],
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&h=240",
    popular: true,
    plans: [
      { type: "TikTok Services", description: "Boost your TikTok profile. Non-Drop and Organic options available.", durations: [
          { duration: "1k Followers", price: 800, original: 1200 }, { duration: "5k Views", price: 100, original: 200 }, { duration: "1k Likes", price: 250, original: 400 },
      ]},
      { type: "Instagram Services", description: "Enhance your Instagram engagement.", durations: [
          { duration: "1k Followers", price: 350, original: 600 }, { duration: "1k Likes", price: 150, original: 250 }, { duration: "1k Views", price: 50, original: 100 },
      ]},
      { type: "YouTube Services", description: "Grow your YouTube channel. Monetization packages available.", durations: [
          { duration: "1k Subscribers", price: 3000, original: 4500 }, { duration: "1k Views", price: 400, original: 600 }, { duration: "1k Likes", price: 400, original: 600 },
      ]},
      { type: "Facebook Services", description: "Increase your page's reach and likes.", durations: [
          { duration: "1k Page Like/Followers", price: 850, original: 1200 }, { duration: "1k Post Likes", price: 400, original: 600 }, { duration: "1k Views", price: 120, original: 200 },
      ]},
    ],
    stock: true
  },
];

export const categories = [
    { id: "all", name: "All", count: products.length },
    { id: "entertainment", name: "Entertainment", count: products.filter(p => p.category.includes("Entertainment")).length },
    { id: "streaming", name: "Streaming", count: products.filter(p => p.category.includes("Streaming")).length },
    { id: "music", name: "Music", count: products.filter(p => p.category.includes("Music")).length },
    { id: "gaming", name: "Gaming", count: products.filter(p => p.category.includes("Gaming")).length },
    { id: "ai-tools", name: "AI Tools", count: products.filter(p => p.category.includes("AI Tools")).length },
    { id: "seo-tools", name: "SEO Tools", count: products.filter(p => p.category.includes("SEO Tools")).length },
    { id: "study-tools", name: "Study Tools", count: products.filter(p => p.category.includes("Study Tools")).length },
    { id: "writer-tools", "name": "Writer Tools", count: products.filter(p => p.category.includes("Writer Tools")).length },
    { id: "social-media-services", name: "Social Media", count: products.filter(p => p.category.includes("Social Media")).length },
    { id: "vpn", name: "VPN", count: products.filter(p => p.category.includes("VPN")).length },
    { id: "software", name: "Software", count: products.filter(p => p.category.includes("Software")).length },
    { id: "productivity", name: "Productivity", count: products.filter(p => p.category.includes("Productivity")).length },
    { id: "courses", name: "Courses", count: products.filter(p => p.category.includes("Courses")).length },
    { id: "graphics-creative", name: "Graphics/Creative", count: products.filter(p => p.category.includes("Graphics/Creative")).length },
    { id: "business", name: "Business", count: products.filter(p => p.category.includes("Business")).length },
    { id: "services", name: "Services", count: products.filter(p => p.category.includes("Services")).length },
];
/**
 * Seed script: run once with `npm run seed` after running supabase/schema.sql.
 *
 * Everything it creates is SAMPLE DATA: invented sellers, invented gigs, no photos.
 * Covers are drawn in code and avatars are initials, so no images are needed.
 *
 * Creates 1 admin, 8 sellers with profiles, 1 buyer and 24 gigs with 3 packages each.
 * Set DEMO_PASSWORD in .env.local first. All accounts share it.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { slugify } from "../lib/utils/slug-generator";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = process.env.DEMO_PASSWORD;

if (!SUPABASE_URL || !SERVICE_ROLE || SUPABASE_URL.includes("placeholder")) {
  console.error("Missing or placeholder Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}
if (!PASSWORD || PASSWORD.length < 12) {
  console.error("Set DEMO_PASSWORD (at least 12 characters) in .env.local. It is the shared password for the sample accounts.");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false } });

const WEB = "11111111-1111-1111-1111-111111111111";
const MOBILE = "22222222-2222-2222-2222-222222222222";
const DESIGN = "33333333-3333-3333-3333-333333333333";
const AI = "44444444-4444-4444-4444-444444444444";
const MARKETING = "55555555-5555-5555-5555-555555555555";
const BUSINESS = "66666666-6666-6666-6666-666666666666";

type Level = "new_seller" | "level_one" | "level_two" | "top_rated";

const SELLERS: Array<{
  email: string; username: string; full_name: string; tagline: string; skills: string[];
  level: Level; orders: number; rating: number;
}> = [
  { email: "mara@gigboard.test", username: "maraKade", full_name: "Mara Kade", tagline: "Brand and logo designer", skills: ["Logo design", "Brand guides", "Figma"], level: "top_rated", orders: 212, rating: 4.9 },
  { email: "isha@gigboard.test", username: "ishaRao", full_name: "Isha Rao", tagline: "Front-end developer for landing pages and web apps", skills: ["Next.js", "React", "Tailwind"], level: "level_two", orders: 97, rating: 4.8 },
  { email: "tomas@gigboard.test", username: "tomasWebb", full_name: "Tomas Webb", tagline: "Mobile developer, React Native and Flutter", skills: ["React Native", "Flutter", "Firebase"], level: "level_two", orders: 64, rating: 4.7 },
  { email: "lena@gigboard.test", username: "lenaOrtiz", full_name: "Lena Ortiz", tagline: "Automation and AI assistants for small teams", skills: ["Zapier", "OpenAI API", "Python"], level: "level_one", orders: 41, rating: 4.8 },
  { email: "sam@gigboard.test", username: "samOkafor", full_name: "Sam Okafor", tagline: "Search and social marketing for local businesses", skills: ["SEO", "Google Ads", "Analytics"], level: "level_one", orders: 38, rating: 4.6 },
  { email: "priya@gigboard.test", username: "priyaNair", full_name: "Priya Nair", tagline: "Virtual assistant and operations support", skills: ["Spreadsheets", "Research", "Scheduling"], level: "top_rated", orders: 180, rating: 4.9 },
  { email: "jonas@gigboard.test", username: "jonasWeber", full_name: "Jonas Weber", tagline: "WordPress and Webflow sites", skills: ["WordPress", "Webflow", "SEO"], level: "new_seller", orders: 3, rating: 0 },
  { email: "ayla@gigboard.test", username: "aylaDemir", full_name: "Ayla Demir", tagline: "Illustration and social media design", skills: ["Illustration", "Canva", "Social media"], level: "new_seller", orders: 0, rating: 0 },
];

// [seller username, category, title, [basic, standard, premium] prices]
const GIGS: Array<[string, string, string, [number, number, number]]> = [
  ["maraKade", DESIGN, "I will design a logo that still reads at 16px", [60, 120, 260]],
  ["maraKade", DESIGN, "I will create a brand guide with colors, fonts and rules", [120, 240, 480]],
  ["aylaDemir", DESIGN, "I will draw a set of icons for your app or site", [40, 90, 180]],
  ["aylaDemir", DESIGN, "I will design a month of social media posts", [50, 110, 220]],
  ["ishaRao", WEB, "I will build your landing page in Next.js in three days", [150, 300, 600]],
  ["ishaRao", WEB, "I will turn your Figma design into a fast React site", [120, 260, 520]],
  ["jonasWeber", WEB, "I will build a WordPress site for your small business", [100, 220, 450]],
  ["jonasWeber", WEB, "I will set up a Webflow site you can edit yourself", [110, 240, 480]],
  ["tomasWebb", MOBILE, "I will build a React Native app for iOS and Android", [300, 700, 1400]],
  ["tomasWebb", MOBILE, "I will fix crashes and slow screens in your mobile app", [60, 140, 300]],
  ["tomasWebb", MOBILE, "I will build a Flutter app with a Firebase backend", [280, 650, 1300]],
  ["ishaRao", MOBILE, "I will make your website work as an installable app", [90, 200, 400]],
  ["lenaOrtiz", AI, "I will automate your invoice emails with a small script", [70, 150, 320]],
  ["lenaOrtiz", AI, "I will build a support chatbot that answers from your FAQ", [150, 320, 640]],
  ["lenaOrtiz", AI, "I will connect your forms, sheets and email with Zapier", [50, 120, 260]],
  ["tomasWebb", AI, "I will add OpenAI features to your existing app", [160, 340, 700]],
  ["samOkafor", MARKETING, "I will audit your site and fix the top ten SEO problems", [80, 180, 380]],
  ["samOkafor", MARKETING, "I will set up and tune your first Google Ads campaign", [120, 260, 520]],
  ["samOkafor", MARKETING, "I will write and schedule a 30-day content calendar", [60, 140, 300]],
  ["aylaDemir", MARKETING, "I will design email newsletter templates that render everywhere", [55, 120, 240]],
  ["priyaNair", BUSINESS, "I will set up a clean spreadsheet and weekly report for your business", [40, 100, 220]],
  ["priyaNair", BUSINESS, "I will research and list 100 qualified leads for you", [60, 140, 300]],
  ["priyaNair", BUSINESS, "I will manage your inbox and calendar for a week", [70, 160, 340]],
  ["priyaNair", BUSINESS, "I will transcribe and summarize your meetings", [30, 80, 170]],
];

const DELIVERY = [3, 5, 8];

async function createAuthUser(email: string, fullName: string, username: string) {
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: PASSWORD!,
    email_confirm: true,
    user_metadata: { full_name: fullName, username },
  });
  if (data?.user) return data.user.id;
  const { data: existing } = await sb.from("users").select("id").eq("email", email).single();
  if (existing) return existing.id as string;
  console.warn(`  ${email}: ${error?.message}`);
  return null;
}

async function main() {
  console.log("Seeding sample data...");

  const adminId = await createAuthUser("admin@gigboard.test", "Demo Admin", "demo_admin");
  if (adminId) {
    await sb.from("users").upsert({ id: adminId, email: "admin@gigboard.test", full_name: "Demo Admin", username: "demo_admin", is_admin: true, is_email_verified: true });
  }

  const buyerId = await createAuthUser("buyer@gigboard.test", "Demo Buyer", "demo_buyer");
  if (buyerId) {
    await sb.from("users").upsert({ id: buyerId, email: "buyer@gigboard.test", full_name: "Demo Buyer", username: "demo_buyer", is_email_verified: true });
  }

  const sellerIds: Record<string, string> = {};
  for (const s of SELLERS) {
    const id = await createAuthUser(s.email, s.full_name, s.username);
    if (!id) continue;
    sellerIds[s.username] = id;
    await sb.from("users").upsert({ id, email: s.email, full_name: s.full_name, username: s.username, is_seller: true, is_email_verified: true });
    await sb.from("seller_profiles").upsert({
      user_id: id,
      tagline: s.tagline,
      description: `${s.tagline}. This is a sample profile for the Gigboard demo.`,
      skills: s.skills,
      seller_level: s.level,
      total_orders_completed: s.orders,
      average_rating: s.rating,
      response_rate: 95,
      response_time_hours: 2,
      on_time_delivery_rate: 98,
      stripe_onboarding_complete: true,
    });
    console.log("  seller", s.username);
  }

  let n = 0;
  for (const [seller, category, title, prices] of GIGS) {
    const sellerId = sellerIds[seller];
    if (!sellerId) {
      console.warn("  skipping gig, no seller:", seller);
      continue;
    }
    const sellerInfo = SELLERS.find((x) => x.username === seller)!;
    const reviews = sellerInfo.orders === 0 ? 0 : Math.max(1, Math.round(sellerInfo.orders / 4) + (n % 5) * 3);
    const { data: gig, error } = await sb
      .from("gigs")
      .insert({
        seller_id: sellerId,
        category_id: category,
        title,
        slug: slugify(title) + "-" + Math.random().toString(36).slice(2, 6),
        description: `<p>${title}. This is a sample gig for the Gigboard demo. What you get:</p><ul><li>A clear plan before work starts</li><li>Progress you can check at each step</li><li>Payment held until you approve the work</li></ul>`,
        short_description: title.slice(0, 150),
        tags: title.split(" ").filter((w) => w.length > 3).slice(0, 5),
        thumbnail_url: null,
        status: "active",
        total_orders: Math.round(sellerInfo.orders / 3),
        total_reviews: reviews,
        average_rating: reviews === 0 ? 0 : sellerInfo.rating,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !gig) {
      console.warn("  gig error:", error?.message);
      continue;
    }
    const tiers = ["basic", "standard", "premium"] as const;
    for (let i = 0; i < 3; i++) {
      await sb.from("gig_packages").insert({
        gig_id: gig.id,
        package_type: tiers[i],
        name: ["Starter", "Standard", "Premium"][i],
        description: ["One deliverable for a simple need", "The full job with more rounds of changes", "Everything, with priority handling"][i],
        price: prices[i],
        delivery_days: DELIVERY[i],
        revisions: [1, 3, 5][i],
        features: [
          { name: "Source files", included: i >= 1 },
          { name: "Commercial use rights", included: i >= 2 },
          { name: "Priority support", included: i === 2 },
          { name: "Revisions included", included: true },
        ] as never,
      });
    }
    n++;
  }

  console.log(`Seed complete: ${n} gigs. Sample accounts: admin@gigboard.test, buyer@gigboard.test, mara@gigboard.test (seller).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

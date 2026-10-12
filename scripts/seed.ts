/**
 * Seed script: run once with `npm run seed` after running supabase/schema.sql.
 *
 * Everything it creates is SAMPLE DATA: invented sellers, buyers, gigs and reviews.
 * Covers are drawn in code, so no images are needed.
 *
 * Creates 1 admin, 4 sample buyers, 8 sellers with profiles, 24 gigs with 3 packages each,
 * and a completed order plus a written review for every rated gig.
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
  email: string;
  username: string;
  full_name: string;
  tagline: string;
  skills: string[];
  level: Level;
  orders: number;
  rating: number;
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

/* Sample buyers who leave the reviews. The first one is the demo bar's Buyer. */
const BUYERS: Array<{ email: string; username: string; full_name: string }> = [
  { email: "buyer@gigboard.test", username: "demo_buyer", full_name: "Demo Buyer" },
  { email: "nadia@gigboard.test", username: "nadiaKhan", full_name: "Nadia Khan" },
  { email: "owen@gigboard.test", username: "owenHart", full_name: "Owen Hart" },
  { email: "zara@gigboard.test", username: "zaraAli", full_name: "Zara Ali" },
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
  ["ishaRao", WEB, "I will make your website work as an installable app", [90, 200, 400]],
  ["lenaOrtiz", AI, "I will automate your invoice emails with a small script", [70, 150, 320]],
  ["lenaOrtiz", AI, "I will build a support chatbot that answers from your FAQ", [150, 320, 640]],
  ["lenaOrtiz", AI, "I will connect your forms, sheets and email with Zapier", [50, 120, 260]],
  ["tomasWebb", AI, "I will add OpenAI features to your existing app", [160, 340, 700]],
  ["samOkafor", MARKETING, "I will audit your site and fix the top ten SEO problems", [80, 180, 380]],
  ["samOkafor", MARKETING, "I will set up and tune your first Google Ads campaign", [120, 260, 520]],
  ["samOkafor", MARKETING, "I will write and schedule a 30-day content calendar", [60, 140, 300]],
  ["aylaDemir", DESIGN, "I will design email newsletter templates that render everywhere", [55, 120, 240]],
  ["priyaNair", BUSINESS, "I will set up a clean spreadsheet and weekly report for your business", [40, 100, 220]],
  ["priyaNair", BUSINESS, "I will research and list 100 qualified leads for you", [60, 140, 300]],
  ["priyaNair", BUSINESS, "I will manage your inbox and calendar for a week", [70, 160, 340]],
  ["priyaNair", AI, "I will transcribe and summarize your meetings", [30, 80, 170]],
];

/* Review text keyed by the gig's position in GIGS. A gig gets 1 to 3 written reviews; the rest of
   its review count stays a number only, which the reviews section says plainly. */
const REVIEW_TEXT: Record<number, Array<[number, string, string?]>> = {
  0: [
    [5, "Mara sent three directions on day one and the final mark holds up at favicon size, which is exactly what we asked for.", "Thanks! The small-size test is the whole point of the brief, glad it landed."],
    [5, "Quick, clear, and the files were organised properly. Second logo I've ordered from her."],
    [4, "Good work. One round of changes took a day longer than listed, but the result was worth it."],
  ],
  1: [
    [5, "The guide covers colour, type, spacing and the do-not list. Our new hire used it on day one without asking a single question."],
    [5, "Clear rules, real examples. Exactly what a small team needs."],
  ],
  4: [
    [5, "Landing page was live in two days, scores 98 on Lighthouse, and Isha explained every decision in the handover notes.", "Appreciate that. The notes are there so you can change things without me."],
    [4, "Fast and tidy. I'd have liked one more layout option to pick from, but the one we got works."],
  ],
  5: [[5, "Pixel-matched the Figma file and the site loads instantly. Isha also fixed two spacing bugs that were in our design."]],
  8: [[4, "The app runs well on both platforms. Delivery was on the listed date and Tomas answered questions within the hour."]],
  9: [
    [5, "Three crashes gone and the list screen scrolls smoothly now. He sent a short video showing each fix."],
    [5, "Found the memory leak nobody else could. Worth every dollar."],
  ],
  10: [[5, "Clean Flutter code and a Firebase setup I can read. Delivered a day early."]],
  11: [[5, "Our site now installs on phones with our icon and works offline. Simple to brief, simple to approve."]],
  12: [[5, "The script sends our invoice reminders every Monday and logs what it did. Lena documented how to change the wording."]],
  13: [
    [5, "The chatbot only answers from our help pages and says so when it doesn't know. Customers trust it more than the old one.", "That's the design goal. Thanks for the clear FAQ to work from."],
    [5, "Set up in a week. The admin lets me add missing answers myself."],
  ],
  14: [[4, "Forms, sheet and email all connected. One Zap needed a tweak after delivery, which Lena did the same day."]],
  15: [[5, "Added summaries and a search feature to our app. Tomas kept the API costs low and showed me the usage dashboard."]],
  16: [
    [5, "Fixed broken links, duplicate titles and slow images. Our rankings moved within a month."],
    [4, "Thorough audit. The write-up was long, but every item had a fix next to it."],
  ],
  17: [[4, "First campaign set up properly, with conversion tracking that works. Sam checked in twice during the first week."]],
  18: [[5, "Thirty posts, scheduled, with a one-page plan explaining the mix. Saved me a month of evenings."]],
  20: [
    [5, "Priya rebuilt our messy spreadsheet into something that updates itself. The weekly report takes two minutes now."],
    [5, "Clear, patient, and fast. Second time hiring her."],
  ],
  21: [[5, "A hundred real leads with verified emails and a note on each. Our reply rate doubled."]],
  22: [
    [5, "Inbox at zero for a week and my calendar finally made sense. Priya flagged the two things that needed me."],
    [5, "Reliable and discreet. Booking her again next quarter."],
  ],
  23: [[5, "Transcripts were accurate and the summaries caught the decisions and the owners. Exactly what I wanted."]],
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

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
    await sb.from("users").upsert({ id: adminId, email: "admin@gigboard.test", full_name: "Demo Admin", username: "demo_admin", avatar_url: "/avatars/demo_admin.svg", is_admin: true, is_email_verified: true });
  }

  const buyerIds: string[] = [];
  for (const b of BUYERS) {
    const id = await createAuthUser(b.email, b.full_name, b.username);
    if (!id) continue;
    buyerIds.push(id);
    await sb.from("users").upsert({ id, email: b.email, full_name: b.full_name, username: b.username, avatar_url: b.username === "demo_buyer" ? "/avatars/demo_buyer.svg" : null, is_email_verified: true });
    console.log("  buyer", b.username);
  }

  const sellerIds: Record<string, string> = {};
  for (const s of SELLERS) {
    const id = await createAuthUser(s.email, s.full_name, s.username);
    if (!id) continue;
    sellerIds[s.username] = id;
    await sb.from("users").upsert({ id, email: s.email, full_name: s.full_name, username: s.username, avatar_url: `/avatars/${s.username}.svg`, is_seller: true, is_email_verified: true });
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
  let reviewCount = 0;
  for (const [seller, category, title, prices] of GIGS) {
    const gigIndex = n;
    const sellerId = sellerIds[seller];
    if (!sellerId) {
      console.warn("  skipping gig, no seller:", seller);
      continue;
    }
    const sellerInfo = SELLERS.find((x) => x.username === seller)!;
    // Unrated sellers get no review count, so a gig never shows "0.0 from 7 reviews".
    const reviews = sellerInfo.rating === 0 ? 0 : Math.max(1, Math.round(sellerInfo.orders / 4) + (n % 5) * 3);
    const { data: gig, error } = await sb
      .from("gigs")
      .insert({
        seller_id: sellerId,
        category_id: category,
        title,
        slug: slugify(title) + "-" + Math.random().toString(36).slice(2, 6),
        description: `<p>${title}. This is a sample gig for the Gigboard demo. What you get:</p><ul><li>A clear plan before work starts</li><li>Progress you can check at each step</li><li>Payment held until you approve the work</li></ul>`,
        short_description: title.slice(0, 150),
        tags: title
          .toLowerCase()
          .split(" ")
          .filter((w) => w.length > 3 && !["will", "that", "your", "with", "from", "into"].includes(w))
          .slice(0, 5),
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
    const packageIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const { data: pkg } = await sb
        .from("gig_packages")
        .insert({
          gig_id: gig.id,
          package_type: tiers[i],
          name: ["Starter", "Standard", "Premium"][i],
          description: ["One deliverable for a simple need", "The full job with more rounds of changes", "Everything, with priority handling"][i],
          price: prices[i],
          delivery_days: [1 + (n % 5), 3 + (n % 5), 6 + (n % 5)][i],
          revisions: [1, 3, 5][i],
          features: [
            { name: "Source files", included: i >= 1 },
            { name: "Commercial use rights", included: i >= 2 },
            { name: "Priority support", included: i === 2 },
            { name: "Revisions included", included: true },
          ] as never,
        })
        .select("id")
        .single();
      if (pkg) packageIds.push(pkg.id as string);
    }

    // Written reviews, each on its own completed order so the review's order_id is real.
    const texts = REVIEW_TEXT[gigIndex] ?? [];
    for (let r = 0; r < texts.length && buyerIds.length > 0; r++) {
      const [stars, text, reply] = texts[r];
      const buyerId = buyerIds[(gigIndex + r) % buyerIds.length];
      const price = prices[0];
      const fee = Math.round(price * 0.055 * 100) / 100;
      const commission = Math.round(price * 0.2 * 100) / 100;
      const completedAt = daysAgo(6 + gigIndex * 2 + r * 9);
      const { data: order } = await sb
        .from("orders")
        .insert({
          order_number: `GB-${String(1000 + reviewCount).padStart(5, "0")}`,
          buyer_id: buyerId,
          seller_id: sellerId,
          gig_id: gig.id,
          package_id: packageIds[0],
          package_snapshot: { name: "Starter", price, delivery_days: 1 + (n % 5) },
          gig_base_price: price,
          extras_price: 0,
          order_subtotal: price,
          buyer_service_fee: fee,
          buyer_total_paid: price + fee,
          platform_commission: commission,
          seller_earnings: price - commission,
          status: "completed",
          requirements_submitted: true,
          delivery_days: 1 + (n % 5),
          delivered_at: completedAt,
          completed_at: completedAt,
          funds_cleared: true,
          funds_cleared_at: completedAt,
          funds_transferred: true,
          funds_transferred_at: completedAt,
          created_at: daysAgo(6 + gigIndex * 2 + r * 9 + 3),
        })
        .select("id")
        .single();
      if (!order) continue;
      const { error: rErr } = await sb.from("reviews").insert({
        order_id: order.id,
        gig_id: gig.id,
        buyer_id: buyerId,
        seller_id: sellerId,
        overall_rating: stars,
        communication_rating: Math.min(5, stars + (r % 2)),
        service_as_described_rating: stars,
        would_recommend: stars >= 4,
        review_text: text,
        seller_response: reply ?? null,
        seller_responded_at: reply ? completedAt : null,
        created_at: completedAt,
      });
      if (rErr) console.warn("  review error:", rErr.message);
      else reviewCount++;
    }
    n++;
  }

  console.log(`Seed complete: ${n} gigs, ${reviewCount} written reviews. Sample accounts: admin@gigboard.test, buyer@gigboard.test, mara@gigboard.test (seller).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

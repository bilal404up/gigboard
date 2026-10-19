import SiteFooter from "@/components/site/SiteFooter";

/** variant "app" is the slim line used on dashboards, orders, messages, settings and admin. */
export function Footer({ variant = "site" }: { variant?: "site" | "app" }) {
  return <SiteFooter variant={variant} />;
}

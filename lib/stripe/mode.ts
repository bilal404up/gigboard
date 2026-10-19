/**
 * Which checkout a visitor gets. Safe to call on the server and in the browser.
 * - "demo": no Stripe key is set. Checkout places the order without charging anything.
 * - "stripe-test": a Stripe test key is set. Test cards such as 4242 4242 4242 4242 work.
 * - "stripe-live": a live key is set.
 * Copy that a visitor reads must follow this, so the site never claims Stripe when it runs without it.
 */
export type PaymentMode = "demo" | "stripe-test" | "stripe-live";

export function paymentMode(): PaymentMode {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key || !/^pk_(test|live)_[A-Za-z0-9]{20,}$/.test(key)) return "demo";
  return key.startsWith("pk_test_") ? "stripe-test" : "stripe-live";
}

export const isStripeConfigured = () => paymentMode() !== "demo";

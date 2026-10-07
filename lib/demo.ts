export const DEMO_ROLES = ["buyer", "seller", "admin"] as const;
export type DemoRole = (typeof DEMO_ROLES)[number];

/**
 * Demo mode lets a visitor switch between sample accounts in one click.
 * It is off unless DEMO_MODE is exactly "true", and it must only ever be turned on
 * for a deployment that holds sample data. The switch signs in to a real sample
 * account with a server-side password; nothing bypasses authentication.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export function isDemoRole(value: unknown): value is DemoRole {
  return typeof value === "string" && (DEMO_ROLES as readonly string[]).includes(value);
}

export const DEMO_ACCOUNTS: Record<DemoRole, { email: string; home: string }> = {
  buyer: { email: "buyer@gigboard.test", home: "/orders" },
  seller: { email: "mara@gigboard.test", home: "/seller/dashboard" },
  admin: { email: "admin@gigboard.test", home: "/admin" },
};

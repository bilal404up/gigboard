import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/lib/contexts/user-context";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database.types";

const sans = Archivo({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Gigboard: hire one freelancer for one job",
  description: "Fixed prices, clear delivery dates, and payment held until you approve the work. Sample data, Stripe test mode.",
};

async function getCurrentUser(): Promise<User | null> {
  try {
    const sb = createClient();
    const { data: { user: authUser } } = await sb.auth.getUser();
    if (!authUser) return null;
    const { data } = await sb.from("users").select("*").eq("id", authUser.id).maybeSingle();
    return (data as User) ?? null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-white text-neutral-900">
        <UserProvider initialUser={user}>
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}

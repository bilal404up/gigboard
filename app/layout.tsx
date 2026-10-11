import type { Metadata } from "next"
import type { CSSProperties, ReactNode } from "react"
import "./globals.css"
import { display, body, mono } from "./fonts"
import { Toaster } from "@/components/ui/toaster"
import { DemoStrip } from "@/components/layout/demo-strip"
import { UserProvider } from "@/lib/contexts/user-context"
import { createClient } from "@/lib/supabase/server" // keep your existing path
import type { User } from "@/types/database.types" // keep your existing path and type name

export const metadata: Metadata = {
  title: "Gigboard: hire one freelancer for one job",
  description:
    "Fixed prices, clear delivery dates, and payment held until you approve the work. Sample data, Stripe test mode.",
}

// keep your existing body for this function if it differs; only the layout markup below changed
async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
    return (data as User | null) ?? null
  } catch {
    return null
  }
}

// old CSS and components read --font-sans; the alias is also set in globals.css
const fontAlias = { "--font-sans": "var(--font-body)" } as CSSProperties

export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialUser = await getCurrentUser()
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} style={fontAlias}>
      {/* body carries no transform or filter, so sticky and fixed children stay reliable.
          Bottom padding for the demo bar comes from body[data-demo] in globals.css. */}
      <body className="flex min-h-screen flex-col" data-demo={demo ? "true" : undefined}>
        <UserProvider initialUser={initialUser}>
          {children}
          <Toaster />
          {demo && <DemoStrip />}
        </UserProvider>
      </body>
    </html>
  )
}

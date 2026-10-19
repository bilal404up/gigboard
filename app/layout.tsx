import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { display, body, mono } from "./fonts"
import { Toaster } from "@/components/ui/toaster"
import { DemoStrip } from "@/components/layout/demo-strip"
import { UserProvider } from "@/lib/contexts/user-context"
import { createClient } from "@/lib/supabase/server"
import type { User } from "@/types/database.types"

export const metadata: Metadata = {
  title: "Gigboard: hire one freelancer for one job",
  description: "Fixed prices, clear delivery dates, and payment held until you approve the work. A demo marketplace with sample data.",
}

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

export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialUser = await getCurrentUser()
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__kit)document.documentElement.classList.remove('js')},4000)",
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col" data-demo={demo ? "true" : undefined}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <UserProvider initialUser={initialUser}>
          {demo && <DemoStrip />}
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  )
}

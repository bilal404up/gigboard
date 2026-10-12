"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Menu, Search, Heart, User as UserIcon, LayoutDashboard, MessageCircle, Settings, ShieldCheck, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";
import { WordMark } from "@/components/layout/wordmark";
import { SellerMark } from "@/components/seller/SellerMark";
import { DemoSwitch } from "@/components/layout/demo-strip";
import { useUser } from "@/lib/contexts/user-context";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/search", label: "Browse" },
  { href: "/how-it-works", label: "How it works" },
];

const ICON_BTN = "inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-laminate-sunk hover:text-ink md:h-10 md:w-10";
const NAV_LINK = "inline-flex h-10 items-center rounded-md px-3 text-[14px] font-semibold transition-colors";
const SECONDARY = "inline-flex h-11 items-center justify-center rounded-md border border-line text-sm font-semibold text-ink transition-colors hover:bg-laminate-sunk";
const PRIMARY = "nav-join inline-flex items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2A2D32]";

export function Navbar() {
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    const sb = createClient();
    let convChannel: ReturnType<typeof sb.channel> | null = null;

    async function refreshUnread() {
      const { data: convs } = await sb
        .from("conversations")
        .select("buyer_id, seller_id, buyer_unread_count, seller_unread_count")
        .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`);
      const total = (convs ?? []).reduce((sum, c) => {
        const isBuyer = c.buyer_id === user!.id;
        return sum + (isBuyer ? c.buyer_unread_count : c.seller_unread_count);
      }, 0);
      setUnread(total);
    }

    let cancelled = false;
    (async () => {
      await refreshUnread();
      // The effect can be cleaned up while the first fetch is still running (React runs effects twice in
      // development), so check before subscribing, and use a unique channel name per run.
      if (cancelled) return;
      convChannel = sb
        .channel(`nav-conv-unread-${user.id}-${Math.random().toString(36).slice(2, 8)}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => {
          refreshUnread();
        })
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (convChannel) sb.removeChannel(convChannel);
    };
  }, [user]);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <header className="site-nav">
      <div className="wrap nav-inner flex items-center gap-4">
        <Link href="/" className="shrink-0 whitespace-nowrap rounded-md text-ink" aria-label="Gigboard home">
          <WordMark />
        </Link>

        <div className="site-nav-search hidden min-w-0 max-w-xl flex-1 md:block">
          <SearchAutocomplete placeholder="What do you need done?" />
        </div>

        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(NAV_LINK, isActive(l.href) ? "bg-laminate-sunk text-ink" : "text-ink-muted hover:bg-laminate-sunk hover:text-ink")}
            >
              {l.label}
            </Link>
          ))}
          {!user?.is_seller && (
            <Link href="/become-seller" className={cn(NAV_LINK, "text-ink-muted hover:bg-laminate-sunk hover:text-ink")}>
              Become a seller
            </Link>
          )}
        {demo && <DemoSwitch className="ml-2" />}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {user ? (
            <>
              <Link href="/favorites" aria-label="Favorites" className={cn(ICON_BTN, "hidden sm:inline-flex")}>
                <Heart className="h-[18px] w-[18px]" />
              </Link>
              <Link href="/messages" aria-label={unread > 0 ? `Messages (${unread} unread)` : "Messages"} className={cn(ICON_BTN, "relative")}>
                <Bell className="h-[18px] w-[18px]" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-pill bg-alarm px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-md md:h-10 md:w-10" aria-label="Account menu">
                    <Avatar className="h-8 w-8 ring-1 ring-line">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                      <AvatarFallback className="bg-transparent p-0">
                        <SellerMark username={user.username} label={user.full_name} size={32} />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <div className="truncate font-semibold text-ink">{user.full_name}</div>
                    <div className="truncate text-xs font-normal text-ink-muted">@{user.username}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
                  {user.is_seller && <DropdownMenuItem onSelect={() => router.push("/seller/dashboard")}>Seller dashboard</DropdownMenuItem>}
                  <DropdownMenuItem onSelect={() => router.push("/messages")}>Messages</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/settings")}>Settings</DropdownMenuItem>
                  {user.is_admin && <DropdownMenuItem onSelect={() => router.push("/admin")}>Admin</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(NAV_LINK, "hidden text-ink-muted hover:bg-laminate-sunk hover:text-ink sm:inline-flex")}>
                Log in
              </Link>
              <Link href="/signup" className={cn(PRIMARY, "h-10")}>
                Join
              </Link>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <button className={cn(ICON_BTN, "lg:hidden")} aria-label="Open menu">
                <Menu className="h-[18px] w-[18px]" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col bg-white p-0">
              <div className="flex h-16 items-center border-b border-line px-5 text-ink">
                <WordMark />
              </div>

              <div className="border-b border-line p-5">
                <SearchAutocomplete placeholder="What do you need done?" />
              </div>
              {demo && (
                <div className="border-b border-line p-5">
                  <p className="mb-2 text-xs font-semibold text-ink-muted">View the demo as</p>
                  <DemoSwitch className="flex w-full" />
                </div>
              )}

              <nav className="flex-1 py-2">
                <MobileNavLink href="/search" label="Browse" icon={<Search className="h-4 w-4" />} />
                <MobileNavLink href="/how-it-works" label="How it works" icon={<UserIcon className="h-4 w-4" />} />
                {!user?.is_seller && <MobileNavLink href="/become-seller" label="Become a seller" icon={<ShieldCheck className="h-4 w-4" />} />}

                {user && (
                  <>
                    <div className="my-2 border-t border-line" />
                    <MobileNavLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
                    {user.is_seller && <MobileNavLink href="/seller/dashboard" label="Seller dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />}
                    <MobileNavLink href="/messages" label="Messages" icon={<MessageCircle className="h-4 w-4" />} />
                    <MobileNavLink href="/favorites" label="Favorites" icon={<Heart className="h-4 w-4" />} />
                    <MobileNavLink href="/settings" label="Settings" icon={<Settings className="h-4 w-4" />} />
                    {user.is_admin && <MobileNavLink href="/admin" label="Admin" icon={<ShieldCheck className="h-4 w-4" />} />}
                  </>
                )}
              </nav>

              <div className="border-t border-line p-5">
                {user ? (
                  <>
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0 ring-1 ring-line">
                        {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                        <AvatarFallback className="bg-transparent p-0">
                          <SellerMark username={user.username} label={user.full_name} size={40} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{user.full_name}</p>
                        <p className="truncate text-xs text-ink-muted">@{user.username}</p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <button onClick={signOut} className={cn(SECONDARY, "w-full gap-2")}>
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </SheetClose>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <SheetClose asChild>
                      <Link href="/login" className={cn(SECONDARY, "flex-1")}>
                        Log in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/signup" className={cn(PRIMARY, "h-11 flex-1")}>
                        Join
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileNavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <SheetClose asChild>
      <Link href={href} className="flex h-11 items-center gap-3 px-5 text-sm font-semibold text-ink transition-colors hover:bg-laminate-sunk">
        <span className="text-ink-muted">{icon}</span>
        {label}
      </Link>
    </SheetClose>
  );
}

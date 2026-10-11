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
import { useUser } from "@/lib/contexts/user-context";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/search", label: "Browse" },
  { href: "/how-it-works", label: "How it works" },
];

const ICON_BTN =
  "inline-flex h-11 w-11 items-center justify-center rounded-[4px] text-sand transition-colors hover:bg-mahogany-raised hover:text-laminate focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release md:h-10 md:w-10";

export function Navbar() {
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
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "conversations" },
          () => { refreshUnread(); }
        )
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
    <header className="header">
      <div className="wrap flex min-h-[var(--header-h)] items-center gap-4">
        <Link href="/" className="shrink-0 whitespace-nowrap rounded-[4px] text-laminate focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-4 focus-visible:outline-release" aria-label="Gigboard home">
          <WordMark />
        </Link>

        <div className="site-nav-search hidden min-w-0 max-w-xl flex-1 md:block">
          <SearchAutocomplete placeholder="What service are you looking for?" />
        </div>

        <nav className="hidden shrink-0 items-center gap-1 text-sm lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-[4px] px-3 font-semibold transition-colors focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release",
                isActive(l.href) ? "bg-mahogany-raised text-laminate" : "text-sand hover:bg-mahogany-raised hover:text-laminate"
              )}
            >
              {isActive(l.href) ? <span className="lamp lamp--on h-2 w-2" aria-hidden="true" /> : null}
              {l.label}
            </Link>
          ))}
          {!user?.is_seller && (
            <Link
              href="/become-seller"
              className="inline-flex h-10 items-center rounded-[4px] px-3 font-semibold text-sand transition-colors hover:bg-mahogany-raised hover:text-laminate focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release"
            >
              Become a seller
            </Link>
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {user ? (
            <>
              <Link href="/favorites" aria-label="Favorites" className={cn(ICON_BTN, "hidden sm:inline-flex")}>
                <Heart className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/messages"
                aria-label={unread > 0 ? `Messages (${unread} unread)` : "Messages"}
                className={cn(ICON_BTN, "relative")}
              >
                <Bell className="h-[18px] w-[18px]" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-pill bg-alarm px-1 text-[10px] font-semibold leading-none text-laminate ring-2 ring-mahogany-deep">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-[4px] focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release md:h-10 md:w-10"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-8 w-8 shadow-[0_0_0_1.5px_#C9A24A]">
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
                    <div className="num truncate text-xs font-normal text-ink-muted">@{user.username}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
                  {user.is_seller && (
                    <DropdownMenuItem onSelect={() => router.push("/seller/dashboard")}>
                      Seller Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => router.push("/messages")}>Messages</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/settings")}>Settings</DropdownMenuItem>
                  {user.is_admin && (
                    <DropdownMenuItem onSelect={() => router.push("/admin")}>Admin</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-10 items-center rounded-[4px] px-3 text-sm font-semibold text-sand transition-colors hover:bg-mahogany-raised hover:text-laminate focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-[4px] bg-[linear-gradient(180deg,#E7C978_0%,#C9A24A_55%,#B08A2C_100%)] px-4 text-sm font-semibold text-ink shadow-[0_2px_0_#7A5A14,inset_0_1px_0_#E7C978] transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release active:translate-y-px"
              >
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
            <SheetContent side="right" className="flex flex-col p-0">
              <div className="booth booth--plain flex h-16 items-center px-5">
                <WordMark />
              </div>

              <div className="border-b-2 border-dotted border-sand p-5">
                <SearchAutocomplete placeholder="Search services…" />
              </div>

              <nav className="flex-1 py-2">
                <MobileNavLink href="/search" label="Browse" icon={<Search className="h-4 w-4" />} />
                <MobileNavLink href="/how-it-works" label="How it works" icon={<UserIcon className="h-4 w-4" />} />
                {!user?.is_seller && (
                  <MobileNavLink href="/become-seller" label="Become a seller" icon={<ShieldCheck className="h-4 w-4" />} />
                )}

                {user && (
                  <>
                    <div className="my-2 border-t-2 border-dotted border-sand" />
                    <MobileNavLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
                    {user.is_seller && (
                      <MobileNavLink href="/seller/dashboard" label="Seller dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
                    )}
                    <MobileNavLink href="/messages" label="Messages" icon={<MessageCircle className="h-4 w-4" />} />
                    <MobileNavLink href="/favorites" label="Favorites" icon={<Heart className="h-4 w-4" />} />
                    <MobileNavLink href="/settings" label="Settings" icon={<Settings className="h-4 w-4" />} />
                    {user.is_admin && (
                      <MobileNavLink href="/admin" label="Admin" icon={<ShieldCheck className="h-4 w-4" />} />
                    )}
                  </>
                )}
              </nav>

              <div className="border-t-2 border-dotted border-sand p-5">
                {user ? (
                  <>
                    <div className="mb-3 flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0 shadow-[0_0_0_1.5px_#C9A24A]">
                        {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                        <AvatarFallback className="bg-transparent p-0">
                          <SellerMark username={user.username} label={user.full_name} size={40} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{user.full_name}</p>
                        <p className="num truncate text-xs text-ink-muted">@{user.username}</p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <button
                        onClick={signOut}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[4px] text-sm font-semibold text-ink shadow-[inset_0_0_0_1.5px_#4B2320] hover:bg-laminate-sunk focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </SheetClose>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-[4px] text-sm font-semibold text-ink shadow-[inset_0_0_0_1.5px_#4B2320] hover:bg-laminate-sunk focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany"
                      >
                        Log in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/signup"
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-[4px] bg-[linear-gradient(180deg,#E7C978_0%,#C9A24A_55%,#B08A2C_100%)] text-sm font-semibold text-ink shadow-[0_2px_0_#7A5A14,inset_0_1px_0_#E7C978] focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany"
                      >
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
      <Link
        href={href}
        className="flex h-11 items-center gap-3 px-5 text-sm font-semibold text-ink transition-colors hover:bg-laminate-sunk focus-visible:outline focus-visible:outline-[2.5px] focus-visible:-outline-offset-[3px] focus-visible:outline-mahogany"
      >
        <span className="text-brass-deep">{icon}</span>
        {label}
      </Link>
    </SheetClose>
  );
}

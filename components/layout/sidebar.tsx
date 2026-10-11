"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

/* A rail of window labels. The open one is lit. */
export function Sidebar({ items, title }: { items: SidebarItem[]; title?: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <nav className="sticky top-[calc(var(--header-h)+1rem)] space-y-1 pr-4">
        {title && <h3 className="t-plate mb-3 px-3 text-ink-muted">{title}</h3>}
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-semibold transition-colors duration-120 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany",
                active ? "bg-mahogany text-laminate" : "text-ink hover:bg-laminate-sunk"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-brass-light" : "text-brass-deep")} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className={cn("plate t-plate min-h-6 px-2", active && "shadow-none")}>{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

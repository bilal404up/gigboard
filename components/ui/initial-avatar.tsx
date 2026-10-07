import { initials } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/** Square initials avatar. One color for everyone, so color stays reserved for level and status. */
export function InitialAvatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-xs bg-brand-primary-100 font-semibold text-brand-primary-dark", className)}
      style={{ width: size, height: size, fontSize: size <= 24 ? 10 : size >= 56 ? 18 : 13 }}
    >
      {initials(name)}
    </span>
  );
}

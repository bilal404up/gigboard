"use client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingStarsProps {
  value: number;
  max?: number;
  size?: number;
  className?: string;
  onChange?: (v: number) => void;
  interactive?: boolean;
}

export function RatingStars({ value, max = 5, size = 16, className, onChange, interactive }: RatingStarsProps) {
  const isInteractive = !!interactive || !!onChange;
  if (!isInteractive) {
    return (
      <div role="img" aria-label={`${value.toFixed(1)} out of ${max} stars`} className={cn("inline-flex items-center gap-0.5", className)}>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(value);
          const half = !filled && i < value;
          return (
            <Star
              key={i}
              aria-hidden
              width={size}
              height={size}
              className={cn(filled ? "fill-ink text-ink" : half ? "fill-ink/50 text-ink" : "fill-neutral-200 text-neutral-300")}
            />
          );
        })}
      </div>
    );
  }
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(value);
        const half = !filled && i < value;
        return (
          <button
            type="button"
            key={i}
            onClick={() => onChange?.(i + 1)}
            disabled={!isInteractive}
            className={isInteractive ? "cursor-pointer hover:scale-110 transition" : "cursor-default"}
            aria-label={`${i + 1} stars`}
          >
            <Star
              width={size}
              height={size}
              className={cn(
                filled ? "fill-ink text-ink" : half ? "fill-ink/50 text-ink" : "fill-neutral-200 text-neutral-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

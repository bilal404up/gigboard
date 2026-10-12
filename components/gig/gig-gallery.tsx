"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { GigCover } from "@/components/gig/gig-cover";

const CTRL =
  "inline-flex h-11 w-11 items-center justify-center rounded-pill bg-white text-ink shadow-[0_0_0_1px_#E3E4E6,0_6px_16px_-8px_rgba(18,20,23,0.35)] transition-opacity hover:bg-laminate focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

const LIGHTBOX_BTN =
  "inline-flex h-11 w-11 items-center justify-center rounded-pill bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function coverWords(title: string) {
  const s = title.replace(/^\s*i\s+will\s+/i, "").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : title;
}

export function GigGallery({
  thumbnail,
  images,
  title,
  seed,
  category,
}: {
  thumbnail: string | null;
  images: string[] | null | undefined;
  title: string;
  seed?: string;
  category?: string | null;
}) {
  const all = [thumbnail, ...(images ?? [])].filter((u): u is string => Boolean(u));
  const total = all.length;
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, next, prev]);

  if (total === 0) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-tray">
        <GigCover seed={seed ?? title} category={category} text={coverWords(title)} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/9] overflow-hidden rounded-tray bg-laminate-sunk">
        <Image src={all[index]} alt={`${title}, image ${index + 1} of ${total}`} fill className="object-cover" priority={index === 0} sizes="(min-width: 1024px) 720px, 100vw" />

        {total > 1 && (
          <>
            <button onClick={prev} aria-label="Previous image" className={cn(CTRL, "absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100")}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} aria-label="Next image" className={cn(CTRL, "absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100")}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-pill bg-ink/80 px-2.5 py-1.5">
              {all.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={cn("h-2 rounded-pill transition-all", i === index ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/80")}
                />
              ))}
            </div>
          </>
        )}

        <button onClick={() => setLightbox(true)} aria-label="Expand image" className={cn(CTRL, "absolute right-3 top-3 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100")}>
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {total > 1 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
          {all.map((src, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-[8px] bg-laminate-sunk transition-all sm:h-16 sm:w-24",
                i === index ? "opacity-100 shadow-[0_0_0_2px_#121417]" : "opacity-60 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="100px" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 sm:p-8" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} aria-label="Close" className={cn(LIGHTBOX_BTN, "absolute right-4 top-4")}>
            <X className="h-5 w-5" />
          </button>
          <div className="relative aspect-[16/10] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={all[index]} alt={`${title}, image ${index + 1} of ${total}`} fill className="object-contain" sizes="100vw" />
            {total > 1 && (
              <>
                <button onClick={prev} aria-label="Previous image" className={cn(LIGHTBOX_BTN, "absolute left-2 top-1/2 -translate-y-1/2")}>
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={next} aria-label="Next image" className={cn(LIGHTBOX_BTN, "absolute right-2 top-1/2 -translate-y-1/2")}>
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-pill bg-white/10 px-3 py-1 text-xs font-medium tabular-nums text-white">
                  {index + 1} / {total}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

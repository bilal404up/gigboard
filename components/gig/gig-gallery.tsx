"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { GigCover } from "@/components/gig/gig-cover";

const CTRL =
  "inline-flex h-11 w-11 items-center justify-center rounded-pill bg-laminate-raised text-ink shadow-[0_1px_0_#D5CBBD,0_4px_0_-2px_#E4DCCF] transition-opacity hover:bg-laminate focus-visible:opacity-100 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany";

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
        <GigCover seed={seed ?? title} category={category} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/9] overflow-hidden rounded-tray bg-laminate-sunk">
        <Image
          src={all[index]}
          alt={`${title}, image ${index + 1} of ${total}`}
          fill
          className="object-cover"
          priority={index === 0}
          sizes="(min-width: 1024px) 720px, 100vw"
        />

        {total > 1 && (
          <>
            <button onClick={prev} aria-label="Previous image" className={cn(CTRL, "absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100")}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} aria-label="Next image" className={cn(CTRL, "absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100")}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-pill bg-mahogany-deep/80 px-2.5 py-1.5">
              {all.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={cn("h-2 rounded-pill transition-all", i === index ? "w-5 bg-brass-light" : "w-2 bg-laminate/50 hover:bg-laminate/80")}
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
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-[6px] bg-laminate-sunk transition-all sm:h-16 sm:w-24",
                i === index ? "opacity-100 shadow-[0_0_0_2.5px_#C9A24A]" : "opacity-60 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="100px" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mahogany-deep/95 p-4 sm:p-8" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} aria-label="Close" className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-pill bg-laminate/10 text-laminate transition-colors hover:bg-laminate/20 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release">
            <X className="h-5 w-5" />
          </button>
          <div className="relative aspect-[16/10] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={all[index]} alt={`${title}, image ${index + 1} of ${total}`} fill className="object-contain" sizes="100vw" />
            {total > 1 && (
              <>
                <button onClick={prev} aria-label="Previous image" className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-laminate/10 text-laminate hover:bg-laminate/20 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={next} aria-label="Next image" className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-laminate/10 text-laminate hover:bg-laminate/20 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release">
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="num absolute bottom-4 left-1/2 -translate-x-1/2 rounded-pill bg-laminate/10 px-3 py-1 text-xs font-medium text-laminate">
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

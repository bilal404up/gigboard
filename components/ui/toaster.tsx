"use client";
import { Toaster as Sonner } from "sonner";

/* laminate slip with a coloured left edge: brass for default and info, release for success, alarm for error, brass-deep for warning */
const tray = "0_2px_0_#D5CBBD,0_10px_0_-4px_#E4DCCF";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      offset={16}
      gap={8}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: `group !flex !gap-3 !items-start !w-full !px-4 !py-3 !pl-5 !rounded-[6px] !border-0 !bg-laminate-raised !text-ink !font-sans !text-sm !shadow-[inset_4px_0_0_#C9A24A,${tray}]`,
          title: "!text-sm !font-semibold !text-ink",
          description: "!text-xs !text-ink-muted !leading-relaxed !mt-0.5",
          actionButton: "!bg-mahogany !text-laminate !text-xs !font-semibold !rounded-[4px] !h-8 !px-3 hover:!bg-mahogany-raised",
          cancelButton: "!bg-laminate-sunk !text-ink !text-xs !rounded-[4px] !h-8 !px-3",
          success: `!shadow-[inset_4px_0_0_#1FC77A,${tray}]`,
          error: `!shadow-[inset_4px_0_0_#B8281C,${tray}]`,
          info: `!shadow-[inset_4px_0_0_#C9A24A,${tray}]`,
          warning: `!shadow-[inset_4px_0_0_#7A5A14,${tray}]`,
          icon: "!mt-0.5",
        },
      }}
      icons={{
        success: (
          <svg className="h-4 w-4 text-release-deep" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        error: (
          <svg className="h-4 w-4 text-alarm" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        ),
        info: (
          <svg className="h-4 w-4 text-brass-deep" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="7" fillOpacity="0.15" />
            <circle cx="8" cy="8" r="3" />
          </svg>
        ),
        warning: (
          <svg className="h-4 w-4 text-brass-deep" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2.5L1.5 13.5h13L8 2.5z" strokeLinejoin="round" />
            <path d="M8 7v3M8 12v.01" strokeLinecap="round" />
          </svg>
        ),
      }}
    />
  );
}

"use client";
import { Toaster as Sonner } from "sonner";

/* white toast with a coloured left edge: ink for default, green for success, red for error, blue for info, amber for warning */
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      offset={16}
      gap={8}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group !flex !gap-3 !items-start !w-full !px-4 !py-3 !pl-5 !rounded-[12px] !border-0 !bg-white !text-ink !font-sans !text-sm !shadow-[inset_3px_0_0_#111113,0_0_0_1px_#E2E0DA,0_12px_28px_-14px_rgba(18,20,23,0.35)]",
          title: "!text-sm !font-semibold !text-ink",
          description: "!text-xs !text-ink-muted !leading-relaxed !mt-0.5",
          actionButton: "!bg-ink !text-white !text-xs !font-semibold !rounded-[8px] !h-8 !px-3 hover:!bg-[#2A2A2E]",
          cancelButton: "!bg-laminate-sunk !text-ink !text-xs !rounded-[8px] !h-8 !px-3",
          success: "!shadow-[inset_3px_0_0_#1E9E5A,0_0_0_1px_#E2E0DA,0_12px_28px_-14px_rgba(18,20,23,0.35)]",
          error: "!shadow-[inset_3px_0_0_#B42318,0_0_0_1px_#E2E0DA,0_12px_28px_-14px_rgba(18,20,23,0.35)]",
          info: "!shadow-[inset_3px_0_0_#5A5A60,0_0_0_1px_#E2E0DA,0_12px_28px_-14px_rgba(18,20,23,0.35)]",
          warning: "!shadow-[inset_3px_0_0_#B45309,0_0_0_1px_#E2E0DA,0_12px_28px_-14px_rgba(18,20,23,0.35)]",
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
          <svg className="h-4 w-4 text-info" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="7" fillOpacity="0.15" />
            <circle cx="8" cy="8" r="3" />
          </svg>
        ),
        warning: (
          <svg className="h-4 w-4 text-[#8A4B00]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2.5L1.5 13.5h13L8 2.5z" strokeLinejoin="round" />
            <path d="M8 7v3M8 12v.01" strokeLinecap="round" />
          </svg>
        ),
      }}
    />
  );
}

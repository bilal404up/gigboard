"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "@/lib/utils/cn"

/* white box with a 3:1 border; the hit area is padded out to 44px */
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer relative h-5 w-5 shrink-0 rounded-[5px] bg-white shadow-[inset_0_0_0_1.5px_#8A9096] transition-colors duration-120",
        "before:absolute before:-inset-3 before:content-['']",
        "data-[state=checked]:bg-ink data-[state=checked]:text-white data-[state=checked]:shadow-none data-[state=indeterminate]:bg-ink data-[state=indeterminate]:text-white",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
          <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

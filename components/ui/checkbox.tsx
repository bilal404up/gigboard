"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "@/lib/utils/cn"

/* a sunk well with a mahogany rim; the hit area is padded out to 44px */
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer relative h-5 w-5 shrink-0 rounded-[4px] bg-laminate-sunk shadow-[inset_0_0_0_1.5px_#4B2320] transition-colors duration-120",
        "before:absolute before:-inset-3 before:content-['']",
        "data-[state=checked]:bg-mahogany data-[state=checked]:text-laminate data-[state=indeterminate]:bg-mahogany data-[state=indeterminate]:text-laminate",
        "focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany disabled:cursor-not-allowed disabled:opacity-50",
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

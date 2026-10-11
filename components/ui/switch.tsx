"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils/cn"

/* a brass knob on a sand track; the track turns release when on */
const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-pill bg-sand shadow-[inset_0_1px_0_rgba(0,0,0,0.12)] transition-colors duration-200",
        "before:absolute before:-inset-2 before:content-['']",
        "data-[state=checked]:bg-release-deep focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 translate-x-1 rounded-pill bg-[linear-gradient(180deg,#E7C978_0%,#C9A24A_55%,#B08A2C_100%)] shadow-[0_1px_0_#7A5A14] transition-transform duration-200 data-[state=checked]:translate-x-6" />
    </SwitchPrimitive.Root>
  )
)
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }

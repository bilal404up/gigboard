import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const badgeVariants = cva("inline-flex min-h-7 items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 font-sans text-[0.8125rem] font-medium leading-none", {
  variants: {
    variant: {
      default: "bg-laminate-sunk text-ink",
      solid: "bg-ink text-white",
      secondary: "bg-sand text-ink",
      outline: "bg-transparent text-ink shadow-[inset_0_0_0_1px_#8A9096]",
      success: "bg-release-tint text-release-deep",
      warning: "bg-[#FFF4E5] text-[#8A4B00]",
      error: "bg-alarm-tint text-alarm",
      info: "bg-[#E9EEF5] text-info",
    },
  },
  defaultVariants: { variant: "default" },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

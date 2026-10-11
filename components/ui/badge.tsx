import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex min-h-7 items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 font-sans text-[0.8125rem] font-medium leading-none",
  {
    variants: {
      variant: {
        default: "bg-laminate-sunk text-ink",
        solid: "bg-mahogany text-laminate",
        secondary: "bg-sand text-ink",
        outline: "bg-transparent text-ink shadow-[inset_0_0_0_1.5px_#4B2320]",
        success: "bg-release-tint text-release-deep",
        warning: "bg-brass-tint text-brass-deep",
        error: "bg-alarm-tint text-alarm",
        info: "bg-[#DEE6F7] text-enamel-cobalt",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

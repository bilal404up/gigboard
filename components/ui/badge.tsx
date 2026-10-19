import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

/* Status pills share the .tag look. warning is amber (held), success is green (released), error is red. */
const badgeVariants = cva("tag tag--plain", {
  variants: {
    variant: {
      default: "",
      solid: "!bg-ink !text-white",
      secondary: "",
      outline: "!bg-transparent shadow-[inset_0_0_0_1px_#C9C6BE]",
      success: "!bg-go-bg !text-go-ink",
      warning: "!bg-held-bg !text-held-ink",
      error: "!bg-stop-bg !text-stop",
      info: "",
    },
  },
  defaultVariants: { variant: "default" },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

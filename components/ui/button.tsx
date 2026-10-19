import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

/*
 * Three variants in practice: primary (ink), secondary (surface with a hairline), quiet (text).
 * "release" is reserved for the buyer's "Approve and release payment".
 * cta, outline, ghost are older names kept as aliases.
 */
const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[8px] font-sans text-[0.9375rem] font-semibold leading-none",
    "transition-[background-color,box-shadow,color] duration-150 ease-out",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-ink text-white hover:bg-[#2A2A2E]",
        cta: "bg-ink text-white hover:bg-[#2A2A2E]",
        release: "bg-go-ink text-white hover:bg-[#0B4A29]",
        secondary: "bg-surface text-ink shadow-[inset_0_0_0_1px_#C9C6BE] hover:shadow-[inset_0_0_0_1px_#111113]",
        outline: "bg-surface text-ink shadow-[inset_0_0_0_1px_#C9C6BE] hover:shadow-[inset_0_0_0_1px_#111113]",
        quiet: "bg-transparent text-ink hover:bg-surface-sunk",
        ghost: "bg-transparent text-ink hover:bg-surface-sunk",
        link: "h-auto min-h-0 rounded-none p-0 text-ink underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-ink",
        danger: "bg-transparent text-stop shadow-[inset_0_0_0_1px_#B42318] hover:bg-stop-bg",
      },
      size: {
        default: "h-11 px-[18px]",
        sm: "h-11 px-3 text-sm md:h-9",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-7 text-base",
        icon: "h-11 w-11 md:h-10 md:w-10",
        "icon-sm": "h-11 w-11 md:h-8 md:w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"

export { Button, buttonVariants }

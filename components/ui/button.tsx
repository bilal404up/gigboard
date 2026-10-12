import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-sans text-[0.9375rem] font-semibold leading-none",
    "transition-colors duration-120 ease-out",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-ink text-white hover:bg-[#2A2D32]",
        /* the money button: green means "this releases or commits payment" */
        cta: "bg-release text-ink hover:bg-[#26A366]",
        secondary: "bg-laminate-sunk text-ink hover:bg-sand/70",
        ghost: "bg-transparent text-ink hover:bg-laminate-sunk",
        link: "h-auto min-h-0 rounded-none p-0 text-ink underline decoration-ink/45 decoration-[1.5px] underline-offset-[3px] hover:decoration-ink",
        danger: "bg-transparent text-alarm shadow-[inset_0_0_0_1px_#B42318] hover:bg-alarm-tint",
        outline: "bg-transparent text-ink shadow-[inset_0_0_0_1px_#8A9096] hover:bg-laminate-sunk hover:shadow-[inset_0_0_0_1px_#121417]",
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

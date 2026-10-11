import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[4px] font-sans text-[0.9375rem] font-semibold leading-none",
    "transition-[transform,background-color,color] duration-120 ease-out",
    "hover:-translate-y-px focus-visible:-translate-y-px active:translate-y-px",
    "focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany",
    "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50",
    "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-mahogany text-laminate shadow-[0_2px_0_#2E1414] hover:bg-mahogany-raised focus-visible:bg-mahogany-raised focus-visible:outline-release active:shadow-[0_0_0_#2E1414,inset_0_2px_0_rgba(0,0,0,0.3)]",
        cta: "bg-[linear-gradient(180deg,#E7C978_0%,#C9A24A_55%,#B08A2C_100%)] text-ink shadow-[0_2px_0_#7A5A14,inset_0_1px_0_#E7C978] hover:shadow-[0_3px_0_#7A5A14,inset_0_1px_0_#E7C978] focus-visible:shadow-[0_3px_0_#7A5A14,inset_0_1px_0_#E7C978] active:shadow-[0_0_0_#7A5A14,inset_0_2px_0_rgba(0,0,0,0.18)]",
        secondary: "bg-laminate-sunk text-ink shadow-[0_2px_0_#D5CBBD] hover:bg-sand/60 active:shadow-none",
        ghost: "bg-transparent text-ink hover:bg-laminate-sunk",
        link: "h-auto min-h-0 rounded-none p-0 text-ink underline decoration-ink/45 decoration-[1.5px] underline-offset-[3px] hover:translate-y-0 hover:decoration-ink focus-visible:translate-y-0 active:translate-y-0",
        danger: "bg-transparent text-alarm shadow-[inset_0_0_0_1.5px_#B8281C] hover:bg-alarm-tint",
        outline: "bg-transparent text-ink shadow-[inset_0_0_0_1.5px_#4B2320] hover:bg-laminate-sunk",
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

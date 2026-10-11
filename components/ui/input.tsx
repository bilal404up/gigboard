import * as React from "react"
import { cn } from "@/lib/utils/cn"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn("field", (type === "number" || props.inputMode === "decimal" || props.inputMode === "numeric") && "field-num", className)}
    ref={ref}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }

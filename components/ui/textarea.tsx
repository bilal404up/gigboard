import * as React from "react"
import { cn } from "@/lib/utils/cn"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea className={cn("field min-h-[6rem] leading-relaxed", className)} ref={ref} {...props} />
))
Textarea.displayName = "Textarea"

export { Textarea }

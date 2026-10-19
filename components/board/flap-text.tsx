import { cn } from "@/lib/utils/cn"

type Props = {
  text: string
  size?: "sm" | "md" | "lg"
  tone?: "held" | "go" | "stop"
  className?: string
  /** Spoken text. Defaults to the text in sentence case. */
  label?: string
}

/* Static split-flap lettering, rendered on the server. Words wrap as units. */
export function FlapText({ text, size = "md", tone, className, label }: Props) {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean)
  const spoken = label ?? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  return (
    <span role={label === "" ? undefined : "img"} aria-label={label === "" ? undefined : spoken} aria-hidden={label === "" ? true : undefined} className={cn("ft", size === "lg" && "ft--lg", size === "sm" && "ft--sm", className)}>
      {words.map((w, i) => (
        <span key={i} className="ft-word" aria-hidden="true">
          {Array.from(w).map((ch, j) => (
            <span key={j} className="ft-cell" data-tone={tone}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}

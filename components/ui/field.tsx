import { cloneElement, isValidElement, useId, type ReactNode } from "react"

type Props = { label: string; hint?: string; error?: string; htmlFor?: string; children: ReactNode }

/* Wraps one control with a label, a hint and an error. Passes the id onto the child unless htmlFor is given. */
export function Field({ label, hint, error, htmlFor, children }: Props) {
  const generated = useId()
  const id = htmlFor ?? generated
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  const control =
    !htmlFor && isValidElement(children)
      ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          id,
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
        })
      : children

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="label">
        {label}
      </label>
      {control}
      {hint && !error ? (
        <p id={hintId} className="hint !mt-0">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="hint hint--error !mt-0">
          {error}
        </p>
      ) : null}
    </div>
  )
}

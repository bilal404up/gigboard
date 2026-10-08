"use client";

import * as React from "react";

/**
 * A form row with a label that is really tied to its input (htmlFor and id), so screen readers
 * announce the label and clicking it focuses the field. Pass one input, select or textarea as the child.
 */
export function Field({ label, hint, error, htmlFor, children }: { label: string; hint?: string; error?: string; htmlFor?: string; children: React.ReactNode }) {
  const generated = React.useId();
  const only = React.isValidElement(children) ? (children as React.ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>) : null;
  const id = htmlFor ?? only?.props.id ?? generated;
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const control = only && !htmlFor
    ? React.cloneElement(only, { id, "aria-describedby": only.props["aria-describedby"] ?? describedBy, "aria-invalid": error ? true : only.props["aria-invalid"] })
    : children;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {hint && (
          <span id={`${id}-hint`} className="text-2xs text-ink-subtle">
            {hint}
          </span>
        )}
      </div>
      {control}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

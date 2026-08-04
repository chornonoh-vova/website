import clsx from "clsx";
import type { ComponentPropsWithRef } from "react";

const base =
  "inline-flex flex-row items-center gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

/**
 * `outline` trims a pixel off each side of the padding so that its border
 * doesn't make it taller than a `solid` button sitting next to it.
 *
 * indigo-500 as a border is 4.47:1 on white and 4.01:1 on neutral-900, and the
 * indigo-700/indigo-300 label text clears 7:1 on both, so the variant holds up
 * in either theme.
 */
const variants = {
  solid: "bg-indigo-500 px-3 py-[7px] text-white shadow-md hover:bg-indigo-600",
  outline:
    "border border-indigo-500 px-[11px] py-[6px] text-indigo-700 shadow-sm hover:bg-indigo-500/10 dark:text-indigo-300",
} as const;

export type ButtonVariant = keyof typeof variants;

export function Button({
  type = "button",
  variant = "solid",
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={clsx(base, variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

import clsx from "clsx";
import type { ComponentPropsWithRef } from "react";

export function Button({
  type = "button",
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button">) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex flex-row items-center gap-1 rounded-md bg-indigo-500 px-3 py-[7px] text-white shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

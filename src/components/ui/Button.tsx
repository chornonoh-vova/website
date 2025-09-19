import clsx from "clsx";
import type { ComponentPropsWithRef } from "react";

export function Button({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button">) {
  return (
    <button
      className={clsx(
        "inline-flex flex-row items-center gap-1 rounded-md bg-indigo-500 px-3 py-1.75 text-white shadow-md",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

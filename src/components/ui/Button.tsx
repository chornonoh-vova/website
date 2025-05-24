import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/utils";

export function Button({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button">) {
  return (
    <button
      className={cn(
        "rounded-md bg-indigo-500 px-4 py-2 text-white shadow-md",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

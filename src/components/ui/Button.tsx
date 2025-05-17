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
        "py-2 px-4 bg-indigo-500 text-white rounded-md shadow-md",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

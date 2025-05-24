import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/utils";

export function IconButton({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button">) {
  return (
    <button
      className={cn(
        "inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-md p-2 transition-colors duration-75 hover:bg-red-50 hover:text-red-500 active:bg-red-100 active:text-red-600",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

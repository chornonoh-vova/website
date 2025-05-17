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
        "inline-flex items-center justify-center min-h-[34px] min-w-[34px] p-2 transition-colors duration-75 rounded-md hover:bg-red-50 active:bg-red-100 hover:text-red-500 active:text-red-600",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

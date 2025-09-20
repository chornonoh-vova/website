import clsx from "clsx";
import { useId, type ComponentPropsWithRef } from "react";

export function Input({
  label,
  id,
  className,
  ...rest
}: ComponentPropsWithRef<"input"> & { label: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="w-full min-w-[120px] flex-1">
      <label
        htmlFor={inputId}
        className="ps-1 text-neutral-950 dark:text-neutral-50"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={clsx(
          "focus:ring-opacity-50 mt-1 block w-full rounded-md border-neutral-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 dark:border-neutral-700 dark:bg-neutral-950 focus:dark:border-indigo-700 focus:dark:ring-indigo-500",
          className,
        )}
        {...rest}
      />
    </div>
  );
}

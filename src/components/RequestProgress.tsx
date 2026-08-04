import clsx from "clsx";
import type { CSSProperties } from "react";
import type { RequestState } from "./execution";

const styles: Record<RequestState, string> = {
  pending: "",
  active:
    "border border-blue-600 bg-blue-600/50 dark:border-blue-500 dark:bg-blue-500/50",
  done: "border border-green-600 bg-green-600/50 dark:border-green-500 dark:bg-green-500/50",
  failed:
    "border border-red-600 bg-red-600/50 dark:border-red-500 dark:bg-red-500/50",
  cancelled:
    "border border-dashed border-neutral-500 bg-neutral-500/25 dark:border-neutral-400 dark:bg-neutral-400/25",
  wasted:
    "border border-dotted border-amber-600 bg-amber-600/25 dark:border-amber-500 dark:bg-amber-500/25",
};

export default function RequestProgress({
  state,
  className,
  style,
}: {
  state: RequestState;
  className?: string;
  style: CSSProperties;
}) {
  return (
    <div
      className={clsx("h-4 rounded-sm", styles[state], className)}
      style={style}
    />
  );
}

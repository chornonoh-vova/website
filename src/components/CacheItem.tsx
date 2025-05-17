import { motion, Reorder, useMotionValue } from "motion/react";
import type { Ref } from "react";
import { Trash } from "lucide-react";
import { useRaisedShadow } from "../hooks/useRaisedShadow";
import { IconButton } from "./ui/IconButton";
import { cn } from "../lib/utils";

function CacheItemText({
  label,
  value,
  borderEnd = false,
  className,
}: {
  label: string;
  value: string;
  borderEnd?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "px-4 py-1 text-neutral-950 dark:text-neutral-50 text-sm border border-transparent",
        borderEnd &&
          "rounded-s-sm border-e border-e-neutral-300 dark:border-e-neutral-700",
        className,
      )}
    >
      <span className="text-xs text-neutral-600 dark:text-neutral-300">
        {label}:
      </span>
      <br />
      {value}
    </p>
  );
}

export function CacheItem({
  className,
  entry,
  ref,
  onDeleteClick,
}: {
  entry: { key: string; value: string };
  className?: string;
  ref?: Ref<HTMLLIElement>;
  onDeleteClick?: () => void;
}) {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);

  return (
    <motion.li
      key={entry.key}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      ref={ref}
    >
      <div className={className}>
        <Reorder.Item
          as="div"
          className={cn([
            "grid grid-cols-[repeat(2,_minmax(0,_1fr))_auto] items-center",
            "rounded-md",
            "border border-neutral-300 dark:border-neutral-700",
          ])}
          initial={{
            opacity: 0,
            y: -8,
            scale: 0.98,
            filter: "blur(4px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            y: 8,
            scale: 0.98,
            filter: "blur(4px)",
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ boxShadow, y }}
          value={entry.key}
          dragListener={false}
        >
          <CacheItemText label="Key" value={entry.key} borderEnd />
          <CacheItemText label="Value" value={entry.value} />
          <div className="ml-auto px-2 py-1">
            {onDeleteClick && (
              <IconButton
                onClick={onDeleteClick}
                aria-label={`Delete ${entry.key}`}
              >
                <Trash className="size-3.5" />
              </IconButton>
            )}
          </div>
        </Reorder.Item>
      </div>
    </motion.li>
  );
}

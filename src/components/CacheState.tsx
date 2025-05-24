import { AnimatePresence, Reorder } from "motion/react";
import { Info } from "lucide-react";
import { CacheItem } from "./CacheItem";
import { cn } from "../lib/utils";

export function CacheState({
  keys,
  entries,
  deleteKey,
}: {
  keys: string[];
  entries: [string, string][];
  deleteKey?: (key: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-xl">Cache state</h4>
      <Reorder.Group values={keys} onReorder={() => {}}>
        <AnimatePresence initial={false}>
          {entries.length === 0 && (
            <div className="flex items-center gap-2 rounded-md border border-neutral-300 px-4 py-2 dark:border-neutral-700">
              <Info className="size-4" />
              <p>Cache is empty</p>
            </div>
          )}

          {entries.map(([key, value], i, arr) => (
            <CacheItem
              key={key}
              entry={{ key, value }}
              className={cn([
                "py-1",
                i === 0 && "pt-0",
                i === arr.length - 1 && "pb-0",
              ])}
              onDeleteClick={deleteKey ? () => deleteKey(key) : undefined}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}

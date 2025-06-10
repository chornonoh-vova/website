import clsx from "clsx";
import { AnimatePresence, motion, Reorder, useMotionValue } from "motion/react";
import {
  useId,
  useReducer,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type Ref,
} from "react";
import { useRaisedShadow } from "../hooks/useRaisedShadow";
import { Info, Trash } from "lucide-react";

export class LRUCache<K, V> {
  #cache: Map<K, V>;
  #capacity: number;

  constructor(capacity: number, initial?: Iterable<readonly [K, V]>) {
    this.#cache = new Map(initial);
    this.#capacity = capacity;
  }

  #setMostRecent(key: K, value: V): void {
    this.#cache.delete(key);
    this.#cache.set(key, value);
  }

  entries(): [K, V][] {
    const entries: [K, V][] = new Array(this.#cache.size);
    let idx = entries.length - 1;
    for (const entry of this.#cache.entries()) {
      entries[idx] = entry;
      idx--;
    }
    return entries;
  }

  get(key: K): V | undefined {
    const value = this.#cache.get(key);

    if (value === undefined) {
      return undefined;
    }

    this.#setMostRecent(key, value);
    return value;
  }

  set(key: K, value: V): void {
    this.#setMostRecent(key, value);

    if (this.#cache.size > this.#capacity) {
      const oldest = this.#cache.keys().next().value!;
      this.#cache.delete(oldest);
    }
  }

  delete(key: K): void {
    this.#cache.delete(key);
  }

  clear(): void {
    this.#cache.clear();
  }
}

export function Button({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button">) {
  return (
    <button
      className={clsx(
        "rounded-md bg-indigo-500 px-4 py-2 text-white shadow-md",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconButton({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button">) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-md p-2 transition-colors duration-75 hover:bg-red-50 hover:text-red-500 active:bg-red-100 active:text-red-600",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  ...rest
}: ComponentPropsWithRef<"input"> & { label: string }) {
  const inputId = useId();
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="ps-1 text-neutral-950 dark:text-neutral-50"
      >
        {label}
      </label>
      <input
        id={inputId}
        className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 dark:border-neutral-700 dark:bg-neutral-950 focus:dark:border-indigo-700 focus:dark:ring-indigo-500"
        {...rest}
      />
    </div>
  );
}

function CacheStats({
  lastValue,
  hits,
  misses,
}: {
  lastValue: string | undefined | null;
  hits: number;
  misses: number;
}) {
  let lastResult = "";

  if (lastValue === undefined) {
    lastResult = "Miss";
  }

  if (typeof lastValue === "string") {
    lastResult = "Hit: " + lastValue;
  }

  return (
    <div className="grid grid-cols-2 rounded-md border border-neutral-300 text-neutral-950 shadow-sm dark:border-neutral-700 dark:text-neutral-50">
      <div className="border-e border-e-neutral-300 px-4 py-2 dark:border-e-neutral-700">
        <p className="text-xs text-neutral-600 dark:text-neutral-300">Stats</p>
        <p className="inline-flex w-full flex-wrap gap-1 text-sm">
          <span>Hits {hits}</span>
          <span>Misses {misses}</span>
        </p>
      </div>
      <div
        className={clsx(
          "rounded-e-sm px-4 py-2 transition-colors duration-75",
          {
            "bg-red-200/50 dark:bg-red-800": lastValue === undefined,
            "bg-green-200/50 dark:bg-green-800": typeof lastValue === "string",
          },
        )}
      >
        <p className="text-xs text-neutral-600 dark:text-neutral-300">
          Last Result
        </p>
        <p className="text-sm">{lastResult}</p>
      </div>
    </div>
  );
}

export function CacheControls({
  getValue,
  setKeyValue,
  reset,
}: {
  getValue?: (key: string) => string | undefined;
  setKeyValue?: (key: string, value: string) => void;
  reset?: () => void;
}) {
  const [lastValue, setLastValue] = useState<string | undefined | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const getKeyRef = useRef<HTMLInputElement>(null);
  const setKeyRef = useRef<HTMLInputElement>(null);
  const setValueRef = useRef<HTMLInputElement>(null);

  const onGetClick = () => {
    const key = getKeyRef.current?.value;
    if (!key) {
      return;
    }

    const value = getValue!(key);
    if (value === undefined) {
      setMisses((m) => m + 1);
    } else {
      setHits((h) => h + 1);
    }
    setLastValue(value);
  };

  const onSetClick = () => {
    const key = setKeyRef.current?.value;
    const value = setValueRef.current?.value;

    if (!key || !value) {
      return;
    }

    setKeyValue!(key, value);
  };

  const onResetClick = () => {
    setLastValue(null);
    setHits(0);
    setMisses(0);
    reset!();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xl">Cache controls</h4>

        {reset && (
          <button
            onClick={onResetClick}
            className="rounded-sm border border-neutral-300 px-2 text-sm dark:border-neutral-700"
          >
            Reset
          </button>
        )}
      </div>

      <CacheStats lastValue={lastValue} hits={hits} misses={misses} />

      {getValue && (
        <div className="flex flex-row items-end-safe gap-2">
          <Input label="Key to get" ref={getKeyRef} type="text" />
          <Button onClick={onGetClick}>Get</Button>
        </div>
      )}

      {setKeyValue && (
        <div className="flex flex-row items-end-safe gap-2">
          <Input label="Key to set" ref={setKeyRef} type="text" />
          <Input label="Value to set" ref={setValueRef} type="text" />
          <Button onClick={onSetClick}>Set</Button>
        </div>
      )}
    </div>
  );
}

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
      className={clsx(
        "border border-transparent px-4 py-1 text-sm text-neutral-950 dark:text-neutral-50",
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
          className={clsx([
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
              className={clsx([
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

const DEFAULT_CAPACITY = 6;

export function LRUVisualization({
  capacity = DEFAULT_CAPACITY,
  initial = [],
  getControl = true,
  setControl = false,
  deleteControl = false,
  resetControl = false,
}: {
  capacity?: number;
  initial?: [string, string][];
  getControl?: boolean;
  setControl?: boolean;
  deleteControl?: boolean;
  resetControl?: boolean;
}) {
  const cache = useRef(new LRUCache(capacity, initial));
  const [, reRender] = useReducer((x) => x + 1, 0);

  const entries = cache.current.entries();
  const keys = entries.map(([key]) => key);

  return (
    <div className="not-prose grid w-full grid-cols-1 gap-2 md:grid-cols-2">
      <CacheState
        keys={keys}
        entries={entries}
        deleteKey={
          deleteControl
            ? (key) => {
                cache.current.delete(key);
                reRender();
              }
            : undefined
        }
      />

      <CacheControls
        getValue={
          getControl
            ? (key) => {
                const value = cache.current.get(key);
                reRender();
                return value;
              }
            : undefined
        }
        setKeyValue={
          setControl
            ? (key, value) => {
                cache.current.set(key, value);
                reRender();
              }
            : undefined
        }
        reset={
          resetControl
            ? () => {
                cache.current.clear();

                for (const [key, value] of initial) {
                  cache.current.set(key, value);
                }

                reRender();
              }
            : undefined
        }
      />
    </div>
  );
}

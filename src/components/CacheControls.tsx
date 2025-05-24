import { useRef, useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

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
        className={cn("rounded-e-sm px-4 py-2 transition-colors duration-75", {
          "bg-red-200/50 dark:bg-red-800": lastValue === undefined,
          "bg-green-200/50 dark:bg-green-800": typeof lastValue === "string",
        })}
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

import { useReducer, useRef } from "react";
import { LRUCache } from "../lib/cache";
import { CacheState } from "./CacheState";
import { CacheControls } from "./CacheControls";

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
    <div className="not-prose grid grid-cols-1 md:grid-cols-2 w-full gap-2">
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

import { useState } from "react";
import { Button } from "../ui/Button";
import { CircleX, RefreshCw } from "lucide-react";
import clsx from "clsx";

const initialGrid = [
  [".", ".", "@", "@", ".", "@", "@", "@", "@", "."],
  ["@", "@", "@", ".", "@", ".", "@", ".", "@", "@"],
  ["@", "@", "@", "@", "@", ".", "@", ".", "@", "@"],
  ["@", ".", "@", "@", "@", "@", ".", ".", "@", "."],
  ["@", "@", ".", "@", "@", "@", "@", ".", "@", "@"],
  [".", "@", "@", "@", "@", "@", "@", "@", ".", "@"],
  [".", "@", ".", "@", ".", "@", ".", "@", "@", "@"],
  ["@", ".", "@", "@", "@", ".", "@", "@", "@", "@"],
  [".", "@", "@", "@", "@", "@", "@", "@", "@", "."],
  ["@", ".", "@", ".", "@", "@", "@", ".", "@", "."],
];

const ROLL = "@";
const EMPTY = ".";

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function isAccessible(grid: string[][], row: number, col: number) {
  const n = grid.length;
  const m = grid[0].length;

  let adjRolls = 0;

  for (const [dr, dc] of directions) {
    const [r, c] = [row + dr, col + dc];

    if (r >= 0 && r < n && c >= 0 && c < m && grid[r][c] === ROLL) {
      adjRolls++;
    }
  }

  return adjRolls < 4;
}

function countAccessibleRolls(grid: string[][]) {
  const n = grid.length;
  const m = grid[0].length;

  let accessible = 0;

  for (let row = 0; row < n; ++row) {
    for (let col = 0; col < m; ++col) {
      if (grid[row][col] !== ROLL) {
        continue;
      }

      if (isAccessible(grid, row, col)) {
        accessible++;
      }
    }
  }

  return accessible;
}

const initialAccessible = countAccessibleRolls(initialGrid);

export function Day4() {
  const [grid, setGrid] = useState(initialGrid);
  const [accessible, setAccessible] = useState(initialAccessible);
  const [removed, setRemoved] = useState(0);

  const remove = () => {
    const n = grid.length;
    const m = grid[0].length;

    const newGrid = structuredClone(grid);

    const toRemove = new Set<string>();

    for (let row = 0; row < n; ++row) {
      for (let col = 0; col < m; ++col) {
        if (grid[row][col] !== ROLL) {
          continue;
        }

        if (isAccessible(grid, row, col)) {
          toRemove.add(`${row}-${col}`);
        }
      }
    }

    for (const rollPos of toRemove) {
      const [row, col] = rollPos.split("-").map(Number);
      newGrid[row][col] = EMPTY;
    }

    setGrid(newGrid);
    setRemoved((prev) => prev + toRemove.size);
    setAccessible(countAccessibleRolls(newGrid));
  };

  const reset = () => {
    setGrid(initialGrid);
    setAccessible(initialAccessible);
    setRemoved(0);
  };

  return (
    <div className="not-prose flex flex-col gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={remove} disabled={accessible === 0}>
          <CircleX className="size-3.5" /> Remove
        </Button>
        <Button onClick={reset}>
          <RefreshCw className="size-3.5" /> Reset
        </Button>
      </div>

      <div className="mx-auto grid grid-cols-[repeat(10,30px)] grid-rows-[repeat(10,30px)] rounded-sm border border-neutral-200 dark:border-neutral-700">
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <p
              key={`${rowIdx}-${colIdx}`}
              className={clsx(
                "text-center font-mono font-bold",
                cell === ROLL && isAccessible(grid, rowIdx, colIdx)
                  ? "text-red-600 dark:text-red-400"
                  : "text-neutral-600 dark:text-neutral-400",
              )}
            >
              {cell}
            </p>
          )),
        )}
      </div>

      <div className="flex flex-col gap-2 self-center rounded-md border border-neutral-200 p-2 dark:border-neutral-700">
        <code>
          Accessible: {accessible}
          <br />
          Removed: {removed}
        </code>
      </div>
    </div>
  );
}

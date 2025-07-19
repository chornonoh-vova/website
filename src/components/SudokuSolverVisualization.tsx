import clsx from "clsx";
import { Play, RotateCcw, Shuffle } from "lucide-react";
import { useEffect, useState, type ComponentPropsWithRef } from "react";

class SudokuState {
  #rows: Uint16Array;
  #cols: Uint16Array;
  #boxes: Uint16Array;

  constructor() {
    this.#rows = new Uint16Array(9);
    this.#cols = new Uint16Array(9);
    this.#boxes = new Uint16Array(9);
  }

  #boxIndex(row: number, col: number): number {
    return Math.trunc(row / 3) * 3 + Math.trunc(col / 3);
  }

  canPlace(row: number, col: number, num: number): boolean {
    const box = this.#boxIndex(row, col);
    const mask = 1 << (num - 1);

    return !(
      this.#rows[row] & mask ||
      this.#cols[col] & mask ||
      this.#boxes[box] & mask
    );
  }

  place(row: number, col: number, num: number) {
    const box = this.#boxIndex(row, col);
    const mask = 1 << (num - 1);

    this.#rows[row] |= mask;
    this.#cols[col] |= mask;
    this.#boxes[box] |= mask;
  }

  remove(row: number, col: number, num: number) {
    const box = this.#boxIndex(row, col);
    const mask = 1 << (num - 1);

    this.#rows[row] ^= mask;
    this.#cols[col] ^= mask;
    this.#boxes[box] ^= mask;
  }
}

function solveSudoku(
  board: number[][],
  step: (row: number, col: number, num: number) => void,
): void {
  const sudokuState = new SudokuState();
  const empty: [number, number][] = [];

  for (let row = 0; row < 9; ++row) {
    for (let col = 0; col < 9; ++col) {
      if (board[row][col] === 0) {
        empty.push([row, col]);
        continue;
      }

      sudokuState.place(row, col, board[row][col]);
    }
  }

  function backtrack(index: number): boolean {
    if (index === empty.length) return true;

    const [row, col] = empty[index];

    for (let num = 1; num <= 9; ++num) {
      if (!sudokuState.canPlace(row, col, num)) {
        continue;
      }

      sudokuState.place(row, col, num);
      board[row][col] = num;
      step(row, col, num);

      if (backtrack(index + 1)) {
        return true;
      }

      sudokuState.remove(row, col, num);
      board[row][col] = 0;
      step(row, col, 0);
    }

    return false;
  }

  backtrack(0);
}

const initialSudokuBoards = [
  [
    [0, 1, 3, 6, 0, 7, 5, 0, 0],
    [6, 2, 7, 8, 0, 0, 0, 4, 3],
    [8, 9, 0, 1, 4, 0, 6, 2, 0],
    [1, 8, 2, 0, 0, 6, 7, 0, 9],
    [7, 4, 0, 2, 3, 1, 8, 0, 5],
    [5, 0, 0, 7, 0, 9, 0, 0, 4],
    [9, 6, 0, 5, 0, 4, 0, 8, 2],
    [2, 7, 4, 0, 6, 8, 0, 5, 1],
    [0, 5, 8, 9, 1, 2, 0, 7, 0],
  ],
  [
    [6, 8, 0, 3, 7, 9, 0, 5, 4],
    [0, 1, 0, 0, 0, 0, 8, 2, 7],
    [7, 0, 5, 0, 0, 0, 0, 6, 0],
    [0, 7, 0, 1, 0, 8, 0, 9, 5],
    [0, 0, 8, 0, 4, 7, 0, 0, 3],
    [4, 3, 1, 0, 6, 5, 0, 8, 2],
    [1, 0, 4, 7, 0, 0, 0, 0, 0],
    [9, 0, 7, 0, 0, 3, 2, 0, 8],
    [0, 0, 3, 6, 0, 0, 5, 0, 0],
  ],
  [
    [5, 2, 8, 0, 0, 6, 4, 1, 3],
    [1, 0, 4, 3, 8, 2, 5, 6, 0],
    [3, 0, 6, 0, 1, 0, 0, 9, 0],
    [6, 5, 2, 0, 0, 7, 9, 0, 0],
    [8, 4, 0, 2, 0, 5, 0, 0, 1],
    [7, 0, 3, 4, 9, 0, 6, 0, 5],
    [2, 8, 7, 0, 4, 3, 1, 5, 0],
    [4, 0, 0, 0, 0, 9, 2, 7, 6],
    [9, 6, 5, 0, 2, 1, 3, 8, 4],
  ],
  [
    [1, 5, 0, 0, 2, 3, 0, 0, 0],
    [0, 0, 0, 0, 5, 0, 0, 0, 6],
    [8, 0, 9, 0, 0, 4, 3, 0, 0],
    [5, 4, 0, 9, 7, 0, 6, 3, 8],
    [0, 0, 0, 1, 8, 0, 0, 0, 2],
    [7, 2, 8, 4, 3, 0, 1, 5, 0],
    [0, 9, 0, 0, 0, 8, 0, 0, 0],
    [0, 0, 0, 0, 4, 0, 5, 9, 0],
    [2, 0, 5, 0, 0, 0, 0, 6, 4],
  ],
];

function Button({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button">) {
  return (
    <button
      className={clsx(
        "inline-flex flex-row items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 shadow-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function SudokuBoard({
  sudoku,
  initialSudoku,
  lastUpdated,
}: {
  sudoku: number[][];
  initialSudoku: number[][];
  lastUpdated: [number, number] | null;
}) {
  const [lastUpdatedRow, lastUpdatedCol] = lastUpdated ?? [-1, -1];

  return (
    <div className="grid grid-cols-[repeat(9,_32px)] grid-rows-[repeat(9,_32px)] place-items-stretch rounded-[8px] border border-neutral-400 shadow-md">
      {sudoku.map((row, rowIdx) => {
        return row.map((val, colIdx) => (
          <div
            key={`cell-${rowIdx}-${colIdx}`}
            className={clsx(
              "border-neutral-400 text-center first:rounded-tl-[7px] last:rounded-br-[7px]",
              rowIdx === lastUpdatedRow &&
                colIdx === lastUpdatedCol &&
                "bg-neutral-200 dark:bg-neutral-700",
              val !== 0 &&
                sudoku[rowIdx][colIdx] === initialSudoku[rowIdx][colIdx] &&
                "font-semibold",
              rowIdx === 0 && colIdx === 8 && "rounded-tr-[7px]",
              rowIdx === 8 && colIdx === 0 && "rounded-bl-[7px]",
              colIdx % 3 === 0 ? "border-r border-l" : "border-r",
              colIdx === 8 && "border-r",
              rowIdx % 3 === 0 ? "border-t border-b" : "border-b",
              rowIdx === 8 && "border-b",
            )}
          >
            {val === 0 ? <span className="sr-only">empty</span> : val}
          </div>
        ));
      })}
    </div>
  );
}

export function SudokuSolverVisualization() {
  const [initialIdx, setInitialIdx] = useState(0);
  const [sudoku, setSudoku] = useState(initialSudokuBoards[0]);
  const [solutionIdx, setSolutionIdx] = useState(-1);
  const [solutionSteps, setSolutionSteps] = useState<
    [number, number, number][]
  >([]);
  const [lastUpdated, setLastUpdated] = useState<[number, number] | null>(null);

  const solve = () => {
    const copiedSudoku = structuredClone(sudoku);
    const steps: [number, number, number][] = [];
    solveSudoku(copiedSudoku, (row, col, num) => {
      steps.push([row, col, num]);
    });
    setSolutionSteps(steps);
    setSolutionIdx(0);
  };

  const resetSolution = () => {
    setSolutionIdx(-1);
    setSolutionSteps([]);
    setLastUpdated(null);
  };

  const reset = () => {
    resetSolution();
    setSudoku(initialSudokuBoards[initialIdx]);
  };

  const randomize = () => {
    resetSolution();
    const idx = Math.floor(Math.random() * initialSudokuBoards.length);
    setInitialIdx(idx);
    setSudoku(initialSudokuBoards[idx]);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (solutionIdx === -1) {
        return;
      }

      const [row, col, num] = solutionSteps[solutionIdx];

      const copiedSudoku = structuredClone(sudoku);
      copiedSudoku[row][col] = num;
      setLastUpdated([row, col]);

      setSudoku(copiedSudoku);

      if (solutionIdx === solutionSteps.length - 1) {
        resetSolution();
      } else {
        setSolutionIdx(solutionIdx + 1);
      }
    }, 250);

    return () => {
      clearInterval(intervalId);
    };
  }, [sudoku, solutionSteps, solutionIdx]);

  return (
    <div className="not-prose mx-auto flex flex-col items-center gap-2">
      <div className="flex flex-row flex-nowrap gap-2">
        <Button className="flex-1" onClick={solve}>
          <Play className="size-3.5" />
          Start
        </Button>
        <Button className="flex-1" onClick={reset}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
        <Button onClick={randomize}>
          <Shuffle className="size-3.5" />
          Randomize board
        </Button>
      </div>

      <SudokuBoard
        sudoku={sudoku}
        initialSudoku={initialSudokuBoards[initialIdx]}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}

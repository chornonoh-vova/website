import clsx from "clsx";
import { motion } from "motion/react";
import { useEffect, useId, useState, type ComponentPropsWithRef } from "react";
import { RefreshCw } from "lucide-react";
import { Queue } from "@datastructures-js/queue";

type Pixel = {
  row: number;
  col: number;
};

const DIRECTIONS = [
  [-1, 0], // up
  [0, 1], // right
  [1, 0], // down
  [0, -1], // left
];

function floodFillDFS(
  image: number[][],
  startRow: number,
  startCol: number,
  color: number,
  callback: (visited: Pixel) => void,
): number[][] {
  const n = image.length;
  const m = image[0].length;

  if (image[startRow][startCol] === color) {
    return image;
  }

  const startColor = image[startRow][startCol];

  function dfs({ row, col }: Pixel) {
    if (
      row < 0 ||
      col < 0 ||
      row >= n ||
      col >= m ||
      image[row][col] !== startColor
    ) {
      return;
    }

    callback({ row, col });
    image[row][col] = color;

    for (const [dr, dc] of DIRECTIONS) {
      const [nextRow, nextCol] = [row + dr, col + dc];
      dfs({ row: nextRow, col: nextCol });
    }
  }

  dfs({ row: startRow, col: startCol });

  return image;
}

function floodFillBFS(
  image: number[][],
  startRow: number,
  startCol: number,
  color: number,
  callback: (visited: Pixel) => void,
): number[][] {
  const n = image.length;
  const m = image[0].length;

  if (image[startRow][startCol] === color) {
    return image;
  }

  const startColor = image[startRow][startCol];

  const queue = new Queue<Pixel>([{ row: startRow, col: startCol }]);

  while (!queue.isEmpty()) {
    const { row, col } = queue.pop()!;

    if (
      row < 0 ||
      col < 0 ||
      row >= n ||
      col >= m ||
      image[row][col] !== startColor
    ) {
      continue;
    }

    callback({ row, col });
    image[row][col] = color;

    for (const [dr, dc] of DIRECTIONS) {
      const [nextRow, nextCol] = [row + dr, col + dc];
      queue.push({ row: nextRow, col: nextCol });
    }
  }

  return image;
}

const initialImage = [
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 2, 2, 2],
  [0, 0, 0, 0, 0, 0, 0, 2, 2, 2],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0, 4],
  [3, 3, 0, 0, 0, 0, 0, 0, 0, 4],
  [3, 3, 3, 0, 0, 0, 0, 0, 0, 0],
];

const colors = [
  "bg-transparent",
  "bg-red-600",
  "bg-orange-600",
  "bg-lime-600",
  "bg-blue-600",
  "bg-fuchsia-600",
];

const ControlButton = ({
  className,
  children,
  ...props
}: ComponentPropsWithRef<"button">) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-1 rounded-sm border border-neutral-200 px-2 py-1 shadow-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const ColorSelect = ({
  className,
  ...props
}: ComponentPropsWithRef<"select">) => {
  const id = useId();
  return (
    <select
      name="color"
      id={`fill-color-${id}`}
      defaultValue="5"
      aria-label="Fill color"
      className={clsx(
        "w-full rounded-sm border border-neutral-200 bg-transparent text-neutral-900 shadow-xs hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-800",
        className,
      )}
      {...props}
    >
      <option value="0">Transparent</option>
      <option value="1">Red</option>
      <option value="2">Orange</option>
      <option value="3">Lime</option>
      <option value="4">Blue</option>
      <option value="5">Fuchsia</option>
    </select>
  );
};

export const FloodFillVisualization = ({
  variant,
}: {
  variant: "dfs" | "bfs";
}) => {
  const [image, setImage] = useState(() => initialImage);
  const [fillColor, setFillColor] = useState(5);
  const [fillIdx, setFillIdx] = useState(-1);
  const [fill, setFill] = useState<Pixel[]>([]);

  const resetFill = () => {
    setFillIdx(-1);
    setFill([]);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (fillIdx === -1) {
        return;
      }

      const toFill = fill[fillIdx];

      const copiedImage = structuredClone(image);
      copiedImage[toFill.row][toFill.col] = fillColor;

      setImage(copiedImage);

      if (fillIdx === fill.length - 1) {
        resetFill();
      } else {
        setFillIdx(fillIdx + 1);
      }
    }, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, [image, fill, fillIdx, fillColor]);

  const onResetClick = () => {
    resetFill();
    setImage(initialImage);
  };

  const onPixelClick = (row: number, col: number) => {
    const toFill: Pixel[] = [];
    const fillCallback = (visited: Pixel) => {
      toFill.push(visited);
    };
    if (variant === "dfs") {
      floodFillDFS(structuredClone(image), row, col, fillColor, fillCallback);
    } else {
      floodFillBFS(structuredClone(image), row, col, fillColor, fillCallback);
    }
    setFill(toFill);
    setFillIdx(0);
  };

  const onFillChange = (color: number) => {
    resetFill();
    setFillColor(color);
  };

  return (
    <div className="not-prose mx-auto flex max-w-fit flex-col gap-3">
      <div className="flex gap-1.5">
        <ControlButton onClick={onResetClick}>
          <RefreshCw className="size-3.5" /> Reset
        </ControlButton>
        <ColorSelect onChange={(e) => onFillChange(parseInt(e.target.value))} />
      </div>
      <div className="grid grid-cols-[repeat(10,_24px)] justify-center gap-1">
        {image.map((row, rowIdx) => {
          return row.map((pixelColor, colIdx) => (
            <motion.button
              key={`${rowIdx}-${colIdx}`}
              aria-label={`pixel-${rowIdx}-${colIdx}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              className={clsx(
                "h-6 w-6 rounded-sm border border-neutral-700 transition-colors duration-200",
                colors[pixelColor],
              )}
              onClick={() => onPixelClick(rowIdx, colIdx)}
            />
          ));
        })}
      </div>
    </div>
  );
};

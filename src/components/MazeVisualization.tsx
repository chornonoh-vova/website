import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { RefreshCcw } from "lucide-react";

type Cell = "#" | " ";
type Maze = Cell[][];
type Position = {
  x: number;
  y: number;
};

const DIRECTIONS = [
  [0, -2],
  [2, 0],
  [0, 2],
  [-2, 0],
];

const TILE_SIZE = 12;

function createMazeInitial(width: number, height: number): Maze {
  return Array.from({ length: height }, () => {
    return new Array(width).fill("#");
  });
}

function getNeighbors(
  pos: Position,
  width: number,
  height: number,
): Position[] {
  const neighbors = [];

  for (const [dx, dy] of DIRECTIONS) {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx >= 1 && nx < width - 1 && ny >= 1 && ny < height - 1) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
}

function generateMazeDFS(width: number, height: number): Maze {
  const maze = createMazeInitial(width, height);
  const visited = Array.from({ length: height }, () =>
    new Array(width).fill(false),
  );
  const stack: Position[] = [];

  stack.push({ x: 1, y: 1 });
  visited[1][1] = true;
  maze[1][1] = " ";

  while (stack.length > 0) {
    const curr = stack.at(-1)!;
    const neighbors = getNeighbors(curr, width, height).filter(
      ({ x, y }) => !visited[y][x],
    );

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];

      const wallX = (curr.x + next.x) / 2;
      const wallY = (curr.y + next.y) / 2;
      maze[wallY][wallX] = " ";
      maze[next.y][next.x] = " ";

      visited[next.y][next.x] = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  maze[1][0] = " ";
  maze[height - 2][width - 1] = " ";

  return maze;
}

class UnionFind {
  parent: Map<string, string> = new Map();

  find(x: string): string {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
    }
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)!));
    }
    return this.parent.get(x)!;
  }

  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;
    this.parent.set(rootX, rootY);
    return true;
  }
}

function posKey(pos: [number, number]): string;
function posKey(pos: Position): string;
function posKey(pos: [number, number] | Position): string {
  let x, y;
  if (Array.isArray(pos)) {
    [x, y] = pos;
  } else {
    x = pos.x;
    y = pos.y;
  }
  return `${x}|${y}`;
}

function generateMazeKruskals(width: number, height: number): Maze {
  const maze = createMazeInitial(width, height);

  const uf = new UnionFind();
  const edges: { from: Position; to: Position; wall: Position }[] = [];

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      maze[y][x] = " ";
      uf.find(posKey([x, y]));

      if (x + 2 < width - 1) {
        edges.push({
          from: { x, y },
          to: { x: x + 2, y },
          wall: { x: x + 1, y },
        });
      }

      if (y + 2 < height - 1) {
        edges.push({
          from: { x, y },
          to: { x, y: y + 2 },
          wall: { x, y: y + 1 },
        });
      }
    }
  }

  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [edges[i], edges[j]] = [edges[j], edges[i]];
  }

  for (const edge of edges) {
    if (uf.union(posKey(edge.from), posKey(edge.to))) {
      maze[edge.wall.y][edge.wall.x] = " ";
      maze[edge.to.y][edge.to.x] = " ";
    }
  }

  maze[1][0] = " ";
  maze[height - 2][width - 1] = " ";

  return maze;
}

function generateMazeWilsons(width: number, height: number): Maze {
  const maze = createMazeInitial(width, height);

  const inMaze = new Set<string>();
  const cells: Position[] = [];

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      cells.push({ x, y });
    }
  }

  const start = cells[Math.floor(Math.random() * cells.length)];
  inMaze.add(posKey(start));
  maze[start.y][start.x] = " ";

  for (const cell of cells) {
    if (inMaze.has(posKey(cell))) continue;

    const path = new Map<string, Position>();
    let curr = cell;

    while (!inMaze.has(posKey(curr))) {
      const neighbors = getNeighbors(curr, width, height);
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      const currKey = posKey(curr);

      if (path.has(currKey)) {
        const keysToRemove: string[] = [];
        let found = false;

        for (const key of path.keys()) {
          if (found) {
            keysToRemove.push(key);
          }
          if (key === currKey) {
            found = true;
          }
        }

        for (const key of keysToRemove) {
          path.delete(key);
        }
      }

      path.set(currKey, next);
      curr = next;
    }

    curr = cell;
    while (path.has(posKey(curr))) {
      const currKey = posKey(curr);
      const next = path.get(currKey)!;

      maze[curr.y][curr.x] = " ";
      const wallX = (curr.x + next.x) / 2;
      const wallY = (curr.y + next.y) / 2;
      maze[wallY][wallX] = " ";

      inMaze.add(currKey);
      curr = next;
    }
  }

  maze[1][0] = " ";
  maze[height - 2][width - 1] = " ";

  return maze;
}

function drawOpenArrow(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const padding = 1;
  const x1 = x + padding;
  const y1 = y + TILE_SIZE / 2;
  const x2 = x + TILE_SIZE - padding;

  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 1.5;

  // main shaft
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y1);
  ctx.stroke();

  const headSize = 5;
  ctx.beginPath();
  ctx.moveTo(x2, y1);
  ctx.lineTo(x2 - headSize, y1 - headSize);
  ctx.moveTo(x2, y1);
  ctx.lineTo(x2 - headSize, y1 + headSize);
  ctx.stroke();
}

export function MazeVisualization({ initialAlgo }: { initialAlgo: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maze, setMaze] = useState<Maze | null>(null);
  const [algo, setAlgo] = useState(initialAlgo);

  const drawMaze = () => {
    if (!maze) return;

    const dark =
      window.localStorage.theme === "dark" ||
      (!("theme" in window.localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const colors = {
      wall: dark ? "#ffffff" : "#000000",
      path: dark ? "#171717" : "#fafafa",
    };

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const scale = window.devicePixelRatio;
    const canvasWidth = Math.floor(canvas.width / scale);
    const canvasHeight = Math.floor(canvas.height / scale);

    const offsetX = (canvasWidth - maze[0].length * TILE_SIZE) / 2;
    const offsetY = (canvasHeight - maze.length * TILE_SIZE) / 2;

    for (let row = 0; row < maze.length; ++row) {
      for (let col = 0; col < maze[row].length; ++col) {
        const x = Math.floor(offsetX + col * TILE_SIZE);
        const y = Math.floor(offsetY + row * TILE_SIZE);
        if (maze[row][col] === "#") {
          ctx.fillStyle = colors.wall;
        } else {
          ctx.fillStyle = colors.path;
        }
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }

    drawOpenArrow(ctx, offsetX, offsetY + TILE_SIZE);
    drawOpenArrow(
      ctx,
      offsetX + (maze[0].length - 1) * TILE_SIZE,
      offsetY + (maze.length - 2) * TILE_SIZE,
    );
  };

  const generate = () => {
    const canvas = canvasRef.current!;

    const scale = window.devicePixelRatio;
    const canvasWidth = Math.floor(canvas.width / scale);
    const canvasHeight = Math.floor(canvas.height / scale);

    let mazeWidth = Math.floor(canvasWidth / TILE_SIZE);
    let mazeHeight = Math.floor(canvasHeight / TILE_SIZE);

    mazeWidth = mazeWidth % 2 === 0 ? mazeWidth - 1 : mazeWidth;
    mazeHeight = mazeHeight % 2 === 0 ? mazeHeight - 1 : mazeHeight;

    switch (algo) {
      case "randomized-dfs": {
        setMaze(generateMazeDFS(mazeWidth, mazeHeight));
        break;
      }
      case "randomized-kruskals": {
        setMaze(generateMazeKruskals(mazeWidth, mazeHeight));
        break;
      }
      case "wilsons": {
        setMaze(generateMazeWilsons(mazeWidth, mazeHeight));
        break;
      }
    }
  };

  const reset = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const { width, height } = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio;

    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale, scale);
  };

  useEffect(drawMaze, [maze]);

  useEffect(() => {
    const listener = () => {
      reset();
      generate();
    };

    listener();

    window.addEventListener("resize", listener);
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", listener);

    return () => {
      window.removeEventListener("resize", listener);
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", reset);
    };
  }, []);

  const algorithms: Record<string, string> = {
    "randomized-dfs": "Randomized DFS",
    "randomized-kruskals": "Randomized Kruskal's",
    wilsons: "Wilson's",
  };

  return (
    <div className="not-prose flex flex-col items-center gap-2">
      <div className="flex items-end gap-1">
        <div className="flex flex-col">
          <label htmlFor="algo-select">Choose an algorithm:</label>
          <select
            id="algo-select"
            className="rounded-sm border border-neutral-200 bg-transparent text-neutral-900 shadow-xs hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-800"
            value={algo}
            onChange={(e) => setAlgo(e.target.value)}
          >
            {Object.entries(algorithms).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={generate}>
          <RefreshCcw className="size-3.5" /> Generate
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        aria-label={`Maze generated with ${algorithms[algo]} algorithm`}
        className="h-[350px] w-full p-1"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

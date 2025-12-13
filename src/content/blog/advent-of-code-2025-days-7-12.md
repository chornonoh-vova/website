---
title: "Advent of Code 2025, part 2"
description: "My journey through AoC 2025, days 7-12"
date: 2025-12-13
---

This blog post is part 2 of the mini-series dedicated to the Advent of Code 2025.
The first part can be found [here](/blog/advent-of-code-2025-days-1-6).

I felt like the difficulty of the puzzles increased a lot the last couple of days
😅. But let's start with day 7.

## Day 7

On this day, we had to trace the beam and practice both BFS and DFS in action 😎

For the parsing it was incredibly easy - just parse the 2D grid as is:

```ts
const START = "S";
const SPLITTER = "^";

type Position = {
  row: number;
  col: number;
};

type Parsed = {
  grid: string[][];
  start: Position;
};

function parse(input: string): Parsed {
  const grid = input.split("\n").map((line) => line.split(""));

  const startCol = grid[0].indexOf(START);

  return {
    grid,
    start: { row: 0, col: startCol },
  };
}
```

There's one assumption here: that a starting point would always be in the first
row. I looked over the example and the actual input and it was the case in both
of them. Therefore I simplified the code a little bit 😁

For the actual first part I've decided to go with the BFS because it felt more natural
to me - basically, I was simulating the beams just as it was going through the grid.

```ts
function countBeamSplits({ grid, start }: Parsed) {
  let cnt = 0;

  let beams = [start];

  for (let i = 1; i < grid.length; ++i) {
    const nextBeams: Position[] = [];

    for (const { row, col } of beams) {
      const nextRow = row + 1;

      if (grid[row][col] === SPLITTER) {
        nextBeams.push({ row: nextRow, col: col - 1 });
        nextBeams.push({ row: nextRow, col: col + 1 });
        cnt++;
      } else {
        nextBeams.push({ row: nextRow, col });
      }
    }

    beams = [];

    for (const { row, col } of nextBeams) {
      const foundIdx = beams.findIndex((b) => b.row === row && b.col === col);
      if (foundIdx === -1) {
        beams.push({ row, col });
      }
    }
  }

  return cnt;
}

console.log("part 1", countBeamSplits(parse(input)));
```

There's something that can be improved here - I'm deduplicating the `nextBeams`
collection by continuously running `findIndex` - which is inefficient and leads
to the `O(n^2)` runtime. But the solution ran pretty quickly even on large input
so I've decided to leave it as is.

For the second part we need to count all of the "timelines" of all the beams,
essentially the number of ways from the start all the way down.

I've used DFS this time, but with memoization, because without it, I would need
to explore trillions and trillions of paths, and it would take a lot of time.

```ts
function countTimelines({ grid, start }: Parsed) {
  const counts = new Map<string, number>();

  function dfs({ row, col }: Position) {
    if (row === grid.length) {
      return 1;
    }

    const key = `${row}-${col}`;

    if (counts.has(key)) {
      return counts.get(key)!;
    }

    let result: number;

    const nextRow = row + 1;

    if (grid[row][col] === SPLITTER) {
      result =
        dfs({ row: nextRow, col: col - 1 }) +
        dfs({ row: nextRow, col: col + 1 });
    } else {
      result = dfs({ row: nextRow, col });
    }

    counts.set(key, result);

    return result;
  }

  return dfs(start);
}

console.log("part 2", countTimelines(parse(input)));
```

## Day 8

Puzzle for the next day was awesome - and it was even in 3D!, here's a parsing
and type definition for it:

```ts
type Position = {
  x: number;
  y: number;
  z: number;
};

function parse(input: string): Position[] {
  return input.split("\n").map((line) => {
    const [x, y, z] = line.split(",").map(Number);
    return { x, y, z };
  });
}
```

Figuring out a distance between the points is a little bit involved, but I've
always struggled with math 😅

```ts
function distance(p: Position, q: Position) {
  return Math.sqrt(
    Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2) + Math.pow(p.z - q.z, 2),
  );
}
```

And the most difficult part was the solution itself (this time I solved it all
in one function). I spent a lot of time figuring out how to represent networks
and how to merge them.

```ts
function first<K, V>(map: Map<K, V>): V {
  return map.values().next().value;
}

function solution(input: string, iterations: number) {
  const boxes = parse(input);

  const n = boxes.length;

  const minDistances: { boxes: [number, number]; distance: number }[] = [];

  for (let i = 0; i < n; ++i) {
    for (let j = i + 1; j < n; ++j) {
      minDistances.push({
        boxes: [i, j],
        distance: distance(boxes[i], boxes[j]),
      });
    }
  }

  minDistances.sort((a, b) => b.distance - a.distance);

  let id = 0;

  const powered = new Array(n).fill(false);

  const networks = new Map<number, Set<number>>();
  const boxToNetwork = new Map<number, number>();

  let box1 = -1,
    box2 = -1;

  while (
    iterations > 0 ||
    networks.size > 1 ||
    first(networks).size !== boxes.length
  ) {
    const min = minDistances.pop()!;
    [box1, box2] = min.boxes;

    if (powered[box1] && powered[box2]) {
      const network1 = boxToNetwork.get(box1)!;
      const network2 = boxToNetwork.get(box2)!;

      if (network1 !== network2) {
        for (const pos2 of networks.get(network2)!) {
          networks.get(network1)!.add(pos2);
          boxToNetwork.set(pos2, network1);
        }

        networks.delete(network2);
      }
    } else if (boxToNetwork.has(box1) || boxToNetwork.has(box2)) {
      powered[box1] = true;
      powered[box2] = true;

      const networkId = (boxToNetwork.get(box1) ?? boxToNetwork.get(box2))!;

      networks.get(networkId)!.add(box1);
      networks.get(networkId)!.add(box2);

      boxToNetwork.set(box1, networkId);
      boxToNetwork.set(box2, networkId);
    } else {
      powered[box1] = true;
      powered[box2] = true;

      const networkId = id++;

      networks.set(networkId, new Set([box1, box2]));

      boxToNetwork.set(box1, networkId);
      boxToNetwork.set(box2, networkId);
    }

    iterations--;

    if (iterations === 0) {
      const networksSnapshot = Array.from(networks.values());
      networksSnapshot.sort((a, b) => b.size - a.size);

      let part1 = 1;
      for (let i = 0; i < 3; ++i) {
        part1 *= networksSnapshot[i].size;
      }

      console.log("part 1", part1);
    }
  }

  console.log("part 2", boxes[box1].x * boxes[box2].x);
}

solution(input, iterations);
```

And this solution while not looking pretty, works surprisingly fast, and I started
wondering, is there a better approach to this problem? And turns out - there is!

In hindsight, this is essentially Kruskal’s algorithm for building a minimum spanning
forest - except I reimplemented the "union" logic manually instead of using DSU.

I actually wrote about it in the [Maze Generation Algorithms](/blog/maze-generation-algorithms)
blog post.

Unfortunately, I couldn't see that this data structure is perfect for this problem.
I think that I come back later to this problem to solve it "properly". Additionally,
it will be a great practice implementing this data structure.

## Day 9

Day 9 and day 10 were the hardest ones for me - I solved the first part really
quickly. But I just couldn't figure out the second part.

```ts
type Point = [number, number];

function parse(input: string): Point[] {
  return input.split("\n").map((line) => {
    const [x, y] = line.split(",").map(Number);
    return [x, y];
  });
}

function area([x1, y1]: Point, [x2, y2]: Point): number {
  const width = Math.abs(x1 - x2) + 1;
  const height = Math.abs(y1 - y2) + 1;
  return width * height;
}

function findMaxArea(input: string) {
  const points = parse(input);

  let maxArea = -Infinity;

  for (let i = 0; i < points.length - 1; ++i) {
    for (let j = i + 1; j < points.length; ++j) {
      maxArea = Math.max(maxArea, area(points[i], points[j]));
    }
  }

  return maxArea;
}

console.log("part 1", findMaxArea(input));
```

In the example above the code is pretty simple - just looking at max areas of all
possible pairs of points. But the second part adds a simple condition that makes
it so much harder - now we can only look for triangles inside of some polygon.

Thanks to my colleague we were able to write a hacky solution based on a lot of
math around intersections of lines idea that we had.

By researching later I found that this problem is pretty common in game development,
and the simple way to solve it is ray casting. Essentially, when we cast a ray from
some point we can count the number of intersections with the polygon, and if it's
odd, then the point is inside, if there are not intersections or number of them
is even - point is outside of the polygon.

Well, this is day #2 that I need to come back to later.

## Day 10

I liked this day a lot! I'm pretty proud of my solution for the part 1, even though
I wasn't able to solve the part 2 myself.

```ts
type LightState = {
  lights: number;
  presses: number;
};

class Machine {
  requiredLights: number;
  lightButtons: number[];

  constructor(requiredLights: number, lightButtons: number[]) {
    this.requiredLights = requiredLights;
    this.lightButtons = lightButtons;
  }

  minLightButtonPresses() {
    const best = new Map<number, number>();
    const queue = new PriorityQueue<LightState>(
      (a, b) => a.presses - b.presses,
      [{ lights: 0, presses: 0 }],
    );

    while (!queue.isEmpty()) {
      const { lights, presses } = queue.dequeue()!;

      if (lights === this.requiredLights) return presses;

      if (best.has(lights) && best.get(lights)! <= presses) continue;

      best.set(lights, presses);

      for (const button of this.lightButtons) {
         queue.enqueue({
          lights: lights ^ button,
          presses: presses + 1,
        });
      }
    }

    return -1;
  }
}

function parse(input: string): Machine[] {
  const lines = input.split("\n");

  const machines: Machine[] = [];

  for (const line of lines) {
    const parts = line.split(" ");

    let requiredLights = 0;
    const lightsString = parts[0].substring(1, parts[0].length - 1);

    for (let i = 0; i < lightsString.length; ++i) {
      if (lightsString[i] === "#") {
        requiredLights |= 1 << i;
      }
    }

    const lightButtons: number[] = [];
    const joltageButtons: number[][] = [];

    for (let i = 1; i < parts.length; ++i) {
      const part = parts[i];

      if (part.startsWith("(") && part.endsWith(")")) {
        let lightButton = 0;
        part
          .substring(1, part.length - 1)
          .split(",")
          .map(Number)
          .forEach((idx) => {
            lightButton |= 1 << idx;
          });

        lightButtons.push(lightButton);
      }
    }

    machines.push(new Machine(requiredLights, lightButtons));
  }

  return machines;
}

function countMinLightButtonPresses(machines: Machine[]) {
  return machines.reduce(
    (prev, curr) => prev + curr.minLightButtonPresses(),
    0,
  );
}

console.log("part 1", countMinLightButtonPresses(parse(input)));
```

I've implemented Dijkstra's algorithm here. And I've also utilized the bit
representation of the lights state here. Adding lights to the requirements became
the bit shift and OR. Each button press became XOR and checking for the
requirements is just a single comparison. Neat!

I thought that my approach would work for the part 2, but there's no chance it
would have completed in a thousands of years 🥲

Turns out this is a math problem:
each joltage requirement and button presses becomes a equation. And we need to
solve the system of these equations to get an answer. I went on Reddit in
the hopes of finding the solution there - and I did. But unfortunately, a lot of
folks used python and some library called Z3. And while it gives the correct answer,
looks like there's a lot of ground in math I need to cover in order to
understand it.

This makes the day #3 that I need to come back to.

## Day 11

Thankfully day 11 was a breeze - I've managed to complete it pretty quickly with
the help of my trusty DFS once again.

Here's how I parsed the graph (I've added a couple of command-line args for part
2):

```ts
const start = argv[3] || "you";
const required1 = argv[4];
const required2 = argv[5];

const input = (await readFile(filename, "utf-8")).trim();

const OUT = "out";

function parse(input: string) {
  const graph = new Map<string, string[]>();

  for (const line of input.split("\n")) {
    const parts = line.split(" ");
    graph.set(parts[0].substring(0, parts[0].length - 1), parts.slice(1));
  }

  return graph;
}
```

The DFS is essentially the same as in Day 7 part 2:

```ts
function countPaths(input: string) {
  const graph = parse(input);

  const memo = new Map<string, number>();

  function dfs(curr: string): number {
    if (curr === OUT) return 1;

    if (memo.has(curr)) {
      return memo.get(curr)!;
    }

    let total = 0;

    for (const next of graph.get(curr)!) {
      total += dfs(next);
    }

    memo.set(curr, total);

    return total;
  }

  return dfs(start);
}

console.log("part 1", countPaths(input));
```

But part 2 involves a little trick for caching:

```ts
function countPathsWithRequired(input: string) {
  const graph = parse(input);

  const memo = new Map<string, number>();

  function dfs(curr: string, has1: boolean, has2: boolean): number {
    if (curr === OUT) {
      return Number(has1 && has2);
    }

    const key = `${curr}|${has1}|${has2}`;

    if (memo.has(key)) return memo.get(key)!;

    const next1 = has1 || curr === required1;
    const next2 = has2 || curr === required2;

    let total = 0;

    for (const next of graph.get(curr)!) {
      total += dfs(next, next1, next2);
    }

    memo.set(key, total);

    return total;
  }

  return dfs(start, false, false);
}

console.log("part 2", countPathsWithRequired(input));
```

I found out the hard way that trying to remember the whole path is pretty
memory-intense. And checking the requirements in this array is inefficient as
well - because we need to check every element in the array. Therefore I'm just
storing two booleans in the params and memoizing based on them - this drastically
improves memory usage and runtime performance.

## Day 12

Day 12 was ... something else. When I initially read it I was shocked, I didn't
even know how to approach it. But I did some brain-storming with my friends and
just kept on unrolling the problem:

- parsing the elements and the regions
- doing a quick check for the total area needed
- generating rotations and flips of elements for all of the possible positions
  in a region
- transforming those positions into bitmasks for a quick overlap checks (turns
  out, you can do bitwise operations on BigInts in JS)
- implementing the core algorithm - backtracking placement of the elements

```ts
type Cell = {
  row: number;
  col: number;
};

type Region = {
  width: number;
  height: number;
  counts: Map<number, number>;
};

function parse(input: string) {
  const elements: Cell[][] = [];
  const regions: Region[] = [];

  const lines = input.split("\n\n");

  for (const line of lines) {
    if (line.match(/^\d:/)) {
      const elementStr = line
        .substring(3)
        .split("\n")
        .map((l) => l.split(""));
      const element: Cell[] = [];
      for (let row = 0; row < elementStr.length; ++row) {
        for (let col = 0; col < elementStr[row].length; ++col) {
          if (elementStr[row][col] === "#") {
            element.push({ row, col });
          }
        }
      }
      elements.push(element);
    } else {
      for (const regionStr of line.split("\n")) {
        const [size, required] = regionStr.split(": ");
        const [width, height] = size.split("x").map(Number);
        const counts = new Map<number, number>();

        const presentCounts = required.split(" ").map(Number);

        for (let i = 0; i < presentCounts.length; ++i) {
          counts.set(i, presentCounts[i]);
        }

        regions.push({
          width,
          height,
          counts,
        });
      }
    }
  }

  return { elements, regions };
}

function rotate(element: Cell[]) {
  const maxRow = Math.max(...element.map((c) => c.row));

  return element.map(({ row, col }) => ({
    row: col,
    col: maxRow - row,
  }));
}

function flipHorizontal(element: Cell[]) {
  const minCol = Math.min(...element.map((c) => c.col));
  const maxCol = Math.max(...element.map((c) => c.col));

  return element.map(({ row, col }) => ({
    row,
    col: maxCol - (col - minCol),
  }));
}

function generateRotations(element: Cell[]) {
  const result: Cell[][] = [];

  let current = element;

  for (let r = 0; r < 4; ++r) {
    result.push(current);
    result.push(flipHorizontal(current));

    current = rotate(current);
  }

  return result;
}

function generatePlacements({ width, height }: Region, element: Cell[]) {
  const placements: bigint[] = [];

  const maxRow = Math.max(...element.map((c) => c.row));
  const maxCol = Math.max(...element.map((c) => c.col));

  for (let row = 0; row + maxRow < height; ++row) {
    for (let col = 0; col + maxCol < width; ++col) {
      let mask = 0n;

      for (const c of element) {
        const id = BigInt((row + c.row) * width + (col + c.col));
        mask |= 1n << id;
      }

      placements.push(mask);
    }
  }

  return placements;
}

function isValidRegion(region: Region, elements: Cell[][]) {
  console.log("checking: ", region.width + "x" + region.height, region.counts);
  const regionSize = region.width * region.height;

  let elementsSize = 0;

  for (const [elementIdx, elementRequired] of region.counts) {
    if (!elementRequired) continue;

    const element = elements[elementIdx];
    const elementSize = element.length;
    elementsSize += elementSize * elementRequired;
  }

  if (regionSize < elementsSize) {
    console.log("valid:", false);
    return false;
  }

  const variants = new Map<number, Set<bigint>>();

  for (const [elementIdx, elementRequired] of region.counts) {
    if (!elementRequired) continue;

    const element = elements[elementIdx];
    const rotations = generateRotations(element);
    const placements = new Set<bigint>();

    for (const rotation of rotations) {
      generatePlacements(region, rotation).forEach((placement) => {
        placements.add(placement);
      });
    }

    variants.set(elementIdx, placements);
  }

  const instances: { shape: number }[] = [];
  for (const [shape, counts] of region.counts) {
    for (let c = 0; c < counts; ++c) {
      instances.push({ shape });
    }
  }

  instances.sort((a, b) => elements[b.shape].length - elements[a.shape].length);

  function backtrack(idx: number, occupied: bigint) {
    if (idx === instances.length) return true;

    const shape = instances[idx].shape;
    const options = variants.get(shape)!;

    for (const mask of options) {
      if ((mask & occupied) !== 0n) continue;

      if (backtrack(idx + 1, occupied | mask)) {
        return true;
      }
    }

    return false;
  }

  const valid = backtrack(0, 0n);
  console.log("valid:", valid);
  return valid;
}

function part1(input: string) {
  const { elements, regions } = parse(input);

  let count = 0;

  for (const region of regions) {
    if (isValidRegion(region, elements)) {
      count++;
    }
  }

  return count;
}

console.log("part 1", part1(input));
```

After all of this code - it just worked first try! I couldn't believe it!

This was probably the most complicated thing that I wrote in a long time - so many
hard concepts crammed into a single practical task, that's why I love Advent of
Code!

I already have at least three days I want to revisit, and I’m sure I’ll learn
even more the second time around.

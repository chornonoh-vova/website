import { useRef, useState } from "react";

const links: [string, string][] = [
  ["kh", "tc"],
  ["qp", "kh"],
  ["de", "cg"],
  ["ka", "co"],
  ["yn", "aq"],
  ["qp", "ub"],
  ["cg", "tb"],
  ["vc", "aq"],
  ["tb", "ka"],
  ["wh", "tc"],
  ["yn", "cg"],
  ["kh", "ub"],
  ["ta", "co"],
  ["de", "co"],
  ["tc", "td"],
  ["tb", "wq"],
  ["wh", "td"],
  ["ta", "ka"],
  ["td", "qp"],
  ["aq", "cg"],
  ["wq", "ub"],
  ["ub", "vc"],
  ["de", "ta"],
  ["wq", "aq"],
  ["wq", "vc"],
  ["wh", "yn"],
  ["ka", "de"],
  ["kh", "ta"],
  ["co", "tc"],
  ["wh", "qp"],
  ["tb", "vc"],
  ["td", "yn"],
];

class Graph {
  #vertices: Set<string>;
  #edges: Map<string, Set<string>>;

  constructor(links: [string, string][]) {
    this.#vertices = new Set();
    this.#edges = new Map();

    for (const [a, b] of links) {
      this.#vertices.add(a);
      this.#vertices.add(b);

      if (!this.#edges.has(a)) {
        this.#edges.set(a, new Set());
      }
      if (!this.#edges.has(b)) {
        this.#edges.set(b, new Set());
      }
      this.#edges.get(a)!.add(b);
      this.#edges.get(b)!.add(a);
    }
  }

  getNeighbors(vertex: string): string[] {
    return Array.from(this.#edges.get(vertex) ?? []);
  }

  get3Cliques(vertex: string): string[][] {
    const neighbors = this.getNeighbors(vertex);

    const cliques: string[][] = [];

    for (let i = 0; i < neighbors.length; ++i) {
      for (let j = 0; j < neighbors.length; ++j) {
        if (i === j) continue;

        const a = neighbors[i];
        const b = neighbors[j];

        if (this.#edges.get(a)?.has(b)) {
          cliques.push([vertex, a, b]);
        }
      }
    }

    return cliques;
  }

  getMaxClique(vertex: string): string[] {
    const cliques: string[][] = [];

    const bronKerbosh = (r: Set<string>, p: Set<string>, x: Set<string>) => {
      if (p.size === 0 && x.size === 0) {
        cliques.push(Array.from(r));
        return;
      }

      for (const v of Array.from(p)) {
        const neighbors = new Set(this.getNeighbors(v));
        bronKerbosh(
          new Set([...r, v]),
          new Set([...p].filter((u) => neighbors.has(u))),
          new Set([...x].filter((u) => neighbors.has(u))),
        );
        p.delete(v);
        x.add(v);
      }
    };

    bronKerbosh(
      // Start search from given vertex
      new Set([vertex]),
      // Consider only neighbors of the given vertex, no need to consider all
      new Set(this.getNeighbors(vertex)),
      new Set(),
    );

    let maxClique: string[] = [];
    for (const clique of cliques) {
      if (clique.length > maxClique.length) {
        maxClique = clique;
      }
    }

    return maxClique;
  }
}

export const LANGraph = ({
  mode = "neighbors",
}: {
  mode?: "neighbors" | "3-clique" | "max-clique";
}) => {
  const graph = useRef(new Graph(links));

  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

  const highlight = "fill-lime-400 stroke-lime-400";
  const noHighlight =
    "fill-neutral-900 stroke-neutral-900 dark:fill-neutral-50 dark:stroke-neutral-50";

  const pointerEnter = (vertex: string) => {
    const allNodes = new Set<string>();
    const allEdges = new Set<string>();

    const addEdge = (v1: string, v2: string) => {
      allEdges.add(`${v1}--${v2}`);
      allEdges.add(`${v2}--${v1}`);
    };

    if (mode === "neighbors") {
      allNodes.add(vertex);

      const neighbors = graph.current.getNeighbors(vertex);

      for (const neighbor of neighbors) {
        allNodes.add(neighbor);
        addEdge(vertex, neighbor);
      }
    }

    if (mode === "3-clique") {
      const cliques = graph.current.get3Cliques(vertex);

      for (const clique of cliques) {
        for (let i = 0; i < clique.length; ++i) {
          allNodes.add(clique[i]);
          for (let j = 0; j < clique.length; ++j) {
            if (i === j) continue;
            addEdge(clique[i], clique[j]);
          }
        }
      }
    }

    if (mode === "max-clique") {
      const clique = graph.current.getMaxClique(vertex);

      for (let i = 0; i < clique.length; ++i) {
        allNodes.add(clique[i]);
        for (let j = 0; j < clique.length; ++j) {
          if (i === j) continue;
          addEdge(clique[i], clique[j]);
        }
      }
    }

    setHighlightedNodes(Array.from(allNodes));
    setHighlightedEdges(Array.from(allEdges));
  };

  const pointerLeave = () => {
    setHighlightedNodes([]);
    setHighlightedEdges([]);
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 134.63 72">
      <g className="graph" transform="matrix(.77965 0 0 .77965 3.119 68.882)">
        <g
          onPointerEnter={() => pointerEnter("kh")}
          onPointerLeave={pointerLeave}
        >
          <title>kh</title>
          <circle
            cx="98.12"
            cy="-48.36"
            r="1.8"
            className={
              highlightedNodes.includes("kh") ? highlight : noHighlight
            }
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("tc")}
          onPointerLeave={pointerLeave}
        >
          <title>tc</title>
          <circle
            cx="124.99"
            cy="-66.67"
            r="1.8"
            className={
              highlightedNodes.includes("tc") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>kh--tc</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("kh--tc") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M99.89-49.56c4.85-3.31 18.39-12.54 23.3-15.88"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("ub")}
          onPointerLeave={pointerLeave}
        >
          <title>ub</title>
          <circle
            cx="93.88"
            cy="-10.75"
            r="1.8"
            className={
              highlightedNodes.includes("ub") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>kh--ub</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("kh--ub") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="m97.89-46.34-3.76 33.37"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("ta")}
          onPointerLeave={pointerLeave}
        >
          <title>ta</title>
          <circle
            cx="71.72"
            cy="-82.55"
            r="1.8"
            className={
              highlightedNodes.includes("ta") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>kh--ta</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("kh--ta") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M96.99-49.83c-4.27-5.52-19.32-25.02-23.92-30.98"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("td")}
          onPointerLeave={pointerLeave}
        >
          <title>td</title>
          <circle
            cx="154.78"
            cy="-53.83"
            r="1.8"
            className={
              highlightedNodes.includes("td") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>tc--td</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("tc--td") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M126.95-65.83c5.38 2.32 20.39 8.8 25.82 11.14"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("qp")}
          onPointerLeave={pointerLeave}
        >
          <title>qp</title>
          <circle
            cx="141.45"
            cy="-23.1"
            r="1.8"
            className={
              highlightedNodes.includes("qp") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>qp--kh</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("qp--kh") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M139.58-24.18c-7.12-4.16-32.62-19.03-39.65-23.13"
          />
        </g>
        <g className="edge">
          <title>qp--ub</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("qp--ub") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M139.4-22.57c-7.82 2.03-35.82 9.3-43.54 11.3"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("de")}
          onPointerLeave={pointerLeave}
        >
          <title>de</title>
          <circle
            cx="22.78"
            cy="-77.38"
            r="1.8"
            className={
              highlightedNodes.includes("de") ? highlight : noHighlight
            }
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("cg")}
          onPointerLeave={pointerLeave}
        >
          <title>cg</title>
          <circle
            cx="41.55"
            cy="-42.95"
            r="1.8"
            className={
              highlightedNodes.includes("cg") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>de--cg</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("de--cg") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M23.79-75.53c3.29 6.03 13.67 25.08 16.83 30.89"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("co")}
          onPointerLeave={pointerLeave}
        >
          <title>co</title>
          <circle
            cx="57.48"
            cy="-69.29"
            r="1.8"
            className={
              highlightedNodes.includes("co") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>de--co</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("de--co") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="m24.65-76.95 30.78 7.18"
          />
        </g>
        <g className="edge">
          <title>de--ta</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("de--ta") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M24.88-77.61c8.05-.85 36.86-3.89 44.8-4.72"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("tb")}
          onPointerLeave={pointerLeave}
        >
          <title>tb</title>
          <circle
            cx="1.8"
            cy="-32.79"
            r="1.8"
            className={
              highlightedNodes.includes("tb") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>cg--tb</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("cg--tb") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M39.41-42.4c-6.97 1.78-28.95 7.4-35.65 9.11"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("ka")}
          onPointerLeave={pointerLeave}
        >
          <title>ka</title>
          <circle
            cx="5.28"
            cy="-62.18"
            r="1.8"
            className={
              highlightedNodes.includes("ka") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>ka--de</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("ka--de") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M6.9-63.58c3.38-2.94 11.17-9.71 14.42-12.53"
          />
        </g>
        <g className="edge">
          <title>ka--co</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("ka--co") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M7.52-62.48c8.59-1.17 39.31-5.36 47.78-6.52"
          />
        </g>
        <g className="edge">
          <title>co--tc</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("co--tc") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M59.72-69.21c10.44.41 54.06 2.1 63.48 2.47"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("yn")}
          onPointerLeave={pointerLeave}
        >
          <title>yn</title>
          <circle
            cx="105.2"
            cy="-31"
            r="1.8"
            className={
              highlightedNodes.includes("yn") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>yn--cg</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("yn--cg") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M103.08-31.4c-9.66-1.81-49.53-9.29-59.34-11.14"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("aq")}
          onPointerLeave={pointerLeave}
        >
          <title>aq</title>
          <circle
            cx="53.58"
            cy="-20.62"
            r="1.8"
            className={
              highlightedNodes.includes("aq") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>yn--aq</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("yn--aq") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M102.98-30.56c-8.49 1.71-38.87 7.82-47.25 9.51"
          />
        </g>
        <g className="edge">
          <title>aq--cg</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("aq--cg") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M52.64-22.37c-2.22-4.11-7.74-14.36-10.05-18.64"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("vc")}
          onPointerLeave={pointerLeave}
        >
          <title>vc</title>
          <circle
            cx="13.93"
            cy="-12.18"
            r="1.8"
            className={
              highlightedNodes.includes("vc") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>ub--vc</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("ub--vc") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M91.9-10.79c-10.96-.19-64.25-1.15-75.77-1.35"
          />
        </g>
        <g className="edge">
          <title>tb--ka</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("tb--ka") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M2.03-34.71c.63-5.32 2.38-20.13 3.02-25.49"
          />
        </g>
        <g className="edge">
          <title>tb--vc</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("tb--vc") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M2.92-30.88c2.34 3.98 7.74 13.15 9.99 16.98"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("wq")}
          onPointerLeave={pointerLeave}
        >
          <title>wq</title>
          <circle
            cx="46.87"
            cy="-1.8"
            r="1.8"
            className={
              highlightedNodes.includes("wq") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>tb--wq</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("tb--wq") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M3.3-31.75c6.84 4.7 35.07 24.11 42.02 28.88"
          />
        </g>
        <g className="edge">
          <title>vc--aq</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("vc--aq") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M16.06-12.64c6.95-1.47 28.88-6.14 35.57-7.56"
          />
        </g>
        <g
          className="node"
          onPointerEnter={() => pointerEnter("wh")}
          onPointerLeave={pointerLeave}
        >
          <title>wh</title>
          <circle
            cx="162.88"
            cy="-38.35"
            r="1.8"
            className={
              highlightedNodes.includes("wh") ? highlight : noHighlight
            }
          />
        </g>
        <g className="edge">
          <title>wh--tc</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("wh--tc") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M161.25-39.56c-6.23-4.66-28.53-21.33-34.68-25.93"
          />
        </g>
        <g className="edge">
          <title>wh--qp</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("wh--qp") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M161.2-37.15c-3.95 2.81-13.79 9.81-17.9 12.73"
          />
        </g>
        <g className="edge">
          <title>wh--yn</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("wh--yn") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M160.96-38.1c-8.68 1.1-44.24 5.63-53.53 6.81"
          />
        </g>
        <g className="edge">
          <title>wh--td</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("wh--td") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="m161.89-40.24-6.11-11.67"
          />
        </g>
        <g className="edge">
          <title>ta--ka</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("ta--ka") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M69.81-81.96C60.1-78.99 16.5-65.62 7.08-62.73"
          />
        </g>
        <g className="edge">
          <title>ta--co</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("ta--co") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M70.41-81.33c-2.65 2.47-8.6 8-11.41 10.62"
          />
        </g>
        <g className="edge">
          <title>td--qp</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("td--qp") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M153.9-51.81c-2.41 5.56-9.13 21.04-11.56 26.65"
          />
        </g>
        <g className="edge">
          <title>td--yn</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("td--yn") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M153.13-53.07c-7.53 3.47-38.58 17.76-46.22 21.28"
          />
        </g>
        <g className="edge">
          <title>wq--aq</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("wq--aq") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M47.59-3.81c1.3-3.64 4.02-11.28 5.3-14.86"
          />
        </g>
        <g className="edge">
          <title>wq--ub</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("wq--ub") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M48.89-2.18c7.73-1.48 35.4-6.75 43.03-8.2"
          />
        </g>
        <g className="edge">
          <title>wq--vc</title>
          <path
            fill="none"
            className={
              highlightedEdges.includes("wq--vc") ? highlight : noHighlight
            }
            stroke-opacity=".5"
            d="M44.71-2.48c-6.07-1.91-23.2-7.31-28.9-9.11"
          />
        </g>
      </g>
    </svg>
  );
};

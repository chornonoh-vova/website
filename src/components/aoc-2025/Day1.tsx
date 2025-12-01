import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button } from "../ui/Button";

const TICK_COUNT = 100;
const RADIUS = 220;
const TICK_LENGTH = 10;
const LABEL_OFFSET = 10;

const TICKS = Array.from({ length: TICK_COUNT }).map((_, i) => {
  const angle = (360 / TICK_COUNT) * i - 90;
  const rad = (angle * Math.PI) / 180;

  return {
    angle,
    tick: {
      x1: (Math.cos(rad) * RADIUS).toPrecision(3),
      y1: (Math.sin(rad) * RADIUS).toPrecision(3),
      x2: (Math.cos(rad) * (RADIUS - TICK_LENGTH)).toPrecision(3),
      y2: (Math.sin(rad) * (RADIUS - TICK_LENGTH)).toPrecision(3),
    },
    label: {
      x: (Math.cos(rad) * (RADIUS + LABEL_OFFSET)).toPrecision(3),
      y: (Math.sin(rad) * (RADIUS + LABEL_OFFSET)).toPrecision(3),
    },
  };
});

type Direction = "L" | "R";

class Safe {
  dial: number;
  part1: number;
  part2: number;

  constructor(initial = 50) {
    this.dial = initial;
    this.part1 = 0;
    this.part2 = 0;
  }

  turn(
    direction: Direction,
    amount: number,
    callback?: (dial: number, part1: number, part2: number) => void,
  ) {
    const dir = direction === "L" ? -1 : 1;

    for (let i = 0; i < amount; ++i) {
      this.dial += dir;
      this.dial %= 100;

      if (!this.dial) {
        this.part2++;
      }
      callback?.(this.dial, this.part1, this.part2);
    }

    if (!this.dial) {
      this.part1++;
    }
    callback?.(this.dial, this.part1, this.part2);
  }
}

const DIAL_DEFAULT = 50;

export function Day1() {
  const [instructions, setInstructions] = useState<string[]>([]);
  const [dial, setDial] = useState(DIAL_DEFAULT);
  const [part1, setPart1] = useState(0);
  const [part2, setPart2] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [data, setData] = useState<[string, number, number, number][]>([]);

  const safe = useMemo(() => new Safe(), []);

  const anglePerTick = 360 / TICK_COUNT;
  const dialAngle = dial * anglePerTick;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length === 1) {
      setInstructions((await e.target.files[0].text()).trim().split("\n"));
      setDial(DIAL_DEFAULT);
      setInstruction("");
      setPart1(0);
      setPart2(0);
      setData([]);
    }
  };

  const simulate = () => {
    safe.dial = DIAL_DEFAULT;
    safe.part1 = 0;
    safe.part2 = 0;

    const gen: [string, number, number, number][] = [];
    for (const instruction of instructions) {
      const direction = instruction.substring(0, 1) as Direction;
      const amount = parseInt(instruction.substring(1));

      safe.turn(direction, amount, (dial, part1, part2) => {
        gen.push([instruction, dial, part1, part2]);
      });
    }

    setData(gen);
  };

  useEffect(() => {
    let dialsIdx = 0;
    const intervalId = setInterval(() => {
      if (dialsIdx === data.length) {
        return;
      }

      const [currInstruction, currDial, currPart1, currPart2] = data[dialsIdx];
      setInstruction(currInstruction);
      setDial(currDial);
      setPart1(currPart1);
      setPart2(currPart2);
      dialsIdx++;
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [data]);

  return (
    <div className="not-prose mx-auto flex max-w-[500px] flex-col items-center gap-2">
      <div className="flex flex-col gap-2 rounded-md border border-neutral-200 p-2 dark:border-neutral-700">
        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          <input
            className="h-full rounded-md px-2"
            type="file"
            onChange={handleFileChange}
          />

          {instructions.length !== 0 && (
            <Button onClick={simulate}>Simulate</Button>
          )}
        </div>

        {data.length !== 0 && (
          <code>
            Current instruction: {instruction}
            <br />
            Part 1: {part1}
            <br />
            Part 2: {part2}
          </code>
        )}
      </div>

      <svg width="100%" height="100%" viewBox="0 0 500 500">
        <g transform="translate(250,250)">
          {TICKS.map((t, i) => {
            return (
              <g key={i}>
                <line {...t.tick} className="stroke-black dark:stroke-white" />
                <text
                  {...t.label}
                  fontSize={10}
                  className="fill-black dark:fill-white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {i}
                </text>
              </g>
            );
          })}

          <line
            x1={0}
            y1={0}
            y2={-(RADIUS - 15)}
            x2={0}
            stroke="red"
            strokeWidth={2}
            transform={`rotate(${dialAngle})`}
          />
        </g>
      </svg>
    </div>
  );
}

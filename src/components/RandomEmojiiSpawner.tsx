import { useState } from "react";
import { Button } from "./ui/Button";
import { BrushCleaning } from "lucide-react";

const EMOJIIS = [
  "⚡️",
  "🚀",
  "🤩",
  "👻",
  "😼",
  "🐶",
  "🍕",
  "💰",
  "❤️‍🔥",
  "🇺🇦",
  "🎁",
];

function getRandomEmojii() {
  return EMOJIIS[Math.floor(Math.random() * EMOJIIS.length)];
}

const MIN = 5;
const MAX = 10;

function getRandomCount() {
  return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

type Emojii = [string, string, string];

export function RandomEmojiiSpawner() {
  const [inert, setInert] = useState(true);
  const [emojiis, setEmojiis] = useState<Emojii[]>([]);

  let addLabel = "Add some emojiis!";

  if (emojiis.length >= 100) {
    addLabel = "More emojiis!!!!";
  }

  if (emojiis.length >= 500) {
    addLabel = "MOREEE!!!!!!!!";
  }

  const spawn = () => {
    const emojiisToAdd: Emojii[] = [];

    const n = getRandomCount();

    for (let i = 0; i < n; ++i) {
      const top = Math.floor(Math.random() * 100);
      const left = Math.floor(Math.random() * 100);
      emojiisToAdd.push([getRandomEmojii(), `${top}%`, `${left}%`]);
    }

    setEmojiis((prev) => [...prev, ...emojiisToAdd]);
  };

  const clear = () => {
    setEmojiis([]);
  };

  return (
    <div className="not-prose relative h-[40vh] w-full touch-manipulation rounded-md border border-neutral-200 dark:border-neutral-700">
      <div
        className="absolute inset-0 m-2 border border-transparent"
        inert={inert}
      >
        {emojiis.map(([emojii, top, left], idx) => (
          <span
            key={idx}
            className="animate-fade-in absolute -translate-1/2 leading-none"
            style={{ top, left }}
          >
            {emojii}
          </span>
        ))}
      </div>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 flex-wrap gap-2">
        <div className="flex grow items-center gap-1 rounded-md bg-neutral-50/75 p-1 backdrop-blur-sm dark:bg-neutral-900/25">
          <input
            id="inert"
            type="checkbox"
            className="shrink-0 rounded-sm"
            checked={inert}
            onChange={(e) => setInert(e.target.checked)}
          />
          <label htmlFor="inert" className="text-sm/6 font-medium">
            Inert
          </label>
        </div>
        <div className="flex grow gap-1">
          <Button className="grow" onClick={spawn}>
            {addLabel}
          </Button>
          <Button title="Clear" onClick={clear}>
            <BrushCleaning className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "./ui/Button";
import { BrushCleaning } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const EMOJIS = [
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

function getRandomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

const MIN = 5;
const MAX = 10;

function getRandomCount() {
  return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

type Emoji = {
  id: string;
  emoji: string;
  top: string;
  left: string;
};

export function RandomEmojiSpawner() {
  const [inert, setInert] = useState(true);
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  let addLabel = "Add some emojis!";

  if (emojis.length >= 100) {
    addLabel = "More emojis!!!!";
  }

  if (emojis.length >= 500) {
    addLabel = "MOREEE!!!!!!!!";
  }

  const spawn = () => {
    const emojisToAdd: Emoji[] = [];

    const n = getRandomCount();

    for (let i = 0; i < n; ++i) {
      const top = Math.floor(Math.random() * 100);
      const left = Math.floor(Math.random() * 100);
      emojisToAdd.push({
        id: `${Date.now()}-${i}`,
        emoji: getRandomEmoji(),
        top: `${top}%`,
        left: `${left}%`,
      });
    }

    setEmojis((prev) => [...prev, ...emojisToAdd]);
  };

  const clear = () => {
    setEmojis([]);
  };

  return (
    <div className="not-prose relative h-[50vh] w-full touch-manipulation rounded-md border border-neutral-200 dark:border-neutral-700">
      <div
        className="absolute inset-0 m-2 border border-transparent"
        inert={inert}
      >
        <AnimatePresence>
          {emojis.map(({ id, emoji, top, left }) => (
            <motion.span
              key={id}
              className="absolute origin-center -translate-1/2 leading-none"
              style={{ top, left }}
              transition={{ type: "spring", bounce: 0.5 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              {emoji}
            </motion.span>
          ))}
        </AnimatePresence>
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

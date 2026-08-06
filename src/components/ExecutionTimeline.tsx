import clsx from "clsx";
import {
  Ban,
  CircleCheck,
  CircleX,
  Clock,
  LoaderCircle,
  type LucideIcon,
  Pause,
  Play,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import {
  Fragment,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  axisMax,
  calls,
  dispatched,
  endOf,
  increment,
  interruptedBy,
  interval,
  type RequestState,
  stateOf,
  type Task,
  tickStep,
  type TimelineEvent,
  totalOf,
  wastedBy,
} from "./execution";
import { logsOf, type Threading } from "./executionLogs";
import LogPanel from "./LogPanel";
import RequestProgress from "./RequestProgress";
import { Button } from "./ui/Button";
import { useMatchMedia } from "../hooks/useMatchMedia";

import styles from "./ExecutionTimeline.module.css";

const icons: Record<RequestState, { Icon: LucideIcon; className: string }> = {
  pending: { Icon: Clock, className: "text-neutral-500 dark:text-neutral-400" },
  active: {
    Icon: LoaderCircle,
    className: "text-blue-600 dark:text-blue-500",
  },
  done: {
    Icon: CircleCheck,
    className: "text-green-600 dark:text-green-500",
  },
  failed: { Icon: CircleX, className: "text-red-600 dark:text-red-500" },
  cancelled: { Icon: Ban, className: "text-neutral-500 dark:text-neutral-400" },
  wasted: {
    Icon: TriangleAlert,
    className: "text-amber-600 dark:text-amber-500",
  },
};

const speed = interval / increment;

const ticks = Array.from(
  { length: axisMax / tickStep },
  (_, idx) => idx * tickStep,
);

const axis = (
  <>
    <p>Time →</p>
    <div className="flex flex-row text-xs">
      {ticks.map((tick) => (
        <div
          key={tick}
          className="flex-1 border-neutral-200 border-l pl-0.5 dark:border-neutral-700"
        >
          {tick}
        </div>
      ))}
    </div>

    <hr className="col-span-full border-neutral-200 dark:border-neutral-700" />
  </>
);

export function CallList({ ordered = false }: { ordered?: boolean }) {
  const items = calls.map((call) => (
    <li key={call.key}>
      <strong>{call.key}</strong> takes <code>{call.duration}ms</code>
    </li>
  ));

  return ordered ? (
    <ol className="list-inside list-decimal">{items}</ol>
  ) : (
    <ul className="list-inside list-disc">{items}</ul>
  );
}

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

export default function ExecutionTimeline({
  id,
  tasks,
  title,
  summary,
  event,
  threading,
}: {
  id: string;
  tasks: Task[];
  title: string;
  summary: ReactNode;
  event?: TimelineEvent;
  threading: Threading;
}) {
  const total = totalOf(tasks, event);
  const reduced = useMatchMedia("(prefers-reduced-motion: reduce)");

  const logs = logsOf(tasks, threading, event);

  const [rawElapsed, setElapsed] = useState(0);
  const elapsed = reduced ? total : rawElapsed;
  const [playing, setPlaying] = useState(true);

  // Null through SSR: a `Date.now()` here wouldn't survive hydration.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);

  useEffect(() => setStartedAt(Date.now()), []);

  const finished = elapsed >= total;
  const failed = event !== undefined && elapsed >= event.at;

  const ranOn = event !== undefined && event.at !== total;

  useEffect(() => {
    if (finished || !playing) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsed((prev) => Math.min(prev + increment, total));
    }, interval);

    return () => clearInterval(intervalId);
  }, [finished, playing, total]);

  const onRestart = () => {
    setElapsed(0);
    setPlaying(true);
    setStartedAt(Date.now());
    setRunId((prev) => prev + 1);
  };

  const cause = tasks.find((task) => task.key === event?.cause);

  const { Icon: SummaryIcon, className: summaryClassName } =
    icons[failed ? "failed" : finished ? "done" : "active"];

  let description: string;

  if (!event) {
    description = `${title} finished in ${total} milliseconds.`;
  } else {
    const interrupted = tasks.filter((task) => interruptedBy(task, event));
    const discarded = tasks.filter((task) => wastedBy(task, event));
    const skipped = tasks.filter((task) => !dispatched(task, event));
    const clauses: string[] = [];

    if (interrupted.length > 0) {
      clauses.push(
        `stopping ${plural(interrupted.length, "call")} still in flight`,
      );
    }

    if (discarded.length > 0) {
      clauses.push(
        `while ${plural(discarded.length, "call")} ran on to ${total} milliseconds and had ${discarded.length === 1 ? "its result" : "their results"} discarded`,
      );
    }

    if (skipped.length > 0) {
      clauses.push(`and ${plural(skipped.length, "later call")} never started`);
    }

    description = `${title}: ${cause?.label} failed after ${event.at} milliseconds${clauses.length > 0 ? `, ${clauses.join(", ")}` : ""}.`;
  }

  return (
    <figure
      id={id}
      className="not-prose my-6 rounded-sm border border-neutral-200 p-2 text-sm dark:border-neutral-700"
      style={
        {
          "--play": startedAt !== null && playing ? "running" : "paused",
        } as CSSProperties
      }
    >
      <div aria-hidden="true" className="overflow-x-auto">
        <div
          key={runId}
          className="grid grid-cols-[9rem_minmax(20rem,1fr)] items-center gap-2"
        >
          {axis}

          {tasks.map((task) => {
            const state = stateOf(task, elapsed, event);
            const span = endOf(task, event) - task.start;
            const { Icon, className } = icons[state];

            const width = `${(span / axisMax) * 100}%`;

            return (
              <Fragment key={task.key}>
                <p className="flex flex-row items-center gap-1">
                  <Icon className={clsx("size-3.5 shrink-0", className)} />
                  {task.label}
                </p>
                <RequestProgress
                  state={state}
                  className={clsx(!reduced && styles.bar)}
                  style={
                    {
                      width: reduced ? width : undefined,
                      marginLeft: `${(task.start / axisMax) * 100}%`,
                      "--bar-span": width,
                      animationDelay: `${task.start * speed}ms`,
                      animationDuration: `${span * speed}ms`,
                    } as CSSProperties
                  }
                />
              </Fragment>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-row items-center justify-between gap-2 border-neutral-200 border-t pt-2 dark:border-neutral-700">
        <p aria-hidden="true" className="flex flex-row items-center gap-1">
          <SummaryIcon
            className={clsx("size-3.5 shrink-0", summaryClassName)}
          />
          <span>
            Total: <code>{elapsed}ms</code>
            {event && failed && ranOn && (
              <>
                {" "}
                · failed after <code>{event.at}ms</code>
              </>
            )}
          </span>
        </p>

        {!reduced && (
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              disabled={finished}
              onClick={() => setPlaying((prev) => !prev)}
            >
              {playing ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="size-3.5" />
              )}
              {playing ? "pause" : "play"}
            </Button>
            <Button variant="outline" onClick={onRestart}>
              <RotateCcw className="size-3.5" />
              restart
            </Button>
          </div>
        )}
      </div>

      <figcaption className="mt-2 space-y-1 border-neutral-200 border-t pt-2 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
        <p className="font-semibold">{title}</p>
        {summary}
      </figcaption>

      <LogPanel lines={logs} elapsed={elapsed} startedAt={startedAt} />

      {!reduced && (
        <p aria-live="polite" className="sr-only">
          {description}
        </p>
      )}
    </figure>
  );
}

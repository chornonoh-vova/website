import { formatLogLine, type LogLine } from "./executionLogs";
import clsx from "clsx";

export default function LogPanel({
  lines,
  elapsed,
  startedAt,
}: {
  lines: LogLine[];
  elapsed: number;
  startedAt: number | null;
}) {
  return (
    <details className="mt-2 border-neutral-200 border-t pt-2 dark:border-neutral-700">
      <summary className="cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
        Show logs
      </summary>

      <ol className="mt-2 max-h-56 overflow-auto rounded-md bg-neutral-100 p-2 font-mono text-xs dark:bg-neutral-800">
        {startedAt !== null &&
          lines
            .filter((line) => line.at <= elapsed)
            .map((line) => {
              const { time, level, thread, logger, message } = formatLogLine(
                line,
                startedAt,
              );
              const error = line.level === "ERROR";

              return (
                <li
                  key={`${line.at}-${line.message}`}
                  className={clsx(
                    "whitespace-pre",
                    error
                      ? "text-red-700 dark:text-red-400"
                      : "text-neutral-600 dark:text-neutral-400",
                  )}
                >
                  {time} {level} {thread} {logger} : {message}
                </li>
              );
            })}
      </ol>
    </details>
  );
}

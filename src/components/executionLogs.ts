import {
  completed,
  dispatched,
  increment,
  type Task,
  type TimelineEvent,
  totalOf,
} from "./execution";

export type LogLine = {
  at: number;
  level: "INFO" | "ERROR";
  thread: string;
  logger: string;
  message: string;
};

export type Threading = {
  request: string;
  worker: (index: number) => string;
};

const requestThread = "nio-8080-exec-1";

export const inlineThreads: Threading = {
  request: requestThread,
  worker: () => requestThread,
};

export const poolThreads: Threading = {
  request: "nio-8080-exec-2",
  worker: (index) => `onPool-worker-${index + 2}`,
};

export const virtualThreads: Threading = {
  request: "nio-8080-exec-9",
  worker: (index) => `virtual-${96 + index * 2}`,
};

const controller = "DashboardController";
const dispatcher = "DispatcherServlet";

export function logsOf(
  tasks: Task[],
  threading: Threading,
  event?: TimelineEvent,
): LogLine[] {
  const total = totalOf(tasks, event);

  const lines: LogLine[] = [
    {
      at: 0,
      level: "INFO",
      thread: threading.request,
      logger: controller,
      message: "Starting dashboard request",
    },
  ];

  tasks.forEach((task, index) => {
    if (!dispatched(task, event)) {
      return;
    }

    const thread = threading.worker(index);
    const logger = `${task.label}Service`;

    lines.push({
      at: task.start,
      level: "INFO",
      thread,
      logger,
      message: `Starting ${task.key} request`,
    });

    if (task.key !== event?.cause && completed(task, event)) {
      lines.push({
        at: task.start + task.duration,
        level: "INFO",
        thread,
        logger,
        message: `Finishing ${task.key} request`,
      });
    }
  });

  if (event) {
    const cause = tasks.find((task) => task.key === event.cause);

    lines.push({
      at: total,
      level: "ERROR",
      thread: threading.request,
      logger: dispatcher,
      message: `Request processing failed: ${cause?.label} request failed`,
    });
  } else {
    lines.push({
      at: total,
      level: "INFO",
      thread: threading.request,
      logger: controller,
      message: "Finishing dashboard request",
    });
  }

  return lines.sort((a, b) => a.at - b.at);
}

function jitterOf(at: number) {
  return (Math.round(at / increment) * 7 + 3) % increment;
}

const pad = (value: number, width = 2) => String(value).padStart(width, "0");

function formatLogTime(startedAt: number, at: number) {
  const time = new Date(startedAt + at + jitterOf(at));

  return [
    pad(time.getHours()),
    pad(time.getMinutes()),
    `${pad(time.getSeconds())}.${pad(time.getMilliseconds(), 3)}`,
  ].join(":");
}

const threadWidth = 15;

const loggerWidth = "RecommendationsService".length;

export function formatLogLine(line: LogLine, startedAt: number) {
  return {
    time: formatLogTime(startedAt, line.at),
    level: line.level.padStart(5),
    thread: `[${line.thread.padStart(threadWidth)}]`,
    logger: line.logger.padEnd(loggerWidth),
    message: line.message,
  };
}

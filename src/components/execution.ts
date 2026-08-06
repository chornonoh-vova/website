export type RequestState =
  | "pending"
  | "active"
  | "done"
  | "failed"
  | "cancelled"
  | "wasted";

export type Task = {
  key: string;
  label: string;
  start: number;
  duration: number;
};

export type SiblingOutcome = Extract<RequestState, "wasted" | "cancelled">;

export type TimelineEvent = {
  at: number;
  cause: string;
  effect: SiblingOutcome;
};

export const calls = [
  { key: "profile", label: "Profile", duration: 150 },
  { key: "orders", label: "Orders", duration: 260 },
  { key: "notifications", label: "Notifications", duration: 170 },
  { key: "recommendations", label: "Recommendations", duration: 310 },
];

export const sequentialTasks: Task[] = calls.map((call, idx) => ({
  ...call,
  start: calls.slice(0, idx).reduce((sum, prev) => sum + prev.duration, 0),
}));

export const parallelTasks: Task[] = calls.map((call) => ({
  ...call,
  start: 0,
}));

function naturalEndOf(task: Task) {
  return task.start + task.duration;
}

function failureOf(
  tasks: Task[],
  cause: string,
  effect: SiblingOutcome,
  at?: number,
): TimelineEvent {
  const task = tasks.find((candidate) => candidate.key === cause);

  if (!task) {
    throw new Error(`Timeline event references unknown task "${cause}"`);
  }

  return { at: at ?? naturalEndOf(task), cause, effect };
}

export const parallelWasteEvent = failureOf(
  parallelTasks,
  "notifications",
  "wasted",
);

export const parallelCancelEvent = failureOf(
  parallelTasks,
  "notifications",
  "cancelled",
);

export const sequentialFailureEvent = failureOf(
  sequentialTasks,
  "notifications",
  "cancelled",
);

export function endOf(task: Task, event?: TimelineEvent) {
  const end = naturalEndOf(task);

  if (!event) {
    return end;
  }

  if (task.key === event.cause) {
    return Math.min(end, event.at);
  }

  if (event.effect === "wasted") {
    return end;
  }

  return Math.min(end, Math.max(event.at, task.start));
}

export function dispatched(task: Task, event?: TimelineEvent) {
  return endOf(task, event) > task.start;
}

export function completed(task: Task, event?: TimelineEvent) {
  return endOf(task, event) === naturalEndOf(task);
}

export function interruptedBy(task: Task, event: TimelineEvent) {
  return (
    task.key !== event.cause &&
    dispatched(task, event) &&
    !completed(task, event)
  );
}

export function wastedBy(task: Task, event: TimelineEvent) {
  return (
    task.key !== event.cause &&
    event.effect === "wasted" &&
    naturalEndOf(task) > event.at
  );
}

export function totalOf(tasks: Task[], event?: TimelineEvent) {
  return tasks.reduce((max, task) => Math.max(max, endOf(task, event)), 0);
}

export function overrunOf(tasks: Task[], event: TimelineEvent) {
  return tasks
    .filter((task) => task.key !== event.cause)
    .reduce((sum, task) => sum + Math.max(0, naturalEndOf(task) - event.at), 0);
}

export const tickStep = 100;

export const axisMax =
  Math.ceil(totalOf(sequentialTasks) / tickStep) * tickStep;

export const increment = 10;
export const interval = 100;

export function progressOf(task: Task, elapsed: number, event?: TimelineEvent) {
  return Math.min(
    Math.max(elapsed - task.start, 0),
    endOf(task, event) - task.start,
  );
}

export function stateOf(
  task: Task,
  elapsed: number,
  event?: TimelineEvent,
): RequestState {
  if (progressOf(task, elapsed, event) === 0) {
    return "pending";
  }

  if (task.key === event?.cause) {
    return elapsed >= endOf(task, event) ? "failed" : "active";
  }

  if (event && elapsed >= event.at && naturalEndOf(task) > event.at) {
    return event.effect;
  }

  return elapsed >= endOf(task, event) ? "done" : "active";
}

import ExecutionTimeline from "./ExecutionTimeline";
import {
  overrunOf,
  parallelCancelEvent,
  parallelTasks,
  totalOf,
} from "./execution";
import { virtualThreads } from "./executionLogs";

const saved = overrunOf(parallelTasks, parallelCancelEvent);

export default function ParallelExecutionWithCancel() {
  return (
    <ExecutionTimeline
      id="parallel-execution-with-cancel"
      tasks={parallelTasks}
      event={parallelCancelEvent}
      threading={virtualThreads}
      title="Parallel execution with cancellation"
      summary={
        <>
          <p>
            The same failure at <code>{parallelCancelEvent.at}ms</code>, and{" "}
            <strong>profile</strong> still returns before it.
          </p>
          <p>
            The difference is what happens to <strong>orders</strong> and{" "}
            <strong>recommendations</strong>: instead of being left to run, they
            are interrupted the moment notifications fails, so neither ever logs
            a "Finishing" line.
          </p>
          <p>
            The whole request is over at{" "}
            <code>{totalOf(parallelTasks, parallelCancelEvent)}ms</code>. That{" "}
            <code>{saved}ms</code> the previous version burned on results nobody
            would read never gets spent.
          </p>
          <p>
            The log also reads <code>virtual-*</code> rather than a pool worker.
            Getting this behaviour at all means leaving{" "}
            <code>ForkJoinPool</code> behind, and <code>CompletableFuture</code>{" "}
            with it.
          </p>
        </>
      }
    />
  );
}

import ExecutionTimeline, { CallList } from "./ExecutionTimeline";
import { parallelTasks, totalOf } from "./execution";
import { poolThreads } from "./executionLogs";

export default function ParallelExecution() {
  return (
    <ExecutionTimeline
      id="parallel-execution"
      tasks={parallelTasks}
      threading={poolThreads}
      title="Parallel execution"
      summary={
        <>
          <p>All four services are called at the same time:</p>
          <CallList />
          <p>
            The request takes as long as the slowest single call:{" "}
            <code>{totalOf(parallelTasks)}ms</code>, drawn against the same axis
            as the sequential timeline above.
          </p>
          <p>
            The log now shows four "Starting" lines on the same millisecond,
            each on its own pool worker, and they come back in order of duration
            rather than dispatch.
          </p>
        </>
      }
    />
  );
}

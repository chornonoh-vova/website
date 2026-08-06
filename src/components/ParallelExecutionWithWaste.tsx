import ExecutionTimeline from "./ExecutionTimeline";
import {
  overrunOf,
  parallelTasks,
  parallelWasteEvent,
  totalOf,
} from "./execution";
import { poolThreads } from "./executionLogs";

const total = totalOf(parallelTasks, parallelWasteEvent);

const stillWaiting = total - parallelWasteEvent.at;
const wasted = overrunOf(parallelTasks, parallelWasteEvent);

export default function ParallelExecutionWithWaste() {
  return (
    <ExecutionTimeline
      id="parallel-execution-with-waste"
      tasks={parallelTasks}
      event={parallelWasteEvent}
      threading={poolThreads}
      title="Parallel execution with wasted work"
      summary={
        <>
          <p>
            Notifications fails <code>{parallelWasteEvent.at}ms</code> in, and
            from that moment the response is unusable.
          </p>
          <p>
            Nothing acts on it: <code>allOf(...).join()</code> waits on all four
            futures whether or not anyone still wants the answer.
          </p>
          <p>
            So <strong>orders</strong> and <strong>recommendations</strong> run
            to completion. You can watch them log "Finishing" below, after the
            request was already doomed.
          </p>
          <p>
            <code>{wasted}ms</code> of thread time goes into results that are
            thrown away. The caller sits there for another{" "}
            <code>{stillWaiting}ms</code> before the exception finally surfaces
            at <code>{total}ms</code>.
          </p>
        </>
      }
    />
  );
}

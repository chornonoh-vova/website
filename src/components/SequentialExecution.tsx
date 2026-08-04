import ExecutionTimeline, { CallList } from "./ExecutionTimeline";
import { sequentialTasks, totalOf } from "./execution";
import { inlineThreads } from "./executionLogs";

export default function SequentialExecution() {
  return (
    <ExecutionTimeline
      id="sequential-execution"
      tasks={sequentialTasks}
      threading={inlineThreads}
      title="Sequential execution"
      summary={
        <>
          <p>
            Each service is called only after the previous one has responded:
          </p>
          <CallList ordered />
          <p>
            The request takes as long as all four added together:{" "}
            <code>{totalOf(sequentialTasks)}ms</code>.
          </p>
          <p>
            Every line in the log comes off the same thread, because there is
            only ever one call in flight.
          </p>
        </>
      }
    />
  );
}

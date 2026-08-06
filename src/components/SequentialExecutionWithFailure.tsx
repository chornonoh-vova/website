import ExecutionTimeline from "./ExecutionTimeline";
import {
  calls,
  sequentialFailureEvent,
  sequentialTasks,
  totalOf,
} from "./execution";
import { inlineThreads } from "./executionLogs";

export default function SequentialExecutionWithFailure() {
  return (
    <ExecutionTimeline
      id="sequential-execution-with-failure"
      tasks={sequentialTasks}
      event={sequentialFailureEvent}
      threading={inlineThreads}
      title="Sequential execution with a failure"
      summary={
        <>
          <p>
            <strong>Notifications</strong> throws{" "}
            <code>{sequentialFailureEvent.at}ms</code> in.
          </p>
          <p>
            <strong>Profile</strong> and <strong>orders</strong> have already
            returned. <strong>Recommendations</strong>, the{" "}
            <code>{calls[3].duration}ms</code> call that would have come next,
            is never dispatched at all.
          </p>
          <p>
            There is nothing to cancel, because there was never anything else
            running.
          </p>
          <p>
            The exception travels straight out of the controller and the log
            simply stops: no <code>"Finishing notifications request"</code>{" "}
            line, because the throw happens between the two log statements, and
            no recommendations lines at all.
          </p>
          <p>
            The request is over at{" "}
            <code>{totalOf(sequentialTasks, sequentialFailureEvent)}ms</code>.
          </p>
        </>
      }
    />
  );
}

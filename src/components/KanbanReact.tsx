import { useDragAndDrop } from "@formkit/drag-and-drop/react";

const tasks = [
  {
    title: "To Do",
    tasks: [
      "✏️ Write introduction for blog post",
      "🧠 Research best practices for drag & drop UX",
    ],
  },
  {
    title: "In Progress",
    tasks: [
      "💻 Implement drag & drop events in JavaScript",
      "🧩 Debug card reordering logic",
      "🧱 Build React version of the Kanban board",
    ],
  },
  {
    title: "Done",
    tasks: [
      "🔍 Review HTML drag & drop MDN docs",
      "🚀 Set up project structure and tooling",
    ],
  },
];

function TaskColumn({ title, tasks }: { title: string; tasks: string[] }) {
  return (
    <div className="flex min-w-[200px] flex-1 flex-col gap-1.5 rounded-md border border-neutral-200 p-2 dark:border-neutral-700">
      <h3 className="text-xl">{title}</h3>

      <TaskList tasks={tasks} />
    </div>
  );
}

function TaskList({ tasks }: { tasks: string[] }) {
  const [parentRef, taskList] = useDragAndDrop<HTMLUListElement, string>(
    tasks,
    {
      group: "kanban",
      dragEffectAllowed: "move",
      dropZoneClass: "!border-dashed",
    },
  );
  return (
    <ul ref={parentRef} className="flex flex-1 list-none flex-col gap-1 p-0">
      {taskList.map((task) => (
        <Task key={task} task={task} />
      ))}
    </ul>
  );
}

function Task({ task }: { task: string }) {
  return (
    <li className="cursor-grab rounded-sm border border-neutral-200 bg-white p-1 active:cursor-grabbing dark:border-neutral-700 dark:bg-black">
      {task}
    </li>
  );
}

export function KanbanReact() {
  return (
    <div className="not-prose flex flex-row gap-2 overflow-y-scroll">
      {tasks.map(({ title, tasks }) => (
        <TaskColumn key={title} title={title} tasks={tasks} />
      ))}
    </div>
  );
}

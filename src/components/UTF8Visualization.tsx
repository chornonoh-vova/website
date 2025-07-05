import clsx from "clsx";
import { Binary, Hexagon } from "lucide-react";
import {
  createContext,
  use,
  useId,
  useMemo,
  useState,
  type ComponentPropsWithRef,
  type PropsWithChildren,
} from "react";

export function Input({
  label,
  ...rest
}: ComponentPropsWithRef<"input"> & { label: string }) {
  const inputId = useId();
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="ps-1 text-neutral-950 dark:text-neutral-50"
      >
        {label}
      </label>
      <input
        id={inputId}
        className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-neutral-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 dark:border-neutral-700 dark:bg-neutral-950 focus:dark:border-indigo-700 focus:dark:ring-indigo-500"
        {...rest}
      />
    </div>
  );
}

type ToggleGroupContext<T> = {
  currentValue: T;
  setCurrentValue: (newVal: T) => void;
};

const ToggleGroupContext = createContext<ToggleGroupContext<unknown> | null>(
  null,
);

type ToggleGroupProps<T> = {
  label: string;
  value: T;
  onValueChange: (newVal: T) => void;
};

function ToggleGroup<T>({
  label,
  value,
  onValueChange,
  children,
}: PropsWithChildren<ToggleGroupProps<T>>) {
  const id = useId();
  return (
    <ToggleGroupContext
      value={{
        currentValue: value,
        setCurrentValue: onValueChange as (newVal: unknown) => void,
      }}
    >
      <div>
        <label id={`${id}-label`} htmlFor={id}>
          {label}
        </label>
        <div
          id={id}
          aria-labelledby={`${id}-label`}
          role="radiogroup"
          className="mt-1 flex flex-row items-center justify-center gap-0 shadow-xs"
        >
          {children}
        </div>
      </div>
    </ToggleGroupContext>
  );
}

function ToggleGroupItem<T>({
  value,
  children,
  ...rest
}: ComponentPropsWithRef<"button"> & { value: T }) {
  const context = use(ToggleGroupContext);
  if (!context) {
    throw new Error("ToggleGroupItem must be used within a ToggleGroup");
  }
  const { currentValue, setCurrentValue } = context as ToggleGroupContext<T>;

  const isSelected = value === currentValue;
  const handleClick = () => setCurrentValue(value);

  return (
    <button
      role="radio"
      aria-checked={isSelected}
      data-selected={isSelected}
      tabIndex={0}
      onClick={handleClick}
      className="inline-flex flex-1 items-center justify-center gap-1 border border-neutral-200 px-3 py-2 first:rounded-l-sm last:rounded-r-sm hover:bg-neutral-100 data-[selected=true]:border-indigo-200 data-[selected=true]:bg-indigo-100 dark:border-neutral-700 dark:hover:bg-neutral-800 data-[selected=true]:dark:border-indigo-700 data-[selected=true]:dark:bg-indigo-800"
      {...rest}
    >
      {children}
    </button>
  );
}

function MapTable({
  repr,
  map,
}: {
  repr: "hex" | "bin";
  map: [string, string[]][];
}) {
  const cell =
    "border border-gray-200 dark:border-gray-600 text-left py-2 px-3.5";
  const headerBg = "bg-gray-50 dark:bg-gray-700";

  return (
    <table className="mt-4 w-full table-auto border-collapse text-sm">
      <caption className="caption-bottom pt-2 text-xs">
        Input string {repr === "hex" ? "hexadecimal" : "binary"} representation
      </caption>
      <thead>
        <tr>
          <th scope="col" className={clsx(cell, headerBg)}>
            Character
          </th>
          <th scope="col" className={clsx(cell, headerBg)}>
            Bytes
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800">
        {map.map(([ch, bytes], i) => (
          <tr key={`${ch}-${i}`}>
            <th scope="row" className={cell}>
              "{ch}"
            </th>
            <td className={cell}>
              <Bytes bytes={bytes} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Bytes({ bytes }: { bytes: string[] }) {
  return (
    <p>
      <span className="inline-flex flex-wrap gap-0.5 align-baseline">
        {bytes.map((b, i) => (
          <span
            key={`${b}-${i}`}
            className="rounded-sm border border-neutral-200 px-1 font-mono dark:border-neutral-700"
          >
            {b}
          </span>
        ))}
      </span>
    </p>
  );
}

export function UTF8Visualization() {
  const [input, setInput] = useState("hello 😉");
  const [repr, setRepr] = useState<"hex" | "bin">("hex");

  const map = useMemo(() => {
    const radix = repr === "hex" ? 16 : 2;
    const pad = repr === "hex" ? 2 : 8;
    const textEncoder = new TextEncoder();
    const result: [string, string[]][] = [];
    for (const ch of input) {
      const encoded = textEncoder.encode(ch);
      const bytes = Array.from(encoded).map((b) =>
        b.toString(radix).padStart(pad, "0"),
      );
      result.push([ch, bytes]);
    }
    return result;
  }, [input, repr]);

  return (
    <div className="not-prose">
      <div className="flex flex-row items-center gap-2">
        <Input
          label="Input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <ToggleGroup
          label="Representation"
          value={repr}
          onValueChange={setRepr}
        >
          <ToggleGroupItem value="bin" title="Binary">
            <Binary className="size-4.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="hex" title="Hexadecimal">
            <Hexagon className="size-4.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <MapTable repr={repr} map={map} />
    </div>
  );
}

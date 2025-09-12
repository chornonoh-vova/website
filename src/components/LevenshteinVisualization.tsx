import clsx from "clsx";
import { useId, useState, type ComponentPropsWithRef } from "react";

function Input({
  label,
  ...rest
}: ComponentPropsWithRef<"input"> & { label: string }) {
  const inputId = useId();
  return (
    <div>
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

function Button({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"button">) {
  return (
    <button
      className={clsx(
        "rounded-md bg-indigo-500 px-4 py-2 text-white shadow-md",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LevenshteinVisualization() {
  const [word1, setWord1] = useState("kitten");
  const [word2, setWord2] = useState("sitting");
  const [matrix, setMatrix] = useState<number[][] | null>(null);

  function calculateMatrix() {
    const m = word1.length;
    const n = word2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0),
    );

    // initialize first row & column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // fill matrix
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const substitutionCost = Number(word1[i - 1] !== word2[j - 1]);
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + substitutionCost,
        );
      }
    }

    setMatrix(dp);
  }

  const cell =
    "border border-gray-200 dark:border-gray-600 text-left py-2 px-3.5";
  const headerBg = "bg-gray-50 dark:bg-gray-700";

  return (
    <div className="my-8">
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <Input
          type="text"
          value={word1}
          onChange={(e) => setWord1(e.target.value)}
          label="First word"
        />
        <Input
          type="text"
          value={word2}
          onChange={(e) => setWord2(e.target.value)}
          label="Second word"
        />
        <Button onClick={calculateMatrix}>Calculate</Button>
      </div>

      {matrix && (
        <div className="overflow-x-auto">
          <table className="mt-4 w-full table-fixed border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className={clsx(cell, headerBg)}>
                  <span className="sr-only">Empty</span>
                </th>
                <th scope="col" className={clsx(cell, headerBg)}>
                  <span className="sr-only">Word 2 - index 0</span>
                </th>
                {word2.split("").map((c, j) => (
                  <th scope="col" key={j} className={clsx(cell, headerBg)}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <th scope="row" className={clsx(cell, headerBg)}>
                    {i > 0 ? (
                      word1[i - 1]
                    ) : (
                      <span className="sr-only">Word 1 - index 0</span>
                    )}
                  </th>
                  {row.map((val, j) => (
                    <td key={j} className={cell}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

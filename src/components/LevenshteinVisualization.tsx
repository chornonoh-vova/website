import clsx from "clsx";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

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

    for (let i = 1; i <= m; ++i) {
      dp[i][0] = i;
    }

    for (let j = 1; j <= n; ++j) {
      dp[0][j] = j;
    }

    for (let i = 1; i <= m; ++i) {
      for (let j = 1; j <= n; ++j) {
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
    <div className="not-prose my-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calculateMatrix();
        }}
        className="mb-4 flex flex-wrap items-end gap-2"
      >
        <Input
          type="text"
          value={word1}
          onChange={(e) => {
            setMatrix(null);
            setWord1(e.target.value);
          }}
          label="First word"
        />
        <Input
          type="text"
          value={word2}
          onChange={(e) => {
            setMatrix(null);
            setWord2(e.target.value);
          }}
          label="Second word"
        />
        <Button type="submit">Calculate</Button>
      </form>

      {matrix && (
        <div className="overflow-x-auto">
          <table className="mt-4 w-full table-auto border-collapse text-sm">
            <caption className="caption-bottom">
              Levenshtein distance dynamic programming matrix
            </caption>
            <thead>
              <tr>
                <th scope="col" className={clsx(cell, headerBg)}>
                  <span className="sr-only">Empty</span>
                </th>
                <th scope="col" className={clsx(cell, headerBg)}>
                  <span className="sr-only">Word 2 - empty prefix</span>
                </th>
                {word2.split("").map((c, j) => (
                  <th scope="col" key={j} className={clsx(cell, headerBg)}>
                    <span className="sr-only">Word 2 - index {j}</span>
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
                      <>
                        <span className="sr-only">Word 1 - index {i - 1}</span>
                        {word1[i - 1]}
                      </>
                    ) : (
                      <span className="sr-only">Word 1 - empty prefix</span>
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

import { useLayoutEffect, useState } from "react";

export function useMatchMedia(query: string) {
  const [matches, setMatches] = useState(false);

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const listener = (event: { matches: boolean }) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", listener);

    listener(mediaQuery);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  });

  return matches;
}

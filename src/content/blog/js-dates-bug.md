---
title: "Date parsing in JS"
description: "The Date parsing bug that lived in production for years"
date: 2026-01-10
---

I've recently encountered an interesting bug: turns out, `Date` constructor behaves
differently in different browsers!

Let's take a look at the problematic code:

```ts
export const formatTimeString = (timeString: string): string => {
  if (!timeString) return "";

  // HH:mm AM/PM to hh:mm:ss
  const parsedTime = new Date(format(new Date(), "yyyy-MM-dd ") + timeString);
  if (!parsedTime.getDate()) return "";

  // Convert time from 12-hour to 24-hour format
  const convertedTime = format(parsedTime, "HH:mm:ss");
  return convertedTime;
};
```

Looks correct, right? And indeed, this code was in production for multiple years
until we noticed that in Safari one of the lesser-used flows was broken. After
a long and painful investigation, everything led me to this piece of code, and
indeed, if you try to run the following code in Chrome (or Node.js), everything
will work:

```js
new Date("2026-01-06 09:00 AM"); // Tue Jan 06 2026 09:00:00 GMT+0200 (Eastern European Standard Time)
```

But the same expression will break in the Safari:

```js
new Date("2026-01-06 09:00 AM"); // Invalid Date
```

That's because Safari parsing is a lot stricter - it follows ECMAScript spec more
closely. But Chrome on the other hand, is a lot more permissive.

But also ECMAScript spec only guarantees parsing of a simplified ISO 8601 format.
Any other string format is implementation-defined and must not be relied upon.
Unfortunately that's exactly what I did 🫠

There's an interesting [Date quiz](https://jsdate.wtf/) that I recommend checking
out, which highlights all of the weirdness with `Date` parsing in JS.

## The fix

To fix this issue, I've opted out of the built-in `Date` parsing, and utilized
[date-fns](https://date-fns.org/) instead. `date-fns` does not delegate parsing
to the underlying JS engine. It parses the string itself, making the result
deterministic across browsers.

Here's how I did it:

```ts
import { format, parse, isValid } from "date-fns";

const INPUT_TIME_FORMAT = "hh:mm a";
const ISO_TIME_FORMAT = "HH:mm:ss";

export const formatTimeString = (timeStr: string): string => {
  if (!timeStr) return "";

  const parts = timeStr.trim().split(/\s+/);
  if (parts.length < 2) return "";

  const [time, meridiemRaw] = parts;
  if (!time || !meridiemRaw) return "";

  const meridiem = meridiemRaw.toUpperCase();
  if (meridiem !== "AM" && meridiem !== "PM") return "";

  const [hours, minutes = ""] = time.split(":");
  if (!hours) return "";

  const toParse = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")} ${meridiem}`;

  const parsedTime = parse(toParse, INPUT_TIME_FORMAT, new Date(0));
  if (!isValid(parsedTime)) return "";

  return format(parsedTime, ISO_TIME_FORMAT);
};
```

I've added here a little bit more code to properly sanitize the full input time
string, because this function is used in an input.

In a stricter environment (e.g. controlled backend input), this could be
simplified to a direct `parse(...)` call.

And of course, added a lot more test cases:

```ts
describe("formatTimeString", () => {
  it("handles invalid time string", () => {
    expect(formatTimeString("   ")).toBe("");
  });

  it("handles invalid time string - no meridiem", () => {
    expect(formatTimeString("9")).toBe("");
  });

  it("handles invalid time string - invalid meridiem", () => {
    expect(formatTimeString("9 blah")).toBe("");
  });

  it("handles invalid time string - no hours", () => {
    expect(formatTimeString(":")).toBe("");
  });

  it("formats a valid time string - only hours - meridiem lowercased", () => {
    expect(formatTimeString("10 pm")).toBe("22:00:00");
  });

  it("formats a valid time string - minutes empty - am", () => {
    expect(formatTimeString("10: am")).toBe("10:00:00");
  });

  it("formats a valid time string - full", () => {
    expect(formatTimeString("10:30 PM")).toBe("22:30:00");
  });

  it("handles an invalid time string - garbage input", () => {
    expect(formatTimeString("InvalidTime")).toBe("");
  });
});
```

This problem once more highlights to me an importance of cross-browser testing,
because tests that run with Node.js aren't enough 😅

After fixing this problem, I made several important conclusions for myself:

- If a date string isn't ISO 8601, don’t pass it to `new Date()`
- Parse it explicitly or build the date numerically.

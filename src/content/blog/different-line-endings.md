---
title: "Different line endings"
description: "A quick guide to line endings across operating systems"
date: 2025-09-06
---

How often do you handle file uploads in your applications? Did you know that very
subtle bugs might be hiding in the code that processes them? Let's take a look at
why.

## Types of line endings

At the lowest level, every file is just a sequence of bytes. We already looked
at how we can encode text in my blog post about [UTF-8 encoding](/blog/utf-8-encoding).

Different operating systems mark line endings differently.

Here are the different ways:

- `CRLF` (Carriage Return + Line Feed): The sequence `\r\n`. This is the standard
  for Windows and DOS operating systems.
  - Carriage Return (`CR`, `\r`): Moves the cursor to the beginning of the current
    line.
  - Line Feed (`LF`, `\n`): Moves the cursor down to the next line.
- `LF` (Line Feed): The sequence `\n`. This is used by Unix-like systems (Linux,
  macOS).
- `CR` (Carriage Return): The sequence `\r`. This was used by older Mac systems
  (pre-OS X) and some Commodore machines.

## Why they differ

### Historical reasons

The use of `LF` alone was established by systems like Multics and later adopted by
Unix, while `CRLF` was adopted by DOS and later inherited by Windows for compatibility
with older systems and certain devices.

### Typewriter analogy

Carriage Return (`\r`) moves the cursor to the beginning of the line, similar to
returning a typewriter carriage to the left margin. Line Feed (`\n`) moves the paper
down to the next line. Windows requires both to signal a new line on a printer,
while Unix uses just the Line Feed character.

## Handling

Git, as an example of a cross-platform utility, offers `core.autocrlf` setting
(and `.gitattributes`) to ensure the correct behavior across systems. On the Windows
systems, `LF` endings are converted to `CRLF` on checkout. In the repository, line
endings are normalized to `LF`.

This is pretty easy to setup:

```bash
# normalize to LF in repo, convert to CRLF on checkout on Windows
git config --global core.autocrlf true
```

But how can we handle that in our application code?

Let's take a look at the following code snippet:

```ts
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || !e.target.files.length) {
    return;
  }

  const file = e.target.files[0];
  const data = await file.text();
  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(lines);
};
```

The logic seems to be pretty solid here - read all of the file contents, split
it and have the result in the end line by line.

But, this handler might not process all of the lines correctly. It will process both
`CRLF` and `LF` line endings correctly, but in very rare edge cases (just like
using `CR` alone) the input won't actually be split, resulting in one long line.

Here's how to handle it correctly:

```ts
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || !e.target.files.length) {
    return;
  }

  const file = e.target.files[0];
  const data = await file.text();
  const normalized = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(lines);
};
```

Notice, how first, the data is normalized, to remove all of the inconsistencies
between different line endings, and after that, normalized data is split just
like in the previous method. But this time, the problem with a single line string
is avoided.

The `.filter(Boolean)` that I've shown in both cases, is a neat way to filter all
of the [_falsy_](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) values
from an array.

### Optional: streaming

If files are large, take into mind that `file.text()` reads everything into memory.
For huge inputs, consider using `file.stream()`, that will read file chunk by
chunk.

Let's take a look at how we can implement that:

```ts
function splitStream(splitOn: RegExp) {
  let buffer = "";

  return new TransformStream<string, string>({
    transform(chunk, controller) {
      buffer += chunk;
      const parts = buffer.split(splitOn);
      parts.slice(0, -1).forEach((part) => controller.enqueue(part));
      buffer = parts.at(-1);
    },
    flush(controller) {
      if (buffer) controller.enqueue(buffer);
    },
  });
}

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || !e.target.files.length) {
    return;
  }

  const file = e.target.files[0];
  const stream = file
    .stream()
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(splitStream(/\r\n|[\n\r]/));

  const lines = [];

  for await (const line of stream) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    lines.push(trimmed);
  }

  console.log(lines);
};
```

The regex in the last example is able to handle all 3 scenarios: it is treating
`CRLF` as a single delimiter, and handles `LF`-only and `CR`-only lines.

## Wrapping up

Line endings may seem like a small detail, but they can cause subtle bugs when
dealing with uploaded files across different operating systems. I know it firsthand,
unfortunately, when these subtle differences caught my code off guard 😅.

To deal with these differences between files, you can choose one of two approaches
that we explored today:

- Normalization: transform all line endings to one common denominator.
- Regex: change split logic to identify the 3 different line endings.

I hope it was useful for you, at least when a file parsing bug pops up, you'll
have an idea of what might have gone wrong 😉.

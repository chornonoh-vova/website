---
title: "Different line endings"
description: "Overview of one of the differences between OSes"
date: 2025-09-06
---

How often do you have a file input in your applications? Do you know, that very subtle bugs might be hiding in the code processing them? Let's take a look at why.

## Types of Line Endings

At the lowest level, every file is just a sequence of bytes. We already looked at how we can encode text in my blog post about [UTF-8 encoding](/blog/utf-8-encoding).

But also, dfferent operating systems have different ways to distinguish where the line ends in a file.

Here are the different ways:

* CRLF (Carriage Return + Line Feed): The sequence \r\n. This is the standard for Windows and DOS operating systems.    * Carriage Return (CR, \r): Moves the cursor to the beginning of the current line.    * Line Feed (LF, \n): Moves the cursor down to the next line. 
* LF (Line Feed): The sequence \n. This is used by Unix, Linux, and macOS. 
* CR (Carriage Return): The sequence \r. This was used by older Mac systems (pre-OS X) and some Commodore machines.

## Why They Differ

Historical Reasons:

The use of LF alone was established by systems like Multics and later adopted by Unix, while CR+LF was adopted by DOS and later inherited by Windows for compatibility with older systems and certain devices.

Typewriter Analogy:

Carriage Return (\r) moves the cursor to the beginning of the line, similar to returning a typewriter carriage to the left margin. Line Feed (\n) moves the paper down to the next line. Windows requires both to signal a new line on a printer, while Unix uses just the Line Feed character.

## Handling

Git, as an example of a cross-platform utility, requires core.autocrlf setting to ensure the correct behaviour accross systems.

Let's take a look at the following code snippet:

This handler might not process all of the lines correctly, resulting in an empty lines.

Here's how to handle it correctly:

```js
const handleFileChange = (e: {
    target: { files: FileList | null };
  }) => {
    if (!e.target.files || !e.target.files.length) {
      return;
    }

    const file = e.target.files[0];
    const data = await file.text();
    const lines = data
      .split(/\r|\n/)
      .map(line => line.trim())
      .filter(Boolean);

    console.log(lines);
};
```
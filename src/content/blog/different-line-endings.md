---
title: "Different line endings"
description: "Overview of one of the differences between OSes"
date: 2025-09-06
---

How often do you have a file input in your applications? Do you know, that very subtle bugs might be hiding in the code processing them? Let's take a look at why.

## Types of Line Endings

At the lowest level, every file is just a sequence of bytes. We already looked at how we can encode text in my blog post about [UTF-8 encoding](/blog/utf8-encoding).

But also, dfferent operating systems have different ways to distinguish where the line ends in a file.

* CRLF (Carriage Return + Line Feed): The sequence \r\n. This is the standard for Windows and DOS operating systems.    * Carriage Return (CR, \r): Moves the cursor to the beginning of the current line.    * Line Feed (LF, \n): Moves the cursor down to the next line. 
* LF (Line Feed): The sequence \n. This is used by Unix, Linux, and macOS. 
* CR (Carriage Return): The sequence \r. This was used by older Mac systems (pre-OS X) and some Commodore machines. 
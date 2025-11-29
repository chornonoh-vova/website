---
title: 'Bash "strict" mode'
description: "Essential options in bash scripts"
date: 2025-11-29
---

I always start my bash scripts with the following lines:

```bash
#!/usr/bin/env bash
set -euo pipefail

# ... rest of the script
```

And I got asked recently by my coworkers, why. And to be honest with you, I couldn't
remember it from the top of my head, because there's so much hidden in these two
simple lines. It just felt like I was doing it forever, and, quite frankly, automatically
at that point.

But what these lines do exactly? Let's break it down.

## The shebang

`#!/usr/bin/env bash` is a "shebang" line at the beginning of a script. When operating
system encounters a line starting with `#!` at the very beginning of a file, it
knows to execute the rest of the file as a command to run the script.

Interestingly, we can put anything in the shebang, for example we can craft this
file:

```txt
#!/bin/cat

test!

test!!

test!!!
```

And when you execute it, it just prints itself!

You've probably noticed, that instead of specifying the `/bin/bash` directly, instead
it specifies it with `/usr/bin/env bash`, and it has a couple of benefits:

- It ensures a script can run on different systems, even if `bash` is installed
  in a non-standard location, such as in a user's home directory.
- It allows a user to use a custom or different version of `bash` they may have
  installed in their `$PATH`, rather than the system's default.

Basically, the `env` command searches the directories listed in the `$PATH` environment
variable for the `bash` executable. And, it executes the script using the first
`bash` interpreter it finds.

These two little things allow us to do very powerful stuff, like executing the rest
of the script with `perl` or `ruby`, for example:

```bash
#!/usr/bin/env perl
```

```bash
#!/usr/bin/env ruby
```

## Shell options

The second line (`set -euo pipefail`) sets three options for the shell:

1. `set -e` (can also be written as `set -o errexit`) tells bash to exit immediately,
   if a pipeline fails with non-zero exit status. By default `bash` is not doing
   that! And it makes sense, because usually `bash` runs in interactive mode (i.e
   when user inputs commands) and it would be pretty annoying if it quit after
   every failed command 😅. But it's really important to set it for scripts, because
   almost every time, commands are meant to execute one after the other, and when
   one fails, script shouldn't be executed further. Note: it doesn’t trigger in
   every case, for example, inside `if` conditions or some compound commands. It
   catches most errors, but not all.
2. `set -u` (can also be written as `set -o nounset`) tells bash to exit immediately
   if it encounters an undefined variable. Pretty simple! But really important when
   writing scripts, because by default it will just silently error, and just substitute
   empty string if used in string, for example. Yikes 😬
3. `-o pipefail` tells bash to fail pipeline entirely if one of the commands in
   the pipeline failed. Again it's important to fail some commands that come later
   in a pipeline if previous command failed. By default, only the latest command
   status is used as a return status of an entire pipeline.

Additionally, there's `set -x` or `set -o xtrace` option available, that is really
useful for debugging, because it prints every command with expanded arguments before
they are getting executed. Usually, I'm setting this option when writing the script
or when I'm trying to figure something out, but leave it out in "production" scripts.

Read more in [this article](https://olivergondza.github.io/2019/10/01/bash-strict-mode.html)
or in the [documentation](https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html).

Omitting these options can lead to some disastrous bugs. Here's some youtube videos
that break it down:

- [Steam bug, unset variable](https://www.youtube.com/watch?v=qzZLvw2AdvM)
- [Cloudflare bug, pipefail](https://www.youtube.com/watch?v=kUtarOlOT3Y)

There are extended versions of this "strict" mode for bash scripts out there,
that additionally set `IFS` variable, for example. You can read more in-depth
information in this [blog post](http://redsymbol.net/articles/unofficial-bash-strict-mode/).

## Automatic script creation

I even have this little script to make other scripts!

```bash
#!/usr/bin/env bash
set -euo pipefail

if [ ! $# -eq 1 ]; then
  echo "mksh takes one argument" 1>&2
  exit 1
elif [ -e "$1" ]; then
  echo "$1 already exists" 1>&2
  exit 1
fi

echo '#!/usr/bin/env bash
set -euo pipefail

'>"$1"

chmod +x "$1"

"$EDITOR" "$1"
```

Shout out to this [awesome blog post](https://evanhahn.com/scripts-i-wrote-that-i-use-all-the-time/)
that opened my eyes to how I can automate this process!

Now I can just run:

```bash
mksh some-script.sh
```

(Given that the path is configured like so in `~/.zshrc`):

```bash
export PATH=$HOME/bin:$PATH
```

And voila, the script will be created and I'm ready to edit it instantly.

## Wrapping up

It still amazes me how much power hides in those two little lines at the top of
a script. They make Bash behave more responsibly, catch mistakes before they cascade,
and save hours of debugging you never had to do in the first place.

If you’re writing Bash scripts and not using them yet, give it a try. Your future
self will thank you.

That's it for today, safe scripting y'all 👋

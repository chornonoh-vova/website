---
title: "i18n-utils: CLI to simplify i18n file management"
description: "CLI utility to streamline operations on i18n files"
date: 2026-01-03
---

In my day-to-day work I'm actively using i18n to localize applications. And we
are supporting multiple languages. It's incredibly powerful, but tough to work
with sometimes.

Here's an example workflow when I'm working on a new feature:

1. Add a key `feature.example.title` with value `Feature example title` to the
   file with `en` translations.
2. Add the same key but with prefix `*EN*` to all other language files.
3. Wait for the localization team to translate all of the prefixed keys.
4. Update now correctly translated strings.

Looks straightforward, doesn't it?

But when translation files grow to a couple of thousand lines it becomes quite a
challenge to find all of the places where you needed to add/update or sometimes
remove a translation altogether. And while we developers don't have any
control on how the localization team translates this stuff, it occurred to me that
I can automate the first and second steps of the workflow!

And in parallel to working on new features I developed a small CLI utility to do
exactly that: `i18n-utils` 🚀

Let's look at the features that I've implemented, and how to use them.

## Repository

This CLI utility is open-source, and the source code is available in the
[repository](https://github.com/chornonoh-vova/i18n-utils).
The CLI is written in TypeScript and runs on Node.js. I've also published
it to the [GitHub Packages](https://github.com/chornonoh-vova/i18n-utils/pkgs/npm/i18n-utils).

After adding this line to your global `.npmrc` file:

```txt
@chornonoh-vova:registry=https://npm.pkg.github.com/
```

You should be able to install it!

```bash
npm install -g @chornonoh-vova/i18n-utils
```

It will be available under a name `i18n-utils` and ready to run!

## Help

For working with arguments I've used this library: [yargs](https://yargs.js.org/),
and when set up correctly, it provides a help out of the box, so you can just run

```bash
i18n-utils
```

or

```bash
i18n-utils --help
```

and it will show all of the available sub-commands.

Subcommand is required when invoking a CLI, so let's talk about them.

## Adding translations

`add` sub-command is designed to help with adding new translations to the i18n files.
It takes a glob to where the files are located, key and value of the translation
and some optional arguments.

Here's an example invocation:

```bash
i18n-utils add './src/translations/**/translation.json' \
    -k 'pageDetail.metadata.command' \
    -v 'CLI command'
```

I have this structure of the i18n files in the project:

```txt
src\
  translations\
    en\
      translation.json
    it\
      translation.json
    ja\
      translation.json
```

You can actually test this glob by just running `ls`:

```bash
ls './src/translations/**/translation.json'
```

And it will show a list of all matching files.

As a result of running this command, the following structure will be added to the
JSON file for English translation (`./src/translations/en/translation.json`):

```json
{
  "pageDetail": {
    "metadata": {
      "command": "CLI command"
    }
  }
}
```

(without overwriting other translations, of course).

And the same structure, but with the value prefixed will be added to all other
languages (in the `./src/translations/ja/translation.json` for example):

```json
{
  "pageDetail": {
    "metadata": {
      "command": "*EN* CLI command"
    }
  }
}
```

You can additionally customize the "base" language, prefix and indentation:

```bash
i18n-utils add './src/translations/**/translation.json' \
    -k 'pageDetail.metadata.command' \
    -v 'CLI command' \
    -b 'en' \
    -p '*EN*' \
    -i 2
```

There's a help available for this sub-command:

```bash
i18n-utils add --help
```

## Updating translations

`update` sub-command is designed to overwrite already existing translations in
i18n files. And while `add` command will fail if translation already exists, `update`
command will fail if the translation does not exist.

Invocation looks a lot similar:

```bash
i18n-utils update './src/translations/**/translation.json' \
    -k 'pageDetail.modal.pageMetadata' \
    -v 'Page metadata: {{key}}'
```

And it supports the same options as an `add` command.

Actually I created this command only because sometimes I make a typo when running
an `add` command 😅

But it turned out to be a helpful command as well!

There's a quite cool use case for the update command:

```bash
i18n-utils update './src/translations/ja/translation.json' \
    -k 'some.example.feature' \
    -v 'いくつかの機能例' \
    -b ja
```

With this command only one file - one for Japanese translations will be updated.
(Don't judge me - I've translated "Some example feature" into Japanese with
Google Translate).

## Removing translations

`remove` sub-command is designed to simply remove existing translations from all
files. It will fail though, if the key does not exist.

```bash
i18n-utils rm './src/translations/**/translation.json' \
    -k 'pageDetails.modal.noPageContent'
```

Btw all commands have shortcuts, for `add` its `a`, for `update` its `u` and
for `remove` its `r` or `rm`.

## Conclusion

That's it! If you run into similar i18n pain points, I hope this utility helps
streamline your workflow. Feedback and contributions are always welcome!

It definitely streamlined my workflow though. And I'm glad that I took a little
bit of the time and wrote this utility.

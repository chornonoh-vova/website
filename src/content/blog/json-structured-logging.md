---
title: "JSON + metadata = useful logs"
description: "Improvements in the observability of the system"
date: 2026-01-18
---

Observability is important. I didn't understand it before, but after investigating
multiple production incidents I get why it's mandatory. I wish I had more information
in those moments! But when you are left with one cryptic log message and that's
all that you have to work with, unfortunately, you have to guess multiple times
and hope that the guess is correct. For these problems I've developed multiple
possible scenarios, and proved them imperatively one-by-one.

Recently though I had a chance to work on improving observability. I've broken
it into two steps: change format and enrich entries with metadata.

## JSON structured logging

The first thing that I wanted to try out is JSON logs, after hearing a lot about
them, I've finally added them.

Turns out, it was easy to change in Spring:

```yaml
logging:
  structured:
    format:
      console: ecs
      file: ecs
```

Usually, these are the benefits that everybody talks about:

- they are machine-friendly: easier to parse, filter, and aggregate
- consistent structure
- better querying
- less ambiguity

In practice, though, locally it is a nightmare to work with. Until I found how
to "prettify" them with jq:

```bash
tail -f logs/service.log | \
  jq -r '[ .["@timestamp"], .log.level, .message ] | @tsv'
```

This snippet essentially mirrors what was before. But why go through all of the
trouble, when we are back at square one? Because we can add some metadata!

## Enriching logs with metadata

When I'm looking at logs, it's important for me to know, what they are referring
to. Usually we do that with adding breadcrumbs of information here and there in
the messages. And sometimes in different formats 😅

For example, we can add a correlation id like that:

```txt
correlationId: {uuid}
```

or

```txt
correlationId={uuid}
```

or

```txt
correlationId = {uuid}
```

These subtle differences add up quickly, and most of the time I've resorted to
filtering messages that _include_ a certain ID, and discarding unrelated ones.

But with structured logs, there's one and only one way to add them - a JSON field!

For example, I went through multiple services, and embedded correlation
ids to every message, and, suddenly, I have a way to track down the whole flows
even across multiple microservices!

Here's an example:

```bash
tail -f logs/service.log | \
  jq -r 'select (.correlationId == "{uuid}") | [ .["@timestamp"], .log.level, .message ] | @tsv'
```

Crucially, it will work everywhere - in Elastic, in journalctl or just from file
logs. It is especially important for my project at work - some environments are
on-prem.

So that's it for now on this - I'm still learning on how it'll affect my day-to-day
work. Hopefully, there will be more updates in the future.

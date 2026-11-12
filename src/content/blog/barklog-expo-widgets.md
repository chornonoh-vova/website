---
title: "Barklog now has widgets!"
description: "How I added native iOS widgets to my Expo app"
date: 2026-11-12
---

I've recently added Home Screen widgets to [Barklog](https://barklog.gg), my gaming
backlog tracking app (I wrote about [shipping it](/blog/shipping-barklog-part-1)
earlier this year). And my favorite part came as a surprise: I can now see my
gaming backlog right on my Mac desktop, even though Barklog is an iPhone app!

All thanks to Apple's [Continuity](https://support.apple.com/guide/mac-help/intro-to-continuity-mchl1d734309/mac)
feature.

But getting there was less straightforward than I expected. With
[`expo-widgets`](https://docs.expo.dev/versions/latest/sdk/widgets/), a widget
looks just like a React component, yet it plays by very different rules. So I
wanted to share what those rules are and how I worked with them.

## What I wanted to build

The idea was simple: let users see their gaming backlog without opening the app.

Barklog organizes games into four categories: Playing, Waiting, Completed, and Abandoned.

And "Waiting" isn't necessarily about unreleased games. It's a list of games you
want to play someday, whether they came out yesterday or ten years ago.

I decided to support two [widget sizes](https://developer.apple.com/documentation/widgetkit/widgetfamily):

- **Small:** Displays one game with its cover, title, and rating.
- **Medium:** Displays up to four games side by side, along with the total number
  of games in that category.

You can configure which category each widget displays, and tapping a game opens
its details in Barklog on your iPhone.

## Enter expo-widgets

Historically, implementing iOS widgets in a React Native app required writing native
SwiftUI code, configuring a separate [WidgetKit](https://developer.apple.com/documentation/widgetkit)
extension, and establishing communication between the app and the widget.

But `expo-widgets` handles much of that for you.

With [Expo SDK 58](https://expo.dev/changelog/sdk-58), which I'm currently using,
I can define widgets using TypeScript and React with components from [`@expo/ui/swift-ui`](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/).
Thankfully, I already used these components throughout the whole app! Expo provides
a `createWidget()` function, which registers the widget, and a special
[`"widget"` directive](https://docs.expo.dev/versions/latest/sdk/widgets/#the-widget-directive)
inside the component.

And here's where it gets interesting.

Even though the widget looks like a React component, it **doesn't run in your normal
React Native environment**. It runs in an isolated JavaScript runtime inside the
widget extension. You can't use React hooks, access your app's context, or perform
asynchronous operations there! The component has to render synchronously from the
data it receives. So my widget can't simply call the `useBacklog()` hook that powers
the rest of the app and display the results.

So how does it get the data?

## Sharing data between the app and widget

In Barklog, the main application already fetches the user's backlog. Rather than
introducing a separate data source for widgets, I reuse that existing query.

Whenever the app receives updated backlog data, it builds a lightweight snapshot
containing the information each widget needs: game titles, ratings, covers, [deep
links](https://docs.expo.dev/linking/overview/), and section counts. Then I publish
it using `BacklogWidget.updateSnapshot()`.

The flow is really simple:

**API → App's backlog query → Widget snapshot → WidgetKit**

The widget only renders the snapshot. It doesn't know anything about my API, authentication,
or database.

But that simplicity has a price: these widgets don't fetch fresh data on their own
(see Apple's guide on [keeping a widget up to date](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date)).
Their contents change only when the app sees new backlog data and publishes another
snapshot.

## The tricky part: game covers

Text was easy. Images were not. My game covers come from IGDB, but the widget can't
fetch them directly, and it can't access arbitrary files inside the main application's
sandbox either. So if the widget can't get the covers itself, the app has to hand
them over.

The way to do that is an **[App Group](https://developer.apple.com/documentation/xcode/configuring-app-groups)**,
which provides a shared container accessible to both the app and its widget extension.
The main app downloads the covers into this shared directory, which `expo-widgets`
exposes as [`widgetsDirectory`](https://docs.expo.dev/versions/latest/sdk/widgets/#sharing-images-with-widgetsdirectory).
The snapshot then contains local paths to those images.

I also made sure to download only the covers that the widgets actually need and
clean up unused files after publishing a new snapshot. If a cover isn't available,
the widget displays a placeholder instead.

Another small gotcha: the snapshot needs to be compatible with native storage, so
`null` is off the table. Instead, I use empty strings for missing image paths and
zero for missing ratings.

## Making it feel native

Besides getting the data to show up, I wanted the widgets to feel like a natural
part of iOS. They support light and dark appearances, as well as the tinted widget
[rendering mode](https://developer.apple.com/documentation/widgetkit/widgetrenderingmode).

There's also a small detail in the layout I quite like: ratings have lower [layout
priority](https://developer.apple.com/documentation/swiftui/view/layoutpriority(_:))
than titles, so they can give up space when the widget gets too crowded.
And because all the UI is built with Expo's SwiftUI components, the result is rendered
natively.

## And yes, they work on my Mac!

This was the most satisfying discovery for me. macOS can [display widgets from apps
installed on your iPhone](https://support.apple.com/guide/mac-help/add-and-customize-widgets-mchl52be5da5/mac)
through Continuity. You don't need a separate macOS version of the application.

So I added the Barklog widgets to my Mac desktop, and there they were: my actual
gaming backlog, sitting alongside my other desktop widgets. It's a small feature,
but seeing something I've built become part of my everyday setup is genuinely
exciting. ☺️

## Final thoughts

The biggest lesson for me: a widget in `expo-widgets` looks like just another React
component, but it's really a tiny separate app that only knows what your main app
tells it. Once I started thinking about it that way, the snapshot, the shared covers,
and the "no `null`" rule all made sense.

`expo-widgets` makes native widgets much more approachable for React Native developers.
But it still helps to understand the underlying widget architecture: the separate
runtime, snapshot-based updates, shared file storage, and native rendering constraints.

I also learned that testing the data transformations and synchronization logic is
quite different from testing the actual widget UI. The latter still needs verification
on a real device.

If you're interested in the implementation, Barklog is fully open-source. You can
explore the [widget source code on GitHub](https://github.com/chornonoh-vova/barklog/tree/main/apps/mobile/src/features/widgets).

And if you're starting with widgets yourself, I recommend checking out the
[official Expo Widgets documentation](https://docs.expo.dev/versions/latest/sdk/widgets/).

Happy building! 🎮

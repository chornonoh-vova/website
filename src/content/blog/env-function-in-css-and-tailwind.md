---
title: "env() function in CSS (and Tailwind)"
description: "Niche function that is incredibly useful"
date: 2026-03-29
---

Usually, when I want to position an element at the bottom of the screen I use
this CSS:

```css
.player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
```

This is an example of the player that is positioned at the bottom of the user screen.

It works like a charm for regular websites. But recently I've encountered problem
with this approach in PWA.

Screens (especially mobile) aren't perfect rectangles. They have curved corners
and cutouts. And our full-screen apps need to account for that (it's usually not
a problem when website or app is viewed inside of the browser).

Modern CSS has a solution for this problem: [env()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env)

Here's how It can by used:

```css
.player {
  position: fixed;
  bottom: env(safe-area-inset-bottom);
  left: env(safe-area-inset-left);
  right: env(safe-area-inset-right);
}
```

The syntax, as you can see is similar to variables, the only difference though,
is that we can define custom variables ourselves, but environment variables are
pre-defined.

By doing this, I made sure that my floating element in the app remains visible at
all times, without being cut out.

One important part, though it this meta tag in HTML:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, viewport-fit=cover"
/>
```

This part (`viewport-fit=cover`) tells that webpage will fill the entire screen.
Without it, browsers typically constrain the webpage to the safe area.

Furthermore, because I’m using tailwind, I’ve added such utility classes:

```css
@utility bottom-safe {
  bottom: env(safe-area-inset-bottom, 0);
}

@utility left-safe {
  left: env(safe-area-inset-left, 0);
}

@utility right-safe {
  right: env(safe-area-inset-right, 0);
}
```

Sure, I could've just wrote `bottom-[env(safe-area-inset-bottom)]` everywhere I
need to, and this approach will work the same way, but I personally prefer having
a dedicated utility classes just for that, instead of complicating markup with
such long custom class names. It's much better to write `bottom-safe` instead of
that monstrosity 😅

---
title: "Storage in the browser"
description: "What are the ways to persist data in the browser?"
date: 2025-11-08
---

## Cookies

Small pieces of data, sent to the browser by a server to be stored on device.
They are sent with every request, therefore they have limitations: only a few
hundreds of them and up to 4Kb in size. They can be automatically expired after
the certain period of time. Also, not all cookies are visible in the JS:
sometimes, they can be HTTP-only, which is a cool feature that adds additional
security.

Cookies can be set via `Set-Cookie` header, syntax looks like this:

```http
Set-Cookie: <name>=<value>; <option1>; <option2>
```

And browser can send cookies back in the `Cookie` header:

```http
Cookie: <name>=<value>; <name>=<value>
```

Via JS, cookies can be set and retrieved via `Document.cookie` property:

```js
document.cookie = "<cookie_name>=<cookie_value>";
console.log(document.cookie);
```

It's quite hard to work with the cookies with this API, but there's newer API
available: [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API)

A couple of examples:

```js
await cookieStore.set("some_cookie", "some_value");

console.log(await cookieStore.get("some_cookie"));

for (const cookie of await cookieStore.getAll()) {
  console.log(`Cookie ${cookie.name}: ${cookie.value}`);
}
```

Cookie Store API has an advantage of being accessible from the web workers.

This new API is in the Baseline 2025, so all newer versions of browsers support it.
But if you need support for older browsers, some libraries can be used, for example:
[js-cookie](https://www.npmjs.com/package/js-cookie).

## Web storage API

This API allows storing key value pairs as plain strings. Each origin has its
own storage.

There are 2 types of web storage:

- Session storage is a temporary storage that is available only when the tab is
  open, after it closes, the session storage is destroyed
- Local storage is resilient to tab closes, it preserves data between browsing
  sessions. But there’s an exception: incognito mode, in which local storage
  behaves just like session storage

Web storage can only store key value pairs, just like the cookies, but have higher
storage limits of up to 5MB.

The values saved in the web storage are not sent with every request, like cookies.

This API is synchronous, therefore not available in the web workers.

Here's a couple of examples:

```js
localStorage.setItem("some_item", "some_value");

console.log(localStorage.getItem("some_item"));

localStorage.removeItem("some_item");
```

I've used this API so many times, but there's quite a big drawback that I've always
encountered: it's that I need to convert values to and from JSON every time.

For example, I have written these kinds of hooks so many times:

```ts
export function useSavedSortConfig(key: string, defaultColumn: string) {
  const savedSortConfig = localStorage.getItem(key);

  let defaultSortConfig = {
    column: defaultColumn,
    order: "desc",
  };

  if (savedSortConfig) {
    try {
      defaultSortConfig = JSON.parse(savedSortConfig);
    } catch (error) {
      console.error(`Failed to parse saved sort config for ${key}: ${error}`);
      localStorage.removeItem(key);
    }
  }

  const [sortConfig, setSortConfig] = useState(defaultSortConfig);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(sortConfig));
  }, [key, sortConfig]);

  return { sortConfig, setSortConfig };
}
```

But there's an API that allows us to store more complex data, and with more
convenience: Indexed DB.

## Indexed DB

Indexed DB is the most advanced storage available in the browser, in my opinion.
Even though, I've never worked with it, I looked at couple of examples, and it's
quite amusing.

In essence, it is asynchronous-first, transactional database system, just like
SQL-based relational database management system. But unlike SQL, it is JS-based.
All querying and management operations are performed via JS APIs.

It might look intimidating at first, but it's built around a few simple ideas:

1. Database: this is an object that can contain multiple object stores
2. Object store: this is similar to the table in SQL databases, it holds records
   of a particular type
3. Transaction: same as a transaction in other databases, it ensures that all
   operations within are atomic
4. Indexes: additional data structure designed to search or filter data by a field
   other than the key

A couple of examples:

```js
const testData = [
  { id: 1, text: "some example data" },
  { id: 2, text: "more example data" },
];

let db;

const openReq = indexedDB.open("TestDB", 1);

openReq.onerror = (event) => {
  console.error("Failed to open database");
};

openReq.onupgradeneeded = (event) => {
  const db = event.target.result;

  const objectStore = db.createObjectStore("test", { keyPath: "id" });

  objectStore.transaction.oncomplete = (event) => {
    const testObjectStore = db
      .transaction("test", "readwrite")
      .objectStore("test");
    for (const test of testData) {
      testObjectStore.add(test);
    }
  };
};

openReq.onsuccess = (event) => {
  db = event.target.result;

  db.onerror = (event) => {
    console.error(`Database error: ${event.target.error?.message}`);
  };
};
```

In this example, database is opened, object store is created and some data is
persisted into it. But as you can notice, all these callbacks can quickly become
cumbersome to work with. And, thankfully, there's a nice wrapper library built
to make it more usable: [idb](https://github.com/jakearchibald/idb)!

Let's take a look at the example, but with this library:

```js
const testData = [
  { id: 1, text: "some example data" },
  { id: 2, text: "more example data" },
];

const db = await openDB("TestDB", 1, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    db.createObjectStore("test", { keyPath: "id" });
  },
});

const testTransaction = db.transaction("test", "readwrite");

const results = [];

for (const test of testData) {
  results.push(testTransaction.store.add(test));
}

results.push(testTransaction.done);

await Promise.all(results);
```

Much nicer!

Here's how we can create a simple notes store with IndexedDB and use it in React
application:

```ts
import { useEffect, useState } from "react";
import { openDB } from "idb";

const NOTES_STORE = "notes";

export function useNotesDB() {
  const [db, setDb] = useState(null);

  useEffect(() => {
    openDB("NotesDB", 1, {
      upgrade(db) {
        db.createObjectStore(NOTES_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      },
    }).then(setDb);
  }, []);

  const add = async (note: Note) => {
    if (!db) return;
    await db.add(NOTES_STORE, note);
  };

  const getAll = async (): Promise<Note[]> => {
    if (!db) return [];
    return db.getAll(NOTES_STORE);
  };

  return { add, getAll };
}
```

## Conclusion

There are quite a few ways to store data in the browser: from the ancient (but
still useful sometimes) cookies, to the super simple Web Storage, and up to the
pretty capable IndexedDB. Each one has its own use case, quirks, and limitations.

Personally, I think it’s nice that browsers give us this much choice. For quick
things like saving user preferences, localStorage is usually more than enough.
And, from my experience, even in production systems it's most widely used option.
But if you ever need to store a lot of structured data, or make your app work
offline, IndexedDB (especially with a helper library like `idb`) is the way to go.

Personally, I want to try working with IndexedDB for one of my projects.

So yeah, depending on what you’re building, you can always pick the right tool
for the job. And it’s kinda cool how far browser storage has come since the days
when cookies were all we had.

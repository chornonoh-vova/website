---
title: "Building local-first app with IndexedDB"
description: "Laying out the foundation for a robust app"
date: 2025-11-15
---

This week I'm digging into TanStack Router & Query documentations to build a
foundation for my application. And while I haven't achieved much, I believe I've
established quite a few powerful patterns and learned interesting concepts while
working with new libraries for me. Let's walk through my setup and what I've learned
along the way.

## Building a small IndexedDB wrapper

I've briefly mentioned IndexedDB in my last week blog post, and this week I'm
learning on how to actually use it in practice. So let's start by writing a small
wrapper around IndexedDB that will simplify our life when working with it in the
future. It might look like an abstraction just for the sake of abstraction, but
believe me, you'll see the value in it!

![pleaseNoNotAnotherBaseClassHelper](../../assets/images/please-no-not-another-base-class-helper.JPG)

[Source](https://www.reddit.com/r/ProgrammerHumor/comments/1cu7f29/pleasenonotanotherbaseclasshelper/)

This wrapper is responsible for maintaining database connection and provides a
couple of convenient methods for performing queries.

```ts
export class IndexedDBWrapper {
  #db: IDBPDatabase<StoryArcDatabaseSchema> | null;

  constructor() {
    this.#db = null;
  }

  async getDb() {
    if (!this.#db) {
      this.#db = await this.#initDB();
    }
    return this.#db;
  }

  #initDB() {
    return openDB<StoryArcDatabaseSchema>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore("storymaps", { keyPath: "id" });
        db.createObjectStore("activities", { keyPath: "id" });
        db.createObjectStore("stories", { keyPath: "id" });
        db.createObjectStore("releases", { keyPath: "id" });
      },
    });
  }

  async readAll<TName extends StoreNames<StoryArcDatabaseSchema>>(
    storeName: TName,
  ): Promise<StoreValue<StoryArcDatabaseSchema, TName>[]> {
    const db = await this.getDb();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return store.getAll();
  }

  async write<TName extends StoreNames<StoryArcDatabaseSchema>>(
    storeName: TName,
    value: StoreValue<StoryArcDatabaseSchema, TName>,
  ) {
    const db = await this.getDb();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await store.put(value);
    await tx.done;
  }
}
```

This class is holding a reference to the database in a private variable and opens
up a connection to the database lazily, when `getDb` is called for the first time.

It is possible to start the `#initDB` in constructor, but I've wanted to be able
to catch errors related to database opening in the React error boundary as well as
any other error to simplify the error handling logic.

`readAll` and `write` generic method definitions look a little bit scary, and honestly,
it took me a bit of time to figure them out. But the result is very powerful - full
type safety when invoking them, which means that it's not possible to invoke these
methods with a name of the store that doesn't exist in the database. And, additionally,
return types are automatically inferred based on the store name as well!

## Integrating with React

To connect this wrapper with React I've set up a context to provide this helper for
various hooks that might need it.

```tsx
const DatabaseContext = createContext<IndexedDBWrapper | null>(null);

export function DatabaseProvider({
  children,
  wrapper,
}: {
  children: ReactNode;
  wrapper: IndexedDBWrapper;
}) {
  return (
    <DatabaseContext.Provider value={wrapper}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useIndexedDBWrapper() {
  const context = useContext(DatabaseContext);
  if (!context)
    throw new Error("useIndexedDBWrapper must be used within DatabaseProvider");
  return context;
}
```

I love this pattern that allows for clean usage of `useIndexedDBWrapper` hook whenever
its needed instead of doing `useContext(DatabaseContext)` everywhere. It additionally
throws an exception and provides a hint to the TypeScript: when this hook is called,
the result of it will never be undefined! I think it's really powerful concept, and
it's my go-to method when creating and using contexts in my apps.

## Wiring it up with TanStack Router & Query

Additionally, I'm providing database wrapper along with a query client to the router
context:

```tsx
const databaseWrapper = new IndexedDBWrapper();
const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    databaseWrapper,
    queryClient,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <DatabaseProvider wrapper={databaseWrapper}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </DatabaseProvider>
    </StrictMode>,
  );
}
```

This way, both query client (a backbone of the TanStack Query) and my database wrapper
will be available in the route loaders.

Here's an example of a loader that ensures that data is available to be rendered
in the route component:

```ts
export const Route = createFileRoute("/")({
  component: StoryMaps,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(
      storyMapsQueryOptions(context.databaseWrapper),
    );
  },
  errorComponent: StoryMapsError,
});
```

Error handling for the route:

```tsx
function StoryMapsError({ error }: { error: Error }) {
  const router = useRouter();

  const retry = () => {
    router.invalidate();
  };

  return (
    <div>
      {error.message}
      <button onClick={retry}>retry</button>
    </div>
  );
}
```

While looking simple, it's powerful as well! All of the errors are
caught by this error boundary, and retries are just one call away!

Route component itself that uses the data and performs a mutation.

```tsx
function StoryMaps() {
  const { data: storymaps } = useStoryMapsSuspenseQuery();
  const addStoryMapMutation = useAddStoryMapMutation();

  const addStoryMap = () => {
    addStoryMapMutation.mutate({
      id: crypto.randomUUID(),
      name: "test",
      description: "test",
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {storymaps.map(({ id, name, description }) => (
        <Link
          key={id}
          to="/$storyMapId"
          params={{
            storyMapId: id,
          }}
        >
          {name} ({id}) {description}
        </Link>
      ))}
      <button onClick={addStoryMap}>Add story map</button>
    </div>
  );
}
```

The interesting thing here is that `storymaps` data will never be undefined, the
responsibility of the component is primarily to render the data. Loading
state can be handled by the separate pending component, and error state is handled
separately as well.

## Queries and Mutations

Now let's take a look at the suspense query for data and a mutation with
optimistic update:

```ts
const storyMapsQueryKey = ["storymaps"];

export function storyMapsQueryOptions(wrapper: IndexedDBWrapper) {
  return queryOptions({
    queryKey: storyMapsQueryKey,
    queryFn: () => wrapper.readAll("storymaps"),
  });
}

export function useStoryMapsSuspenseQuery() {
  const wrapper = useIndexedDBWrapper();

  return useSuspenseQuery(storyMapsQueryOptions(wrapper));
}

export function useAddStoryMapMutation() {
  const wrapper = useIndexedDBWrapper();

  return useMutation({
    mutationFn: (newStoryMap: StoryMap) =>
      wrapper.write("storymaps", newStoryMap),

    onMutate: async (newStoryMap, context) => {
      await context.client.cancelQueries({ queryKey: storyMapsQueryKey });

      const prevStoryMaps = context.client.getQueryData(storyMapsQueryKey);

      context.client.setQueryData(storyMapsQueryKey, (old: StoryMap[]) => [
        ...old,
        newStoryMap,
      ]);

      return { prevStoryMaps };
    },

    onError: (error, _newStoryMap, onMutateResult, context) => {
      console.error(error);
      if (onMutateResult?.prevStoryMaps) {
        context.client.setQueryData(
          storyMapsQueryKey,
          onMutateResult.prevStoryMaps,
        );
      }
    },

    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: storyMapsQueryKey,
      });
    },
  });
}
```

The query is pretty simple - it just returns the data by the given query key. The
only important thing here is that query key needs to be the same in the loader and
in the query hook. That's why I've defined it as a separate function to reuse it
in both places - and `queryOptions` helps with that.

The mutation here is much more involved, let's break it down:

- `mutationFn` is an async function that performs some action - in our case, adding
  data to the IndexedDB. In other cases it can be a request to the backend, for example.
- `onMutate` is a heart of the logic: it mutates the internal state of the query
  client and appends a new data that we are adding immediately, so that UI can be
  updated even before the actual mutation is completed. It additionally saves the
  previous state to the context.
- `onError` is a handler for errors that might happen when performing a mutation.
  Its job is to restore that previous value that we've saved to the context, because
  at that point, something went wrong, and our optimistic update was a wrong guess.
- `onSettled` handler is called in both cases - when the mutation failed and when
  it succeeded. The only purpose of this handler is to request the information
  once more, just to make sure that we are displaying the correct data to the user.

## Final thoughts

This setup might look like a lot of moving parts, but once everything clicks together
it becomes a ridiculously pleasant development experience. I get a fully local-first
workflow, instant reads from IndexedDB, optimistic UI out of the box, and a clean
way to thread my database instance through the whole app without creating a mess
of props.

The best part is that nothing here is “magic.” It’s all just small, composable building
blocks: a tiny wrapper around `idb`, a React context, TanStack Router loaders,
and a couple of React Query hooks. And with these pieces in place, I finally feel
like I’m building an app that is resilient, fast, and actually nice to work on.

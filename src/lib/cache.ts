export class LRUCache<K, V> {
  #cache: Map<K, V>;
  #capacity: number;

  constructor(capacity: number, initial?: Iterable<readonly [K, V]>) {
    this.#cache = new Map(initial);
    this.#capacity = capacity;
  }

  #setMostRecent(key: K, value: V): void {
    this.#cache.delete(key);
    this.#cache.set(key, value);
  }

  entries(): [K, V][] {
    const entries: [K, V][] = new Array(this.#cache.size);
    let idx = entries.length - 1;
    for (const entry of this.#cache.entries()) {
      entries[idx] = entry;
      idx--;
    }
    return entries;
  }

  get(key: K): V | undefined {
    const value = this.#cache.get(key);

    if (value === undefined) {
      return undefined;
    }

    this.#setMostRecent(key, value);
    return value;
  }

  set(key: K, value: V): void {
    this.#setMostRecent(key, value);

    if (this.#cache.size > this.#capacity) {
      const oldest = this.#cache.keys().next().value!;
      this.#cache.delete(oldest);
    }
  }

  delete(key: K): void {
    this.#cache.delete(key);
  }

  clear(): void {
    this.#cache.clear();
  }
}

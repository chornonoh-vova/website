---
title: "ORMs vs query builders vs raw SQL"
description: "Short story discussing each approach"
date: 2026-01-25
---

My experience spans multiple backend ecosystems:

- Spring - my main framework, that I'm using every day,
- Node.js - in second place, I'm using it in side projects and used it previously.
- Rust - I only have a limited experience with it, while developing one of the
  services, and learning it in my free time.

In each of these ecosystems, database access is slightly different, but at the
end, they all come down to the basics: SQL. Essentially, you can create a plain
string with SQL inside and execute it with appropriate database driver in any language.

## Raw SQL

For example, Bun provides native bindings for executing [SQL](https://bun.com/docs/runtime/sql).

Here's a little example on how it looks like:

```js
import { sql } from "bun";

const users = await sql`
  SELECT * FROM users
  WHERE active = ${true}
  LIMIT ${10}
`;
```

Honestly, it's one of the most straight-forward and easy to use! I find it extremely
useful when I need to do some quick prototyping.

Rust is unique in that regard, [sqlx](https://github.com/launchbadge/sqlx) library
gives compile-time checked queries!

```rust
let mut rows = sqlx::query("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .fetch(&mut conn);
```

It's extremely powerful when I tried it, but I've only used it in small prototypes,
so I don't know how it'll hold with more complicated queries.

A nice thing with raw SQL is that you can query database in any way you want, but
it's hard to work with at some point.

Once queries become dynamic - conditional filters, optional joins, pagination -
raw SQL often turns into string concatenation, which is harder to read, refactor,
and reason about safely.

## ORMs

But let's take a look at other level - ORMs. These are a high level of abstraction
on top of the SQL - to the point where you can't be totally sure what SQL actually
hits the database when you do some operation 😅

I had the most experience with Hibernate, and it centers about an idea of entities,
which essentially represents rows in a table as object. There can be different
relationships between them, and Hibernate maps it to the actual database schema.
It can be quite powerful as well, with Repositories and auto-generated methods
you don't even need to write some of the most common SQL queries.

Here's an example of how Hibernate hides problems in the plain sight.

Imagine you have the following Entities:

```java
@Entity
@Table(name = "book")
public class Book {

    @Id
    private UUID id;

    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Author author;
}

@Entity
@Table(name = "author")
public class Author {

    @Id
    private UUID id;

    private String name;
}
```

And somewhere in the code we do this:

```java
List<Book> books = bookRepository.findAll();
for (Book book : books) {
    System.out.println(book.getAuthor().getName());
}
```

Well, if you had 50 books there will be 1 query to get all books and one query
for each book to get the author. It's an example of classic N+1 problem.

That's where you need to know a nitty gritty details of how Hibernate works, to
write the optimized solution:

```java
@Query("""
    select b from Book b
    join fetch b.author
""")
List<Book> findAllWithAuthors();
```

With Hibernate, the number of queries often depends not on the repository method,
but on how the returned objects are accessed later. This makes performance
characteristics implicit and sometimes surprising.

But sometimes - you have to do something outside of the box - that ORM disallows
or can't do cleanly. That's where in my experience I used JPQL or raw SQL as
a fallback, and again that didn't scale well with an amount of dynamic query
building that I had to do. To be able to cope with a complexity my team implemented
an in-house query builder.

## Query builders

That's where we can talk about query builders. I'm using one more and more in my
side project, and I think it can be a perfect middle ground. In the past I've used
[knex](https://knexjs.org/), but now I'm using [kysely](https://kysely.dev/).

They are very similar to each other, here's a snippet of one quite complicated
query that I wrote recently:

```ts
const booksQuery = db
  .selectFrom("book")
  .selectAll("book")
  .leftJoinLateral(
    (eb) =>
      eb
        .selectFrom("readingRun")
        .select(["bookId", "completedPages", "updatedAt"])
        .whereRef("bookId", "=", "book.id")
        .orderBy("id", "desc")
        .limit(1)
        .as("readingRun"),
    (join) => join.onRef("readingRun.bookId", "=", "book.id"),
  )
  .select((eb) => [
    eb.fn.coalesce("readingRun.completedPages", eb.lit(0)).as("completedPages"),
    eb.fn
      .coalesce("readingRun.updatedAt", "book.updatedAt")
      .as("lastUpdatedAt"),
  ])
  .where("userId", "=", userId)
  .orderBy("lastUpdatedAt", "desc");

const allBooks = await booksQuery.execute();
```

In runtime, this query will be "compiled" to:

```sql
SELECT
    "book".*,
    COALESCE("readingRun"."completedPages", 0) AS "completedPages",
    COALESCE("readingRun"."updatedAt", "book"."updatedAt") AS "lastUpdatedAt",
FROM
    "book"
    LEFT JOIN LATERAL (
        SELECT
            "bookId",
            "completedPages",
            "updatedAt"
        FROM
            "readingRun"
        WHERE
            "bookId" = "book.id"
        ORDER BY
            "id" DESC
        LIMIT
            1
    ) AS "readingRun" ON "readingRun"."bookId" = "book"."id"
WHERE
    "userId" = 'some-user-id'
ORDER BY
    "lastUpdatedAt" DESC;
```

If we compare the source code with an SQL output - we can easily spot similarities,
even without the experience working with a library.

What's even more impressive here - is that it's fully type safe!

The one downside for me was getting used to this callback-style syntax. Right now
it's quite an exercise to rebuild SQL in my head from the source code. But it was
the same with JPQL, and it's all just a matter of experience.

Also, this query builder can easily be extended to add more where conditions - a
common task that I have to do.

Migrations can also be written with query builders - and this gives us an unexpected
advantage. Sometimes it's quite hard to write an SQL-only migration, but with a
full power of the language that you're working with at your disposal, you can
literally do anything!

This is one of the pain points of the Hibernate that I have currently: my team
writes migrations in the plain SQL files, and you have to be extra careful with
the schema-to-entity mapping. And on top of that, every once in a while a business-logic
heavy migration needs to be written, that you can only write in Java. At that point
we have to juggle both SQL and Java migrations at the same time 😅

## Conclusion

In conclusion, I can say that after working with all kinds of database access libraries
I gravitate more and more to the query builders such as kysely. I find it extremely
valuable that query builder is not trying to hide SQL behind layers and layers of
abstractions, but tries to give me the better developer experience in writing it.

---
title: "TypeScript vs JavaScript private"
description: "Deep dive into differences between TS private modifier and native JS #private fields"
date: 2025-06-14
---

The first versions of JS lacked many features. JavaScript started without classes, visibility modifiers, or traditional OOP features. Instead, it relied on a unique, prototype-based inheritance model. Clunky? Definitely. But once you understood it, it just worked. Even when the classes were introduced natively in ES6, they were basically a wrapper around an old way of creating classes.

Let’s take a glimpse into the past and look at how classes were implemented back then.

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
```

This constructor function defines a Person class with two properties: name and age.

We can define some methods for the class like so:

```javascript
Person.prototype.greet = function () {
  console.log("Hello, my name is " + this.name);
};
```

Here’s how we can extend a class:

```javascript
function Student(name, age, grade) {
  Person.call(this, name, age); // Call parent constructor
  this.grade = grade;
}

Student.prototype = Object.create(Person.prototype); // Inherit from Person

Student.prototype.study = function () {
  console.log("Studying hard!");
};
```

Usage:

```javascript
var person1 = new Person("Alice", 30);
person1.greet();

var student1 = new Student("Bob", 18, "A");
student1.greet(); // Inherited from Person
student1.study();
```

Classes were introduced in the ES6. At their core, they are just syntactic sugar on top of what we’ve just seen. They were designed to streamline OOP programming in JS. Let’s rewrite our examples from before with ES6:

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log("Hello, my name is " + this.name);
  }
}

class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    this.grade = grade;
  }

  study() {
    console.log("Studying hard!");
  }
}
```

Usage remains unchanged (with the only exception that var is now replaced with `const`):

```javascript
const person1 = new Person("Alice", 30);
person1.greet();

const student1 = new Student("Bob", 18, "A");
student1.greet();
student1.study();
```

In my opinion, a modern way of working with classes in JS is much better and more streamlined. There is one problem, though, that I want to point out: there are no visibility modifiers! TypeScript visibility modifiers were designed to solve this issue. Let’s take a look at an updated example from before, now annotated with TS visibility modifiers:

```typescript
class Person {
  private name: string;
  private age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log("Hello, my name is " + this.name);
  }
}

class Student extends Person {
  private grade: string;

  constructor(name: string, age: number, grade: string) {
    super(name, age);
    this.grade = grade;
  }

  study() {
    console.log("Studying hard!");
  }
}

const person1 = new Person("Alice", 30);
person1.greet();

const student1 = new Student("Bob", 18, "A");
student1.greet();
student1.study();
```

I’ve chosen to make properties of a Person class private as well, which leads to them not being available in the Student subclass (we’ll take a look at that problem after).

If we try to access private property outside a class, we get an error, just as expected:

```typescript
person1.name;
//      ^ Property 'name' is private and only accessible within class 'Person'.
student1.grade;
//       ^ Property 'grade' is private and only accessible within class 'Student'.
```

But there’s a caveat: this check is compile-time only, and that means if we take a look at the transpiled JS code:

```javascript
"use strict";
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  // Omitting methods
}
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    this.grade = grade;
  }
  // Omitting methods
}

// Instantiations, etc.

person1.name; // <- Accessing private property!
student1.grade; // <- Accessing private property!
```

We can observe that we can easily access private members from the JS code. It is mentioned here in the TS [docs](https://www.typescriptlang.org/docs/handbook/2/classes.html#caveats).

What we can do about it? There private properties syntax available in the recent JS versions: [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties), it also has great support across all browsers.

Unlike TypeScript’s `private`, which only exists at compile-time, JavaScript's `#private` fields enforce privacy at runtime, making them more robust against accidental or malicious access.

Let’s rewrite our example from before with JS private properties:

```typescript
class Person {
  #name: string;
  #age: number;

  constructor(name: string, age: number) {
    this.#name = name;
    this.#age = age;
  }

  greet() {
    console.log("Hello, my name is " + this.#name);
  }
}

class Student extends Person {
  #grade: string;

  constructor(name: string, age: number, grade: string) {
    super(name, age);
    this.#grade = grade;
  }

  study() {
    console.log("Studying hard!");
  }
}
// Consumer code remains unchanged
```

Now, when we try to access `person1.#name` or `student1.#grade` - we get an error in runtime!

It is compiled to JS without stripping down private modifiers:

```javascript
"use strict";
class Person {
  #name;
  #age;
  constructor(name, age) {
    this.#name = name;
    this.#age = age;
  }
  greet() {
    console.log("Hello, my name is " + this.#name);
  }
}
class Student extends Person {
  #grade;
  constructor(name, age, grade) {
    super(name, age);
    this.#grade = grade;
  }
  study() {
    console.log("Studying hard!");
  }
}
// Consumer code remains unchanged
```

There are a couple of advantages when using JS private modifiers:

- Truly private in runtime
- TS still checks for access in compile-time

Don’t worry, if you are compiling your code for older targets, let’s check out how TS achieves this in targets ES2021 and lower:

```javascript
"use strict";
var __classPrivateFieldSet =
  (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f)
      throw new TypeError("Private accessor was defined without a setter");
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    )
      throw new TypeError(
        "Cannot write private member to an object whose class did not declare it",
      );
    return (
      kind === "a"
        ? f.call(receiver, value)
        : f
          ? (f.value = value)
          : state.set(receiver, value),
      value
    );
  };
var __classPrivateFieldGet =
  (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === "a" && !f)
      throw new TypeError("Private accessor was defined without a getter");
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    )
      throw new TypeError(
        "Cannot read private member from an object whose class did not declare it",
      );
    return kind === "m"
      ? f
      : kind === "a"
        ? f.call(receiver)
        : f
          ? f.value
          : state.get(receiver);
  };
var _Person_name, _Person_age, _Student_grade;
class Person {
  constructor(name, age) {
    _Person_name.set(this, void 0);
    _Person_age.set(this, void 0);
    __classPrivateFieldSet(this, _Person_name, name, "f");
    __classPrivateFieldSet(this, _Person_age, age, "f");
  }
  greet() {
    console.log(
      "Hello, my name is " + __classPrivateFieldGet(this, _Person_name, "f"),
    );
  }
}
(_Person_name = new WeakMap()), (_Person_age = new WeakMap());
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    _Student_grade.set(this, void 0);
    __classPrivateFieldSet(this, _Student_grade, grade, "f");
  }
  study() {
    console.log("Studying hard!");
  }
}
_Student_grade = new WeakMap();
```

We are still achieving private access in runtime here, but this leads to an unfortunate drawback: a little performance penalty because TS has to backport this feature with `WeakMap` (which is a cool under-used feature of JS, btw). But I’d argue that a performance penalty is negligible in this case. It is still important to understand that, though. This transpilation can increase debugging complexity. So there are definitely some trade-offs.

Let’s now go back to the elephant in the room, that I’ve set up a little earlier: how do we access some properties/methods in the child classes while maintaining privacy for the outer world? TS has an answer for that: protected visibility modifier.

Unfortunately, JavaScript doesn't have a protected keyword, which means there's no built-in way to allow access to a field only from within the class and its subclasses. You're left choosing between:

- `#private` (strict privacy, no subclass access),
- or `protected` in TS (compile-time only, not truly private in JS).

Let’s take a brief look at the TS example of the protected modifier:

```typescript
class Person {
  protected name: string;
  protected age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  // Omitting methods
}

class Student extends Person {
  private grade: string;

  constructor(name: string, age: number, grade: string) {
    super(name, age);
    this.grade = grade;
  }

  fullInfo() {
    // Now, protected fields from Person are available in Student
    console.log("name", this.name, "age", this.age, "grade", this.grade);
  }

  // Omitting other methods
}
```

## Final Thoughts

- Use TypeScript's `private` or `protected` when you're working in a TS environment and want stronger compile-time safety.
- Use JavaScript’s `#private` fields if runtime enforcement is important, or you're shipping a library that should protect the internals.

The good news? You can combine both — using `#private` fields in TS gives you runtime safety plus TypeScript’s type-checking, offering the best of both worlds.

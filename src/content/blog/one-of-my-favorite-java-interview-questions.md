---
title: "One of my favorite Java interview questions"
description: "A deep dive into singleton implementation details"
date: 2025-05-31
---

As I gain more and more experience conducting technical interviews, I realize it's really important to ask open-ended questions instead of close-ended ones. Open-ended questions allow for free-form answers, they encourage detailed responses and allow for more exploration of the opinions. Close-ended questions, on the other hand, are easily answered with a fixed set of answers, in the worst case "yes" or "no".

| Close-ended                                         | Open-ended                                                  |
| --------------------------------------------------- | ----------------------------------------------------------- |
| Simple, specific answer                             | More expansive answer, encourage discussion                 |
| Close or limit the scope of conversation            | Open up a conversation, facilitate exploration of the topic |
| Usually have a set of predefined answers            | Have no predefined answers                                  |
| Useful for collecting quantitative data and quizzes | Useful for collecting qualitative data and deeper insights  |

Now I understand, this is obvious. But as a beginner, I didn't fully grasp that.

In my practice, I found this really simple (at first glance) question: "How to implement a Singleton in Java?" to be a good open-ended question. It allows us to discuss in great detail a wide range of Java topics - from fundamentals to the more advanced concurrency techniques. Let's explore six implementations of the Java Singleton pattern - from eager instantiation to the initialization-on-demand holder idiom - and discuss when you might (or might not) want to use it.

## How to implement a Singleton in Java?

Firstly, this question tests a baseline knowledge on how to create a singleton, and (almost) all the implementations share the same pattern:

- Private constructor (to prevent others from creating new instances except the class itself)
- Static method to obtain an instance of this class

There are also a couple of different approaches to the creation of a singleton instance itself

### Eager initialization

```java
package com.example;

public class EagerSingleton {
  private static final EagerSingleton instance = new EagerSingleton();

  private EagerSingleton() {}

  public static EagerSingleton getInstance() {
    return instance;
  }

  // some other methods...
}
```

This approach creates an instance of a singleton at the moment when the class is loaded by the JVM. It's very easy to implement, but it has a downside of always creating an instance, and it might not be applicable in every scenario. Let's try to solve this problem by initializing our singleton lazily.

### Lazy initialization

```java
package com.example;

public class UnsafeSingleton {
  private static UnsafeSingleton instance = null;

  private UnsafeSingleton() {}

  public static UnsafeSingleton getInstance() {
    if (instance == null) {
      instance = new UnsafeSingleton();
    }
    return instance;
  }

  // some other methods...
}
```

This approach, on the other hand, defers instantiation of a singleton instance to the moment when the `getInstance` method is first called. Even though this approach solves a problem of eager instantiation, it has one significant downside: it's not thread-safe. Let's try reproducing this problem by trying to spawn 2 threads and calling `getInstance` at the same time [source](https://refactoring.guru/design-patterns/singleton/java/example).

```java
package com.example;

public class Main {
  public static void main(String[] args) {
    System.out.println("Result:");
    Thread thread1 = new Thread(new Thread1());
    Thread thread2 = new Thread(new Thread2());
    thread1.start();
    thread2.start();
  }

  static class Thread1 implements Runnable {
    @Override
    public void run() {
      UnsafeSingleton singleton = UnsafeSingleton.getInstance();
      System.out.println(singleton.toString());
    }
  }

  static class Thread2 implements Runnable {
    @Override
    public void run() {
      UnsafeSingleton singleton = UnsafeSingleton.getInstance();
      System.out.println(singleton.toString());
    }
  }
}
```

And in the console, we see the following output:

```
> Task :com.example.Main.main()
Result:
com.example.UnsafeSingleton@3d82cc27
com.example.UnsafeSingleton@61214655
```

By default, the `toString` method prints a hash code of the object along with its name. By looking at the result, we can see that the `getInstance` method returns 2 different objects, which violates the singleton property.

This observation perfectly leads to the follow-up question.

## How to make the creation thread-safe?

Java has a couple of tools available to ensure thread-safety, let's explore three of them in this section.

### Synchronized method

```java
package com.example;

public class ThreadSafeSingleton {
  private static ThreadSafeSingleton instance = null;

  private ThreadSafeSingleton() {}

  public static synchronized ThreadSafeSingleton getInstance() {
    if (instance == null) {
      instance = new ThreadSafeSingleton();
    }
    return instance;
  }

  // some other methods...
}
```

This approach differs from a previous one simply by adding a synchronized modifier to the `getInstance` method. This addition ensures that no two threads can call this method at the same time - only one of them can call, the others have to wait. It has a disadvantage though: now every call to `getInstance` has to be synchronized. What we really want is that only a creation of the instance is synchronized (only the first time when it's called, basically). But after the creation, all threads can obtain a reference for their needs independently. How can we achieve that?

### Double-check locking

```java
package com.example;

public class DoubleCheckingSingleton {
  private static volatile DoubleCheckingSingleton instance = null;

  private DoubleCheckingSingleton() {}

  public static DoubleCheckingSingleton getInstance() {
    DoubleCheckingSingleton result = instance;
    if (result == null) {
      synchronized(DoubleCheckingSingleton.class) {
        result = instance;
        if (result == null) {
          instance = result = new DoubleCheckingSingleton();
        }
      }
    }
    return result;
  }

  // some other methods...
}
```

This approach utilizes [Double-checked locking](https://en.wikipedia.org/wiki/Double-checked_locking). It has an advantage of only acquiring a lock when it's required, but, as a downside, code to implement it becomes much more complicated. How can we simplify thread safety without compromising performance and code complexity?

### Inner holder

```java
package com.example;

public class HolderSingleton {
  private static class Holder {
    private static final HolderSingleton instance = new HolderSingleton();
  }

  private HolderSingleton() {}

  public static HolderSingleton getInstance() {
    return Holder.instance;
  }

  // some other methods...
}
```

This is a [technique](https://en.wikipedia.org/wiki/Initialization-on-demand_holder_idiom) that I recently learned myself. Turns out, that inner classes are lazily created, so this example also defers the creation of the instance, but what is most interesting here is that it’s also thread-safe! I really liked this approach and the simplicity of it. But what if I tell you, that all the examples above can be broken?

### Serialization and Reflection

Java has a lot more powerful tools, for example serialization and reflection. What if I told you, that serialized version of the singleton can be restored from the file as another instance? What if I told you that any private constructor can be effectively turned public? All of that is possible with serialization and reflection. To guard against serialization problems, classes need to implement `Serializable` and override `readResolve` method. Reflection can break even the best Singleton implementations. While guarding against it fully is non-trivial, it’s worth understanding the limitations - and I’d love to hear if you’ve found some elegant solutions!

All these thoughts lead me to discovering an ultimate version of the singleton:

```java
public enum EnumSingleton {
  INSTANCE;

  // some example state
  private int value;

  public int getValue() {
      return value;
  }

  public void setValue(int value) {
      this.value = value;
  }
}
```

How it works:

- An enum itself acts as a singleton. By defining an enum with a single instance, you guarantee that only one object of that enum type will ever exist.
- The JVM handles enum instantiation, ensuring thread safety and preventing multiple instantiations through serialization or reflection.

Unfortunately, there is no way to make it lazily created (at least one that I know of).

All of these versions of the simplest pattern, simpler and more effective implementations of it in Spring and other frameworks lead us to almost philosophical question, whether or not should we know it all. More and more candidates don't have any idea on how you can implement Singleton from the ground up, without any libraries or frameworks.

## Should you really care?

Singleton as a pattern itself has significant downsides:

- It introduces a global state into the application, which can become hard to maintain
- Hidden dependency - it can become hard to track down which classes depend on it
- Complicates testing - due to the global nature of the singleton, it can make mocking more challenging

On the other hand, it is useful in some cases, like: configuration classes, logging utilities, metrics collectors.

In my day-to-day work, I mostly work with Spring. And Spring allows for Inversion of Control. Basically, the class can define the dependencies without actually creating them. This work is done by the IoC container, and Spring allows for more granular control over the lifetime of the objects:

- singleton
- prototype
- request
- session
- application
- websocket

[Source](https://www.baeldung.com/spring-bean-scopes)

By default, though beans have a singleton scope. In Spring, a 'bean' is a managed object created and wired by the framework. It is possible to specify singleton behavior explicitly, like this: `@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON)`. But most of the time, it is left as default (unless it really needs to be different).

Utilizing Springs IoC container solves the biggest problems about singletons:

- Now it’s easily testable and mockable because dependent classes are not calling a static method to obtain an instance, relying on the container to provide one
- It’s easier to see what classes dependencies
- There can be a global state still, but it becomes much easier to deal with one

With all the upsides and convenience of working with Spring, it might become tempting to over-rely on the framework. But in my opinion, it is still important to understand how Java works under the hood, how Spring itself is creating those beans under the hood. Some of the techniques that we can learn from this question (such as double-locking) can be really useful outside of the context of the singletons.

## Conclusion

In a simple, single-threaded context, a straightforward utility class like `EagerSingleton` is fine. In a multi-threaded context prefer the `HolderSingleton` or `DoubleCheckingSingleton`. As a rule of thumb, it is much better to avoid singletons altogether in the code base. It is preferable to rely on the DI framework.

And about interviews: while it's okay to lean on frameworks in day-to-day work, understanding the fundamentals shows true engineering mindset - and that's what we're looking for.

Even though we discussed a lot of the details about Singletons today, the general concept remains very simple, implementation of it requires very little knowledge of concepts that I'm sure you already know (like constructors and static methods). This question designed to spark conversation, show off how you can apply basic and advanced Java concepts to one of the simplest problems that you can think of. Simply put: **Do not be a frameworker, be an engineer!**.

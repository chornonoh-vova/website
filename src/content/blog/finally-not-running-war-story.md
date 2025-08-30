---
title: "Finally block not running - war story"
description: "What are the reasons when finally block might not run"
date: 2025-08-30
---

This week I've encountered two strange errors that broke production, and I want
to share one of them.

## Handling exceptions

Let's take a look at this piece of code:

```java
public class Program {
    public static void main(String[] args) {
        File temp = null;
        try {
            temp = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
            System.out.println("Created temp file: " + temp.getAbsolutePath());
        } catch (Exception exception) {
            System.err.println(exception.getMessage());
        } finally {
            if (temp != null && temp.exists()) {
                boolean isDeleted = temp.delete();
                System.out.println("File " + temp.getAbsolutePath() + " deleted: " + isDeleted);
            }
        }
    }
}
```

This is pretty common pattern of handling some temporary resources. At first glance,
the code looks fine. But under certain conditions, the finally block responsible
for deleting temporary files is never executed. In production, it led to some disastrous
consequences: temp directory would completely fill up (sometimes in a span of 30
minutes!), and system no longer worked correctly.

Let's look at the reasons why finally block might not execute.

### JVM Exit

If the JVM (Java Virtual Machine) itself exits while the `try` or `catch` block
is being executed, the `finally` block won't be executed.

There can be multiple reasons why JVM exits:

- Manually calling `System.exit()`
- Manually calling `Runtime.getRuntime().exit()`
- Fatal error within the program (for example, `OutOfMemoryError`)
- Operating system might forcefully end the process

### Thread termination

If the thread, that is executing `try-catch-finally` block is forcefully killed
or interrupted. In the system, that I've provided an example, there were multiple
threads (workers) that were executing jobs. In such multi-threaded environments,
where threads can be abruptly stopped, this situation is more common.

### Problems with code itself

There can be a problems with a code itself, for example, infinite loops in the
try or catch blocks. Naturally, this would prevent a `finally` block from executing.

Another problem that can arise is with deleting file itself: the `delete()` method
of the `File` can return false if file cannot be deleted (for example, when some
other process is blocking deletion). Or the `SecurityManager` in JVM might block
file deletion if it's not allowed.

## How to fix it

I've decided to approach this problem from two different angles: more robust and
safe code that is trying to delete a file, and a fallback script, if everything
else goes wrong.

### Try with resources

I've implemented a helper class to hold on to temporary resource:

```java
public class TempFile implements AutoCloseable {
    private static final int MAX_DELETE_RETRIES = 3;
    private static final int DELETE_RETRY_DELAY = 1000;

    private final File file;

    public TempFile(String prefix, String suffix) throws IOException {
        this.file = File.createTempFile(prefix, suffix);
    }

    public File getFile() {
        return file;
    }

    private void delete() {
        try {
            Files.deleteIfExists(this.file.toPath());
        } catch (IOException e) {
            System.err.println("Failed to delete file " + e.getMessage());
        }
    }

    @Override
    public void close() {
        int attempts = 0;
        while (this.file.exists() && attempts < MAX_DELETE_RETRIES) {
            this.delete();
            if (this.file.exists()) {
                System.err.println("File " + this.file.getAbsolutePath() + " still exists after " + (attempts + 1) + " attempts");
                try {
                    Thread.sleep(DELETE_RETRY_DELAY);
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            attempts++;
        }

        if (file.exists()) {
            System.err.println("Failed to delete file " + this.file.getAbsolutePath() + " after " + attempts + " attempts");
        } else {
            System.out.println("Deleted file " + this.file.getAbsolutePath() + " after " + attempts + " attempts");
        }
    }
}
```

As you can notice, it implements `AutoCloseable`, so now, the consumer can utilize
try with resources:

```java
public class Program {
    public static void main(String[] args) {
        try (TempFile temp = new TempFile(UUID.randomUUID().toString(), ".tmp")) {
            System.out.println("Working with temp file: " + temp.getFile().getAbsolutePath());
        } catch (Exception exception) {
            System.err.println(exception.getMessage());
        }
    }
}
```

By doing this, I've separated the business logic that needs a file and resource
management. It allows the resource management part to be as complicated as it needs
to, while still providing clean interface for consumers. And, as you can see, I
indeed added retries to the file deletion logic.

### Fallback

To be 100% sure, I've also added the cron script, that periodically checks files
in the `/tmp` folder, and deletes them, if they are older than certain time period.

```bash
#!/bin/bash

# Cron setup
# */2 * * * * /bin/cleanup_tmp.sh >> /var/log/cleanup_tmp.log 2>&1

# Removes temporary files older than 10 minutes
echo "[$(date)] - cleaning up temporary files"
FILES_COUNT=$(find /tmp -maxdepth 1 -name "*.tmp" -cmin +10 -delete -print | wc -l)
echo "[$(date)] - $FILES_COUNT files deleted."
```

As you can see by the cron setup, script runs every 2 minutes and deletes files
older than 10 minutes (this 10 minute period was chosen specifically for the system).

## Conclusion

No matter how careful we are, systems will fail under real-world conditions. Our
job as engineers is to reduce risk, add observability, and handle failures gracefully,
not to chase an impossible “perfect” system.

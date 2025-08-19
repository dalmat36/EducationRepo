
# Concurrent Access and Critical Sections

When multiple threads concurrently read and write to a shared resource, that can lead to incorrect behavior, such as a data race. This issue can be mitigated by identifying and protecting critical sections of code.

---

## Critical Sections
- A critical section is a part of a program that accesses a shared resource (e.g., a data structure in memory)
- The program may not function correctly if multiple threads access the critical section simultaneously
- Critical sections need protection to ensure only one thread or process can execute that code section at a time
- Barron and Olivia demonstrate a critical section with their shared shopping list, where incrementing a value is a three-step process: read, modify, and write back; those three steps form a critical section that needs to be executed by each thread as an uninterrupted action

---

## Mutex (Mutual Exclusion)
- A mutex, also known as a lock, is a mechanism to prevent simultaneous access to shared resources
- Only one thread can possess the mutex at a time, forcing threads to take turns accessing the shared resource
- The process involves acquiring the lock, executing the critical section, and then releasing the lock

---

## Atomic Operations
- Acquiring a lock is an atomic operation, meaning it executes as a single, indivisible action
- Atomic operations appear instantaneous to the rest of the system and are uninterruptible

---

## Thread Blocking
- Threads attempting to acquire a lock that's already held by another thread will block (wait) until it becomes available

---

## Best Practices
- Keep the code protected by a mutex as short as possible to prevent threads from getting stuck waiting
- Operations that don't require the shared resource should be performed outside the critical section to improve efficiency
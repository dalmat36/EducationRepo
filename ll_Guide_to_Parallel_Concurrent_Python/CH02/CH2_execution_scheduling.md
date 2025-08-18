
# Operating System Scheduling in Concurrent Computing

Computers manage multiple processes and threads competing for limited processor resources. The operating system's scheduler controls when different threads and processes execute on the CPU.

---

## The Role of the Scheduler

### Process Management
- Enables multiple programs to run concurrently on a single processor
- New processes are loaded into memory and placed in the "ready queue" when created
- Cycles through ready processes, allocating CPU time for each process to execute

### Multiprocessor Handling
- For systems with multiple processors, the OS schedules processes across all available processors to maximize resource utilization

### Process Execution States
- Processes may run until completion, get blocked waiting for I/O events, or be swapped out after using their allocated timeshare

---

## Context Switch
- Saves the state of a currently running process and loads the state of another process
- Allows multiple processes to share CPU time
- Context switches are not instantaneous and incur overhead
- Schedulers must balance switch frequency with performance impact

---

## Scheduling Algorithms
- Different operating systems use different scheduling algorithms based on their specific purposes and system requirements
- Some scheduling algorithms aim to maximize throughput, while others focus on minimizing latency for improved responsiveness
- **Preemptive scheduling:** Can interrupt low-priority processes for high-priority ones
- **Non-preemptive scheduling:** Allows processes to run for their full allotted time once started

---

## Key Takeaways
- Scheduling details are typically handled by the OS "under the hood"
- Programmers should not assume a specific execution order or equal time allocation for threads or processes
- Programs should be written to function correctly regardless of scheduling decisions
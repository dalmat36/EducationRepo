
# Thread Lifecycle and States

A new process begins with a single **main thread** that can spawn additional child threads. Child threads execute independently within the same process and can spawn their own children. Threads notify their parent upon completion, with the main thread usually finishing last.

---

## Thread States
Threads transition through four main states during their lifecycle:

### 1. NEW
- The thread has been created but is not yet running
- Doesn't consume CPU resources at this stage
- Assigned a function to execute

### 2. RUNNABLE
- The operating system can schedule the thread to execute on a processor
- May be swapped with other threads through context switches

### 3. BLOCKED
- The thread enters this state when waiting for an event or resource
- Doesn't use CPU resources while blocked
- Returns to RUNNABLE when the required condition is met

### 4. TERMINATED
- The thread enters this state upon completing execution or being abnormally aborted
- Notifies its parent thread before termination

---

## Key Concepts
- Threads can create child threads to perform parallel tasks
- The `join()` method allows a parent thread to wait for a child thread to complete
- Different programming languages may use varying terminology for thread states
- Efficient thread management is crucial for concurrent and parallel computing
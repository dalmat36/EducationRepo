
# Shared vs. Distributed Memory

Memory organization and access are crucial factors in parallel computing performance. Even with numerous processors, inefficient memory access can negate potential gains because computer memory typically operates slower than processors, creating potential bottlenecks.

Shared memory and distributed memory are the two main memory architectures that support different use cases for parallel computing.

---

## Shared Memory Architecture
All processors access a global memory address space, and changes made by one processor to that memory are visible to all others.

### Types of Shared Memory Systems
1. **Uniform Memory Access (UMA)**
   - Processors have equal access speed to memory
   - Symmetric multiprocessing (SMP) is a common UMA architecture
   - Modern multicore processors use SMP architecture

2. **Non-uniform Memory Access (NUMA)**
   - Often created by connecting multiple SMP systems
   - Processors have varying access speeds to different memory parts
   - All processors can still access all memory

### Caches in Shared Memory Systems
- Each core typically has its own fast, local cache
- Cache coherency becomes a challenge when updating shared memory
- Hardware handles cache coherency in multicore processors

### Advantages and Disadvantages
- Easier for programming due to simple data sharing
- May not scale well due to increased bus traffic and synchronization needs

---

## Distributed Memory Architecture
Each processor has its own local memory and address space; no global address space exists, and processors are connected through a network.

### Key Characteristics
- Changes in one processor's memory are not automatically reflected in others
- Programmers must explicitly define data communication between nodes

### Advantages and Disadvantages
- Highly scalable: adding processors increases both processing power and memory
- Cost-effective using commodity hardware
- Communication between nodes can be challenging to program
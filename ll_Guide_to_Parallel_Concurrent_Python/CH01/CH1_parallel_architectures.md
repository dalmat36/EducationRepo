
# Four Classes of Computer Architecture (Flynn’s Taxonomy)

Parallel computing requires parallel hardware with multiple processors. Flynn's taxonomy classifies four multi-processor architectures based on instruction streams and data streams:

---

## 1. Single Instruction, Single Data (SISD)
- Sequential computer with a single processor unit
- Executes one series of instructions on one data element at a time

---

## 2. Single Instruction, Multiple Data (SIMD)
- Parallel computer with multiple processing units
- All processors execute the same instruction simultaneously on different data elements
- Well-suited for applications performing repetitive operations on large datasets (e.g., image processing)
- Modern GPUs often use SIMD instructions

---

## 3. Multiple Instruction, Single Data (MISD)
- Each processing unit executes its own series of instructions on the same data stream
- Not a commonly used architecture due to limited practical applications

---

## 4. Multiple Instruction, Multiple Data (MIMD)
- Each processing unit can execute different instructions on different datasets
- Most commonly used architecture found in multicore PCs, networked clusters, and supercomputers

### MIMD Subdivisions

#### Single Program, Multiple Data (SPMD)
- Multiple processing units execute copies of the same program simultaneously
- Processors can run asynchronously and execute different program parts based on conditional logic
- The most common style of parallel programming

#### Multiple Program, Multiple Data (MPMD)
- Processors execute different, independent programs simultaneously on different data
- Often uses a "host" or "manager" node to distribute work to other nodes and then collect results
- Less common than SPMD but useful for certain applications
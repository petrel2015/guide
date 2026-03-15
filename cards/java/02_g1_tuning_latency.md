---
question: "G1保证实施性如何调优"
tags: ["java","实战","后端","gc"]
---

- 核心目标就是尽可能降低 GC 停顿时间，同时避免 Full GC 的发生。
- 通过 MaxGCPauseMillis 从默认 200 改为 50 来告诉 JVM，我希望每次 GC 停顿控制在 50 毫秒以内。这个值不是硬限制，但 G1 会尽量满足这个目标。
- 调整 InitiatingHeapOccupancyPercent 从默认 45 改为 30 让 G1 在堆使用率达到 30% 时就开始并发标记。这可以提前回收老年代，避免堆膨胀导致 Full GC，从而保障实时性。
- 设置 G1NewSizePercent 由 5改为 20 和 G1MaxNewSizePercent 由 60 改为 40，确保新生代不会过大导致 GC 停顿时间增加，也不会过小导致频繁 GC。
- GC 线程方面，我会根据机器的 CPU 核数设置 ParallelGCThreads 和 ConcGCThreads。一般来说，ParallelGCThreads 设置为核数，ConcGCThreads 设置为核数的一半，这样可以在不影响业务线程的前提下提高 GC 并发效率。
- 关闭 +UseStringDeduplication，因为字符串去重虽然可以节省内存，但它会在 GC 阶段增加额外的处理时间，不利于实时性保障。
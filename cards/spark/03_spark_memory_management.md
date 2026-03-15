---
question: "Spark内存模型"
tags: ["spark","大数据"]
---

- Spark 的内存管理核心在于对 executor 内存的精细调度，目标是避免 OOM，同时最大化资源利用。
- Spark 会根据任务运行情况动态调整执行与存储内存的比例，同时也提供参数供开发者手动调优。
- Executor 的内存整体分为堆内内存和堆外内存。堆内内存（spark.executor.memory=1G）由 JVM 管理，
- 堆内内存包括保留内存、用户内存和统一内存。
- 统一内存是最主要的部分，默认占堆内内存的 60%，通过 spark.memory.fraction 调整。
- 它进一步分为执行内存和存储内存，默认各占一半，可通过 spark.memory.storageFraction 控制。
- 执行内存用于处理 shuffle、join 等操作中产生的中间数据，Spark 会优先保障其使用；
- 存储内存用于缓存 RDD 和广播变量，当不足时可以落盘，避免影响计算。
- 若开启堆外内存（spark.memory.offHeap.enabled=true），Spark 可将部分数据结构（如缓存）存储在 off-heap 区域，常用于 Arrow、JNI 以及 Tungsten 的 Unsafe 操作。
- 此外还有 overhead 内存，它类似保留内存，但用于操作系统层面的开销，如网络传输等。
- 通过这些机制，Spark 能在不同计算场景下灵活调配内存资源，提升任务稳定性与执行效率。
---
question: "G1保证吞吐量如何调优"
tags: [ "java", "实战","后端","gc" ]
---

- 提高 MaxGCPauseMillis 的值，比如从默认的 200ms 调到 500ms 或更高。这样 G1 会减少 GC 的频率，每次回收更多对象，从而提升吞吐量。
- 增加 G1HeapRegionSize 的大小，比如从默认的 1MB 提高到 4MB。这样每次 GC 处理的区域更大，减少 GC 的元数据开销，提高效率。
- 调高 InitiatingHeapOccupancyPercent，比如从默认的 45%提高到 60%或更高，让 G1更晚启动并发标记周期，延迟GC 的触发时间，减少干扰业务线程。
- 减少 G1MixedGCCountTarget 的值，默认是 8，让 G1 在并发周期后只进行少量 MixedGC，避免频繁回收老年代，提升吞吐量。
- 关闭+UseStringDeduplication，当然默认是 false，因为它会增加 GC的 CPU 开销，不利于高吞吐场景。
- 合理设置 ParallelGCThreads和-XX:ConcGCThreads，确保 GC 足够并行但不抢占业务线程资源。比如在 8 核机器上设置为 4 或 6，避免过度竞争。ParallelGCThreads，若核数 ≤ 8，则等于核数；若核数 > 8，则为 8 + (N - 8) * 5/8ConcGCThreads 默认值为 ParallelGCThreads / 4
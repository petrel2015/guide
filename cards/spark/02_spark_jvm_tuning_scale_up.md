---
question: "Spark 性能调优（调大内存）"
tags: [ "spark","jvm","大数据"]
---

# 卡片：Spark&JVM 调优（调大内存池，1-2min）
另一个场景是作业没有 OOM，但任务频繁 spill，CPU 利用率不高，整体吞吐偏低。Spark UI 显示 shuffle spill 很多，GC 压力不大但 IO 成本高。判断是执行内存池偏小导致频繁落盘。我做了两层优化：
Spark 层我提高执行内存占比：`spark.memory.fraction` 从 0.6 调到 0.7，`spark.memory.storageFraction` 从 0.5 调到 0.6；同时把 `spark.sql.shuffle.partitions` 从 400 降到 200，减少过多小任务。
JVM 层继续用 G1，适当放宽 `-XX:MaxGCPauseMillis`（例如 200 调到 400），并保持并发线程数为自动计算，让 GC 不过度打断业务线程。
结果是 spill 明显下降，IO 压力降低，吞吐提升且稳定性不受影响。

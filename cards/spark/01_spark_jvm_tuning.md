---
question: "Spark 性能调优（调小内存）"
tags: [ "spark","jvm","大数据"]
---

有个 Spark 作业频繁 OOM，executor 容量固定、代码也不能改。Spark UI 里 task peak memory 贴近上限，几乎不 spill，容器还被 OOM killer 干掉。判断是单 task 峰值过高、内存顶满。我做了两层优化：
Spark 层我降低执行内存占比：`spark.memory.fraction` 从 0.6 调到 0.4，`spark.memory.storageFraction` 从 0.5 调到 0.3；同时把 `spark.sql.shuffle.partitions` 从 200 提到 600，让单 task 更早 spill，峰值内存下降。
JVM 层我启用 G1（`-XX:+UseG1GC`），`-XX:InitiatingHeapOccupancyPercent` 从 45 调到 30，`-XX:ParallelGCThreads` 设为 8、`-XX:ConcGCThreads` 设为 3（原来由 JVM 自动计算），让 Old 区回收更快、停顿更稳。
结果是容器不再被 OOM killer 干掉，作业稳定运行，吞吐也更平滑。

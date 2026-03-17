---
question: "Java 21 中常见锁的对比（特点、场景、优缺点）"
tags: [ "java", "并发", "java21", "锁" ]
---

- **synchronized**：内置关键字，支持锁升级。**优点**：代码简洁，由 JVM 自动管理释放，Java 21 中已极大优化。**缺点**：不可重入性外扩展较弱，且在**虚拟线程**中若执行耗时 IO 可能导致 OS 线程被固定（Pinning）。
- **ReentrantLock**：显示锁，提供公平锁、非公平锁选项。**优点**：支持 `tryLock`、中断响应和多条件变量（Condition）。**缺点**：必须在 `finally` 中手动释放，代码稍显繁琐。
- **ReadWriteLock (ReentrantReadWriteLock)**：读写分离锁。**特点**：允许多个读线程同时访问，但写写、读写互斥。**场景**：读多写少的缓存场景。**缺点**：写线程可能出现“饥饿”现象。
- **StampedLock**：Java 8 引入，支持乐观读。**优点**：性能极高，通过版本戳（Stamp）验证数据一致性，避免读写互斥。**缺点**：不可重入，且在虚拟线程中的调度开销相对较高。
- **虚拟线程下的锁选择**：在 Java 21 中，若使用虚拟线程，优先推荐 `ReentrantLock` 而非 `synchronized`。因为 `synchronized` 在同步块内调用阻塞操作时可能阻塞底层的平台线程，而 `ReentrantLock` 则能更好地与调度器协作。
- **选择建议**：简单场景首选 `synchronized`；需要高级特性或使用虚拟线程处理 IO 时首选 `ReentrantLock`；极致读性能选 `StampedLock`。

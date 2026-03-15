---
question: "jvm调优参数都有哪些"
tags: [ "java", "jvm","后端","gc" ]
---

- 常见的 xms，xmx，调整堆内存大小的。
- 打印 gc 日志：PrintGCDetails。
- 遇到问 oom题时 dump 堆内存的参数 HeapDumpOnOutOfMemoryError，HeapDumpPath。
- 还可以选择垃圾回收器， 比如 useg1gc。
- g1gc 有一些自己的参数如
- MaxGCPauseMillis 默认 200ms可以调低，让 G1 更积极地进行 GC。还有一些其他参数可以在不同场景下调整 G1 来达到是保证吞吐量还是减少平均暂停时间。
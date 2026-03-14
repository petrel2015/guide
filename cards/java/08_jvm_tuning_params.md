---
question: "jvm调优参数都有哪些"
tags: [ "java", "jvm","后端","gc" ]
---

常用参数包括 
`-Xms`、`-Xmx` 用于设置堆大小，
`-XX:+PrintGCDetails` 或 GC 日志参数用于观察回收行为。
线上排查 OOM 时会开启 `-XX:+HeapDumpOnOutOfMemoryError` 和 `-XX:HeapDumpPath` 保留现场。
GC 选择常见是 `-XX:+UseG1GC`，并结合 `-XX:MaxGCPauseMillis` 等目标控制停顿。
调参原则是先看现象与指标，再小步调整并验证效果。

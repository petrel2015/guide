---
question: "java有什么调测工具"
tags: ["java", "实战","后端"]
---

我常用两类工具：JDK 自带工具和 Arthas。JDK 工具里，jstack 看线程堆栈，jmap 导出堆快照，jstat 观察 GC 状态；线上更常结合 GC 日志看趋势。Arthas 这边常用 watch、trace、stack、sc、sm 做无侵入定位，复杂点会用 vmtool 直接看对象状态。工具怎么选取决于问题类型，但目标都是快速定位瓶颈和异常行为。

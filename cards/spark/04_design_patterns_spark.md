---
question: "spark用了哪些设计模式"
tags: [ "spark","jvm","大数据","设计模式","后端"]
---

在 Spark 对接不同资源管理器时能看到典型的创建型和策略模式。
## 创建型
创建型体现在 ExternalClusterManager 作为工厂接口，根据 master 配置选择 Yarn 或 Kubernetes 的具体实现。
## 策略模式
策略模式体现在不同的 SchedulerBackend 实现封装不同调度策略。 这样扩展新的资源管理器时改动小、耦合低，核心调度流程也更稳定。

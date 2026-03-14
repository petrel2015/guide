---
question: "spark都可以如何扩展"
tags: [ "spark","大数据"]
---

# 卡片：Spark 的常见注入点与 --jar 区别（1-2min）

Spark 里“注入”的意思是把自定义逻辑挂到 Spark 生命周期或执行链路中。常见入口有：

- `SparkPlugin`：全局级别插件，运行时在 Driver/Executor 启动时加载，可注册监听器、度量、资源、RPC 等，适合跨应用的统一增强。
- `SparkListener`：事件监听器，监听 Job/Stage/Task/SQL 等事件，用于审计、监控、日志增强，不改变执行逻辑。
- `FeatureStep`（K8s 资源特性步骤）：K8s 资源与调度链路的特性扩展点，按步骤链路插入资源相关逻辑。
- `SparkSessionExtensions`：SQL 级扩展点，可注入自定义 `Parser`、`Analyzer` 规则、`Optimizer` 规则、`Planner` 策略与自定义函数，用于改写或增强 SQL 语义与优化。
- `QueryExecutionListener`：SQL 执行生命周期监听（解析后/执行后），可拿到 Logical/Physical Plan 与执行指标，适合审计、统计、诊断。

## 核心区别（非常简化）

- **作用范围**：
  - `SparkPlugin`：应用级、Driver/Executor 级
  - `SparkListener` / `QueryExecutionListener`：监听事件，不改执行结果
  - `SparkSessionExtensions`：可改变 SQL 解析/优化/物理计划

- **能不能改变执行逻辑**：
  - 只能监听：`SparkListener`、`QueryExecutionListener`
  - 可改写：`SparkSessionExtensions`
  - 可做底层增强：`SparkPlugin`

## 与 `--jar` 的区别

`--jar` 只是把代码打进 classpath，**不会自动生效**。要真正“注入”，你还需要：

- `SparkPlugin`：在 `spark.plugins` 中配置插件类名
- `SparkListener`：在 `spark.extraListeners` 或代码中注册
- `SparkSessionExtensions`：在 `spark.sql.extensions` 中配置扩展类名
- `QueryExecutionListener`：在 `spark.sql.queryExecutionListeners` 中配置

总结一句：`--jar` 是“把代码带上车”，注入点配置才是“让它上路”。

## 设计模式/理念对应（简要）

- `SparkPlugin`：插件模式（Plugin）、SPI/反射加载、生命周期回调（Hook）
- `SparkListener`：观察者模式（Observer）、事件总线/发布订阅
- `SparkSessionExtensions`：策略模式（Strategy）、规则链/管道（Rule-based pipeline）
- `QueryExecutionListener`：观察者模式（Observer）、前后置回调
- `FeatureStep`：责任链/流水线（Step pipeline）、策略模式、模板方法

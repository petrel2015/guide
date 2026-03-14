---
question: "# Spark SQL Catalyst 优化器流程"
tags: [ "spark","大数据"]
---

Catalyst 的整体流程可以记成四步：Parser -> Analyzer -> Optimizer -> Planner。Parser 负责把 SQL 或 DSL 转成未解析的逻辑计划（Logical Plan），只是语法结构，不带字段/表的真实含义。Analyzer 会结合 Catalog 和函数注册表做解析与校验，把未解析的节点补全成可执行的逻辑计划，例如把表名、列名、函数和数据类型全部绑定起来。Optimizer 在逻辑层做规则优化，比如谓词下推、列裁剪、常量折叠、join 重排等，目标是减少数据量和计算成本。Planner 会把优化后的逻辑计划转换为多个物理计划，并基于成本模型选择最优方案，最终生成可执行的 Spark 物理算子（如 Broadcast Hash Join、Sort Merge Join 等）。记住：前两步解决“能不能执行”，后两步解决“怎么更快”。

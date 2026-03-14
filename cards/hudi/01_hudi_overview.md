---
question: "介绍hudi"
tags: ["大数据","hudi"]
---

Hudi 是面向数据湖的表格式与存储管理层，核心目标是让数据湖具备“流批一体、可更新、可回溯”的能力。它的主要特质可以概括为：

- **Upsert/Incremental**：支持插入、更新、删除（Upsert/Deletes），并支持增量拉取（Incremental Query）。
- **索引与定位能力**：通过索引快速定位记录位置，避免全表扫描写入。
- **事务与时间线（Timeline）**：用提交时间线管理数据版本，支持回滚与回放。
- **多写模式**：
  - Copy-on-Write（COW）：写入时重写数据文件，读性能好
  - Merge-on-Read（MOR）：写入日志文件，读时合并，写性能好
- **表服务（Table Services）**：如清理（Clean）、压缩（Compaction）、聚簇（Clustering），保持表健康。
- **查询兼容**：支持 Spark/Flink/Presto/Trino 等生态读取（依赖相应的集成）。
- **数据治理特性**：支持分区演进、Schema 演进、数据去重与变更捕获。

一句话：Hudi 让数据湖具备类似“数据仓库表”的可更新、可追溯与增量计算能力。

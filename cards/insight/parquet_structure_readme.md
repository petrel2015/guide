---
question: "介绍parquet"
tags: ["大数据","parquet"]
---

# Parquet 结构与设计：Why / What / How

这份 README 聚焦 Parquet 的结构设计、设计动机与优势，并解释 Hudi + Spark 如何使用 Parquet。

## 为什么设计 Parquet（设计动机）

Parquet 的核心目标是：**在大规模分析场景下，以列式存储获得更高的压缩率和更快的扫描性能**。

传统行存（如 CSV/JSON/Avro）在分析场景的痛点：
- 查询往往只需要少量列，但行存必须读整行
- 压缩率有限（同一列的数据类型相似，列式更容易压缩）
- Predicate/Projection 下推效果差

Parquet 的设计选择：
- 列式存储（Columnar）
- 列内编码 + 压缩
- 文件级、行组级、列块级元数据
- 支持 predicate pushdown 与 column pruning

## Parquet 的物理结构（从外到内）

**1. Parquet File**
- 文件头包含 Magic (`PAR1`)
- 文件尾包含 **Footer + Metadata**（核心！）

**2. Row Group（行组）**
- 一个文件由多个 Row Group 组成
- Row Group 是“扫描与并行的最小粒度”
- 每个 Row Group 包含多列的数据块

**3. Column Chunk（列块）**
- 每个列在一个 Row Group 中是一个 Column Chunk
- Column Chunk 由多个 Page 组成

**4. Page（页）**
- Data Page：真正的数据
- Dictionary Page：字典编码（可选）
- Index Page：辅助索引（可选）

简化示意：

```
Parquet File
  ├── Row Group 1
  │     ├── Column Chunk: colA
  │     │     ├── Dictionary Page (optional)
  │     │     └── Data Pages
  │     ├── Column Chunk: colB
  │     └── Column Chunk: colC
  ├── Row Group 2
  └── Footer (Metadata)
```

再补一个“结构关系图”，突出 Row Group / Column Chunk / Page 的层级：

```mermaid
flowchart TB
  F[Parquet File]
  F --> RG1[Row Group 1]
  F --> RG2[Row Group 2]
  RG1 --> C1A[Column Chunk: colA]
  RG1 --> C1B[Column Chunk: colB]
  C1A --> D1[Dictionary Page (optional)]
  C1A --> P1[Data Page 1]
  C1A --> P2[Data Page 2]
  C1B --> P3[Data Page 1]
  C1B --> P4[Data Page 2]
  F --> FT[Footer / Metadata]
```

## 设计好处（为什么快）

**1. 列裁剪（Column Pruning）**
只读需要的列，减少 IO。

**2. 谓词下推（Predicate Pushdown）**
依赖列块统计信息（min/max/null count），跳过不可能命中的 Row Group。

**3. 高压缩率**
列内值相似，编码+压缩效果好（字典/位图/RLE）。

**4. 扫描并行化**
Row Group 是并行读的天然切分单位。

## Spark 如何使用 Parquet

Spark SQL 的 Parquet 读取路径（概念）：
- Spark 读取 Footer 元数据
- 结合过滤条件做 Row Group 级别过滤
- 结合投影做列裁剪
- 生成 ColumnarBatch（列式向量）供算子执行

常见优势：
- `Filter`、`Project`、`Aggregate` 更快
- 与 WholeStageCodegen / Columnar 执行配合良好

## Hudi 如何使用 Parquet

Hudi 的数据文件基于 Parquet（或 ORC），最常见是 Parquet。

**COW（Copy-on-Write）**
- 直接写 Parquet 数据文件
- 查询直接读 Parquet，性能好

**MOR（Merge-on-Read）**
- 基础数据在 Parquet
- 增量更新写入 log 文件
- 查询时 merge base + log（增量合并）

**关键点**
- Parquet 提供高效的扫描与压缩
- Hudi 的 Timeline/索引/Compaction 让 Parquet 文件能“可更新、可回溯”

## 简要对比：Parquet vs 行存

- 读少量列：Parquet 更快
- 高压缩：Parquet 更优
- 频繁小更新：行存更友好（Parquet 更适合批量更新）

## 一句话总结

Parquet 用列式结构、行组与列块元数据实现高效扫描与压缩，是大数据分析与数据湖的核心文件格式；Hudi 与 Spark 利用这些结构实现高性能读写与增量处理。

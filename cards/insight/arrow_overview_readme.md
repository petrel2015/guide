---
question: "介绍arrow"
tags: ["大数据","arrow"]
---

## 为什么设计 Arrow（设计动机）

Arrow 的目标是：**提供一种跨语言、跨进程的列式内存标准，让数据交换与计算更快、更少拷贝**。

传统痛点：
- JVM / Python / C++ 之间交换数据需要序列化/反序列化
- 行式内存布局对分析型计算（向量化）不友好
- 批量数据传输成本高

Arrow 的设计选择：
- 列式内存布局（Columnar in-memory)
- 明确的二进制格式规范
- 跨语言实现（C++/Java/Python/Rust 等）
- 零拷贝或少拷贝的数据交换

## Arrow 的内存结构（高层）

Arrow 以 **RecordBatch** 为基本传输单位：

- `Schema`：字段名、类型、可空性
- `RecordBatch`：一批列式数据
- `Array`：单列数据，常见类型如 Int/Float/String/Struct/List
- `Buffer`：底层二进制块（数据、偏移、位图）

**典型列的 3 类 Buffer：**
- Validity Buffer（位图）：标记 `NULL`
- Offsets Buffer：变长类型（如 String/List）的位置索引
- Data Buffer：实际数据

## 设计好处（为什么快）

- **向量化执行**：列式布局适合 SIMD 与批处理
- **少拷贝交换**：跨语言可直接共享内存或用轻量格式
- **批处理友好**：RecordBatch 适合作为执行引擎的输入/输出
- **一致的数据表示**：减少 ETL/编码转换

## Arrow 在 Spark 中的使用场景

- **Spark <-> Python（PySpark）**：通过 Arrow 加速 DataFrame 与 Pandas 之间的转换
- **Columnar Execution**：在列式执行路径中使用 `ColumnarBatch`
- **与原生引擎集成**：如 Gluten/Velox、DataFusion 等使用 Arrow 作为数据交换格式

## Arrow 与 Parquet 的关系

- **Arrow 是内存格式**（in-memory）
- **Parquet 是磁盘格式**（on-disk）

常见模式：
- 读取 Parquet -> 解码成 Arrow -> 执行计算
- 计算结果 Arrow -> 写回 Parquet

## 简要对比：Arrow vs Row-Based 内存

- 列式布局：Arrow 更适合分析型计算
- 内存访问：连续、缓存友好
- 跨语言：Arrow 优势明显

## 一句话总结

Arrow 是跨语言列式内存标准，为高性能分析与数据交换提供“共同语言”，是 Spark 生态与现代执行引擎的重要基础设施。

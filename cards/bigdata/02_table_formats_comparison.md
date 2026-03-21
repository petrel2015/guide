---
question: "请对比大数据主流表格式：Paimon, Hudi 和 Iceberg"
tags: [ "大数据", "数据湖", "Paimon", "Hudi", "Iceberg" ]
---

- **核心定位与背景**：**Iceberg** (2020 TLP) 追求极简和引擎无关，是事实上的标准；**Hudi** (2016开源, 2019 TLP) 专注于 CDC 和增量处理，功能最丰富；**Paimon** (2024 TLP) 源自 Flink Table Store，采用 LSM 结构，是流式数据湖的新星。
- **社区活跃度**：**Iceberg** 社区最广，获 Snowflake、AWS 等大厂原生支持；**Hudi** 在 Uber/Walmart 等大规模生产环境验证充分，稳定性高；**Paimon** 目前在 Flink 生态内爆发式增长，是 2024-2025 年国内热度最高的流式存储方案。
- **技术特点（Iceberg）**：优点是**隐藏分区**和 **REST Catalog**，实现计算引擎解耦，查询性能稳健；缺点是高频小文件写入压力大，Merge-on-Read 性能较 Hudi 稍逊，主要面向批处理或微批场景。
- **技术特点（Hudi）**：优点是拥有**强大的索引机制**（Bloom, Bucket, HBase）和增量拉取能力，支持 COW 和 MOR 两种模式，处理 CDC 效率最高；缺点是参数复杂、学习曲线陡峭，对 Flink 的原生支持曾落后于 Spark。
- **技术特点（Paimon）**：优点是**基于 LSM-Tree** 存储，天然适配高吞吐流式写入和主键更新，支持 Changelog 生成；缺点是生态尚在完善（如 Trino 支持较新），在纯批处理的大规模分析场景下不如 Iceberg 成熟。
- **适用场景**：通用数仓、多引擎协作选 **Iceberg**；大规模数据库 CDC 实时同步到湖选 **Hudi**；基于 Flink 构建流式数据湖、追求极致实时性和主键更新性能选 **Paimon**。

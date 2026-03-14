---
question: "介绍下spark的join都有哪些算子"
tags: [ "spark","大数据"]
---

## 三种 Join 的核心差异

- **BHJ（Broadcast Hash Join）**：广播一侧数据，避免 shuffle；可用 `BROADCAST` hint 影响策略。
- **SHJ（Shuffle Hash Join）**：两边都 shuffle 后，在每个分区对较小一侧建 hash 表并探测；可用 `SHUFFLE_HASH` hint。
- **SMJ（Sort Merge Join）**：两边 shuffle 后排序再 merge；可用 `MERGE` hint。

## Spark 如何选择（简化）

- 可通过 Join Hint 影响策略选择（`BROADCAST`、`MERGE`、`SHUFFLE_HASH` 等），但不保证一定生效。
- 启用 AQE 时，Spark 可能在运行时把 SMJ 动态转换为 SHJ（基于分区大小阈值）。

## SHJ 的优化点（如何用得好）

- **让分区足够小**：AQE 下可通过 `spark.sql.adaptive.maxShuffledHashJoinLocalMapThreshold` 触发 SMJ -> SHJ 转换。
- **避免极端数据倾斜**：倾斜会导致某些分区无法建立 hash 表，反而更差。
- **配合统计信息**：准确的表统计能帮助 Spark 选择更合理的 join 方式。

## 与 BHJ/SMJ 的取舍

- **BHJ**：最快，但受广播阈值/内存限制
- **SHJ**：通常比 SMJ 快（省掉排序），但对内存敏感
- **SMJ**：最稳健，适合大表 join，代价是排序开销

## 版本与演进（高层）

- **Join Hint 扩展**：`MERGE` 与 `SHUFFLE_HASH` 等 Join Hints 在 Spark 3.0 增加支持（此前主要是 `BROADCAST`）。
- **AQE 动态优化**：Spark 3.2.0 起支持在 AQE 中把 SMJ 动态转换为 SHJ（基于分区大小阈值）。

一句话：**BHJ 最快但受限，SHJ 速度好但吃内存，SMJ 最稳但多排序**。


# 卡片：BroadcastNestedLoopJoin 是什么（1-2min）

**BroadcastNestedLoopJoin（BNLJ）** 是一种“广播 + 嵌套循环”的 Join 物理算子。Spark 会把一侧（通常是小表）广播到每个 Executor，然后对另一侧的每条记录做逐行匹配（嵌套循环）。

## 什么时候会看到它

- **非等值 Join**（如 `a.id > b.id`、`a.ts BETWEEN b.start AND b.end`）
- **无法使用 Hash Join / Sort Merge Join** 的场景
- 也可能在某些复杂条件下被迫作为兜底方案

## 说明了什么

- 你的 Join 条件无法走 BHJ/SHJ/SMJ 的高效路径
- 可能是非等值条件、表达式过复杂或缺少等值键
- 通常意味着 **性能可能较差**，尤其当广播侧不够小或另一侧很大

## 建议

- 尽量改写为等值 Join（可分拆条件）
- 检查是否能缩小广播表
- 考虑先过滤再 Join，降低行数

一句话：看到 `BroadcastNestedLoopJoin` 往往意味着“不得已的兜底 Join”。

---
question: "Shuffle Write 内存布局与三种 Writer 触发条件（1-2min）"
tags: [ "spark","大数据"]
---


## Shuffle Write 的内存与文件布局（简化）

核心链路：**内存缓冲/排序 -> spill 文件 -> 合并写出 data + index**。

**内存阶段**：
- `SortShuffleWriter` 使用 `ExternalSorter` 在内存中缓冲/排序记录，内存不足时 spill 到磁盘，并在所有 spill 完成后合并写出。
- `UnsafeShuffleWriter` 使用 `ShuffleExternalSorter` 缓冲**序列化字节**，按照内存页/缓冲区管理数据，并在压力过高时 spill。

**磁盘阶段**：
- 多次 spill 形成临时文件，最终合并成 **一个 data 文件 + 一个 index 文件**。

**结果布局**：
- data 文件中各 partition 占据连续区域；index 文件记录每个 partition 的 offset/length，供下游 reducer 读取。

## 三种 Shuffle Writer 与触发条件

### 1) BypassMergeSortShuffleWriter（优先级最高）
- **触发条件**：
  - **无 map-side combine**
  - **partition 数 <= `spark.shuffle.sort.bypassMergeThreshold`**（默认 200）
- **写入方式**：每个 partition 直接写成独立小文件，所有 partition 的文件再合并成单个 data 文件并生成 index 文件，整个流程跳过排序。

### 2) UnsafeShuffleWriter（次优）
- **触发条件**：
  - 使用 **SerializedShuffleHandle**（即序列化写路径）
  - **无 map-side combine**
  - **partition 数 <= 16,777,215**（受分区 ID 编码限制）
- **特点**：借助 `ShuffleExternalSorter` --- 以**序列化字节**为基本单位管理内存缓冲，并在内存压力大时以页/缓冲为粒度 spill。

### 3) SortShuffleWriter（兜底）
- 当 **Bypass** 和 **Unsafe** 条件都不满足时使用（默认回退）。
- 依赖 `ExternalSorter`，排序 + spill + 合并写出。

## 一句话总结

- **Bypass**：分区数量少且不做 map-side combine，直接写多个小文件再合并，最省内存但受阈值限制。
- **Unsafe**：走序列化写路径、也不 combine，仍能复用内存页管理，性能较优但 partition 数受上限制约。
- **Sort**：当其他写法都不符合条件时的默认 fallback，负责排序 + spill + 合并，最通用但开销最大。

---
question: "executor如何运行的"
tags: [ "spark","大数据"]
---

# 卡片：Executor 执行任务（1-2min）
1. Executor 线程池接收 TaskRunner，反序列化为 ShuffleMapTask 或 ResultTask。  
2. ShuffleMapTask 负责上游计算并写出 shuffle 文件，生成 MapStatus 上报 Driver。  
3. ResultTask 执行最终算子，把结果回传 Driver 或写外部存储。  
4. 存储层由 MemoryStore/DiskStore 托管 RDD block，中间结果由 BlockManager 管理。  
5. 下游 Task 拉取 Map 输出并继续计算，必要时触发 spill。  
6. 任务级指标上报，用于 UI 和调优判断。

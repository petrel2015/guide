---
question: "spark"
tags: [ "spark","大数据"]
---

行动算子会触发实际计算并生成 Job，比如 `collect`、`count`、`save`；转换算子如 `map`、`filter` 只构建 DAG 不触发计算。宽依赖会引发 shuffle 并切分 Stage，比如 `aggregateByKey`；窄依赖是父子一对一关系，可在同一节点内完成，不需要 shuffle。理解这些概念有助于定位性能瓶颈与调优方向。

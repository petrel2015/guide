---
question: "reduceByKey vs groupByKey vs aggregateByKey"
tags: [ "spark","大数据"]
---

**结论先行**：能用 `reduceByKey` 就别用 `groupByKey`。

## reduceByKey
- **优点**：先在 map 端做局部聚合（map-side combine），大幅减少 shuffle 数据量
- **缺点**：只适用于可交换、可结合的聚合函数（如 sum/count/max）
- **场景**：大多数聚合任务
- **例子**：
```scala
val rdd = sc.parallelize(Seq(("a", 1), ("a", 2), ("b", 1)))
val result = rdd.reduceByKey(_ + _)
```

## aggregateByKey
- **优点**：支持“分区内聚合”和“分区间合并”使用不同逻辑，灵活度高
- **缺点**：API 更复杂，需要显式提供 `zeroValue`、`seqOp`、`combOp`
- **场景**：需要自定义聚合（例如求均值、TopN、复杂统计）
- **例子**（求均值）：
```scala
val rdd = sc.parallelize(Seq(("a", 1), ("a", 2), ("b", 1)))
val sumCnt = rdd.aggregateByKey((0, 0))(
  (acc, v) => (acc._1 + v, acc._2 + 1),
  (acc1, acc2) => (acc1._1 + acc2._1, acc1._2 + acc2._2)
)
val avg = sumCnt.mapValues { case (sum, cnt) => sum.toDouble / cnt }
```

## groupByKey
- **优点**：语义直观，得到完整的 value 列表
- **缺点**：会把所有 value 全量 shuffle 到 reducer，网络与内存开销大，容易 OOM
- **场景**：必须拿到完整列表或后续逻辑无法用增量聚合表达
- **例子**：
```scala
val rdd = sc.parallelize(Seq(("a", 1), ("a", 2), ("b", 1)))
val result = rdd.groupByKey()
```

## 如何选用
- 如果只是简单聚合（求和、计数、最大/最小），用 `reduceByKey`
- 如果需要复杂聚合（均值、TopN、复合指标），优先用 `aggregateByKey`
- 如果必须保留全部 value（例如排序、复杂二次处理），才考虑 `groupByKey`

一句话：`reduceByKey` 性能最好，`aggregateByKey` 最灵活，`groupByKey` 最重。

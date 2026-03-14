---
question: "spark支持哪些 Join"
tags: [ "spark","大数据"]
---

Spark SQL 支持常见的关系型 Join 类型，核心包括：

- `INNER JOIN`：只保留两表匹配的行
- `LEFT OUTER JOIN`：保留左表全部行，右表不匹配为 `NULL`
- `RIGHT OUTER JOIN`：保留右表全部行，左表不匹配为 `NULL`
- `FULL OUTER JOIN`：两边都保留，不匹配为 `NULL`
- `LEFT SEMI JOIN`：只返回左表中“能匹配”的行，不带右表列
- `LEFT ANTI JOIN`：只返回左表中“不能匹配”的行
- `CROSS JOIN`：笛卡尔积（通常需要显式开启或语法允许）

常见别名写法：
- `JOIN` 默认等价于 `INNER JOIN`
- `LEFT JOIN` 等价于 `LEFT OUTER JOIN`

注意：Join 类型是逻辑语义；物理执行方式可能是 `BroadcastHashJoin`、`SortMergeJoin`、`ShuffledHashJoin` 等，取决于数据规模和配置。

备注：外连接中的“不匹配为 NULL”是指保留的一侧有行，但另一侧找不到匹配时，另一侧的列会被填充为 `NULL`。示例：

```sql
SELECT a.id, a.name, b.score
FROM A a
LEFT OUTER JOIN B b
  ON a.id = b.id;
```

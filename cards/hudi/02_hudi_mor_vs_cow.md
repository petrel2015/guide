---
question: "hudi的mor表和cow表区别"
tags: ["大数据","hudi"]
---

# 卡片：Hudi MOR vs COW 如何选择（1-2min）

Hudi 表有两种主流写模式：Copy-on-Write（COW）与 Merge-on-Read（MOR）。核心差别在写入方式与读性能。

**COW（Copy-on-Write）**
- 写入：更新会重写数据文件
- 读取：直接读 base file，读性能好、简单
- 延迟：偏批处理
- 成本：写放大较高

**MOR（Merge-on-Read）**
- 写入：更新先写日志文件（log），不立即重写 base
- 读取：读取时合并 base + log，读开销更高
- 延迟：更适合低延迟写入/准实时
- 成本：写放大较低，但读更复杂

**如何抉择**
- 读多写少、重视查询性能：选 COW
- 写多读少、需要低延迟写入：选 MOR
- 需要近实时数据可见：倾向 MOR
- 离线分析/报表为主：倾向 COW

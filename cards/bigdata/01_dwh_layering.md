---
question: "数仓分成"
tags: ["大数据"]
---

- ODS，Operational Data Store，操作数据层外部数据源导入的原始数据。不加工，保持数据的原始性和完整性。比如网元/信令数据。
- DWD，Data Warehouse Detail，明细数据层将 ODS 数据清洗，去重，去噪，统一格式，规范化避免直接操作原始数据，为后续加工奠定基础。比如话务详单/流量详单。
- DWM（Data Warehouse Middle，数据整合层）
- DWS（Data Warehouse Summary，数据汇总层）
- DM（Data Mart，数据集市） 
- 进一步的汇总，关联，轻度的汇聚，生成公共指标，主题
指标比如运营商领域的某小时某小区基站连接率，掉线率
- ADS（Application Data Service，应用服务层）面向业务的报表，高度定制的结果数据比如客户投诉管理，用户消费行为
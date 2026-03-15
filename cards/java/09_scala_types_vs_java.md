---
question: "#Scala的类都有哪些对比java是什么"
tags: [ "spark","java","scala","大数据" ]
---

## Scala 常见类型
定义有 `class`、`case class`、`object`、`trait`，并且常配合 `abstract class`、`sealed` 使用。和 Java 的对应关系如下：

- `class`：普通类，类似 Java 的 `class`，可实例化、可继承。
- `case class`：带结构化语义的类，编译器自动生成 `equals/hashCode/toString/copy/unapply`，适合做不可变数据模型；Java 里通常用
  `record` 或 Lombok 生成类似能力。
- `object`：单例对象，编译期生成一个全局唯一实例；Java 里常用 `static` 成员或枚举单例来模拟。
- `trait`：可多继承的特质，既像 Java 的 `interface`，又能带具体方法实现与字段；Java 8+ 接口有默认方法，但不支持字段实例化与线性化混入。

## 常见补充概念：

- `abstract class`：抽象类，Scala 与 Java 类似，但 Scala 可同时混入多个 `trait`。
- `sealed`：密封类/特质，限制子类必须在同一文件，利于模式匹配完备性检查；Java 用 `sealed class/interface`（Java 17+）。
- 伴生对象（Companion Object）：`class Foo` + `object Foo` 同名共存，常放工厂方法与常量；Java 里靠 `static` 工厂方法。
- 样例对象（`case object`）：单例 + 可模式匹配的值对象，类似 Java 的枚举值。

## 快速对比总结：

- Scala 更强调不可变数据与模式匹配（`case class` / `case object`）
- Scala 更强调混入组合（`trait`）
- Java 更强调类继承 + 接口约定

备注：`case class` 更像 DTO/值对象（类似 Java `record` 或 Lombok `@Value`），而不是传统 JavaBean（可变字段 + getter/setter +
无参构造）。

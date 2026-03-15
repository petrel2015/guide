# 静态随机卡片

一个纯前端静态站点：从 `cards/` 目录下所有 Markdown 文件构建卡片数据，构建完成后内容固定；新增/修改 Markdown 需要重新构建才会生效。

## 入口

- 随机模式：`/random/`（随机展示一个问题，点击按钮显示答案）
- 标签模式：`/tag/`（先选标签，再在该标签题库内模式）

构建产物在 `dist/`。

## 使用

```bash
npm i
npm run build
npm run preview
```

然后访问：

- `http://localhost:4173/random/`
- `http://localhost:4173/tag/`
- `http://localhost:4173/browse/`

同一局域网下，也可以用你电脑的局域网 IP 访问（例如 `http://192.168.x.x:4173/random/`）。

## Markdown 卡片格式

`cards/` 下每个 `*.md` 文件默认是一张卡片：

```md
---
question: 什么是事件循环（Event Loop）？
tags: [JavaScript, 浏览器, Node.js]
---

这里写答案（支持 Markdown：列表、代码块等）。
```

- Mermaid 图：答案里写 ` ```mermaid ... ``` ` 会渲染成图（见 `cards/spark_auron_end_to_end.md` 或 `cards/mermaid-demo.md`）
- `question`：必填
- `tags`：可选，数组或逗号分隔字符串
- 文件路径会用于“目录”筛选（建议最多一层子目录，例如 `cards/frontend/hooks.md` 的目录是 `frontend`）

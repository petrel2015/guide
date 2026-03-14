import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const cardsDir = path.join(rootDir, "cards");
const siteDir = path.join(rootDir, "site");
const distDir = path.join(rootDir, "dist");

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

const defaultFenceRenderer = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const info = String(token.info || "")
    .trim()
    .split(/\s+/g)[0]
    .toLowerCase();
  if (info === "mermaid") {
    const code = md.utils.escapeHtml(token.content || "");
    return `<div class="mermaid">${code}</div>\n`;
  }
  if (typeof defaultFenceRenderer === "function") {
    return defaultFenceRenderer(tokens, idx, options, env, self);
  }
  return self.renderToken(tokens, idx, options);
};

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/\.md$/i, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function parseTags(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : String(raw).split(/[,，]/g);
  const out = [];
  const seen = new Set();
  for (const item of arr) {
    const t = String(item ?? "").trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

async function collectMarkdownFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await collectMarkdownFiles(full)));
      continue;
    }
    if (!ent.isFile()) continue;
    if (!ent.name.toLowerCase().endsWith(".md")) continue;
    if (ent.name.toLowerCase() === "readme.md") continue;
    out.push(full);
  }
  return out;
}

function extractQuestionFromContent(content) {
  const m = content.match(/^\s*#\s+(.+)\s*$/m);
  if (!m) return { question: "", content: content };
  const question = m[1].trim();
  const idx = content.indexOf(m[0]);
  const rest = content.slice(idx + m[0].length).replace(/^\s+/, "");
  return { question, content: rest };
}

async function buildCards() {
  const files = (await collectMarkdownFiles(cardsDir)).sort((a, b) => a.localeCompare(b));
  const cards = [];
  const errors = [];

  for (const absPath of files) {
    const rel = toPosix(path.relative(cardsDir, absPath));
    const depth = rel.split("/").filter(Boolean).length;
    if (depth > 2) {
      errors.push(`${rel}: directories should be at most 1 level deep under cards/`);
      continue;
    }
    const raw = await fs.readFile(absPath, "utf8");
    const parsed = matter(raw);

    let question = String(parsed.data.question ?? parsed.data.q ?? "").trim();
    let answerMd = String(parsed.content ?? "").trim();

    if (!question) {
      const extracted = extractQuestionFromContent(answerMd);
      question = extracted.question;
      answerMd = extracted.content.trim();
    }

    if (!question) {
      errors.push(`${rel}: missing front matter field "question"`);
      continue;
    }

    const tags = parseTags(parsed.data.tags ?? parsed.data.tag);
    const dir = (() => {
      const d = path.posix.dirname(rel);
      return d === "." ? "" : d;
    })();

    const id = String(parsed.data.id ?? "").trim() || slugify(rel);
    const questionHtml = md.renderInline(question);
    const answerHtml = md.render(answerMd);

    cards.push({
      id,
      source: rel,
      dir,
      tags,
      questionText: question,
      questionHtml,
      answerHtml
    });
  }

  if (errors.length) {
    const msg = errors.map((e) => `- ${e}`).join("\n");
    throw new Error(`Invalid card markdown:\n${msg}`);
  }

  return cards;
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  await fs.cp(src, dst, { recursive: true });
}

async function copyMermaidVendor() {
  const distAssetsVendorDir = path.join(distDir, "assets", "vendor");
  await fs.mkdir(distAssetsVendorDir, { recursive: true });

  const mermaidDistDir = path.join(rootDir, "node_modules", "mermaid", "dist");
  let src = "";
  let chunksDirName = "";
  try {
    const files = await fs.readdir(mermaidDistDir);
    const preferred = ["mermaid.esm.min.mjs", "mermaid.esm.min.js", "mermaid.esm.mjs", "mermaid.esm.js"];
    for (const name of preferred) {
      if (files.includes(name)) {
        src = path.join(mermaidDistDir, name);
        chunksDirName = name.includes("esm.min") ? "mermaid.esm.min" : "mermaid.esm";
        break;
      }
    }
    if (!src) {
      const fallback = files.find((x) => /^mermaid(\.esm)?(\.min)?\.(m?js)$/.test(x));
      if (fallback) {
        src = path.join(mermaidDistDir, fallback);
        chunksDirName = fallback.includes("esm.min") ? "mermaid.esm.min" : "mermaid.esm";
      }
    }
  } catch {
    // ignore: handled below
  }

  if (!src) {
    throw new Error(
      'Mermaid dependency not found. Run "npm i" first (expected node_modules/mermaid/dist/*).'
    );
  }

  const dst = path.join(distAssetsVendorDir, "mermaid.esm.min.js");
  await fs.copyFile(src, dst);

  const srcChunksDir = path.join(mermaidDistDir, "chunks", chunksDirName);
  const dstChunksDir = path.join(distAssetsVendorDir, "chunks", chunksDirName);
  try {
    await fs.cp(srcChunksDir, dstChunksDir, { recursive: true });
  } catch {
    // Some mermaid builds may not use chunks; ignore.
  }
}

async function main() {
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });
  await copyDir(siteDir, distDir);
  await copyMermaidVendor();

  const cards = await buildCards();
  const payload = {
    generatedAt: new Date().toISOString(),
    count: cards.length,
    cards
  };

  await fs.writeFile(path.join(distDir, "cards.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  process.stdout.write(`Built dist/ with ${cards.length} cards.\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});

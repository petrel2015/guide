import {
  el,
  loadCardsIndex,
  normalizeTag,
  renderMermaid,
  renderTags,
  setHtml,
  setText,
  uniqStrings
} from "./shared.js";

const searchEl = document.getElementById("search");
const clearFiltersBtn = document.getElementById("clearFilters");
const dirListEl = document.getElementById("dirList");
const tagListEl = document.getElementById("tagList");
const cardListEl = document.getElementById("cardList");

const viewerEl = document.getElementById("viewer");
const viewerNextBtn = document.getElementById("viewerNext");
const viewerPrevBtn = document.getElementById("viewerPrev");
const viewerTagsEl = document.getElementById("viewerTags");
const viewerQuestionEl = document.getElementById("viewerQuestion");
const viewerAnswerEl = document.getElementById("viewerAnswer");

let allCards = [];
let filteredCards = [];
let selectedDir = "";
let selectedTags = new Set();
let viewerIdx = -1;

function getDirPrefixes(dir) {
  const clean = String(dir || "").trim().replace(/^\/+|\/+$/g, "");
  if (!clean) return [];
  const parts = clean.split("/").filter(Boolean);
  const out = [];
  for (let i = 0; i < parts.length; i += 1) {
    out.push(parts.slice(0, i + 1).join("/"));
  }
  return out;
}

function buildDirIndex(cards) {
  const dirs = new Set();
  for (const c of cards) {
    for (const p of getDirPrefixes(c.dir)) dirs.add(p);
  }
  const sorted = Array.from(dirs).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  const entries = [{ path: "", depth: 0 }];
  for (const p of sorted) {
    const depth = p.split("/").length - 1;
    entries.push({ path: p, depth });
  }
  return entries;
}

function cardMatches(card, term) {
  if (!term) return true;
  const t = term.toLowerCase();
  if (String(card.questionText || "").toLowerCase().includes(t)) return true;
  if ((card.tags || []).some((x) => String(x).toLowerCase().includes(t))) return true;
  return false;
}

function applyFilters() {
  const term = String(searchEl.value || "").trim();
  const tags = Array.from(selectedTags);
  filteredCards = allCards.filter((c) => {
    if (selectedDir && !(c.dir === selectedDir || String(c.dir || "").startsWith(`${selectedDir}/`))) {
      return false;
    }
    if (tags.length) {
      const set = new Set((c.tags || []).map((x) => normalizeTag(x)));
      for (const t of tags) if (!set.has(t)) return false;
    }
    if (!cardMatches(c, term)) return false;
    return true;
  });
  renderCardList();
}

function renderDirList() {
  const entries = buildDirIndex(allCards);
  dirListEl.innerHTML = "";
  for (const entry of entries) {
    const label = entry.path ? `${entry.path}/` : "（全部）";
    const count = entry.path
      ? allCards.filter((c) => c.dir === entry.path || String(c.dir || "").startsWith(`${entry.path}/`)).length
      : allCards.length;

    const btn = el(
      "button",
      {
        type: "button",
        class: `dirbtn${entry.path === selectedDir ? " is-active" : ""}`,
        "data-dir": entry.path,
        style: { "--depth": entry.depth }
      },
      [
        el("span", { class: "dirbtn__indent", "aria-hidden": "true" }),
        el("span", { class: "dirbtn__label" }, [label]),
        el("span", { class: "item__meta" }, [String(count)])
      ]
    );
    btn.addEventListener("click", () => {
      selectedDir = entry.path;
      renderDirList();
      applyFilters();
    });
    dirListEl.append(btn);
  }
}

function renderTagList() {
  const counts = new Map();
  for (const c of allCards) {
    for (const t of c.tags || []) {
      const tag = normalizeTag(t);
      if (!tag) continue;
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  const tags = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
    .map(([tag, count]) => ({ tag, count }));

  tagListEl.innerHTML = "";
  for (const it of tags) {
    const active = selectedTags.has(it.tag);
    const chip = el("button", { type: "button", class: `chip${active ? " is-active" : ""}` }, [
      `${it.tag} (${it.count})`
    ]);
    chip.addEventListener("click", () => {
      if (selectedTags.has(it.tag)) selectedTags.delete(it.tag);
      else selectedTags.add(it.tag);
      renderTagList();
      applyFilters();
    });
    tagListEl.append(chip);
  }
}

function openViewer(idx) {
  viewerIdx = idx;
  const card = filteredCards[viewerIdx];
  if (!card) return;
  setHtml(viewerQuestionEl, card.questionHtml);
  setHtml(viewerAnswerEl, card.answerHtml);
  renderTags(viewerTagsEl, card.tags);
  viewerAnswerEl.classList.add("is-hidden");

  viewerEl.classList.remove("is-hidden");
  viewerEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeViewer() {
  viewerEl.classList.add("is-hidden");
  viewerEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function viewerNext() {
  if (!filteredCards.length) return;
  const next = viewerIdx < 0 ? 0 : (viewerIdx + 1) % filteredCards.length;
  openViewer(next);
}

function viewerPrev() {
  if (!filteredCards.length) return;
  const prev = viewerIdx <= 0 ? filteredCards.length - 1 : viewerIdx - 1;
  openViewer(prev);
}

function renderCardList() {
  cardListEl.innerHTML = "";
  if (!filteredCards.length) {
    cardListEl.append(el("div", { class: "muted" }, ["没有匹配的题目。"]));
    return;
  }

  filteredCards.forEach((card, idx) => {
    const row = el("button", { type: "button", class: "item" }, [
      el("div", { class: "item__title" }, [card.questionText || "（无标题）"]),
      el("div", { class: "item__meta" }, [card.dir ? `${card.dir}/` : ""])
    ]);
    row.addEventListener("click", () => openViewer(idx));
    cardListEl.append(row);
  });
}

searchEl.addEventListener("input", () => applyFilters());
clearFiltersBtn.addEventListener("click", () => {
  searchEl.value = "";
  selectedDir = "";
  selectedTags = new Set();
  renderDirList();
  renderTagList();
  applyFilters();
});

viewerNextBtn.addEventListener("click", () => viewerNext());
viewerPrevBtn.addEventListener("click", () => viewerPrev());

viewerQuestionEl.addEventListener("click", () => {
  const show = viewerAnswerEl.classList.contains("is-hidden");
  viewerAnswerEl.classList.toggle("is-hidden", !show);
  if (show) void renderMermaid(viewerAnswerEl);
});

viewerEl.addEventListener("click", (e) => {
  if (e.target === viewerEl) closeViewer();
});

window.addEventListener("keydown", (e) => {
  if (viewerEl.classList.contains("is-hidden")) return;
  if (e.key === "Escape") closeViewer();
  if (e.key === " " || e.code === "Space") {
    e.preventDefault();
    viewerQuestionEl.click();
  }
  if (e.key === "n" || e.key === "N") viewerNextBtn.click();
  if (e.key === "p" || e.key === "P") viewerPrevBtn.click();
});

try {
  const index = await loadCardsIndex();
  allCards = (index.cards || []).map((c) => ({
    ...c,
    tags: uniqStrings((c.tags || []).map((x) => normalizeTag(x)))
  }));
  renderDirList();
  renderTagList();
  filteredCards = allCards.slice();
  renderCardList();
} catch (err) {
  dirListEl.innerHTML = "";
  tagListEl.innerHTML = "";
  cardListEl.innerHTML = "";
  cardListEl.append(el("div", { class: "muted" }, ["未能加载卡片数据。请先运行构建并使用本地服务器预览。"]));
  searchEl.disabled = true;
  clearFiltersBtn.disabled = true;
}

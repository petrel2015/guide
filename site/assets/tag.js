import {
  el,
  loadCardsIndex,
  normalizeTag,
  renderMermaid,
  renderTags,
  setHtml,
  setText,
  shuffleInPlace,
  uniqStrings
} from "./shared.js";

const tagSearchEl = document.getElementById("tagSearch");
const clearTagBtn = document.getElementById("clearTag");
const tagListEl = document.getElementById("tagList");

const modeInfoEl = document.getElementById("modeInfo");
const counterEl = document.getElementById("counter");
const tagLineEl = document.getElementById("tagLine");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const prevBtn = document.getElementById("prevCard");
const nextBtn = document.getElementById("nextCard");

let allCards = [];
let allTags = [];
let selectedTag = "";

let cards = [];
let order = [];
let orderIdx = 0;

function resetQuizState() {
  order = [];
  orderIdx = 0;
  setText(counterEl, "-");
  setHtml(questionEl, `<p class="muted">请选择一个标签开始。</p>`);
  setHtml(answerEl, "");
  renderTags(tagLineEl, []);
  answerEl.classList.add("is-hidden");
  prevBtn.disabled = true;
  nextBtn.disabled = true;
}

function ensureOrder() {
  if (!order.length) {
    order = Array.from({ length: cards.length }, (_, i) => i);
    shuffleInPlace(order);
    orderIdx = 0;
  }
  if (orderIdx >= order.length) {
    shuffleInPlace(order);
    orderIdx = 0;
  }
}

function showCardByIndex(idx) {
  const card = cards[idx];
  setHtml(questionEl, card.questionHtml);
  setHtml(answerEl, card.answerHtml);
  renderTags(tagLineEl, card.tags);
  setText(counterEl, `${orderIdx + 1} / ${order.length}`);
  answerEl.classList.add("is-hidden");
}

function nextCard() {
  if (!cards.length) return;
  ensureOrder();
  const idx = order[orderIdx];
  showCardByIndex(idx);
  orderIdx += 1;
}

function prevCard() {
  if (!cards.length || orderIdx <= 1) return;
  orderIdx -= 1;
  const idx = order[orderIdx - 1];
  showCardByIndex(idx);
}

function applyTagFilter(tag) {
  selectedTag = String(tag || "").trim();
  if (!selectedTag) {
    modeInfoEl.textContent = "请选择一个标签";
    cards = [];
    resetQuizState();
    renderTagList();
    return;
  }

  cards = allCards.filter((c) => (c.tags || []).some((t) => normalizeTag(t) === selectedTag));
  order = [];
  orderIdx = 0;
  prevBtn.disabled = cards.length === 0;
  nextBtn.disabled = cards.length === 0;

  modeInfoEl.textContent = `${selectedTag} · ${cards.length} 题`;
  renderTagList();

  if (!cards.length) {
    setText(counterEl, "0 / 0");
    setHtml(questionEl, `<p class="muted">该标签下暂无题目。</p>`);
    setHtml(answerEl, "");
    renderTags(tagLineEl, []);
    answerEl.classList.add("is-hidden");
    return;
  }

  nextCard();
  const url = new URL(window.location.href);
  url.searchParams.set("tag", selectedTag);
  history.replaceState(null, "", url);
}

function renderTagList() {
  const term = String(tagSearchEl.value || "").trim().toLowerCase();
  tagListEl.innerHTML = "";

  const items = allTags.filter((it) => {
    if (!term) return true;
    return it.tag.toLowerCase().includes(term);
  });

  if (!items.length) {
    tagListEl.append(el("div", { class: "muted" }, ["没有匹配的标签。"]));
    return;
  }

  for (const it of items) {
    const active = it.tag === selectedTag;
    const chip = el("button", { type: "button", class: `chip${active ? " is-active" : ""}` }, [
      `${it.tag} (${it.count})`
    ]);
    chip.addEventListener("click", () => applyTagFilter(it.tag));
    tagListEl.append(chip);
  }
}

prevBtn.addEventListener("click", () => prevCard());
nextBtn.addEventListener("click", () => nextCard());

questionEl.addEventListener("click", () => {
  if (nextBtn.disabled) return;
  const visible = answerEl.classList.contains("is-hidden");
  answerEl.classList.toggle("is-hidden", !visible);
  if (visible) void renderMermaid(answerEl);
});

tagSearchEl.addEventListener("input", () => renderTagList());
clearTagBtn.addEventListener("click", () => {
  tagSearchEl.value = "";
  applyTagFilter("");
});

window.addEventListener("keydown", (e) => {
  if (e.key === " " || e.code === "Space") {
    if (nextBtn.disabled) return;
    e.preventDefault();
    questionEl.click();
  }
  if (e.key === "n" || e.key === "N") {
    if (nextBtn.disabled) return;
    nextBtn.click();
  }
  if (e.key === "p" || e.key === "P") {
    if (prevBtn.disabled) return;
    prevBtn.click();
  }
  if (e.key === "Escape") clearTagBtn.click();
});

try {
  const index = await loadCardsIndex();
  allCards = (index.cards || []).map((c) => ({
    ...c,
    tags: uniqStrings((c.tags || []).map((x) => normalizeTag(x)))
  }));

  const counts = new Map();
  for (const c of allCards) {
    for (const t of c.tags || []) {
      const tag = normalizeTag(t);
      if (!tag) continue;
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  allTags = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
    .map(([tag, count]) => ({ tag, count }));

  const preselect = (() => {
    const url = new URL(window.location.href);
    const t = String(url.searchParams.get("tag") || "").trim();
    if (!t) return "";
    if (allTags.some((x) => x.tag === t)) return t;
    return "";
  })();

  renderTagList();
  if (preselect) applyTagFilter(preselect);
  else resetQuizState();
} catch (err) {
  modeInfoEl.textContent = "加载失败";
  setText(counterEl, "加载失败");
  tagListEl.innerHTML = "";
  setHtml(questionEl, `<p class="muted">未能加载卡片数据。请先运行构建并使用本地服务器预览。</p>`);
  answerEl.classList.add("is-hidden");
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  tagSearchEl.disabled = true;
  clearTagBtn.disabled = true;
}

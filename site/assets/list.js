import {
  loadCardsIndex,
  normalizeTag,
  uniqStrings,
  el,
  setHtml,
  renderMermaid
} from "./shared.js";
import { checkDevice } from "./device-check.js";

checkDevice();

const tagSearchEl = document.getElementById("tagSearch");
const clearTagBtn = document.getElementById("clearTag");
const tagListEl = document.getElementById("tagList");
const modeInfoEl = document.getElementById("modeInfo");
const cardListEl = document.getElementById("cardList");
const tagListContainerEl = document.getElementById("tagListContainer");
const toggleTagsBtn = document.getElementById("toggleTags");

let allCards = [];
let allTags = [];
let selectedTag = "";

toggleTagsBtn.addEventListener("click", () => {
  const isExpanded = tagListContainerEl.classList.toggle("is-expanded");
  toggleTagsBtn.textContent = isExpanded ? "收起标签" : "展开全部标签";
});

function applyTagFilter(tag) {
  selectedTag = String(tag || "").trim();
  if (!selectedTag) {
    modeInfoEl.textContent = "请选择一个标签";
    cardListEl.innerHTML = "";
    renderTagList();
    return;
  }

  const filteredCards = allCards.filter((c) => (c.tags || []).some((t) => normalizeTag(t) === selectedTag));
  modeInfoEl.textContent = `${selectedTag} · ${filteredCards.length} 题`;
  renderTagList();
  renderCards(filteredCards);

  const url = new URL(window.location.href);
  url.searchParams.set("tag", selectedTag);
  history.replaceState(null, "", url);
}

function renderCards(cards) {
  cardListEl.innerHTML = "";
  for (const card of cards) {
    // 创建容器
    const questionDiv = el("div", { class: "list-card__question" });
    setHtml(questionDiv, card.questionHtml);

    const answerDiv = el("div", { class: "list-card__body is-hidden" });
    setHtml(answerDiv, card.answerHtml);

    const cardEl = el("article", { class: "list-card" }, [
      el("header", { class: "list-card__header" }, [
        questionDiv,
        el("span", { class: "muted" }, ["▼"])
      ]),
      answerDiv
    ]);

    const header = cardEl.querySelector(".list-card__header");
    const body = cardEl.querySelector(".list-card__body");
    const indicator = header.querySelector("span");

    header.addEventListener("click", () => {
      const show = body.classList.contains("is-hidden");
      body.classList.toggle("is-hidden", !show);
      indicator.textContent = show ? "▲" : "▼";
      if (show) {
        void renderMermaid(body);
      }
    });

    cardListEl.append(cardEl);
  }
}

function renderTagList() {
  const term = String(tagSearchEl.value || "").trim().toLowerCase();
  tagListEl.innerHTML = "";
  const items = allTags.filter((it) => !term || it.tag.toLowerCase().includes(term));

  for (const it of items) {
    const active = it.tag === selectedTag;
    const chip = el("button", { type: "button", class: `chip${active ? " is-active" : ""}` }, [
      `${it.tag} (${it.count})`
    ]);
    chip.addEventListener("click", () => applyTagFilter(it.tag));
    tagListEl.append(chip);
  }
}

tagSearchEl.addEventListener("input", () => renderTagList());
clearTagBtn.addEventListener("click", () => {
  tagSearchEl.value = "";
  applyTagFilter("");
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
      if (tag) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  allTags = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
    .map(([tag, count]) => ({ tag, count }));

  const url = new URL(window.location.href);
  const preselect = url.searchParams.get("tag");
  
  renderTagList();
  if (preselect && allTags.some(x => x.tag === preselect)) applyTagFilter(preselect);
} catch (err) {
  modeInfoEl.textContent = "加载失败";
}

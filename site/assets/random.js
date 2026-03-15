import { loadCardsIndex, renderMermaid, renderTags, setHtml, setText, shuffleInPlace } from "./shared.js";
import { checkDevice } from "./device-check.js";

checkDevice();

const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const prevBtn = document.getElementById("prevCard");
const nextBtn = document.getElementById("nextCard");
const counterEl = document.getElementById("counter");
const tagLineEl = document.getElementById("tagLine");

let cards = [];
let order = [];
let orderIdx = 0;

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
  ensureOrder();
  const idx = order[orderIdx];
  showCardByIndex(idx);
  orderIdx += 1;
}

function prevCard() {
  if (orderIdx <= 1) return;
  orderIdx -= 1;
  const idx = order[orderIdx - 1];
  showCardByIndex(idx);
}

prevBtn.addEventListener("click", () => prevCard());
nextBtn.addEventListener("click", () => nextCard());

questionEl.addEventListener("click", () => {
  const visible = answerEl.classList.contains("is-hidden");
  answerEl.classList.toggle("is-hidden", !visible);
  if (visible) void renderMermaid(answerEl);
});

window.addEventListener("keydown", (e) => {
  if (e.key === " " || e.code === "Space") {
    e.preventDefault();
    questionEl.click();
  }
  if (e.key === "n" || e.key === "N") nextBtn.click();
  if (e.key === "p" || e.key === "P") prevBtn.click();
});

try {
  const index = await loadCardsIndex();
  cards = index.cards || [];
  if (!cards.length) throw new Error("No cards found");
  nextCard();
} catch (err) {
  setText(counterEl, "加载失败");
  setHtml(questionEl, `<p class="muted">未能加载卡片数据。请先运行构建并使用本地服务器预览。</p>`);
  answerEl.classList.add("is-hidden");
  nextBtn.disabled = true;
  prevBtn.disabled = true;
}

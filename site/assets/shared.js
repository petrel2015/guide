export function normalizeTag(tag) {
  const t = String(tag ?? "").trim();
  return t;
}

export function uniqStrings(items) {
  const out = [];
  const seen = new Set();
  for (const it of items) {
    const v = String(it ?? "").trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function setHtml(el, html) {
  el.innerHTML = html || "";
}

export function setText(el, text) {
  el.textContent = text ?? "";
}

export function el(tagName, attrs = {}, children = []) {
  const node = document.createElement(tagName);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    if (key === "class") node.className = String(value);
    else if (key.startsWith("data-")) node.setAttribute(key, String(value));
    else if (key === "style" && typeof value === "object") Object.assign(node.style, value);
    else node.setAttribute(key, String(value));
  }
  for (const child of children) {
    if (child == null) continue;
    node.append(child);
  }
  return node;
}

export async function loadCardsIndex() {
  const url = new URL("../cards.json", import.meta.url);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load cards.json: ${res.status}`);
  return await res.json();
}

export function renderTags(container, tags) {
  container.innerHTML = "";
  for (const t of tags || []) {
    container.append(el("span", { class: "tag" }, [t]));
  }
}

let mermaidPromise = null;

export async function ensureMermaid() {
  if (mermaidPromise) return mermaidPromise;
  mermaidPromise = (async () => {
    const mod = await import("./vendor/mermaid.esm.min.js");
    const mermaid = mod?.default || mod?.mermaid || mod;
    const isDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
    if (typeof mermaid?.initialize === "function") {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: isDark ? "dark" : "default"
      });
    }
    return mermaid;
  })();
  return mermaidPromise;
}

export async function renderMermaid(container) {
  const candidates = Array.from(container?.querySelectorAll?.(".mermaid") || []);
  const nodes = [];
  for (const n of candidates) {
    const processed = n.getAttribute("data-processed");
    if (processed) {
      if (n.querySelector("svg")) continue;
      n.removeAttribute("data-processed");
    }
    nodes.push(n);
  }
  if (!nodes.length) return;

  let mermaid;
  try {
    mermaid = await ensureMermaid();
  } catch {
    return;
  }

  if (typeof mermaid?.run === "function") {
    try {
      await mermaid.run({ nodes });
    } catch {
      // ignore
    }
    return;
  }

  if (typeof mermaid?.init === "function") {
    try {
      mermaid.init(undefined, nodes);
    } catch {
      // ignore
    }
  }
}

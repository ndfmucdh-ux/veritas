import { useEffect } from "react";

// Pictographs, flags and variation selectors. Typographic marks (check, cross, star) are kept.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{2604}\u{2607}-\u{2612}\u{2614}-\u{2704}\u{2706}-\u{2712}\u{2717}-\u{271C}\u{271E}-\u{27BF}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{23E9}-\u{23FF}\u{FE0F}\u{20E3}]/gu;
const SKIP = "textarea, input, [contenteditable='true'], script, style";

function clean(node) {
  const v = node.nodeValue;
  if (!v || !EMOJI.test(v)) { EMOJI.lastIndex = 0; return; }
  EMOJI.lastIndex = 0;
  if (node.parentElement?.closest(SKIP)) return;
  node.nodeValue = v.replace(EMOJI, "").replace(/^\s{2,}/, " ");
}

function walk(root) {
  if (root.nodeType === 3) return clean(root);
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = it.nextNode())) clean(n);
}

/** Keeps the interface free of emoji, wherever the text comes from (data, AI output, labels). */
export default function EmojiSanitizer() {
  useEffect(() => {
    walk(document.body);
    const obs = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "characterData") clean(r.target);
        else r.addedNodes.forEach((n) => (n.nodeType === 1 || n.nodeType === 3) && walk(n));
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, []);
  return null;
}